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
