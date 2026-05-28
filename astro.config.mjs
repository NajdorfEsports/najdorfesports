// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://najdorfesports.gg',
  // The sitemap `i18n` block mirrors the routing config below so the
  // generated sitemap emits <xhtml:link rel="alternate" hreflang="...">
  // entries linking each page to its localized variants. Keys are the
  // on-disk path prefixes; values are the hreflang language tags. Without
  // this, the sitemap lists URLs with no alternate-language signal, which
  // is a real (and free) SEO loss for an APAC-facing org. News and Matches
  // are English-only and have no localized variants, so they simply appear
  // without alternates, which is correct.
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', 'zh-TW': 'zh-TW', 'zh-CN': 'zh-CN' },
      },
    }),
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-TW', 'zh-CN'],
    routing: { prefixDefaultLocale: false },
  },

  vite: {
    // `@tailwindcss/vite` ships against the standalone vite package, while
    // Astro pulls in its own vendored vite copy under astro/node_modules.
    // The two emit structurally identical Plugin types that astro check
    // can't reconcile, the cast collapses the duplicate-version noise
    // without affecting runtime behavior.
    plugins: [/** @type {any} */ (tailwindcss())],
  },

  build: {
    inlineStylesheets: 'auto',
  },

  // No server-state on this site (fully static prerender). The Cloudflare
  // adapter auto-enables a KV-backed session store unless an explicit
  // driver is set; an in-memory unstorage driver short-circuits that so
  // the build doesn't ask for a SESSION KV binding that doesn't exist.
  session: {
    driver: 'memory',
  },

  // `imageService: 'compile'` is already the adapter default, but setting
  // it explicitly suppresses the "Cloudflare does not support sharp at
  // runtime" warning. Sharp is a devDep used at build time only.
  adapter: cloudflare({
    imageService: 'compile',
  }),
});