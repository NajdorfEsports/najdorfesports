# Najdorf Esports: Working Notes for Claude

Brief for future Claude Code sessions. Read this first, then the code. Things
already obvious from the file tree or `package.json` are not repeated here.

## Writing rules

- **NEVER use em-dashes anywhere.** (An em-dash is the long dash at Unicode
  code point U+2014. This file names the code point instead of printing the
  character so the repo-wide em-dash guard can scan every file, this one
  included.) Not in user-facing copy, not in code comments, not in commit
  messages, not in PR descriptions. Em-dashes are a notorious AI tell and the
  owner is allergic to them. Use a period, a comma, a colon, a semicolon,
  parentheses, or restructure the sentence instead. En-dashes (`–`) are fine
  in numeric ranges. Hyphens (`-`) are fine.
- No "owner's name", real-life identity, or personal handles anywhere in
  copy, commits, JSON-LD, or meta tags. The org is the only identity. Player
  handles on the roster are fine; the rule is about the org's owner.

## Workflow

- **Commit directly to `main`. Do not open PRs.** Stage changes, commit with a
  descriptive message, push to `origin/main`. Cloudflare Pages picks it up
  from main automatically.
- ONE-TIME EXCEPTION: the 2026-06 redesign pass lives on `redesign/2026-06`
  and merges only after the owner approves its Pages preview. Everything
  after that merge returns to direct-to-main.
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

- Astro 6 SSG + Tailwind 4 (CSS-first via `@tailwindcss/vite`) + TypeScript strict.
- **Deliberately NO Cloudflare adapter** since the Astro 6 migration:
  @astrojs/cloudflare 13 dropped Pages support entirely (it targets Workers
  SSR). The site is fully prerendered; production is the Cloudflare PAGES
  git integration serving `dist` with `public/_headers` + `public/_redirects`.
  `wrangler.jsonc` is an assets-only Worker config that drives `npm run
preview` and the Playwright e2e server, nothing more.
- package.json pins `vite` via an npm override to Astro's major: without it,
  `@tailwindcss/vite` resolves the next vite major and the build fails on
  plugin-internal API drift.
- **No UI-framework integrations.** No React/Preact/Svelte/Vue/Solid. Don't
  introduce one without flagging first. Vanilla PROCESSED scripts (Astro
  `<script>`, bundled into `/_astro/*.js`) cover client-side needs; see the
  CSP section for why inline scripts are banned.
- Navigation is plain cross-document with NATIVE view transitions declared
  in `global.css` (`@view-transition`; the header bishop/wordmark morph via
  `.vt-*` classes). The old ClientRouter was removed: its SPA swap silently
  skipped re-running inline scripts (it killed the burger menu in
  production) and it blocked the no-inline-JS CSP. Don't reintroduce it
  without solving both.
- `sharp` is a devDep; Astro's static image service uses it at build time
  (plus the OG script). Keep it a devDep.

## Dev tooling and quality gates

- **After clone:** run `npm install` (the `prepare` script auto-points
  `core.hooksPath` at `.githooks`; or run `npm run hooks:install`). Use Node 22
  (`.nvmrc`); `engines` requires >= 22.18 because the `fetch:*` scripts import
  the TypeScript schema module (`src/data/schemas.ts`) directly via Node's
  native type-stripping.
- **Commands:** `npm run check` (= `astro check`, the typecheck), `npm test`
  (Vitest; the pure-logic suite under `src/**/*.test.ts`), `npm run format` /
  `npm run format:check` (Prettier), `npm run test:e2e` (Playwright against
  an existing `dist`; `test:e2e:full` builds first; the webServer is
  `wrangler dev`, so `_headers`/`_redirects` apply like production). All
  dev-only; nothing ships to the browser.
- **E2E rules:** specs assert STRUCTURE and visibility, never opponents,
  counts, or W-L values; the weekly Liquipedia refresh must never break a
  test. The no-JS spec (e2e/nojs.spec.ts) is the guard for the reveal
  doctrine below.
