# Najdorf Esports site: audit-and-fix report

Date: 2026-05-28. Branch: `main`.

## Important environment constraint (read first)

**Node.js is not installed on this machine.** `node`, `npm`, `npx`, and
`wrangler` are all absent from PATH, and there is no `node_modules/`. That
means I could **not** run `npm install`, `npm audit`, `npm outdated`,
`npm run build`, or `astro check` locally. `git`, `curl`, and `python` are
available, and the live production site is reachable.

I adapted the engagement to that reality rather than guessing:

- For dependency work I read `package-lock.json` directly (it is committed and
  authoritative for resolved versions) and queried the npm registry over HTTPS
  with `curl` for the latest published versions.
- I verified the live security posture with `curl -sI` against production.
- I made only changes I could verify **without** a build: metadata-string edits
  validated by JSON parsing and an `npm ci` sync-equality check in Python,
  documentation files (which Astro never imports, so they cannot break a build),
  and a JSONC comment validated by re-parsing the file.
- Every change that genuinely needs a build to verify (dependency *upgrades*
  that regenerate the lockfile, adapter/output changes, runtime data
  validation) is escalated to **Owner action items** with exact commands rather
  than committed blind. The repo's CI workflow (`.github/workflows/ci.yml`)
  will build-verify every push, so the committed changes are also gated there.

Nothing was left in a knowingly broken state.

---

## 1. Summary

The repo had already absorbed most of a prior hardening pass (CSP lockdown,
JSON-LD escaping, sitemap hreflang, SHA-pinned Actions, a CI build gate). This
pass **verified those against the real code and the live site** (which the
prior research pass could not read) and found them genuinely in place and
effective. The substantive new work: tightened two loose dependency ranges up
to the already-patched astro 5.18 / adapter 12.6 line (lockfile kept in sync by
hand and verified), documented the Pages-vs-wrangler deploy split so it can no
longer read as unresolved drift, and added an owner-facing `MAINTENANCE.md`.
The dependency tree is already past every CVE floor named in the brief, and on
this fully-static deploy most of those CVEs are not even reachable.

## 2. Per-task results

### Task 1 — Dependency security and pinning (DONE)

**Found:** `package-lock.json` already resolves **astro 5.18.1** and
**@astrojs/cloudflare 12.6.13** (top-level `wrangler` 4.94.0, consistent with
package.json `^4.94.0`, no lock/manifest mismatch). astro 5.18.1 is above every
advisory floor in the brief (CVE-2025-55303 fixed 5.13.2, CVE-2025-59837 fixed
5.13.10, plus CVE-2025-61925 / 64525 / 65019 and CVE-2026-25545). The gap was
only in the **declared ranges**: `astro` floored at `^5.13.0` (below those
fixes) and the adapter was a bare `"12"` with no caret. `sharp` is correctly a
devDependency and stays one (the adapter uses `imageService: 'compile'`).

**Fixed (commit `66b0e35`):** raised the declared floors to
`astro: ^5.18.0` and `@astrojs/cloudflare: ^12.6.13` in both `package.json`
**and** the `packages.""` block of `package-lock.json`, so `npm ci`'s
sync check still passes. Verified with Python that (a) both files parse as
JSON, (b) the dependency/devDependency blocks are byte-identical between the
two files, and (c) the resolved versions (5.18.1, 12.6.13) satisfy the new
ranges. Resolved graph is unchanged; this only prevents a future install from
silently resolving below the patched line.

**Left alone:** did not bump the resolved astro to the newest 5.x patch
(5.18.2) because that requires `npm install` to fetch the tarball and rewrite
integrity hashes, which I cannot run. Did not touch `@astrojs/sitemap`,
`tailwindcss`, or `wrangler` ranges (already sensible). See Owner action items
for the one-command refresh.

### Task 2 — Pages-vs-Workers config drift (DONE, verified clean)

**Found:** the repo carries both Pages artifacts (`public/_headers`,
`public/_redirects`, README says Pages) and a Workers `wrangler.jsonc`
(`main: dist/_worker.js/index.js`, ASSETS binding, `npm run deploy = wrangler
deploy`). `astro.config.mjs` sets **no `output`** (so default `static`) and
**no route sets `prerender = false`** (grep confirmed). The site is fully
static.

