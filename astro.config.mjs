// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://najdorfesports.gg',
  integrations: [sitemap()],

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