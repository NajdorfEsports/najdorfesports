/**
 * Coaching data: the single source of truth for the /coaching/ page.
 *
 * Locale-independent FACTS and per-coach localized prose (bio, region note)
 * live here, so that adding a second coach is a pure data change. Shared page
 * chrome (section headings, filter labels, payment labels, FAQ) is localized in
 * the i18n dictionaries (t.coaching.*). Region options live in ./regions.
 *
 * Each paid tier exists once per payment processor because Cal.com allows
 * exactly one payment app per event type. The page routes the visitor to the
 * matching processor's Cal.com event. A link whose twin event does not exist
 * yet (enabled: false) renders a "Coming soon" state, never a dead anchor.
 *
 * Prices are DISPLAY-ONLY static values that must match the Cal.com event
 * settings. Nothing here is fetched or computed at runtime. When a price
 * changes in Cal.com, update it here (one place) and the matching "Save $X"
 * badge string in the i18n files.
 */
import type { Role } from './site';

/** Cal.com account handle that owns every coaching event. */
export const CAL_ACCOUNT = 'najdorfesports';

/**
 * Cal.com embed origin (the host of embed.js). Passed explicitly to Cal("init")
 * in the page embed script. Kept here so the data layer and the inline script
 * reference the same value (the script hardcodes the literal and carries a sync
 * comment, since an is:inline script cannot import this module).
 */
export const CAL_ORIGIN = 'https://app.cal.com';

/**
 * Public booking-page origin for the no-JS fallback link. Each Book control is
 * a real anchor to `${CAL_BOOKING_ORIGIN}/<calLink>` that the embed upgrades to
 * a popup on click, so booking still works if embed.js fails or JS is off.
 * Distinct from CAL_ORIGIN (the embed script host).
 */
export const CAL_BOOKING_ORIGIN = 'https://cal.com';

/**
 * Booker brand color. Cal's embed API needs a literal hex (it cannot read a CSS
 * custom property), so this MUST be kept in sync with --color-accent in
 * src/styles/global.css.
 */
export const CAL_BRAND_COLOR = '#215BFF';

/** Community Discord invite, reused from the shop CTA. */
export const COACHING_DISCORD_INVITE = 'https://discord.gg/7X2QbvUW3z';

export type Processor = 'stripe' | 'paypal';
export type Tier = 'single' | 'pack2' | 'pack4';
export type LanguageId = 'cantonese' | 'mandarin';
export type Loc = 'en' | 'zh-TW' | 'zh-CN';

export interface BookingLink {
  processor: Processor;
  /** Cal.com event link "account/event-slug", bound by the popup data-cal-link. */
  calLink: string;
  /** false until the twin event type exists in Cal.com and is verified non-404. */
  enabled: boolean;
}

export interface Offering {
  tier: Tier;
  /** Static display price in USD, must match Cal.com. Localized copy never overrides it. */
  priceUsd: number;
  durationMin: number;
  /** Sessions included in the offering (1, 2, 4). */
  sessions: number;
  /** Exactly one booking link per processor. */
  links: BookingLink[];
}

export interface CoachLanguage {
  id: LanguageId;
  /** ISO codes for the flag(s) shown beside the localized language label. */
  flags: string[];
}

export interface Coach {
  /** URL-safe id, used for the booking section anchor (book-<slug>). */
  slug: string;
  /** Public identity: gamer tag only (brand rule, no legal names in copy). */
  displayName: string;
  /** Role key into t.roles. */
  role: Role;
  languages: CoachLanguage[];
  /** Signature heroes; also drive the PlayerAvatar art on the coach card. */
  heroes: string[];
  /** ISO code for the flag shown next to the localized region note. */
  countryCode: string;
  /** Localized "based in" note, e.g. "Hong Kong (UTC+8)". */
  regionNote: Record<Loc, string>;
  /** Localized bio joined to the coach card. */
  bio: Record<Loc, string>;
  /** Map slug under public/maps/ faded behind the coach card. */
  backdropMap: string;
  /** The paid ladder, ascending. */
  offerings: Offering[];
}

/**
 * Build the per-processor links for a tier. The base Cal.com event slugs are the
 * card (Stripe) variants; the PayPal twins follow the "<slug>-paypal" convention.
 * Both sets exist and are live (verified non-404), so callers pass
 * paypalEnabled: true. The default stays false so a future tier whose PayPal
 * twin has not been created yet ships "Coming soon" instead of a dead anchor.
 */
