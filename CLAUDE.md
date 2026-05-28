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
- **Matches IS localized** (en + zh-TW + zh-CN). Root `/matches/` plus
  `/zh-TW/matches/` and `/zh-CN/matches/`. All three are thin wrappers over
  `MatchesPageBody.astro`; the SportsEvent JSON-LD comes from
  `src/data/matches-jsonld.ts` (locale-independent, canonical English names).
  Tournament headings run through `translateTournament`.
- **News IS localized** (en + zh-TW + zh-CN). See the Data section for the
  `slug` + `locale` front-matter convention. The RSS feed and OG cards stay
  English-only on purpose (feed would otherwise triple; OG art reuses the
  English card by slug).
- Build localized URLs with `pathFor(locale, '/path/')`. Don't hand-craft
  `/zh-TW/...` strings.
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
  - **Preferred workaround:** instead of editing the auto file, add a manual
    entry with the same `handle` and `"status": "inactive"`. `RosterPageBody`
    filters those out of the `headcount` and they drop off the active sections
    naturally. This is reversible (delete the manual entry to re-list them)
    and survives the weekly fetch. Only fall back to editing the auto file
    if Liquipedia is wrong about a player who is genuinely off the roster
    AND you need them gone immediately. Do NOT invent a `_delete: true` flag
    in `mergeByKey`, the inactive-status pattern covers every real case.
- `npm run fetch:player <url-or-handle> [--apply]`: pulls one player's
  Liquipedia profile into a `roster.manual.json` entry (handle, role,
  country + code, birth date, signature heroes, socials, real name,
  liquipediaUrl). Without `--apply`, prints the entry to stdout for
  review; with `--apply`, merges into `roster.manual.json` by handle
  (existing manual keys win on collision). Run `npm run fetch:heroes`
  afterward so any new signature hero gets a portrait. Useful for
  mid-week joins before the weekly team-page fetcher picks them up.
- `npm run fetch:maps`: same shape as `fetch:heroes` but for map images.
  Reads every `mapScores[].map` from both match JSONs and merges with the
  hardcoded `OWCS_MAP_POOL` constant (the full current OW2 competitive
  rotation), then downloads each image from Liquipedia's lpcommons into
  `public/maps/<slug>.webp` and rewrites `src/data/maps.json`. New OW
  maps just need to be appended to that constant. Liquipedia files
  several maps under their real-world LOCATION name (Circuit Royal at
  `Monte_Carlo`, Colosseo at `Rome`, Watchpoint: Gibraltar at
  `Gibraltar`, etc.); those aliases live in `MAP_FILENAME_OVERRIDES` in
  the same script.
- `MatchCard.astro` backdrop priority:
  1. The LAST map of the match (the deciding map) with a known icon.
  2. Any earlier map in the match with a known icon (walk back).
  3. Hash-of-match-id fallback into the full pool, so future matches
     with no map data yet (TBD opponent, freshly imported) still get a
     backdrop. Same match → same hash → same backdrop on every load.
- `src/data/site.ts` holds brand constants, OWCS season metadata, the
  socials list, and shared TS types. Socials with `url: 'TODO'` are filtered
  out by `<SocialRow>` so nothing broken ships.
- `src/data/sponsors.json` is an empty array at launch; UI hides empty
  sections automatically. Don't add a placeholder section back.
- News is an Astro content collection (`src/content/news/*.md`); schema in
  `src/content.config.ts`. Author defaults to `Najdorf Esports`.
- **News is multilingual via a `slug` + `locale` convention.** Each article
  is three files sharing ONE `slug`: `<base>.md` (en), `<base>.zh-TW.md`,
  `<base>.zh-CN.md`. The English file's slug equals its filename base, so old
  `/news/<slug>/` URLs and `news-<slug>.png` OG cards keep working. Routes:
  `/news/`, `/zh-TW/news/`, `/zh-CN/news/` (index + `[slug]`) all filter the
  collection by `data.locale`. Every article should ship all three locales; a
  missing translation is soft-handled (the switcher falls back to that
  locale's news index, never 404s). Shared bodies live in
  `NewsList.astro` + `NewsArticle.astro`.
- **GOTCHA:** the `glob()` loader's default `generateId` returns
  `data.slug` when a `slug` field exists, which would collapse all three
  locale files to one entry id (only the last-read survives). We override
  `generateId` to key off the file path. Keep that override or news silently
  loses locales.
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

`/shop/` is a deliberate coming-soon stub (`src/pages/shop/index.astro`)
that announces drops with the OWCS Pacific Stage 2 LAN. Don't backfill
products data or convert the stub into a real catalog without being
asked.