**Verified against production (the key thing the prior pass could not do):**

- The full CSP **and** HSTS are present on the apex, a locale path
  (`/zh-TW/`), a deep route (`/matches/`), a cached static asset
  (`/favicon.svg`), **and** the 404 response. So `_headers` governs every
  response; the "CSP silently disappears on worker responses" failure mode is
  **not occurring**.
- `/_worker.js` and `/_worker.js/index.js` both return **404** in production:
  server code is not exposed as a public asset.
- `/_image?...` returns **404**: there is no live image endpoint, consistent
  with a fully-static, build-time-compiled image service.

So the drift is a **clarity/maintainability** issue, not an active security
hole. Production runs on the Pages Git integration; `wrangler.jsonc` is only
the manual `npm run deploy` / `npm run preview` fallback.

**Fixed (commit `2186e64`):** added a header comment to `wrangler.jsonc`
spelling out that it is the manual fallback, that production is Pages + static,
and a warning to re-verify CSP/HSTS if production ever moves to `wrangler
deploy` (where `_headers` covers asset responses only). Validated the file
still parses as JSONC. Recorded the same in `MAINTENANCE.md`.

**Left alone:** did not remove the Cloudflare adapter to produce a worker-free
static build. That is the theoretically cleanest end state, but it changes the
build output and couples to the adapter-specific `session` / `imageService`
config, so it needs a build to verify, which I cannot run. See Owner action
items for the recommendation and trade-off.

### Task 3 — Security headers / CSP (verified; one low finding)

**Found / verified (real strings below in section 3):** strong CSP with
`default-src 'self'`, `frame-src https://player.twitch.tv` only,
`frame-ancestors 'none'`, `base-uri 'self'`, `object-src 'none'`,
`form-action 'self'`, plus `manifest-src`/`worker-src 'self'` and
`upgrade-insecure-requests`. `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a tight
`Permissions-Policy`, COOP/CORP, and `X-Frame-Options: DENY` are all present
and **live**. HSTS is live with `max-age=31536000; includeSubDomains; preload`.

**Two honest caveats, not fixed (reasons below):**

1. `script-src` still includes `'unsafe-inline'`. It is genuinely required by
   the current inline scripts: the reveal-on-scroll and count-up IIFEs and the
   `LiveHero` countdown in `BaseLayout.astro` / `LiveHero.astro`, plus Astro's
   `ClientRouter`. Removing it cleanly means per-script hashes/nonces, which on
   Astro means the experimental CSP feature (`experimental.csp`) or moving the
   scripts to external files, both of which need a build to verify. `style-src
   'unsafe-inline'` is likewise needed by Astro's scoped/inline styles.
2. Every response carries `Access-Control-Allow-Origin: *`. It is **not** in
   `_headers` and **not** in app code (no `functions/`, no middleware); it is
   injected by the Cloudflare asset layer (it is even baked into the cached
   `favicon.svg` `HIT`). On a fully public, **cookieless** static site this is
   low risk (CWE-942 matters when responses carry credentialed or private data;
   nothing here does). I did not blind-add an `! Access-Control-Allow-Origin`
   unset to `_headers` because I cannot verify whether it takes effect against a
   platform-injected header and a bad line could weaken the whole file. See
   Owner action items.

> Note: the cached `/favicon.svg` currently serves the **older** CSP (missing
> `object-src`/`manifest-src`/`worker-src`) because it is a stale CDN `HIT`
> from before commit `30bed2b`. The HTML responses serve the current CSP. This
> is cache aging, not a config bug; it self-heals or can be purged.

### Task 4 — GitHub Actions workflow + fetcher (verified clean)

**Found:** `.github/workflows/update-matches.yml` declares least-privilege
`permissions: contents: write`, uses `stefanzweifel/git-auto-commit-action`
(which uses the built-in `GITHUB_TOKEN`, no PAT), and **every** action is
pinned to a full commit SHA with the human tag in a trailing comment. Triggers
are `workflow_dispatch` + weekly `schedule` only, **not** `push`, so the
auto-commit cannot recurse. `scripts/fetch-liquipedia.mjs` matches its
documented behavior exactly: descriptive `User-Agent` with site URL + contact
email, `Accept-Encoding: gzip`, a 30s sleep between every `action=parse` call,
per-fetch `try/catch`, and a fail-soft `safeWrite` that preserves the existing
JSON on any empty/failed result (with atomic temp-file + rename). Nothing to
fix.

### Task 5 — CI build gate (verified present)

**Found:** `.github/workflows/ci.yml` already runs `npx astro check` + `npm run
build` on push to `main` and on PRs, with `permissions: contents: read`,
SHA-pinned actions, and `concurrency` cancellation. No deploy step (Cloudflare
owns deploy). This is exactly the requested safety net; nothing to add.

### Task 6 — SEO (verified)

- Sitemap **i18n is configured** in `astro.config.mjs` (added in commit
  `f48b027`), mirroring the routing locales, so hreflang alternates emit for
  en / zh-TW / zh-CN.
- `public/robots.txt` exists and references `sitemap-index.xml`. (Production
  also serves Cloudflare-managed AI-crawler rules layered on top, with the same
  `Sitemap:` line.)
- `BaseLayout.astro` builds **absolute** canonical and `og:image` URLs via
  `new URL(..., site.url)`, emits hreflang alternates + `x-default`, and
  per-page JSON-LD (`SportsOrganization` with stable `@id`, `NewsArticle`
  referencing that `@id`) is structurally sound. No change needed.

### Task 7 — Accessibility & performance (verified)

- Images: `PlayerAvatar.astro` uses `alt`, explicit `width`/`height`,
  `loading="lazy"`, `decoding="async"`; the monogram fallback uses
  `role="img"` + `aria-label`.
- Semantics: skip link to `#main`, `<main id="main" tabindex="-1">`, persistent
  `<header>`/`<footer>`.
