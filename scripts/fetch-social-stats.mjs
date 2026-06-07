// Build-time social / community stats fetcher.
//
// Mirrors the fail-soft contract of fetch-liquipedia.mjs: on ANY per-source
// error it keeps that source's previous value, and it never writes empty data,
// so the site never deploys with blank counts. Scheduled (when armed) by
// .github/workflows/refresh-social-stats.yml; run locally with:
//
//   npm run fetch:social
//
// CREDENTIALS (provided as GitHub Actions secrets / local env; none committed):
//   YOUTUBE_API_KEY            YouTube Data API v3 key (subscribers + views,
//                              and best-effort live concurrent viewers)
//   YOUTUBE_CHANNEL_ID         the org's YouTube channel id (UC...)
//   X_BEARER_TOKEN             X / Twitter API v2 bearer (PAID tier; followers)
//   TWITCH_CLIENT_ID           Twitch app client id  } only for the live
//   TWITCH_CLIENT_SECRET       Twitch app secret      } "watching now" count
//   TWITCH_LOGIN               the org's Twitch channel login
//
// Discord needs NO secret: the public invite endpoint already returns the
// member / online counts. TikTok and Instagram have no simple key-based API
// (their official APIs require an approved app + OAuth), so they are left to
// the manual override in social-stats.manual.json until that is set up.
//
// IDENTIFIERS that are not secret are derived from the single channel registry
// in src/data/channels.ts (no third copy to keep in sync).

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonAtomic } from './lib/io.mjs';
import { channels } from '../src/data/channels.ts';
import { SocialStatSchema } from '../src/data/schemas.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'data', 'social-stats.json');

// Descriptive User-Agent with site + contact, matching the Liquipedia fetcher
// convention. Default fetch UAs get blocked by some of these endpoints.
const UA =
  'NajdorfEsports-StatsBot/1.0 (+https://najdorfesports.gg; owner@najdorfesports.gg)';

const byPlatform = Object.fromEntries(channels.map((c) => [c.platform, c]));
const CONFIG = {
  discordInvite: byPlatform.discord?.discordInvite || '',
  xUsername: byPlatform.x?.xUsername || '',
  youtubeChannelId: byPlatform.youtube?.youtubeChannelId || process.env.YOUTUBE_CHANNEL_ID || '',
  twitchLogin: process.env.TWITCH_LOGIN || '',
};

async function getJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json', ...headers },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

// Discord: public invite endpoint, NO auth. We read ONLY the aggregate member /
// online counts. The same payload also contains the invite creator's personal
// account; per the org-identity-only policy we never read or persist that.
async function fetchDiscord() {
  const code = CONFIG.discordInvite;
  if (!code) return null;
  const d = await getJson(
    `https://discord.com/api/v10/invites/${code}?with_counts=true`,
  );
  const members = d.approximate_member_count ?? d.profile?.member_count ?? null;
  const online = d.approximate_presence_count ?? d.profile?.online_count ?? null;
  if (typeof members !== 'number') {
    throw new Error('no member count in invite payload');
  }
  const row = { platform: 'discord', count: members, isLive: false, liveViewers: null };
  if (typeof online === 'number') row.secondary = { online };
  return row;
}

// YouTube: Data API v3. Subscriber + view counts, plus best-effort concurrent
// live viewers when a broadcast is active. Skipped unless key + channel id set.
async function fetchYouTube() {
  const key = process.env.YOUTUBE_API_KEY;
  const id = CONFIG.youtubeChannelId;
  if (!key || !id) return null;
  const stats = await getJson(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${id}&key=${key}`,
  );
  const s = stats.items?.[0]?.statistics;
  if (!s) throw new Error('no statistics in channel payload');
  const row = {
    platform: 'youtube',
    count: Number(s.subscriberCount ?? 0),
    secondary: {
      views: Number(s.viewCount ?? 0),
      videos: Number(s.videoCount ?? 0),
    },
    isLive: false,
    liveViewers: null,
  };
  // Live concurrent viewers (extra quota; failures are non-fatal).
  try {
    const live = await getJson(
      `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${id}&eventType=live&type=video&key=${key}`,
    );
    const vid = live.items?.[0]?.id?.videoId;
    if (vid) {
      const det = await getJson(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${vid}&key=${key}`,
      );
      const cc = det.items?.[0]?.liveStreamingDetails?.concurrentViewers;
      if (cc != null) {
        row.isLive = true;
        row.liveViewers = Number(cc);
      }
    }
  } catch (err) {
    console.warn('[social] youtube live check failed (non-fatal):', err.message);
  }
  return row;
}

