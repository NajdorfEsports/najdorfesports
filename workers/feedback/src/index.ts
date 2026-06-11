/**
 * Najdorf Esports coaching feedback Worker.
 *
 * Flow: Cal.com fires a signed BOOKING_PAID webhook into the fetch handler,
 * which stores a record in KV keyed by the booking uid. A cron (every 5 minutes)
 * scans KV and, 48 hours after each session ends, sends one feedback email via
 * Resend that links a Tally form. Free tier throughout (Workers, KV, Resend free).
 *
 * Why a Worker and not Cal.com Workflows: custom email templates moved to paid
 * Cal.com Teams, but webhooks are free on every plan. This is the free path.
 *
 * Independent of the Astro Pages build: it has its own wrangler config and is
 * deployed separately. See SETUP.md for the one-time setup checklist.
 */
import {
  verifySignature,
  parseBookingPaid,
  computeSendAfter,
  isDue,
  buildFeedbackEmail,
  KV_PREFIX,
  FEEDBACK_OWNER_EMAIL,
  type FeedbackRecord,
} from './lib';

export interface Env {
  FEEDBACK_KV: KVNamespace;
  /** Cal.com webhook shared secret (wrangler secret). */
  CALCOM_WEBHOOK_SECRET: string;
  /** Resend API key (wrangler secret), starts with re_. */
  RESEND_API_KEY: string;
  /** Tally feedback form URL (wrangler secret). Never fabricated. */
  TALLY_FORM_URL: string;
  /** Verified Resend sending identity. */
  FROM_ADDRESS: string;
  /** "true" enables test behavior. */
  TEST_MODE: string;
}

const SIGNATURE_HEADER = 'x-cal-signature-256';
const MAX_ATTEMPTS = 5;
const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60;

function isTestMode(env: Env): boolean {
  return env.TEST_MODE === 'true';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get(SIGNATURE_HEADER);

    const valid = await verifySignature(env.CALCOM_WEBHOOK_SECRET, rawBody, signature);
    if (!valid) {
      return new Response('Invalid signature', { status: 401 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      // Acknowledge so Cal.com does not retry a body we cannot parse.
      return new Response('OK', { status: 200 });
    }

    if (isTestMode(env)) {
      console.log('[feedback] TEST_MODE payload:', rawBody);
    }

    const triggerEvent = (body as { triggerEvent?: string })?.triggerEvent;
    if (triggerEvent !== 'BOOKING_PAID') {
      // Ack everything else so Cal.com stops retrying.
      return new Response('OK', { status: 200 });
    }

    const parsed = parseBookingPaid(body);
    if (!parsed) {
      console.warn('[feedback] BOOKING_PAID missing uid or endTime; skipping.');
      return new Response('OK', { status: 200 });
    }

    const key = `${KV_PREFIX}${parsed.uid}`;
    // Idempotent: duplicate webhook deliveries for the same uid are no-ops.
    const existing = await env.FEEDBACK_KV.get(key);
    if (existing) {
      return new Response('OK', { status: 200 });
    }

    const now = Date.now();
    const record: FeedbackRecord = {
      uid: parsed.uid,
      email: parsed.email,
      name: parsed.name,
      discordHandle: parsed.discordHandle,
      endTime: parsed.endTime,
      sendAfter: computeSendAfter(parsed.endTime, isTestMode(env), now),
      sent: false,
      attempts: 0,
    };
    await env.FEEDBACK_KV.put(key, JSON.stringify(record));

    return new Response('OK', { status: 200 });
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    if (!env.TALLY_FORM_URL) {
      console.error('[feedback] TALLY_FORM_URL is unset; refusing to send broken links.');
      return;
    }

    const now = Date.now();
    const testMode = isTestMode(env);
    const list = await env.FEEDBACK_KV.list({ prefix: KV_PREFIX });

    for (const entry of list.keys) {
      const raw = await env.FEEDBACK_KV.get(entry.name);
      if (!raw) continue;

      let record: FeedbackRecord;
      try {
        record = JSON.parse(raw) as FeedbackRecord;
      } catch {
        continue;
      }

      if (!isDue(record, now)) continue;

      const recipient = testMode ? FEEDBACK_OWNER_EMAIL : record.email;
      if (!recipient) {
        record.attempts += 1;
        if (record.attempts >= MAX_ATTEMPTS) record.failed = true;
        await env.FEEDBACK_KV.put(entry.name, JSON.stringify(record));
        continue;
      }

      const email = buildFeedbackEmail({
        to: recipient,
        from: env.FROM_ADDRESS,
        replyTo: FEEDBACK_OWNER_EMAIL,
        tallyUrl: env.TALLY_FORM_URL,
      });

      let ok = false;
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(email),
        });
        ok = res.ok;
        if (!ok) console.error('[feedback] Resend error', res.status, await res.text());
      } catch (err) {
        console.error('[feedback] Resend request failed', err);
      }

      if (ok) {
        record.sent = true;
        record.sentAt = now;
        // Let storage self-clean about 90 days after sending.
        await env.FEEDBACK_KV.put(entry.name, JSON.stringify(record), {
          expirationTtl: NINETY_DAYS_SECONDS,
        });
      } else {
        record.attempts += 1;
        if (record.attempts >= MAX_ATTEMPTS) record.failed = true;
        await env.FEEDBACK_KV.put(entry.name, JSON.stringify(record));
      }
    }
  },
};
