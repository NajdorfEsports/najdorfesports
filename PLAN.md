# Redesign: Motion System (branch `redesign/motion-system`)

Living checklist for the autonomous motion-system redesign. Updated as work
lands so progress survives a context reset. The reference bundle is vendored at
`design-system/` (gitignored, never shipped). Build must pass (`npm run build`)
after every phase; each phase is its own commit; nothing merges to production
until the owner approves the Cloudflare preview.

## Key facts established in recon

- The repo ALREADY has the brand foundation: `.texture-board`, `.texture-diag`,
  `.ink-img/.ink-wash/.chip-ink`, `.link-slide`, `.link-arrow`, `.surface-hover`,
  `.btn-lift`, `.reveal` (scripting-gated + 3s failsafe), and the core components
  (`BishopMark`, `Button`, `Badge`, `OWCSBadge`, `PlatformIcon`, `SectionHeader`).
  The design system was derived FROM this repo. So the NEW work is the motion
  layer + chess-piece family + per-page visuals + removals + bios + automation.
- Single Astro version (6.4.6). The "version inconsistency across page groups"
  does NOT exist in this repo; it was a stale artifact of the design snapshot.
  Nothing to migrate. (Confirmed Phase 0.)
- Existing hero ambient: `.hero-glow` + `.hero-pt` particles + `.hero-cursor-glow`
  driven by `src/scripts/hero-ambient.ts`. Phase 3 removes the cursor-follow glow.
- Reduced motion: sitewide `*` safety net + named overrides at the end of
  `global.css`. New `.naj-*` motion classes carry their own composed-still
  overrides. OS setting only; NO visible site toggle, NO `.naj-rm` chip,
  NO `body[data-reduced]` manual toggle (owner decision).
- FONT CONFLICT to resolve with evidence in Phase 1: project memory records the
  owner DELIBERATELY self-hosts Montserrat/Saira/Barlow for the Next Match card
  (commit 678d8ea) and said not to remove them; the redesign prompt calls them
  "unused." Verify actual consumption before deleting anything.

## Phases

- [x] **Phase 0 - Setup & recon.** Branch `redesign/motion-system`; vendor
      `design-system/` + gitignore; confirm versions/paths/fonts; write
      CLAUDE.md redesign section + PLAN.md. Read-only recon workflow mapping all
      7 frames + every target page body + font/i18n audit.
- [x] **Phase 1 - Removals, cleanup, copy fixes.**
  - [x] Home: removed standalone WatchHub block (in-module Watch Live stays).
  - [x] Home: removed "season so far" section (AchievementStrip + BroadcastReach);
        renumbered the chess-move scoresheet indices so the Najdorf line stays
        contiguous (highlights 4->3, news 5->4).
  - [x] Home: hero eyebrow -> `OWCS PACIFIC · STAGE 2 · 2026`; stale "June 4"
        tagline -> "Now competing in the Stage 2 main event." (en + zh-TW + zh-CN).
        The "3rd at Stage 1 as Rankers" half is the existing data-driven
        achievement line, kept dynamic. Exact wording flagged for owner.
  - [x] Roster index: removed AchievementStrip ("Recent results") + dead imports.
  - [x] Player page: removed PlayerStatsPanel (team-record + recent-matches +
        map-record); kept header, hero pool, socials, Liquipedia attribution;
        left a bio slot for Phase 4.
  - [x] Games: removed CommunityCTA ("Travel with the team") from the games hub
        (kept on home; component + i18n keys untouched).
  - [x] Coaching: pricing cards equal height (h-full) + Book buttons bottom-aligned
        (mt-auto), removed the misplaced flex-1 on the pack note.
  - [x] Fonts: resolved with evidence -> KEEP Montserrat/Saira/Barlow (used only
        by NextMatchCountdown per owner decision; the "unused" premise is false).
  - [x] Astro version consistency confirmed (single 6.4.6).
  - [x] Excluded gitignored `design-system/` from tsconfig so `astro check` stays
        clean (the reference bundle is never typechecked / shipped).