- **CI** (`.github/workflows/ci.yml`) runs the em-dash guard, `astro check`,
  `format:check`, `npm test`, the build, the no-inline-scripts guard, and
  Playwright on every push to main and `redesign/**`. The **pre-commit
  hook** (`.githooks/pre-commit`) mirrors the fast gates on staged files.
  Scheduled (never deploy-blocking): `lighthouse.yml` asserts the
  performance budgets weekly (en pages >= 0.97; zh pages >= 0.90 because
  their ~290KB self-hosted CJK payload is priced into Lighthouse's
  simulation even though it loads post-idle); `links.yml` sweeps built
  links with lychee and opens an issue on failures.
- **Data validation:** `src/data/schemas.ts` is the single source of truth for
  both the data-layer types (`z.infer`) and build-time validation. `loaders.ts`
  and `social.ts` validate every `data/*.json` against it, so a malformed
  Liquipedia fetch fails the build with a precise message instead of shipping
  broken; the fetch scripts validate their output against the same schemas
  before writing. ONE zod: import from `'zod'` (the explicit v4 dep)
  everywhere, including `src/content.config.ts` (Astro 6's content layer
  accepts Standard Schema validators, so the old v3/v4 split is gone).
- `LiveHero.astro` is in `.prettierignore`: prettier-plugin-astro 0.14 cannot
  parse its countdown script. Leave it hand-formatted.

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
- New zh strings are machine-drafted but NEVER final: tag each with
  `// DRAFT PENDING RIRI NATIVE REVIEW` and list them for review.
- **CJK fonts:** zh pages self-host subsetted Noto Sans TC/SC. Run
  `npm run build:fonts` after adding or changing ANY zh copy and commit
  the regenerated `public/fonts/*.subset.woff2` +
  `public/styles/fonts-cjk.css` (the font-coverage vitest fails with the
  missing characters listed if you forget). The faces load post-idle via
  `src/scripts/fonts.ts` and are deliberately NOT render-critical: zh
  body/chrome uses the metrics-matched system stacks, Noto carries
  headings and article prose.

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
  `src/assets/maps/<slug>.webp` and rewrites `src/data/maps.json`. New OW
  maps just need to be appended to that constant. Liquipedia files
  several maps under their real-world LOCATION name (Circuit Royal at
  `Monte_Carlo`, Colosseo at `Rome`, Watchpoint: Gibraltar at
  `Gibraltar`, etc.); those aliases live in `MAP_FILENAME_OVERRIDES` in
  the same script.
