/**
 * Social / community stats: config, types, formatting, and the merged loader.
 *
 * STATUS: dormant. While `SHOW_SOCIAL_STATS` is false the loaders return []/null
 * and the <SocialStats> strip renders nothing, so the feature is invisible in
 * production no matter what sits in the JSON. Flip it to true (and
 * `SHOW_LIVE_VIEWERS` for the live pill) when the numbers are worth showing.
 *
 * The channel registry itself lives in ./channels (the single source of truth);
 * here we only derive the stat-bearing subset and load/merge the fetched counts.
 *
 * PRIVACY: every number is fetched at BUILD TIME by
 * scripts/fetch-social-stats.mjs (a GitHub Action), written to
 * social-stats.json, and rendered statically. The visitor's browser never talks
 * to a third party. Same fail-soft + manual-override contract as roster/matches:
 * corrections go in social-stats.manual.json and win on collision (key:
 * `platform`). The merged file is validated against SocialStatSchema at module
 * load, so a malformed social-stats.json fails the build even while the feature
 * is off.
 */
import { mergeByKey } from './site';
import { channels, type SocialPlatform, type SocialMetric, type ChannelPlatform } from './channels';
import { parseData, validateArray, SocialStatSchema, type SocialStat } from './schemas';
import statsAuto from './social-stats.json';
import statsManual from './social-stats.manual.json';

// Re-export the channel vocabulary + the stat row type so existing importers
// (e.g. <SocialStats>) keep resolving these from here.
export type { SocialPlatform, SocialMetric, ChannelPlatform, SocialStat };

/**
 * Master switch. While false the loader returns [] and the component renders
 * nothing. Currently OFF by deliberate editorial choice: the org does not
 * display raw follower / member counts anywhere (small early numbers read as a
 * negative signal). <CommunityCTA> falls back to its no-number CTAs
 * automatically. Flip back to `true` to surface counts again.
 */
export const SHOW_SOCIAL_STATS = false;

/**
 * Second switch, for the realtime "watching now" pill specifically. Even with
 * `SHOW_SOCIAL_STATS` on, the live pill stays hidden unless this is also true
 * AND a live count is present.
 */
export const SHOW_LIVE_VIEWERS = false;

/**
 * Channels that can headline a stats card (those with a `primaryMetric`),
 * derived from the single `channels` registry so the Discord/X/etc. identifiers
 * live in exactly one place. Replaces the old standalone `socialChannels` array.
 */
export const statsChannels = channels.filter((c) => c.primaryMetric);

/**
 * Compact number formatting (1500 -> "1.5K", 2_400_000 -> "2.4M"). Returns "0"
 * for a non-numeric input.
 */
export function formatCount(n: number | null | undefined): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

// Validate + merge at module load (build time), so a malformed social-stats.json
// fails `astro build` regardless of the feature flag. Manual overrides win,
// keyed by platform, same contract as roster/matches.
const mergedStats = validateArray(
  SocialStatSchema,
  (() => {
    const { auto, manual } = parseData(SocialStatSchema, statsAuto, statsManual, 'social-stats');
    return mergeByKey(auto, manual as SocialStat[], 'platform');
  })(),
  'social-stats (merged)',
);

/**
 * The stat rows to render, kept only for channels that are configured-to-show
 * and actually have a number. Returns [] whenever the master switch is off, so
 * every consumer is inert by default.
 */
export function loadSocialStats(): SocialStat[] {
  if (!SHOW_SOCIAL_STATS) return [];
  const channelByPlatform = new Map(statsChannels.map((c) => [c.platform, c]));
  return mergedStats.filter((s) => {
    const channel = channelByPlatform.get(s.platform);
    if (!channel || channel.url === 'TODO') return false;
    const show = s.display ?? channel.display !== false;
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
  return mergedStats.find((s) => s.isLive && typeof s.liveViewers === 'number') ?? null;
}