// X / Twitter: API v2 public_metrics. Requires a PAID bearer token; without
// one this returns null and the manual override carries the number instead.
async function fetchX() {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return null;
  const d = await getJson(
    `https://api.twitter.com/2/users/by/username/${CONFIG.xUsername}?user.fields=public_metrics`,
    { Authorization: `Bearer ${token}` },
  );
  const followers = d.data?.public_metrics?.followers_count;
  if (typeof followers !== 'number') throw new Error('no followers_count');
  return { platform: 'x', count: followers };
}

// Twitch: live "watching now" only (the org's stream channel). Produces a
// `twitch` row carrying isLive + liveViewers; it is not a subscriber card.
async function fetchTwitchLive() {
  const cid = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  const login = CONFIG.twitchLogin;
  if (!cid || !secret || !login) return null;
  const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
    },
    body: new URLSearchParams({
      client_id: cid,
      client_secret: secret,
      grant_type: 'client_credentials',
    }),
  });
  const token = (await tokenRes.json()).access_token;
  if (!token) throw new Error('no twitch app token');
  const d = await getJson(
    `https://api.twitch.tv/helix/streams?user_login=${login}`,
    { 'Client-Id': cid, Authorization: `Bearer ${token}` },
  );
  const stream = d.data?.[0];
  return {
    platform: 'twitch',
    count: null,
    isLive: Boolean(stream),
    liveViewers: stream ? Number(stream.viewer_count) : null,
  };
}

async function main() {
  // Load previous so each source can fail-soft to its last good value.
  let prev = [];
  try {
    prev = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    /* first run, no file yet */
  }
  const out = new Map(prev.map((r) => [r.platform, r]));

  const sources = [
    ['discord', fetchDiscord],
    ['youtube', fetchYouTube],
    ['x', fetchX],
    ['twitch', fetchTwitchLive],
  ];

  const now = new Date().toISOString();
  let anyOk = false;
  for (const [name, fn] of sources) {
    try {
      const row = await fn();
      if (row) {
        out.set(row.platform, { ...row, updated: now });
        anyOk = true;
        console.log(`[social] ${name}: ok`);
      } else {
        console.log(`[social] ${name}: skipped (not configured)`);
      }
    } catch (err) {
      console.warn(`[social] ${name}: failed, keeping previous (${err.message})`);
    }
  }

  if (!anyOk) {
    console.warn('[social] no source succeeded; leaving file untouched');
    return;
  }

  const result = Array.from(out.values());
  const parsed = SocialStatSchema.array().safeParse(result);
  if (!parsed.success) {
    console.error('[social] output failed validation, leaving file untouched:', parsed.error.issues);
    return;
  }
  const next = JSON.stringify(result, null, 2) + '\n';
  let current = '';
  try {
    current = await readFile(OUT, 'utf8');
  } catch {
    /* no file yet */
  }
  if (next === current) {
    console.log('[social] no change');
    return;
  }
  await writeJsonAtomic(OUT, result, { label: 'social-stats' });
  console.log(`[social] wrote ${OUT} (${result.length} platform rows)`);
}

// Fail-soft: log and exit green so a transient outage never blocks the run or
// deploys empty data. Per-source errors are already handled above.
main().catch((err) => {
  console.error('[social] unexpected error, leaving file untouched:', err);
});
