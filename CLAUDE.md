# Najdorf Esports — Working Notes for Claude

Brief for future Claude Code sessions. Read this first, then the code. Things
already obvious from the file tree or `package.json` are not repeated here.

## Workflow

- **Commit directly to `main`. Do not open PRs.** Stage changes, commit with a
  descriptive message, push to `origin/main` — Cloudflare Pages picks it up
  from main automatically.
- Flag in chat before pushing if a change is risky (irreversible, public-facing
  copy, security-relevant). Otherwise keep going.
- Stop only for genuine blockers (missing input, irreversible action, a
  decision only the owner can make).
- Use the date from the current-session system reminder for "Last updated"
  lines and JSON-LD dates instead of hard-coding a stale one.

## Identity

- The **org** is the only identity in code, copy, commits, meta tags, or
  JSON-LD. **No personal/owner names anywhere.** (Player handles in the
  roster are fine — the rule is about the org's owner.)
- Contact address everywhere: `owner@najdorfesports.gg`.
- Org JSON-LD `@id` is `https://najdorfesports.gg/#org`, emitted on every
  page by `BaseLayout.astro`. Per-page JSON-LD (SportsEvent, Person) should
  reference this `@id` rather than redefining the org.

## Stack

- Astro 5 SSG + Tailwind 4 (CSS-first via `@tailwindcss/vite`) + TypeScript strict.
- Cloudflare Pages adapter (`@astrojs/cloudflare`); deploy is auto on push.
- **No UI-framework integrations.** No React/Preact/Svelte/Vue/Solid. Don't
  introduce one without flagging first. Vanilla inline scripts wrapped in
  `requestIdleCallback` (see `LiveHero.astro`) cover client-side needs.
- `sharp` is a devDep for the OG image script only — keep it that way.

## i18n

- Astro built-in i18n, `prefixDefaultLocale: false`. English at `/`,
  `zh-TW` and `zh-CN` prefixed.
- `src/i18n/en.ts` is the source of truth. Every key here must exist in
  `zh-TW.ts` and `zh-CN.ts`; the shared `Strings` type enforces shape.
- **News and Matches are English-only.** They live at root (`/news/`,
  `/matches/`) with no localized variant. Non-en home pages show a
  "News articles are currently published in English only" line.
- Build localized URLs with `pathFor(locale, '/path/')` — don't hand-craft
  `/zh-TW/...` strings.
- `{{TODO_zhTW: ...}}` / `{{TODO_zhCN: ...}}` markers in zh-* page
  `description` props mean a meta description is still the English source.
  Replace in-place when translated copy lands.
- `scripts/auto-translate-i18n.mjs` is a **one-shot helper**, not part of
  the build. Run manually, commit, hand-edit. Its inline string table is
  allowed to drift from `en.ts` — don't trust it as a source.

## Data

- Roster, matches, achievements come from Liquipedia via a **weekly** GitHub
  Action (`.github/workflows/update-matches.yml`, Mondays 09:07 UTC).
  Trigger ad-hoc from the Actions tab if a mid-week move needs picking up.
- Auto outputs: `src/data/{roster,matches,achievements}.json`. Manual
  overrides live in `*.manual.json` siblings and **win on collision** via
  `mergeByKey` (key: `handle` for roster, `id` for matches and achievements).
  Auto-only entries are kept; manual-only entries are appended.
- Always edit the `.manual.json` for corrections — the auto file is
  rewritten by the GH Action.
- `src/data/site.ts` holds brand constants, OWCS season metadata, the
  socials list, and shared TS types. Socials with `url: 'TODO'` are filtered
  out by `<SocialRow>` so nothing broken ships.
- Sponsors and products are empty arrays at launch; UI hides empty sections
  automatically. Don't add a placeholder section back.
- News is an Astro content collection (`src/content/news/*.md`); schema in
  `src/content.config.ts`. Author defaults to `Najdorf Esports`.
- Roster portraits: add a real `.webp` to `public/roster/{handle}.webp`,
  THEN add the lowercase handle to `rosterPortraits` in
  `src/data/roster-portraits.ts`. Stub files alone don't flip the UI.

## Liquipedia compliance

The fetcher (`scripts/fetch-liquipedia.mjs`) must keep:

- Descriptive `User-Agent` with site URL + contact email (default fetch UA
  is BANNED by Liquipedia).
- 30s sleep between `action=parse` calls; 2s between non-parse follow-ups.
- Fail-soft on any error: leave the JSON file untouched. The site never
  deploys with empty data.
- `TEAM_LIQUIPEDIA_NAMES` tries both `'Najdorf Esports'` and `'Rankers'` so
  a Liquipedia page rename works zero-downtime. Keep older aliases in the
  list during transitions.

Attribution to Liquipedia + CC BY-SA 3.0 link is **required** on every page
that surfaces this data (currently footer, `/matches`, `/roster`).

## Privacy and security

These are deliberate stances — don't undo without flagging.

- **Zero own cookies.** No analytics, no third-party scripts, no
  fingerprinting. Nothing on the site touches `document.cookie`,
  `localStorage`, `sessionStorage`, or `IndexedDB`. (Cloudflare's `__cf_bm`
  security cookie is the only acceptable exception under the strictly-
  necessary doctrine.)
- Fonts are **self-hosted** from `/fonts/` (Anton + Inter, SIL OFL 1.1).
  Don't hot-link Google Fonts — that sends visitor IPs to Google and has
  been ruled a GDPR violation (Landgericht München 2022).
- Twitch player is **click-to-load** (`LiveHero.astro` facade) — the
  iframe is only injected after the user clicks. Don't auto-embed.
- `public/_headers` defines a tight CSP. `frame-src` allows **only**
  `https://player.twitch.tv` — adding a new third-party embed requires
  updating this header.
- `public/_redirects` handles www→apex, pages.dev→apex, and
  lowercase-locale fixups (`/zh-tw/*` → `/zh-TW/*`). Locale prefixes are
  case-sensitive on disk.

## Out of scope (don't add unless asked)

Press kit, social icon links, individual player pages, per-page OG image
generation, iCal feed, streams hub, comment system, any form of analytics.
