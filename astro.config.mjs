// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://najdorfesports.gg',
  // The sitemap `i18n` block mirrors the routing config below so the
  // generated sitemap emits <xhtml:link rel="alternate" hreflang="...">
  // entries linking each page to its localized variants. Keys are the
  // on-disk path prefixes; values are the hreflang language tags. Without
  // this, the sitemap lists URLs with no alternate-language signal, which
  // is a real (and free) SEO loss for an APAC-facing org. Pages with no
  // localized variants (legal, shop) simply appear without alternates,
  // which is correct.
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', 'zh-TW': 'zh-TW', 'zh-CN': 'zh-CN' },
      },
      // The Press / Media Kit is built but kept dormant: exclude it (and its
      // localized variants) from the sitemap so search engines don't discover
      // it before it is ready. It also carries a noindex meta. Remove this
      // filter and the noindex when surfacing the page.
      filter: (page) => !page.includes('/press/'),
    }),
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-TW', 'zh-CN'],
    routing: { prefixDefaultLocale: false },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    inlineStylesheets: 'auto',
  },

  // Deliberately NO adapter. The site is fully prerendered static HTML;
  // production is the Cloudflare PAGES git integration serving `dist` with
  // public/_headers and public/_redirects, and @astrojs/cloudflare 13
  // dropped Pages support entirely (it now targets Workers SSR, which this
  // site doesn't use; its workerd build environment also breaks build-time
  // CJS deps). Astro's static output optimizes images with sharp at build
  // time by default, so nothing was lost by removing it. Local production
  // preview stays `npm run preview` (wrangler dev serving dist as an
  // assets-only Worker, which applies _headers and _redirects).
});