- **Image pipeline (2026-06):** hero/map/highlight art lives in
  `src/assets/{heroes,maps,highlights}` and ships build-optimized through
  astro:assets. `heroes.json` / `maps.json` map display names to SLUGS;
  `src/lib/assetImages.ts` joins them with `import.meta.glob` lookups,
  fail-soft on either side of a JSON/file drift. A fetcher run needs zero
  code changes (restart `astro dev` locally so the glob re-resolves).
  `public/` keeps only stable-URL assets: branding + OG, fonts, favicons,
  manifest, robots, `_headers`, `_redirects`, roster portrait stubs.
  Backdrop art is texture behind scrims: keep candidates right-sized (one
  640w for match backdrops, 320w for strips); oversized eager images
  starve the display font, which is the text LCP.
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
- **Social / community stats: DORMANT by owner decision (2026-06-11).**
  `src/data/social.ts` holds the config, types, `formatCount`, and two master
  switches. `SHOW_SOCIAL_STATS` is `false`: the owner keeps counts hidden while
  the numbers are small (single/low double digits read as a liability, not
  social proof). Do NOT flip it without the owner's go-ahead. When it flips to
  `true`, Discord + X (`display: true`) render a "<count> members/followers"
  line in `<CommunityCTA>` (the "Join the community" band on the home page)
  with zero other changes. `SHOW_LIVE_VIEWERS` is also `false` (gates the live
  "watching now" pill). Channels at zero (YouTube / TikTok / Instagram) keep
  `display: false` and stay hidden regardless. The standalone `<SocialStats>`
  strip (`components/team/`) exists but is not placed anywhere; it's an
  alternative surface. The data pipeline stays LIVE so the switch is the only
  change needed later: counts are fetched at BUILD time by
  `scripts/fetch-social-stats.mjs` (`npm run fetch:social`), written to
  `social-stats.json` (auto) with a `social-stats.manual.json` override merged
  by `platform` (manual wins, same contract as roster/matches). No client ever
  calls a third party, so the zero-cookie / no-third-party-script posture and
  the CSP are untouched. The fetcher is fail-soft (keeps each source's last good
  value; never writes empty). Discord member/online counts need NO secret
  (public invite endpoint; the fetcher reads only the aggregate numbers, never
  the inviter's personal account). YouTube (subs + views + live viewers), X
  (followers; PAID API), and Twitch (live "watching now") are optional and only
  run when their secrets are present; TikTok + Instagram have no simple API and
  stay on manual override. **The X follower count is maintained BY HAND** (no
  free API): edit `count` in `social-stats.manual.json`. The refresh workflow
  (`.github/workflows/refresh-social-stats.yml`) runs **weekly** (Mon 09:22 UTC)
  and on manual dispatch; it auto-commits `social-stats.json` only when a number
  changes. True per-second "watching now" realtime (vs the scheduled snapshot)
  would need an on-demand endpoint (which would need re-adding an SSR adapter);
  `connect-src 'self'` is already in the CSP, so only the adapter question
  matters for that upgrade.
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
  Logo never gets tinted blue; brand blue is for UI accents only. The
  HEADER serves an astro:assets-optimized copy from
  `src/assets/branding/`; the public file keeps its stable URL for the
  press kit and OG pipeline. The bishop is also never run through the
  `.ink-img` duotone (that treatment is for Blizzard art only).
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
- `public/_headers` defines a tight CSP. **`script-src` has NO
  'unsafe-inline'**: every script is an Astro-processed module bundled
  into `/_astro/*.js` (`vite build.assetsInlineLimit: 0` stops small
  bundles being re-inlined), and `scripts/check-no-inline-scripts.mjs`
  enforces the invariant in CI. JSON-LD blocks stay inline (they are
  non-executable data). Never add an `is:inline` executable script;
  client behavior goes in `src/scripts/*.ts` or a component-level
  processed `<script>`. `frame-src` allows **only**
  `https://player.twitch.tv`, `https://www.youtube-nocookie.com`, and
  `https://app.cal.com`; `script-src` and `connect-src` additionally allow
  `https://app.cal.com` for the coaching embed. Adding any other
  third-party embed requires updating this header. `style-src` keeps
  'unsafe-inline' (inline style attributes + Astro's inlined small
  stylesheets + the Cal embed's runtime styles); the reason is documented
  in the header file.
- **No-JS doctrine:** content must be 100% visible with scripting off. A
  script may only hide content whose hidden initial state is gated on
  `@media (scripting: enabled)` in CSS (see `.reveal` in `global.css`,
  which also carries a 3s failsafe so a blocked script can never strand
  content invisible; the mobile nav has a matching `scripting: none`
  fallback). The e2e no-JS spec enforces this.
- The Cal.com coaching embed is **lazy** (same doctrine as the Twitch
  facade): `embed.js` is fetched only on the first hover/focus/touch/click
  of a Book button, never at page load. Do not convert it to an eager embed.
  See the Coaching section.
- `public/_redirects` handles **path-based** redirects only: the news-slug
  rename and the lowercase-locale fixups (`/zh-tw/*` → `/zh-TW/*`). Locale
  prefixes are case-sensitive on disk. **Host** redirects do NOT work in
  `_redirects`: Cloudflare Pages matches the source on path only, so a
  `https://www.../*` source never fires (it is dead weight). `www` → apex is
  a Cloudflare zone-level **Single Redirect** in the dashboard (match
  `https://www.*` → `https://${1}`, 301, verified live).
  `najdorfesports.pages.dev` still serves 200 (it cannot be redirected from
  this zone), but every page's canonical points at the apex. Don't re-add a
  `https://.../*` host line to `_redirects`.
- Email addresses are wrapped in `<!--email_off--> ... <!--/email_off-->`
  HTML comments (rendered via `<Fragment set:html=...>`) to opt out of
  Cloudflare's automatic Email Obfuscation. If you add a new mailto link
  or visible email in a page or component, wrap it the same way.

## Coaching

- `/coaching/` (all three locales) is a thin wrapper over
  `CoachingPageBody.astro`. Per-coach FACTS and localized prose (bio, region
  note) live in `src/data/coaching.ts` so adding coach #2 is a pure data
  change. Shared page chrome (section headings, filter and payment labels,
  FAQ) is in `t.coaching.*`.
- The page is a coach browser with role/language/hero filters, then a
  per-coach two-step booking flow (payment method, then tier). There is no
  customer-location/region step (deliberately removed: every region was
  offered the same methods, so it only added friction). All vanilla, no
  framework; `src/scripts/coaching.ts` (a processed module loaded only on
  this page) drives the filters and the payment selector. Default: card.
- Dual payment: card (Stripe) and PayPal. Cal.com allows one payment app per
  event type, so each tier exists twice: the canonical slugs are the card
  variants, the `<slug>-paypal` twins are PayPal. `BookingLink.enabled` gates
  each; a disabled link renders "Coming soon", never a dead anchor.
- Booking is Cal.com popup embeds. Each Book control is BOTH a real anchor to
  `cal.com/<slug>` (no-JS fallback) and carries `data-cal-link`/`data-cal-config`.
  `embed.js` loads lazily on first hover/focus/touch/click of a Book control
  (privacy doctrine, see Privacy); a too-early first click is replayed once the
  embed registers, else it falls back to opening the Cal.com link. Keep it lazy.
- Prices in `coaching.ts` are display-only (`priceUsd`) and MUST match the
  Cal.com event settings; when a price changes there, update `priceUsd` and the
  matching "Save $X" badge strings in all three i18n files.
- If an in-iframe checkout is ever blocked, the fix is extending `frame-src`
  with the processor redirect origins or relaxing the `payment=()` entry in the
  Permissions-Policy in `public/_headers` for the embed, NOT removing the popup
  or opening a second tab.
- There is deliberately NO free/intro tier anywhere; the owner ordered it
  scrubbed. Do not reintroduce it.
- No Service/Product/FAQPage JSON-LD on the coaching page; the org node +
  breadcrumbs from `BaseLayout` are the deliberate scope. The page uses the
  default OG card on purpose.
- 48-hour post-session feedback is a separate Cloudflare Worker in
  `workers/feedback/` (Cal.com BOOKING_PAID webhook to a Resend email linking a
  Tally form), independent of the Astro build. See `workers/feedback/SETUP.md`.
  zh strings added in the rebuild carry DRAFT PENDING RIRI NATIVE REVIEW markers.

## Out of scope (don't add unless asked)

Per-page OG image generation, iCal feed, streams hub, comment system, any
form of analytics. (Individual player pages are NO LONGER out of scope:
they were built out in the 2026-06 pass with derived team stats from
`src/lib/derived-stats.ts`; the honesty rule there is that per-player
appearances are NOT derivable from Liquipedia data, so everything is
labelled as team results. Never invent per-player numbers.)

`/shop/` is a deliberate coming-soon stub (`src/pages/shop/index.astro`)
that announces drops with the OWCS Pacific Stage 2 LAN. Don't backfill
products data or convert the stub into a real catalog without being
asked.
