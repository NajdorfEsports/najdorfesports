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
    plugins: [tailwindcss()],
  },

  build: {
    inlineStylesheets: 'auto',
  },

  adapter: cloudflare()
});