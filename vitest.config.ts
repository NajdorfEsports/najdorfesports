import { defineConfig } from 'vitest/config';

// Pure-logic unit tests over the data / i18n / lib modules, plus the feedback
// Worker's pure helpers (workers/feedback/src/lib.ts). None of them import Astro
// virtual modules (astro:*) or Cloudflare runtime bindings, so a plain
// Vite/Vitest config resolves everything (TS + JSON natively) without loading
// the full Astro config (which would pull in the Cloudflare adapter and hang the
// test process on close). The Worker source stays independent of the Astro
// build; only its unit tests run here.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'workers/**/*.test.ts'],
    environment: 'node',
  },
});
