# Feedback Worker setup checklist

One-time setup to take the 48-hour coaching feedback Worker live. Do these in
order. Nothing here runs automatically; the website deploy is unaffected by this
Worker. Most steps are also covered by the Claude Cowork browser prompt, which
handles the dashboard clicks; this file is the plain reference.

## What it does

Cal.com fires a signed `BOOKING_PAID` webhook to this Worker. The Worker stores
the booking in KV. A cron (every 5 minutes) sends one feedback email (via Resend)
48 hours after the session ends, linking your Tally form. Reply-To is
owner@najdorfesports.gg.

## Prerequisites

- Node 22 and the Cloudflare CLI authenticated: `npx wrangler login`.
- From this directory: `npm install` (installs wrangler, vitest, types).

## 1. Resend account and verified domain (browser)

1. Create a free Resend account at https://resend.com.
2. Add the domain `najdorfesports.gg`. Resend shows DNS records (SPF, DKIM).
3. In the Cloudflare dashboard, add those DNS records to the najdorfesports.gg
   zone exactly as shown. Wait until Resend marks the domain Verified.
4. Create an API key. Save it for step 5 (`RESEND_API_KEY`).

Note: `FROM_ADDRESS` is feedback@najdorfesports.gg. It is a sending identity
only, not a monitored mailbox; replies go to owner@najdorfesports.gg via
Reply-To.

## 2. Tally feedback form (browser)

1. Create a free form at https://tally.so. Suggested fields: which coach,
   session date, rating 1 to 5, what went well, what could improve, optional
   contact permission.
2. Enable Tally's own email notifications to owner@najdorfesports.gg so
   responses land in the real inbox.
3. Copy the form URL. Save it for step 5 (`TALLY_FORM_URL`).

## 3. KV namespace

    npx wrangler kv namespace create FEEDBACK_KV

Paste the printed id into `wrangler.toml` under `[[kv_namespaces]]` (replace
`REPLACE_WITH_KV_NAMESPACE_ID`).

## 4. Choose a webhook secret

Pick a long random string. You will give the same value to both the Worker
(step 5) and Cal.com (step 7).

## 5. Set secrets

    npx wrangler secret put CALCOM_WEBHOOK_SECRET
    npx wrangler secret put RESEND_API_KEY
    npx wrangler secret put TALLY_FORM_URL

`FROM_ADDRESS` and `TEST_MODE` are non-secret and already in `wrangler.toml`.
Keep `TEST_MODE = "true"` until step 8 passes.

## 6. Deploy

    npx wrangler deploy

Copy the deployed Worker URL (for example
https://najdorf-feedback.<subdomain>.workers.dev). This is the webhook URL.

## 7. Add the Cal.com webhook (browser)

Cal.com: Settings > Developer > Webhooks > New.

- Subscriber URL: the Worker URL from step 6.
- Event trigger: BOOKING_PAID only.
- Secret: the same value as `CALCOM_WEBHOOK_SECRET`.
- Save.

## 8. End-to-end test (TEST_MODE)

1. Confirm `TEST_MODE = "true"`.
2. Make one real test booking on a paid event and complete payment.
3. Within about 10 minutes the cron sends the feedback email to
   owner@najdorfesports.gg (TEST_MODE routes all mail to the owner).
4. Check `npx wrangler tail` for the logged payload and any errors.
5. Confirm the email arrives and the Tally link works.

## 9. Go live

Set `TEST_MODE = "false"` in `wrangler.toml` and redeploy:

    npx wrangler deploy

Real attendees now receive the email 48 hours after each session.

## Tests

    npm test    # pure-logic unit tests (signature, payload parse, scheduling)

These also run in the repo's root `npm test`.

## Free-tier headroom

Workers: 100,000 requests/day. KV: 100,000 reads and 1,000 writes/day. Resend:
100 emails/day, 3,000/month. At a few bookings per week this stays far inside
every free limit.