function links(baseSlug: string, paypalEnabled = false): BookingLink[] {
  return [
    { processor: 'stripe', calLink: `${CAL_ACCOUNT}/${baseSlug}`, enabled: true },
    { processor: 'paypal', calLink: `${CAL_ACCOUNT}/${baseSlug}-paypal`, enabled: paypalEnabled },
  ];
}

/**
 * Launch roster: one coach. Identity is the gamer tag only. Facts mirror the
 * roster entry; the signature heroes drive the PlayerAvatar art, since no real
 * headshot is registered yet. Bio and region note are localized here so adding
 * coach #2 stays a pure data change. zh strings are drafts pending native review.
 */
export const COACHES: ReadonlyArray<Coach> = [
  {
    slug: 'brysonbtw',
    displayName: 'brysonbtw',
    role: 'DPS',
    countryCode: 'hk',
    heroes: ['Reaper', 'Echo'],
    backdropMap: 'kings-row',
    languages: [
      { id: 'cantonese', flags: ['hk'] },
      { id: 'mandarin', flags: ['tw', 'cn'] },
    ],
    regionNote: {
      en: 'Hong Kong (UTC+8)',
      // DRAFT PENDING RIRI NATIVE REVIEW
      'zh-TW': '香港（UTC+8）',
      // DRAFT PENDING RIRI NATIVE REVIEW
      'zh-CN': '香港（UTC+8）',
    },
    bio: {
      en: 'brysonbtw is a DPS on the Najdorf Esports OWCS Pacific roster. He plays a fast, aggressive style built around Reaper and Echo, and in coaching he focuses on the positioning, target priority, and split-second decisions that turn solid mechanics into wins. Every session is hands-on and shaped around your replays and your goals.',
      // DRAFT PENDING RIRI NATIVE REVIEW
      'zh-TW':
        'brysonbtw 是 Najdorf Esports OWCS Pacific 名單上的輸出選手。他以 Reaper 與 Echo 為核心，打法快速而具侵略性；在教學中，他著重於將紮實的基本功，轉化為決定勝負的站位、目標選擇與臨場判斷。每一堂課都注重實作，並依你的錄影與目標量身打造。',
      // DRAFT PENDING RIRI NATIVE REVIEW
      'zh-CN':
        'brysonbtw 是 Najdorf Esports OWCS Pacific 名单上的输出选手。他以 Reaper 与 Echo 为核心，打法快速而具侵略性；在教学中，他着重于把扎实的基本功，转化为决定胜负的站位、目标选择与临场判断。每一节课都注重实操，并依你的录像与目标量身打造。',
    },
    offerings: [
      {
        tier: 'single',
        priceUsd: 15,
        durationMin: 60,
        sessions: 1,
        links: links('overwatch-coaching-1h', true),
      },
      {
        tier: 'pack2',
        priceUsd: 25,
        durationMin: 60,
        sessions: 2,
        links: links('brysonbtw-2-session-pack', true),
      },
      {
        tier: 'pack4',
        priceUsd: 50,
        durationMin: 60,
        sessions: 4,
        links: links('brysonbtw-4-session-pack', true),
      },
    ],
  },
];

/** Public booking URL for the no-JS fallback anchor. */
export function bookingUrl(calLink: string): string {
  return `${CAL_BOOKING_ORIGIN}/${calLink}`;
}

/** The booking link for a given processor, if the offering defines one. */
export function linkFor(offering: Offering, processor: Processor): BookingLink | undefined {
  return offering.links.find((l) => l.processor === processor);
}

/** Distinct roles present across all coaches (for the role filter). */
export function coachRoles(): Role[] {
  return [...new Set(COACHES.map((c) => c.role))];
}

/** Distinct language ids present across all coaches (for the language filter). */
export function coachLanguageIds(): LanguageId[] {
  return [...new Set(COACHES.flatMap((c) => c.languages.map((l) => l.id)))];
}

/** Distinct signature heroes across all coaches, sorted (for the hero filter). */
export function coachHeroes(): string[] {
  return [...new Set(COACHES.flatMap((c) => c.heroes))].sort();
}
