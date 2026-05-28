import { en, type Strings } from './en';
import { zhTW } from './zh-TW';
import { zhCN } from './zh-CN';

export const SUPPORTED_LOCALES = ['en', 'zh-TW', 'zh-CN'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

const dict: Record<Locale, Strings> = {
  en,
  'zh-TW': zhTW,
  'zh-CN': zhCN,
};

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  'zh-TW': '繁中',
  'zh-CN': '简中',
};

/**
 * Resolve the active locale from Astro.currentLocale (or any string), with a
 * safe fallback to the default. Pages should always call this rather than
 * indexing `dict` directly.
 */
export function useT(localeLike: string | undefined): Strings {
  if (!localeLike) return dict[DEFAULT_LOCALE];
  return dict[localeLike as Locale] ?? dict[DEFAULT_LOCALE];
}

/**
 * Resolve the active locale from the Astro global (anything exposing
 * `currentLocale`), with a safe fallback to the default. Replaces the
 * `(Astro.currentLocale ?? DEFAULT_LOCALE) as Locale` cast that every page
 * and component otherwise repeats.
 */
export function getLocale(astro: { currentLocale?: string }): Locale {
  return (astro.currentLocale ?? DEFAULT_LOCALE) as Locale;
}

/**
 * Primary navigation links, shared by SiteHeader and SiteFooter so the two
 * never drift. Localized routes go through `pathFor`; Matches is English-only
 * per spec and always links to the un-prefixed `/matches/` path.
 */
export function primaryNav(locale: Locale, t: Strings): Array<{ href: string; label: string }> {
  return [
    { href: pathFor(locale, '/'),        label: t.nav.home    },
    { href: pathFor(locale, '/roster/'), label: t.nav.roster  },
    { href: '/matches/',                 label: t.nav.matches },
    { href: pathFor(locale, '/news/'),   label: t.nav.news    },
    { href: pathFor(locale, '/about/'),  label: t.nav.about   },
  ];
}

/**
 * Build the absolute pathname for a given locale + page path. Default locale
 * stays prefix-less; non-default locales get a leading `/{locale}` segment.
 *
 * pathFor('en',    '/roster/') -> '/roster/'
 * pathFor('zh-TW', '/roster/') -> '/zh-TW/roster/'
 * pathFor('zh-TW', '/')        -> '/zh-TW/'
 */
export function pathFor(locale: Locale, pagePath: string): string {
  const clean = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === '/' ? '/' : clean}`;
}

/**
 * Strip the locale prefix from a pathname so we can re-prefix it for other
 * locales. `/zh-TW/roster/` -> `/roster/`; `/roster/` -> `/roster/`.
 */
export function unlocalizedPath(pathname: string): string {
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}` || pathname === `/${locale}/`) return '/';
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length);
    }
  }
  return pathname;
}
