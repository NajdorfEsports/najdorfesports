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
- [ ] **Phase 2 - Motion foundation.** Port `_motion.css` -> `src/styles/motion.css`
      (`.naj-*` ambient classes, keyframes, OS reduced-motion freeze), import into
      global.css; add `--ease-out`/`--ease-standard` motion tokens. Build the six
      chess-piece inline-SVG components (Pawn/Knight/Bishop/Rook/Queen/King;
      white=line, black=hatch, ghost=faint) + `PieceBackdrop` ambient composer,
      importance-by-intensity scale, reduced-motion safe, no client JS.
- [ ] **Phase 3 - Per-page visuals (commit + Lighthouse per page).**
  - [ ] Home hero (frame-1): make-the-move one-shot -> ambient settle; remove
        cursor-follow glow; reduced-motion = resolved still.
  - [ ] Next-match (frame-2): keep aesthetic; timezone selector (Intl, IANA);
        flip-on-change digits (<=150ms, reduced-motion = plain text).
  - [ ] News cards (frame-3): piece backdrop per importance tier + scrim.
  - [ ] Roster header (frame-4): copyright-safe branded header (role field +
        piece + nameplate); removes Blizzard hero art from player pages.
  - [ ] Coaching (frame-5): elevated hero; chess-promotion stepper; FAQ accordion.
  - [ ] Games (frame-6): three original animated card backgrounds.
  - [ ] Partners (frame-7): scorecard units + recency stamp; polish offer/founding.
- [ ] **Phase 4 - Roster bios.** Extend roster data (`bio` + `bioLang`); render
      with correct `lang` attr; placeholder content only.
- [ ] **Phase 5 - Liquipedia data integration.** Build-time Node script ->
      `schedule.json` + match updates; MediaWiki API (no scraping), contact UA,
      rate limits, caching, CC BY-SA attribution kept; scheduled GH Action +
      Cloudflare deploy hook (env placeholders). Graceful fallback to existing data.
- [ ] **Phase 6 - Partners live stats.** Extend job to refresh scorecard from
      Twitch/YouTube/SOOP/X (env placeholders); recency stamp; OWCS attribution.
      Keep static numbers if no creds.

## Out of scope / untouched

- Top results ticker (do not touch).
- Matches-page map-card backdrops + hero-pool icons (leftover Blizzard art):
  leave this pass; note as future item.
- No new runtime framework; static Cloudflare Pages; no new client deps.
