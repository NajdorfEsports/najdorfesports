# Najdorf Esports — Working Notes for Claude

## Workflow

- **Commit directly to `main`. Do not open PRs.** Owner prefers to skip the
  branch-and-merge cycle for this project. Stage changes, commit with a
  descriptive message, push to `origin/main`. Cloudflare Pages picks it up
  from main automatically.
- If a change is risky enough that you'd normally want review before merging,
  flag it in chat and ask before pushing rather than putting it behind a PR.
- Stop only for genuine blockers (missing input, irreversible action, a
  decision only the owner can make). Otherwise keep going.

## Identity rules

- The org is the only identity that appears anywhere in the codebase or
  rendered output. **No personal/owner names** in code, comments, commits,
  copy, meta tags, or JSON-LD.
- Contact address is `owner@najdorfesports.gg`.

## Stack reminders

- Astro 5 + Tailwind 4 (CSS-first config via `@tailwindcss/vite`) + TypeScript SSG
- Cloudflare Pages adapter (`@astrojs/cloudflare`); deploy is auto on push to main
- No UI framework integrations — no React/Preact/Svelte/Vue/Solid. Don't
  introduce one without flagging first; vanilla scripts wrapped in
  `requestIdleCallback` cover client-side needs.
- i18n: Astro built-in, `prefixDefaultLocale: false`. English at `/`, Chinese
  at `/zh-TW/` and `/zh-CN/`. Matches and News are English-only.
- Roster, matches, and achievements come from Liquipedia via a 6-hourly
  GitHub Action. Manual overrides live in `*.manual.json` and win on collision
  via `mergeByKey`.

## Out of scope (don't add unless asked)

Press kit, social icon links, individual player pages, OG image generation,
iCal feed, streams hub.
