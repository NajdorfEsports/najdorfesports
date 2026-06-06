/**
 * Social / community stats: config, types, formatting, and the merged loader.
 *
 * STATUS: LIVE for Discord + X. `SHOW_SOCIAL_STATS` is true and those two
 * channels have `display: true`, so their counts render in <CommunityCTA> (the
 * "Join the community" band on the home page). Channels still at zero (YouTube
 * / TikTok / Instagram) keep `display: false` and stay hidden. The standalone
 * <SocialStats /> strip remains available but is not placed anywhere; it is an
 * alternative surface, not required. To add a channel later: give it a real
 * `url` + the relevant id/username and set `display: true`. To hide all counts
 * again, flip `SHOW_SOCIAL_STATS` back to false (CommunityCTA reverts to no
 * counts automatically). `SHOW_LIVE_VIEWERS` still gates the live "watching
 * now" pill separately.
 *
 * PRIVACY: every number is fetched at BUILD TIME by
 * `scripts/fetch-social-stats.mjs` (a GitHub Action), written to
 * `social-stats.json`, and rendered statically. The visitor's browser never
 * talks to YouTube / TikTok / Instagram / X / Discord, so no visitor IP leaks,
 * no cookies, and no CSP change. Same fail-soft + manual-override contract as
 * roster / matches: corrections go in `social-stats.manual.json` and win on
 * collision (key: `platform`).
 */
import { mergeByKey } from './site';
import statsAuto from './social-stats.json';
import statsManual from './social-stats.manual.json';

/**
 * Master switch. While false the loader returns `[]` and the component renders
 * nothing, so the feature is invisible in production no matter what sits in the
 * JSON. Most channels are at zero today; turn this on when the numbers are
 * worth showing.
 *
 * Currently OFF by deliberate editorial choice: the org does not display raw
 * follower / member counts anywhere (small early numbers read as a negative
 * signal). <CommunityCTA> falls back to its no-number CTAs ("Join the Discord"
 * / "Follow on X") automatically. Flip back to `true` to surface counts again.
 */
export const SHOW_SOCIAL_STATS = false;

/**
 * Second switch, for the realtime "watching now" pill specifically. Even with
 * `SHOW_SOCIAL_STATS` on, the live pill stays hidden unless this is also true
 * AND a live count is present. True per-second realtime needs the runtime
 * upgrade noted in CLAUDE.md; until then the scheduled fetcher captures the
 * concurrent-viewer count as-of-last-refresh.
 */
export const SHOW_LIVE_VIEWERS = false;

export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'x' | 'discord';

export type SocialMetric =
  | 'subscribers' // youtube
  | 'followers' // tiktok / instagram / x
  | 'members' // discord
  | 'views' // youtube total views (secondary)
  | 'likes'; // tiktok hearts (secondary)

export interface SocialChannel {
  platform: SocialPlatform;
  /** Public profile / invite URL. 'TODO' keeps the channel out of every render. */
  url: string;
  /** @handle or label shown next to the count. */
  handle?: string;
  /** Which metric headlines this channel's stat card. */
  primaryMetric: SocialMetric;
  /**
   * Non-secret identifiers the build-time fetcher needs. The secret API keys
   * live in GitHub Actions secrets, never here. Leave these undefined until the
   * channel actually exists. Keep in sync with the CONFIG block in
   * scripts/fetch-social-stats.mjs.
   */
  youtubeChannelId?: string;
  tiktokUsername?: string;
  instagramUsername?: string;
  xUsername?: string;
  discordInvite?: string; // invite code only, e.g. '7X2QbvUW3z'
  /**
   * Per-channel display gate. Off by default so a freshly-added channel does
   * not surface a "0 followers" card before it is worth showing. A manual stat
   * row can override this via its own `display` field.
   */
  display: boolean;
}

/**
 * The channel registry. URLs mirror `socials` in site.ts where they exist.
 * Channels with `url: 'TODO'` (no account yet) never render, matching the
 * existing TODO-filter convention.
 */
export const socialChannels: ReadonlyArray<SocialChannel> = [
  {
    platform: 'discord',
    url: 'https://discord.gg/7X2QbvUW3z',
    handle: 'discord.gg/najdorf',
    primaryMetric: 'members',
    discordInvite: '7X2QbvUW3z',
    display: true,
  },
  {
    platform: 'x',
    url: 'https://x.com/najdorfesports',
    handle: '@najdorfesports',
    primaryMetric: 'followers',
    xUsername: 'najdorfesports',
    display: true,
  },
  {
    platform: 'youtube',
    url: 'TODO',
    primaryMetric: 'subscribers',
    // youtubeChannelId: 'UC...'  // set when the channel launches
    display: false,
  },
  {
    platform: 'tiktok',
    url: 'TODO',
    primaryMetric: 'followers',
    // tiktokUsername: 'najdorfesports',
    display: false,
  },
  {
    platform: 'instagram',
    url: 'TODO',
    primaryMetric: 'followers',
    // instagramUsername: 'najdorfesports',
    display: false,
  },
];

/**
 * A fetched stat row, keyed by `platform`. This is the shape that lands in
 * `social-stats.json` (auto) and `social-stats.manual.json` (override).
 */
export interface SocialStat {
  platform: SocialPlatform | 'twitch';
  /** Headline number (subscribers / followers / members). null = unknown. */
  count: number | null;
  /** Secondary numbers when available (e.g. youtube views, discord online). */
  secondary?: Record<string, number>;
  /** Concurrent viewers right now, when the channel is live-streaming. */
  liveViewers?: number | null;
  isLive?: boolean;
  /** ISO timestamp of the fetch that produced this row. */
  updated?: string;
  /** Per-row display override; a manual entry can force-show or force-hide. */
  display?: boolean;
}

/**
 * Compact number formatting (1500 -> "1.5K", 2_400_000 -> "2.4M"). Returns
 * "0" for a non-numeric input, though the loader only ever passes real
 * numbers through to the component.
 */
export function formatCount(n: number | null | undefined): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Merge auto + manual stat rows, then keep only channels that are both
 * configured-to-show and actually have a number. Returns `[]` whenever the
 * master switch is off, so every consumer is inert by default.
 */
export function loadSocialStats(): SocialStat[] {
  if (!SHOW_SOCIAL_STATS) return [];
  const merged = mergeByKey(
    statsAuto as SocialStat[],
    statsManual as SocialStat[],
    'platform',
  );
  const channelByPlatform = new Map(socialChannels.map((c) => [c.platform, c]));
  return merged.filter((s) => {
    const channel = channelByPlatform.get(s.platform as SocialPlatform);
    if (!channel || channel.url === 'TODO') return false;
    const show = s.display ?? channel.display;
    return show && typeof s.count === 'number';
  });
}

/**
 * The live "watching now" row, if any channel is currently streaming and the
 * live pill is enabled. Separate from `loadSocialStats` because a live row can
 * exist for a platform whose subscriber card is not shown.
 */
export function loadLiveViewers(): SocialStat | null {
  if (!SHOW_SOCIAL_STATS || !SHOW_LIVE_VIEWERS) return null;
  const merged = mergeByKey(
    statsAuto as SocialStat[],
    statsManual as SocialStat[],
    'platform',
  );
  return (
    merged.find((s) => s.isLive && typeof s.liveViewers === 'number') ?? null
  );
}
