# Najdorf Esports: Working Notes for Claude

Brief for future Claude Code sessions. Read this first, then the code. Things
already obvious from the file tree or `package.json` are not repeated here.

## Writing rules

- **NEVER use em-dashes (`—`) anywhere.** Not in user-facing copy, not in code
  comments, not in commit messages, not in PR descriptions. Em-dashes are a
  notorious AI tell and the owner is allergic to them. Use a period, a comma,
  a colon, a semicolon, parentheses, or restructure the sentence instead.
  En-dashes (`–`) are fine in numeric ranges. Hyphens (`-`) are fine.
- No "owner's name", real-life identity, or personal handles anywhere in
  copy, commits, JSON-LD, or meta tags. The org is the only identity. Player
  handles on the roster are fine; the rule is about the org's owner.

## Workflow

- **Commit directly to `main`. Do not open PRs.** Stage changes, commit with a
  descriptive message, push to `origin/main`. Cloudflare Pages picks it up
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
  roster are fine; the rule is about the org's owner.)
- Contact address everywhere: `owner@najdorfesports.gg`.
- Org JSON-LD `@id` is `https://najdorfesports.gg/#org`, emitted on every
  page by `BaseLayout.astro`. Per-page JSON-LD (SportsEvent, Person) should
  reference this `@id` rather than redefining the org.
- The org is **Najdorf Esports**, a separate entity that acquired the **Rankers**
  roster (Liquipedia spells it "Rankers" with an S, no Z, on the OWCS Pacific
  2026 Stage 1 bracket page). It is NOT a rebrand of Rankers. Phrasing in
  news posts, about copy, and any external comms should reflect that.

## Stack

- Astro 5 SSG + Tailwind 4 (CSS-first via `@tailwindcss/vite`) + TypeScript strict.
- Cloudflare Pages adapter (`@astrojs/cloudflare`); deploy is auto on push.
- **No UI-framework integrations.** No React/Preact/Svelte/Vue/Solid. Don't
  introduce one without flagging first. Vanilla inline scripts wrapped in
  `requestIdleCallback` (see `LiveHero.astro`) cover client-side needs.
- `sharp` is a devDep for the OG image script only. Keep it that way.

## i18n

- Astro built-in i18n, `prefixDefaultLocale: false`. English at `/`,
  `zh-TW` and `zh-CN` prefixed.
- `src/i18n/en.ts` is the source of truth. Every key here must exist in
  `zh-TW.ts` and `zh-CN.ts`; the shared `Strings` type enforces shape.
- **News and Matches are English-only.** They live at root (`/news/`,
  `/matches/`) with no localized variant. Non-en home pages show a
  "News articles are currently published in English only" line.
- Build localized URLs with `pathFor(locale, '/path/')`. Don't hand-craft
  `/zh-TW/...` strings.
- `{{TODO_zhTW: ...}}` / `{{TODO_zhCN: ...}}` markers in zh-* page
  `description` props mean a meta description is still the English source.
  Replace in-place when translated copy lands.
- `scripts/auto-translate-i18n.mjs` is a **one-shot helper**, not part of
  the build. Run manually, commit, hand-edit. Its inline string table is
  allowed to drift from `en.ts`. Don't trust it as a source.

## Data

- Roster, matches, achievements come from Liquipedia via a **weekly** GitHub
  Action (`.github/workflows/update-matches.yml`, Mondays 09:07 UTC).
  Trigger ad-hoc from the Actions tab if a mid-week move needs picking up.
- Auto outputs: `src/data/{roster,matches,achievements}.json`. Manual
  overrides live in `*.manual.json` siblings and **win on collision** via
  `mergeByKey` (key: `handle` for roster, `id` for matches and achievements).
  Auto-only entries are kept; manual-only entries are appended.
- Always edit the `.manual.json` for corrections. The auto file is rewritten
  by the GH Action. NOTE: if you need to remove a player that Liquipedia
  still lists, you have to also edit the auto file directly until Liquipedia
  catches up; manual overrides cannot delete an auto entry.
