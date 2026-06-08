/**
 * Coaching offerings: the single source of truth for the /coaching/ page.
 *
 * Locale-independent FACTS live here (Cal.com links, prices, durations, the
 * coach data). All prose (titles, blurbs, badges, hero, FAQ) is localized in
 * the i18n dictionaries (t.coaching.*) and joined to these rows by `id`.
 *
 * Prices are DISPLAY-ONLY static values that must match the Cal.com event
 * settings. Nothing here is fetched or computed at runtime. When a price
 * changes in Cal.com, update it here (one place) and the matching "Save $X"
 * badge string in the i18n files.
 */

/** Cal.com account handle that owns every coaching event. */
export const CAL_ACCOUNT = 'najdorfesports';

/**
 * Cal.com embed origin. This is the cloud default; it is passed explicitly to
 * Cal("init") in the page embed script. Kept here so the data layer and the
 * inline script reference the same value (the script hardcodes the literal and
 * carries a sync comment, since an is:inline script cannot import this module).
 */
export const CAL_ORIGIN = 'https://app.cal.com';

/**
 * Booker brand color. Cal's embed API needs a literal hex (it cannot read a CSS
 * custom property), so this MUST be kept in sync with --color-accent in
 * src/styles/global.css. It is the only place the raw brand hex is allowed to
 * live outside the token definition.
 */
export const CAL_BRAND_COLOR = '#215BFF';

/** Community Discord invite, reused from the shop CTA. */
export const COACHING_DISCORD_INVITE = 'https://discord.gg/7X2QbvUW3z';

export type OfferingId = 'single' | 'pack2' | 'pack4';

export interface Offering {
  id: OfferingId;
  /** Cal.com event link "account/event-slug", bound by the popup data-cal-link. */
  calLink: string;
  /** Static display price, must match Cal.com. Localized copy never overrides it. */
  priceLabel: string;
  /** Numeric USD price for the Offer JSON-LD only. */
  priceUsd: number;
  /** Sessions included in the offering. */
  sessions: number;
  /** Minutes per session. */
  minutesPerSession: number;
}

/**
 * The paid ladder, ascending. Badges and blurbs live in
 * t.coaching.offerings.items (single carries no badge, the packs show savings).
 * The free intro call event still exists in Cal.com but is not surfaced here.
 */
export const OFFERINGS: ReadonlyArray<Offering> = [
  {
    id: 'single',
    calLink: `${CAL_ACCOUNT}/overwatch-coaching-1h`,
    priceLabel: '$15 USD',
    priceUsd: 15,
    sessions: 1,
    minutesPerSession: 60,
  },
  {
    id: 'pack2',
    calLink: `${CAL_ACCOUNT}/brysonbtw-2-session-pack`,
    priceLabel: '$25 USD',
    priceUsd: 25,
    sessions: 2,
    minutesPerSession: 60,
  },
  {
    id: 'pack4',
    calLink: `${CAL_ACCOUNT}/brysonbtw-4-session-pack`,
    priceLabel: '$50 USD',
    priceUsd: 50,
    sessions: 4,
    minutesPerSession: 60,
  },
];

/**
 * v1 coach. Identity is the gamer tag only (brand rule: no legal names in
 * public copy, even though the roster pages show them). Facts mirror the
 * roster entry; the signature heroes drive the PlayerAvatar art on the coach
 * card, since no real headshot exists yet (public/roster/brysonbtw.webp is a
 * stub and is not registered in roster-portraits).
 */
export const COACH = {
  handle: 'brysonbtw',
  /** Role key into t.roles. */
  role: 'DPS',
  /** ISO code for the flag shown next to the localized country label. */
  countryCode: 'hk',
  signatureHeroes: ['Reaper', 'Echo'],
  /** Map art faded behind the coach card. Any slug under public/maps/. */
  backdropMap: 'kings-row',
  /**
   * Spoken languages, each with the flag(s) shown beside it. Labels are
   * localized (t.coaching.coach.lang*); `flags` are ISO codes for CountryFlag.
   * Mandarin shows both Taiwan and mainland China per the owner's choice.
   */
  languages: [
    { id: 'cantonese', flags: ['hk'] },
    { id: 'mandarin', flags: ['tw', 'cn'] },
  ],
} as const;