- [x] **Phase 2 - Motion foundation.** Ported `_motion.css` -> `src/styles/motion.css`
      (`.naj-*` ambient classes, keyframes, OS reduced-motion freeze, no manual
      toggle/chip), imported into global.css; added `--ease-out`/`--ease-standard`
      motion tokens to tokens.css. Built `src/lib/pieces.ts` (geometry + importance
      META + seeded ember/shard generators) and `src/components/brand/`
      `ChessPiece.astro` (six pieces; white/black/ghost; per-instance hatch
      pattern; optional importance-scaled sway) + `PieceBackdrop.astro`
      (build-time ambient composer, seeded + deterministic, no client JS).
      Visually verified all six pieces + a King backdrop in the dev preview
      (legible over motion); temp preview route removed before commit.
- [x] **Phase 3 - Per-page visuals (all seven frames done; Lighthouse below).**
      Lighthouse (built dist, performance): home 95, coaching 99, partners 100,
      games 100, player 100, news 100. CLS 0.000 and TBT 0ms on every page (motion
      is pure transform/opacity + build-time inline SVG, no layout shift). Targets
      (perf >= 90, CLS < 0.1) cleared.
  - [x] Home hero (frame-1): bishop "make-the-move" travel-in one-shot, settles
        to its resting square; removed the cursor-follow glow (markup, script,
        CSS); reduced-motion = resolved still.
  - [x] Next-match (frame-2): "Your timezone" picker (Intl, IANA, preselects the
        visitor zone; ICT/CST stays the no-JS fallback); flip tightened to 140ms.
  - [x] News cards (frame-3): backdrop piece per importance tier (King featured
        -> Pawn) + ambient sheen; scrim/legibility preserved.
  - [x] Roster header (frame-4): copyright-safe branded header (role field +
        piece + nameplate); removed Blizzard hero art from the player header.
  - [x] Coaching (frame-5): elevated hero (+ ambient backdrop), chess-promotion
        stepper, FAQ height+opacity reveal (::details-content + interpolate-size).
  - [x] Games (frame-6): three original animated card backgrounds (GameCardBg).
  - [x] Partners (frame-7): scorecard recency stamp + attribution footnote;
        hero + founding ambient backdrops.
- [x] **Phase 4 - Roster bios.** Added `bio` + `bioLang` to RosterEntrySchema;
      player page renders a Bio section with `lang={bioLang}` when a bio exists,
      else a localized placeholder. No invented bios (owner fills via
      roster.manual.json). Added t.playerPage.bioHeading + bioPlaceholder.
- [x] **Phase 5 - Liquipedia data integration.** The repo ALREADY ships the
      whole pipeline: `scripts/fetch-liquipedia.mjs` pulls matches (opponent /
      time / scores / map-by-map) from the exact Stage 2 Pacific source via the
      MediaWiki `action=parse` API (NO scraping), with a real contact UA
      (`owner@najdorfesports.gg`, not a placeholder), gzip, 1-parse/30s, and
      fail-soft fallback; CC BY-SA attribution is on footer/matches/roster.
      Change made: bumped `update-matches.yml` from weekly to every ~8h so
      schedule/results refresh automatically; the auto-commit pushes to main
      and Cloudflare Pages' git integration redeploys on that push.
      Deviations (flagged for owner): (1) NO `schedule.json` - `matches.json`
      already IS the schedule and is the validated single source of truth;
      a second file would fragment it. (2) NO deploy hook needed - commits
      already trigger the Pages git-integration deploy. (3) The Jun 18 vs
      Meng Gong 3 result populates on the next fetch run (or a manual
      workflow_dispatch); not hand-entered, to avoid fabricating a score.
- [x] **Phase 6 - Partners live stats (kept current numbers, per the brief's
      no-creds fallback).** The scorecard's broadcast peak viewership already
      comes from `matches.broadcastPeakViewers` (the OWCS broadcast peak),
      refreshed by the now-8h Liquipedia job (Phase 5); the OWCS attribution +
      recency stamp landed in Phase 3 frame-7. The figures are real and
      provenanced. Dedicated external live-stats wiring (Twitch / YouTube /
      SOOP peak, X impressions) is DEFERRED: it needs owner credentials and
      cannot be built or tested here, and the brief says to leave the current
      numbers and note it when creds are unavailable. A safe pattern already
      exists for when the owner is ready (scripts/fetch-social-stats.mjs +
      social-stats.manual.json, fail-soft, secrets optional). Flagged for owner.

## Out of scope / untouched

- Top results ticker (do not touch).
- Matches-page map-card backdrops + hero-pool icons (leftover Blizzard art):
  leave this pass; note as future item.
- No new runtime framework; static Cloudflare Pages; no new client deps.
