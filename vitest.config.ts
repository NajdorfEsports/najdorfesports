import { defineConfig } from 'vitest/config';

// Pure-logic unit tests over the data / i18n / lib modules. None of them import
// Astro virtual modules (astro:*), so a plain Vite/Vitest config resolves
// everything (TS + JSON natively) without loading the full Astro config (which
// would pull in the Cloudflare adapter and hang the test process on close).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