- `npm run fetch:player <url-or-handle> [--apply]` — pulls a single player's
  Liquipedia profile and shapes it into a `roster.manual.json` entry
  (handle, role, country + code, birth date, signature heroes, twitter /
  twitch / youtube, real name, liquipediaUrl). Without `--apply` it prints
  the entry to stdout for review; with `--apply` it merges into
  `roster.manual.json` by handle (existing manual keys win on collision).
  Run `npm run fetch:heroes` afterward so any new signature hero gets its
  portrait downloaded. Useful for new joins before the weekly team-page
  fetcher picks them up, or when overriding any field for one player.
- `npm run fetch:maps` — same shape as `fetch:heroes` but for map images.
  Reads every `mapScores[].map` from `matches.json` + `matches.manual.json`,
  downloads each map's image from Liquipedia's lpcommons, writes WebP
  thumbnails to `public/maps/<slug>.webp`, and rewrites `src/data/maps.json`
  with the name → URL map. `MatchCard.astro` uses these as the card
  backdrop (the deciding/last map of each match). Run this after the
  matches fetcher introduces a new map name.
- `src/data/site.ts` holds brand constants, OWCS season metadata, the
  socials list, and shared TS types. Socials with `url: 'TODO'` are filtered
  out by `<SocialRow>` so nothing broken ships.
- Sponsors and products are empty arrays at launch; UI hides empty sections
  automatically. Don't add a placeholder section back.
- News is an Astro content collection (`src/content/news/*.md`); schema in
  `src/content.config.ts`. Author defaults to `Najdorf Esports`.
- News front matter `tone` is `primary` (default) / `secondary` / `split`.
  These names map to the brand color palette in `NewsCover.astro` and the
  OG card generator.
- Roster portraits: add a real `.webp` to `public/roster/{handle}.webp`,
  THEN add the lowercase handle to `rosterPortraits` in
  `src/data/roster-portraits.ts`. Stub files alone don't flip the UI.

## Branding

- Brand colors live in `src/styles/tokens.css` and `global.css`:
  `--color-accent` (primary, blue `#215BFF`) and `--color-accent-2`
  (secondary, soft blue `#6B8DFF`). Both cascade into every component.
- The bishop logo is **strictly black and white**. The canonical raster
  source is `public/branding/najdorf-esports-logo.png` (transparent bg,
  opaque black artwork). `scripts/generate-og.mjs` derives every raster
  output from that single file (PWA icons, `bishop-logo.png`, and
  `bishop-logo-dark.png` for dark-bg uses via `.negate({alpha:false})`).
  Logo never gets tinted blue; brand blue is for UI accents only.
- Cache-bust the og:image URLs by bumping `OG_VERSION` in
  `BaseLayout.astro` whenever OG art changes; otherwise Discord/Slack/X
  serve stale unfurl cards from their CDN caches.

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

These are deliberate stances. Don't undo without flagging.

- **Zero own cookies.** No analytics, no third-party scripts, no
  fingerprinting. Nothing on the site touches `document.cookie`,
  `localStorage`, `sessionStorage`, or `IndexedDB`. (Cloudflare's `__cf_bm`
  security cookie is the only acceptable exception under the strictly-
  necessary doctrine.)
- Fonts are **self-hosted** from `/fonts/` (Anton + Inter, SIL OFL 1.1).
  Don't hot-link Google Fonts. That sends visitor IPs to Google and has
  been ruled a GDPR violation (Landgericht München 2022).
- Twitch player is **click-to-load** (`LiveHero.astro` facade). The
  iframe is only injected after the user clicks. Don't auto-embed.
- `public/_headers` defines a tight CSP. `frame-src` allows **only**
  `https://player.twitch.tv`. Adding a new third-party embed requires
  updating this header.
- `public/_redirects` handles www→apex, pages.dev→apex, and
  lowercase-locale fixups (`/zh-tw/*` → `/zh-TW/*`). Locale prefixes are
  case-sensitive on disk.
- Email addresses are wrapped in `<!--email_off--> ... <!--/email_off-->`
  HTML comments (rendered via `<Fragment set:html=...>`) to opt out of
  Cloudflare's automatic Email Obfuscation. If you add a new mailto link
  or visible email in a page or component, wrap it the same way.

## Out of scope (don't add unless asked)

Press kit, social icon links, individual player pages, per-page OG image
generation, iCal feed, streams hub, comment system, any form of analytics.
