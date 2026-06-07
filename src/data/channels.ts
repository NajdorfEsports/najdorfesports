/**
 * THE single source of truth for the org's social channels. Both worlds derive
 * from this one array:
 *   - the UI helpers in site.ts (displaySocials / communitySocials / sameAsUrls)
 *     drive the footer + About chip row, the home "Join the community" band, and
 *     the JSON-LD `sameAs`.
 *   - the build-time stats config in social.ts (statsChannels) and
 *     scripts/fetch-social-stats.mjs read the fetcher identifiers.
 *
 * This is a LEAF module: it imports nothing from site.ts / social.ts, so the
 * existing site<->social cycle (social.ts imports mergeByKey from site.ts) is
 * not reintroduced. Keep it dependency-free.
 *
 * Flags default to the common case, so most entries need none:
 *   - display   (default true):  visible chip in <SocialRow> (footer + About).
 *   - community (default false): card in the home "Join the community" band.
 *   - sameAs    (default true):  included in the org JSON-LD `sameAs` list.
 * A `url: 'TODO'` entry is dormant everywhere until a real URL lands.
 */

/** Platforms that can headline a community-stats card. Twitch is excluded: it
 *  only contributes a live "watching now" count, never a follower card. */
export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'x' | 'discord';
export type SocialMetric = 'subscribers' | 'followers' | 'members' | 'views' | 'likes';
/** Channel-registry platform key: the social platforms plus twitch. */
export type ChannelPlatform = SocialPlatform | 'twitch';

export interface Channel {
  /** Canonical lowercase key (matches a social-stats row's `platform`). */
  platform: ChannelPlatform;
  /** Display label (drives <PlatformIcon> + the CTA copy). */
  name: 'Discord' | 'X' | 'Twitch' | 'YouTube' | 'TikTok' | 'Instagram';
  /** Public profile / invite URL. 'TODO' keeps the channel dormant everywhere. */
  url: string;
  /** @handle or short label shown next to the link. */
  handle?: string;
  /** One-line CTA copy used by <CommunityCTA>. */
  blurb?: string;
  display?: boolean;
  community?: boolean;
  sameAs?: boolean;
  /** Present => this channel can headline a stats card (see statsChannels). */
  primaryMetric?: SocialMetric;
  // Non-secret identifiers the build-time stats fetcher needs; secrets stay in
  // GitHub Actions env, never here.
  discordInvite?: string;
  xUsername?: string;
  youtubeChannelId?: string;
  tiktokUsername?: string;
  instagramUsername?: string;
}

export const channels: ReadonlyArray<Channel> = [
  {
    platform: 'discord',
    name: 'Discord',
    url: 'https://discord.gg/7X2QbvUW3z',
    // Visible label MUST match the href: the discord.gg/najdorf vanity does not
    // resolve to our server, so we show the permanent invite code instead.
    handle: 'discord.gg/7X2QbvUW3z',
    blurb: 'Hang with the squad. Match chat, watch parties, and roster updates first.',
    community: true,
    primaryMetric: 'members',
    discordInvite: '7X2QbvUW3z',
  },
  {
    platform: 'x',
    name: 'X',
    url: 'https://x.com/najdorfesports',
    handle: '@najdorfesports',
    blurb: 'Roster moves, match results, and OWCS Pacific posts, straight from the org.',
    community: true,
    primaryMetric: 'followers',
    xUsername: 'najdorfesports',
  },
  {
    // Org-owned Twitch channel: footer + About chip row, the community band, and
    // JSON-LD sameAs. No primaryMetric (live "watching now" only, never a card).
    platform: 'twitch',
    name: 'Twitch',
    url: 'https://www.twitch.tv/najdorfesports',
    handle: 'twitch.tv/najdorfesports',
    blurb: 'Live on match days, with co-streams and scrim VODs between fixtures.',
    community: true,
  },
  {
    // Org YouTube channel for highlights and recaps. Same surfaces as Twitch.
    platform: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/@NajdorfEsportsOW',
    handle: 'youtube.com/@NajdorfEsportsOW',
    blurb: "Match highlights, recaps, and the squad's best plays.",
    community: true,
    primaryMetric: 'subscribers',
    // youtubeChannelId: 'UC...'  // set when the stats fetch is wired up
  },
  // TikTok + Instagram: dormant (url 'TODO') so they render nowhere; kept for
  // the stats config (statsChannels) if/when those accounts launch.
  { platform: 'tiktok', name: 'TikTok', url: 'TODO', primaryMetric: 'followers' },
  { platform: 'instagram', name: 'Instagram', url: 'TODO', primaryMetric: 'followers' },
];
