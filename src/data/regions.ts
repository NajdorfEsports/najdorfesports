/**
 * Region options for the coaching booking flow's first step.
 *
 * The region step is a plain client-side choice (no IP geolocation, no cookies,
 * nothing persisted). Today every live region exposes the same payment methods,
 * so the step is partly future-proofing: if a region ever needs a different
 * processor set, that is a data edit here, not a redesign.
 *
 * The selector renders only `live: true` regions. Launching a scaffolded region
 * later is a single flag flip. Labels are localized; zh strings are drafts
 * pending native review.
 */
import type { Processor, Loc } from './coaching';

export interface RegionOption {
  id: 'na' | 'hk' | 'tw' | 'cn' | 'global' | 'eu' | 'sa' | 'africa' | 'me';
  /** Localized region label shown on the selector button. */
  label: Record<Loc, string>;
  /** Payment methods offered in this region (today the same set everywhere). */
  methods: Processor[];
  /** The selector renders only live regions. */
  live: boolean;
}

const BOTH: Processor[] = ['stripe', 'paypal'];

export const REGIONS: ReadonlyArray<RegionOption> = [
  {
    id: 'na',
    // DRAFT PENDING RIRI NATIVE REVIEW (zh-TW, zh-CN)
    label: { en: 'North America', 'zh-TW': '北美', 'zh-CN': '北美' },
    methods: BOTH,
    live: true,
  },
  {
    id: 'hk',
    // DRAFT PENDING RIRI NATIVE REVIEW (zh-TW, zh-CN)
    label: { en: 'Hong Kong', 'zh-TW': '香港', 'zh-CN': '香港' },
    methods: BOTH,
    live: true,
  },
  {
    id: 'tw',
    // DRAFT PENDING RIRI NATIVE REVIEW (zh-TW, zh-CN)
    label: { en: 'Taiwan', 'zh-TW': '台灣', 'zh-CN': '台湾' },
    methods: BOTH,
    live: true,
  },
  {
    id: 'cn',
    // DRAFT PENDING RIRI NATIVE REVIEW (zh-TW, zh-CN)
    label: { en: 'Mainland China', 'zh-TW': '中國大陸', 'zh-CN': '中国大陆' },
    methods: BOTH,
    live: true,
  },
  {
    id: 'global',
    // DRAFT PENDING RIRI NATIVE REVIEW (zh-TW, zh-CN)
    label: { en: 'Global', 'zh-TW': '全球', 'zh-CN': '全球' },
    methods: BOTH,
    live: true,
  },
  {
    id: 'eu',
    // DRAFT PENDING RIRI NATIVE REVIEW (zh-TW, zh-CN)
    label: { en: 'Europe', 'zh-TW': '歐洲', 'zh-CN': '欧洲' },
    methods: BOTH,
    live: false,
  },
  {
    id: 'sa',
    // DRAFT PENDING RIRI NATIVE REVIEW (zh-TW, zh-CN)
    label: { en: 'South America', 'zh-TW': '南美洲', 'zh-CN': '南美洲' },
    methods: BOTH,
    live: false,
  },
  {
    id: 'africa',
    // DRAFT PENDING RIRI NATIVE REVIEW (zh-TW, zh-CN)
    label: { en: 'Africa', 'zh-TW': '非洲', 'zh-CN': '非洲' },
    methods: BOTH,
    live: false,
  },
  {
    id: 'me',
    // DRAFT PENDING RIRI NATIVE REVIEW (zh-TW, zh-CN)
    label: { en: 'Middle East', 'zh-TW': '中東', 'zh-CN': '中东' },
    methods: BOTH,
    live: false,
  },
];

/** Default region preselected so the page is never empty. */
export const DEFAULT_REGION_ID = 'global';

/** Default payment method preselected (card, which is live at launch). */
export const DEFAULT_PROCESSOR: Processor = 'stripe';

/** Regions that render in the selector. */
export function liveRegions(): RegionOption[] {
  return REGIONS.filter((r) => r.live);
}
