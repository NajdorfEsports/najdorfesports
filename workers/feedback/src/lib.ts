/**
 * Pure, runtime-agnostic helpers for the feedback Worker. No Cloudflare-only
 * imports live here so the unit tests run under the repo's standard vitest. The
 * fetch and scheduled handlers in index.ts wire these to KV and Resend.
 */

export interface FeedbackRecord {
  /** Cal.com booking uid; also the KV key suffix and idempotency key. */
  uid: string;
  email: string;
  name: string;
  discordHandle: string;
  /** ISO end time of the session. */
  endTime: string;
  /** Epoch ms after which the feedback email may send. */
  sendAfter: number;
  sent: boolean;
  attempts: number;
  sentAt?: number;
  failed?: boolean;
}

export interface ParsedBooking {
  uid: string;
  email: string;
  name: string;
  discordHandle: string;
  endTime: string;
}

const SUBJECT = 'How was your coaching session with Najdorf Esports?';
const OWNER_EMAIL = 'owner@najdorfesports.gg';

/**
 * Verify Cal.com's HMAC SHA256 signature. Cal signs the raw request body with
 * the webhook secret and sends the hex digest in the `x-cal-signature-256`
 * header. Comparison is length-checked and constant-time over the hex strings.
 */
export async function verifySignature(
  secret: string,
  rawBody: string,
  signatureHeader: string | null | undefined,
): Promise<boolean> {
  if (!secret || !signatureHeader) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const expected = toHex(mac);
  return timingSafeEqualHex(expected, signatureHeader.trim().toLowerCase());
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Read a Cal.com response value, which may be a raw string or { value }. */
function valueOf(r: unknown): string {
  if (r == null) return '';
  if (typeof r === 'string') return r;
  if (typeof r === 'object') {
    const v = (r as { value?: unknown }).value;
    if (v != null) return String(v);
  }
  return String(r);
}

/**
 * Find the Discord handle the booking question collected. Cal.com places custom
 * answers under different keys across versions (responses, userFieldsResponses,
 * customInputs), so we scan all of them for a discord-named field rather than
 * hardcoding one path. Verify against a real TEST_MODE payload before launch.
 */
function extractDiscord(payload: Record<string, unknown>): string {
  const objectPools = [payload.responses, payload.userFieldsResponses].filter(
    (p): p is Record<string, unknown> => !!p && typeof p === 'object' && !Array.isArray(p),
  );
  for (const pool of objectPools) {
    for (const k of Object.keys(pool)) {
      if (k.toLowerCase().includes('discord')) return valueOf(pool[k]);
    }
  }
  const customInputs = payload.customInputs;
  if (Array.isArray(customInputs)) {
    for (const item of customInputs) {
      const label = String((item?.label ?? '') as string).toLowerCase();
      if (label.includes('discord')) return valueOf(item?.value ?? item);
    }
  }
  return '';
}

/**
 * Parse a BOOKING_PAID webhook body into the fields we keep. Returns null if the
 * essential fields (uid, endTime) are missing, so the caller can ack-and-skip
 * rather than store a useless record.
 */
export function parseBookingPaid(body: unknown): ParsedBooking | null {
  const root = (body ?? {}) as Record<string, unknown>;
  const payload = (root.payload ?? {}) as Record<string, unknown>;

  const booking = (payload.booking ?? {}) as Record<string, unknown>;
  const uid = payload.uid ?? payload.bookingUid ?? booking.uid;
  const endTime = payload.endTime ?? payload.endtime ?? booking.endTime;

  const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
  const attendee = (attendees[0] ?? {}) as Record<string, unknown>;
  const responses = (payload.responses ?? {}) as Record<string, unknown>;

  const email = attendee.email ?? payload.bookerEmail ?? valueOf(responses.email);
  const name = attendee.name ?? valueOf(responses.name);
  const discordHandle = extractDiscord(payload);

  if (!uid || !endTime) return null;
  return {
    uid: String(uid),
    email: String(email ?? ''),
    name: String(name ?? ''),
    discordHandle: String(discordHandle ?? ''),
    endTime: String(endTime),
  };
}

/** When the feedback email becomes eligible: 48h after the session (10 min in TEST_MODE). */
export function computeSendAfter(endTimeIso: string, testMode: boolean, nowMs: number): number {
  const offsetMs = testMode ? 10 * 60 * 1000 : 48 * 60 * 60 * 1000;
  const end = Date.parse(endTimeIso);
  const base = Number.isFinite(end) ? end : nowMs;
  return base + offsetMs;
}

/** A record is due when it is unsent, not permanently failed, and past its sendAfter. */
export function isDue(
  record: Pick<FeedbackRecord, 'sendAfter' | 'sent'> & { failed?: boolean },
  nowMs: number,
): boolean {
  return !record.sent && !record.failed && record.sendAfter <= nowMs;
}

export interface ResendPayload {
  from: string;
  to: string;
  reply_to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Build the Resend request body for the feedback email. Plain and idiom-free,
 * English only for v1. One thank-you line, one Tally link, one privacy line.
 * No images, no tracking pixels. Reply-To is the owner so replies reach a real
 * inbox (the From identity is send-only).
 */
export function buildFeedbackEmail(opts: {
  to: string;
  from: string;
  replyTo: string;
  tallyUrl: string;
}): ResendPayload {
  const text = [
    'Thanks for training with Najdorf Esports.',
    '',
    `We would value your honest feedback on your coaching session. It takes a minute: ${opts.tallyUrl}`,
    '',
    'Your feedback goes privately to the organization and is only used to improve coaching.',
    '',
    'Najdorf Esports',
    OWNER_EMAIL,
  ].join('\n');

  const html = [
    '<p>Thanks for training with Najdorf Esports.</p>',
    `<p>We would value your honest feedback on your coaching session. It takes a minute: <a href="${opts.tallyUrl}">share your feedback</a>.</p>`,
    '<p>Your feedback goes privately to the organization and is only used to improve coaching.</p>',
    `<p>Najdorf Esports<br>${OWNER_EMAIL}</p>`,
  ].join('\n');

  return {
    from: opts.from,
    to: opts.to,
    reply_to: opts.replyTo,
    subject: SUBJECT,
    html,
    text,
  };
}

export const FEEDBACK_SUBJECT = SUBJECT;
export const FEEDBACK_OWNER_EMAIL = OWNER_EMAIL;
export const KV_PREFIX = 'booking:';