- The Twitch facade is a real `<button>` with `aria-label` and a `polite`
  live region for the countdown; keyboard-accessible by construction.
- Fonts: the two latin woff2 files are `<link rel="preload" ... crossorigin>`
  and all four `@font-face` blocks use `font-display: swap`.

No concrete defects found, so no markup was restructured for taste.

### Task 8 — Type-safety & set:html (verified; one recommendation)

- **`set:html` audit (clean):** every usage is either the static
  `<!--email_off-->` / `<!--/email_off-->` literal comments, or the JSON-LD
  blocks serialized through `serializeJsonLd`, which escapes `< > &` to `\uXXXX`
  (commit `1c5b42e`). No `set:html` is ever fed raw Liquipedia or external data.
- **Runtime data validation:** `src/data/loaders.ts` casts the merged
  roster/matches/achievements JSON with `as` and does not validate it at build
  time (unlike news, which has a Zod schema). Adding validation is reasonable
  but needs either a new dependency (`zod`) or hand-rolled guards plus a build
  to verify, neither of which I can do here. Left as a recommendation; did
  **not** migrate the JSON into content collections (out of scope / growth-
  triggered).

### Task 9 — Owner maintenance cheat-sheet (DONE)

**Added (commit `296ae46`):** `MAINTENANCE.md`, a short task-oriented guide
(bench a player via `status: inactive`, add/correct a player, add a match by
hand, publish a news post including the **`npm run build:og` share-card
gotcha**, when to bump `OG_VERSION`, trigger the Liquipedia refresh, the two
house rules) with a pointer back to `CLAUDE.md` for depth. Linked from
`README.md`.

### Task 10 — Git hygiene (verified; one owner item)

