import { describe, it, expect } from 'vitest';
import {
  verifySignature,
  parseBookingPaid,
  computeSendAfter,
  isDue,
  buildFeedbackEmail,
} from '../src/lib';

/** Compute the hex HMAC SHA256 the way Cal.com signs, for the valid-signature case. */
async function sign(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const SECRET = 'test-webhook-secret';

const bookingPaidBody = JSON.stringify({
  triggerEvent: 'BOOKING_PAID',
  payload: {
    uid: 'bk_abc123',
    endTime: '2026-06-10T11:00:00Z',
    attendees: [{ name: 'Player One', email: 'player@example.com' }],
    responses: {
      name: { label: 'your_name', value: 'Player One' },
      discord_handle: { label: 'Discord username', value: 'playerone#0001' },
    },
  },
});

describe('verifySignature', () => {
  it('accepts a correct signature', async () => {
    const header = await sign(SECRET, bookingPaidBody);
    expect(await verifySignature(SECRET, bookingPaidBody, header)).toBe(true);
  });

  it('rejects a wrong signature', async () => {
    expect(await verifySignature(SECRET, bookingPaidBody, 'deadbeef')).toBe(false);
  });

  it('rejects a signature made with a different secret', async () => {
    const header = await sign('other-secret', bookingPaidBody);
    expect(await verifySignature(SECRET, bookingPaidBody, header)).toBe(false);
  });

  it('rejects a missing header', async () => {
    expect(await verifySignature(SECRET, bookingPaidBody, null)).toBe(false);
  });

  it('rejects when the secret is empty', async () => {
    // An unconfigured secret must never validate, regardless of the header.
    expect(await verifySignature('', bookingPaidBody, 'anything')).toBe(false);
  });
});

describe('parseBookingPaid', () => {
  it('extracts uid, endTime, attendee, and discord handle', () => {
    const parsed = parseBookingPaid(JSON.parse(bookingPaidBody));
    expect(parsed).not.toBeNull();
    expect(parsed!.uid).toBe('bk_abc123');
    expect(parsed!.endTime).toBe('2026-06-10T11:00:00Z');
    expect(parsed!.email).toBe('player@example.com');
    expect(parsed!.name).toBe('Player One');
    expect(parsed!.discordHandle).toBe('playerone#0001');
  });

  it('finds the discord handle under a raw-string response key', () => {
    const parsed = parseBookingPaid({
      triggerEvent: 'BOOKING_PAID',
      payload: {
        uid: 'u2',
        endTime: '2026-06-10T11:00:00Z',
        attendees: [{ name: 'A', email: 'a@b.com' }],
        responses: { discordHandle: 'raw#1234' },
      },
    });
    expect(parsed!.discordHandle).toBe('raw#1234');
  });

  it('finds the discord handle in customInputs array', () => {
    const parsed = parseBookingPaid({
      payload: {
        uid: 'u3',
        endTime: '2026-06-10T11:00:00Z',
        attendees: [{ name: 'A', email: 'a@b.com' }],
        customInputs: [{ label: 'Discord username', value: 'ci#9999' }],
      },
    });
    expect(parsed!.discordHandle).toBe('ci#9999');
  });

  it('returns null when uid is missing', () => {
    expect(parseBookingPaid({ payload: { endTime: '2026-06-10T11:00:00Z' } })).toBeNull();
  });

  it('returns null when endTime is missing', () => {
    expect(parseBookingPaid({ payload: { uid: 'x' } })).toBeNull();
  });
});

describe('computeSendAfter', () => {
  const end = '2026-06-10T11:00:00Z';
  const endMs = Date.parse(end);

  it('adds 48 hours to the session end in normal mode', () => {
    expect(computeSendAfter(end, false, 0)).toBe(endMs + 48 * 60 * 60 * 1000);
  });

  it('in test mode sends 10 minutes after the booking, ignoring the session end', () => {
    expect(computeSendAfter(end, true, 1_000_000)).toBe(1_000_000 + 10 * 60 * 1000);
  });

  it('falls back to now when endTime is unparseable (normal mode)', () => {
    expect(computeSendAfter('not-a-date', false, 1000)).toBe(1000 + 48 * 60 * 60 * 1000);
  });
});

describe('isDue', () => {
  it('is due when past sendAfter and unsent', () => {
    expect(isDue({ sendAfter: 100, sent: false }, 200)).toBe(true);
  });

  it('is not due before sendAfter', () => {
    expect(isDue({ sendAfter: 300, sent: false }, 200)).toBe(false);
  });

  it('is not due when already sent', () => {
    expect(isDue({ sendAfter: 100, sent: true }, 200)).toBe(false);
  });

  it('is not due when permanently failed', () => {
    expect(isDue({ sendAfter: 100, sent: false, failed: true }, 200)).toBe(false);
  });
});

describe('buildFeedbackEmail', () => {
  it('sets subject, reply_to, and includes the tally link', () => {
    const email = buildFeedbackEmail({
      to: 'player@example.com',
      from: 'feedback@najdorfesports.gg',
      replyTo: 'owner@najdorfesports.gg',
      tallyUrl: 'https://tally.so/r/abc123',
    });
    expect(email.subject).toBe('How was your coaching session with Najdorf Esports?');
    expect(email.reply_to).toBe('owner@najdorfesports.gg');
    expect(email.html).toContain('https://tally.so/r/abc123');
    expect(email.text).toContain('https://tally.so/r/abc123');
  });
});