**Found:** a pattern scan (`git grep` for AWS keys, private-key headers, Slack
tokens, GitHub tokens, Google API keys, Stripe keys, and generic
secret/token/password strings) over all tracked files returned only false
positives (a `tokenize()` helper, a match `id` containing the literal
"team-secret", and privacy copy about Cloudflare's bot-management token). No
`.env`, `.dev.vars`, `.pem`, or `.key` files are tracked; `.gitignore` already
excludes them. `package.json` is `version: 0.1.0`, `private: true`, no LICENSE
file. `gitleaks` is not installed, so I could not scan git **history**; flagged
below.

## 3. Verified facts (things the prior audit had to take on faith)

- **Static vs SSR:** fully static. No `output` set (default `static`), no
  `prerender = false` anywhere, and `/_image` is 404 in production.
- **CVE reachability:** the `/_image`-route and SSR-only CVEs (CVE-2025-55303,
  CVE-2025-59837, CVE-2025-65019, and the X-Forwarded-Host / Host-header items
  CVE-2025-61925 / 64525 / CVE-2026-25545) are **not reachable** on this static
  deploy (no live image endpoint, no per-request SSR). They are also already
  patched in the locked astro 5.18.1. Net: hygiene, not active exposure.
- **Real CSP string (served live on HTML):**
  `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src https://player.twitch.tv; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; manifest-src 'self'; worker-src 'self'; upgrade-insecure-requests`
- **Other live response headers (apex):** `Strict-Transport-Security:
  max-age=31536000; includeSubDomains; preload`, `X-Content-Type-Options:
  nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy: accelerometer=(),
  camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(),
  payment=(), usb=()`, `Cross-Origin-Opener-Policy: same-origin`,
  `Cross-Origin-Resource-Policy: same-site`, `X-XSS-Protection: 0`, and a stray
  `Access-Control-Allow-Origin: *` (platform-injected; see Task 3).
- **`_worker.js` exposure:** none (`/_worker.js` -> 404).
- **Actions permissions:** data workflow `contents: write` only, built-in
  `GITHUB_TOKEN`, all actions SHA-pinned, no `push` trigger (no recursion). CI
  workflow `contents: read` only.
- **Fetcher behavior:** descriptive UA + contact email, gzip, 30s parse
  rate-limit, fail-soft + atomic writes, per-fetch try/catch. Matches CLAUDE.md.

## 4. Owner action items (need the dashboard or a decision)

1. **Refresh the dependency tree when convenient (optional, low priority).**
   The locked versions are already patched. To pull the newest 5.x patch and
   regenerate the lockfile cleanly, on a machine with Node:
   ```bash
   npm install astro@^5.18.0 @astrojs/cloudflare@^12.6.13
   npm audit
   ```
   Do **not** jump to astro 6 / adapter 13 (drops Pages support; that is the
   separate planned migration). I could not run `npm audit` here; CI will.

2. **HSTS preload (verify / decide).** HSTS is already served with `preload`.
   Submitting the apex to the browser preload list
   (https://hstspreload.org/) is a deliberate, hard-to-undo step. The
   `_headers` value already meets the requirements; decide consciously before
   submitting. Setting/confirming HSTS at the edge (Cloudflare dashboard ->
   SSL/TLS -> Edge Certificates) is the most reliable place if you ever change
   it.

3. **`Access-Control-Allow-Origin: *` (low risk).** It is injected by the
   Cloudflare asset layer, not by this repo, and is harmless on a cookieless
   public static site. If you want it gone, the cleanest lever is a Cloudflare
   **Transform Rule** (Response Header -> remove `Access-Control-Allow-Origin`)
   in the dashboard, which reliably runs after asset serving. Test on a preview
   host first.

4. **Pages-vs-Workers platform decision (clarity).** Recommended: keep the
   current Pages Git deploy and treat `wrangler.jsonc` as the documented manual
   fallback (now commented). If you would rather have a single path, the
   worker-free option is to drop the Cloudflare adapter and ship a pure static
   build, but that touches the `session`/`imageService` config and needs a
   build + redeploy to verify. Not done here for that reason.

5. **Git-history secret scan.** `gitleaks` is not installed locally and I did
   not scan history. Recommended one-off on a Node/Docker machine:
   ```bash
   gitleaks detect --source . --redact
   ```
   The working-tree scan was clean. If history ever shows a hit, rotate the
   credential rather than rewriting history blindly.

6. **Optional: runtime validation for Liquipedia-sourced JSON.** Consider a
   lightweight Zod (or hand-rolled) schema in `src/data/loaders.ts` so a
   malformed upstream payload fails the build loudly instead of shipping
   structurally-wrong data. Low priority; needs a build to verify.

## 5. npm audit before/after and final versions

`npm audit` / `npm outdated` **could not be run** (no Node on this machine).
Substitute evidence from the committed lockfile and the npm registry:

| Package | Declared before | Declared after | Resolved (lockfile) | Latest published |
| --- | --- | --- | --- | --- |
| astro | `^5.13.0` | `^5.18.0` | **5.18.1** | 5.18.2 (5.x); 6.4.2 (latest) |
| @astrojs/cloudflare | `12` | `^12.6.13` | **12.6.13** | 12.6.13 (12.x); 13.6.0 (latest) |
| @astrojs/sitemap | `^3.4.0` | `^3.4.0` | 3.x | unchanged |
| tailwindcss / @tailwindcss/vite | `^4.1.0` | `^4.1.0` | 4.3.0 | unchanged |
| sharp (dev) | `^0.34.0` | `^0.34.0` | 0.34.x | unchanged (devDep) |
| wrangler (dev) | `^4.94.0` | `^4.94.0` | 4.94.0 | unchanged |

Resolved versions are unchanged by this pass; only the declared floors for
astro and the adapter moved up to the already-installed, patched line. No
High/Critical advisory floor from the brief remains below the resolved astro
5.18.1. Run `npm audit` in CI or locally to confirm the transitive tree.

## 6. Anything reverted

Nothing was reverted. No change made in this pass requires a build to validate:
the dependency edit is metadata only (verified by JSON parse + sync-equality
check), the wrangler comment was verified by re-parsing the JSONC, and the two
new/edited files are Markdown that Astro never imports. The CI build gate will
additionally validate the commits on push.

## Commits from this pass

- `66b0e35` chore(deps): raise declared floors to the patched astro 5.18 / adapter 12.6 line
- `2186e64` docs(deploy): document Pages-vs-wrangler split in wrangler.jsonc
- `296ae46` docs: add owner-facing MAINTENANCE.md cheat-sheet
- (this file) AUDIT-REPORT.md

---

## Follow-up pass (build-verified)

The pass documented above ran on a machine **without** the Node toolchain and
so, by design, only made changes it could verify without a build. A follow-up
pass on a machine **with** Node installed picked up three defects that needed
`.astro` edits and a build to apply safely. All three were confirmed with
`npx astro check` (0 errors / 0 warnings / 0 hints), `npm run build`, and
inspection of the generated `dist/` output.

1. **SEO: hreflang no longer points at pages that 404 (was a live defect).**
   The English-only pages (privacy, terms, shop, 404) were emitting
   `<link rel="alternate" hreflang="zh-TW"...>` / `zh-CN` tags in `<head>` that
   pointed at localized URLs which do not exist (a Search Console error). Added
   a `localized` prop to `BaseLayout.astro` (default `true`) gating the hreflang
   block, and set `localized={false}` on those four pages. Verified in `dist/`:
   the four en-only pages emit **0** head hreflang tags; localized pages (home,
   about, matches, roster, news and every locale variant) keep all **4** (en,
   zh-TW, zh-CN, x-default). The in-page language switcher links are unaffected.

2. **Accessibility: every page now has exactly one `<h1>` (was a live defect).**
   The home hero wordmark and the news cover title both rendered as `<p>`,
   leaving the home page and all nine news articles with no top-level heading.
   Promoted the home wordmark to `<h1>` and the `NewsCover` title to a
   conditional `<h1>` (article hero) / `<h2>` (index card). Tailwind preflight
   zeroes heading margins and inherits font-size, so the swap is visually
   identical. Verified in `dist/`: exactly one `<h1>` per page.

3. **Privacy: opted out of Google's Topics API.** Added `browsing-topics=()` to
   the `Permissions-Policy` in `public/_headers`, consistent with the site's
   no-tracking stance. Verified present in the shipped `dist/_headers`.

### Commits from the follow-up pass

- `6556de1` fix(seo): gate hreflang alternates to localized pages only
- `0fa2ff3` fix(a11y): give every page exactly one h1
- `7da68dd` security(headers): opt out of Google Topics API
- (this addendum) AUDIT-REPORT.md
