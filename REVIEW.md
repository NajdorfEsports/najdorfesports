# Crossword content review (owner + RiRi)

Feature: daily Overwatch mini crossword at `/games/crossword/` (all three
locales). Built 2026-06-11 on `feature/games-crossword`; merges to `main`
after the owner approves the Cloudflare Pages preview. This file is the
review gate for the content that shipped with it.

## 1. Unverified entries (excluded from generation until confirmed)

These carry `verified: false` in `src/data/crossword/entries.ts`; the
generator skips them. Flip to `true` (and regenerate) once confirmed.

| Answer | Clue draft                     | What needs checking                                 |
| ------ | ------------------------------ | --------------------------------------------------- |
| AATLIS | "Flashpoint map added in 2025" | Ship date and mode against Liquipedia / patch notes |

## 2. Deliberate editorial calls

- **SINATRAA is not used anywhere**, although the research corpus lists him
  as 2019 OWL MVP. Cautious call alongside the no-personal-misconduct rule;
  the 2019 MVP slot simply goes unclued. RYUJEHONG is excluded per the
  brief's explicit rule.
- **JJONAK is clued as "2018 OWL regular-season MVP"** and PROFIT as "2018
  Grand Finals MVP for London"; the two awards are distinct and the clues
  keep them distinct.
- **HADI is clued as a tank pro** (not a caster), SHU and SEICOE are not
  clued at all, and pre-acquisition results are credited to RANKERS, per
  the brief's exclusion rules.
- **SP9RK1E and TA1YO are structurally excluded**: answers must be A-Z
  only, so handles with digits can never appear.
- **Names longer than 7 letters are out of the practical corpus** (grid
  geometry: the largest grid is 7x7). That excludes REINHARDT, ZENYATTA,
  WIDOWMAKER, LIFEWEAVER, SPITFIRE, MONDATTA, GANYMEDE, KANEZAKA, and
  similar; most are still reachable through nicknames (REIN, ZEN, WIDOW),
  real names, or clue text. JETPACKCAT (10) is kept in the corpus per the
  brief, reserved for a future larger grid.

## 3. Corpus size: 344 entries, not 500

The brief asked for 500+. The corpus stops at 344 because that is where
full fact-confidence stopped; padding to a number with shaky trivia would
violate the "mark anything uncertain" rule harder than missing the count.
Every entry has a `sourceNote`. The structure makes expansion trivial
(append to `entries.ts`, tests enforce all invariants, regenerate).

## 4. Grid architecture (why these minis look the way they do)

A ~350-word themed vocabulary cannot fill a fully-crossed American-style
grid: each crossing multiplies the expected number of valid fills by the
letter-collision probability (~0.07), and a fully-crossed 5x5 has 17
crossings; exhaustive search confirms zero fills exist. The generator
therefore uses "rail" patterns (full words one way, two or three full
words crossing them, remaining cells checked once), the same shape
commercial themed minis use. Puzzles carry 5-6 words each.

Anti-repetition: an answer is excluded for 5 days after use and always
within the same day across difficulties; when a day cannot fill, the
window relaxes 5 -> 3 -> 0. Over the generated 385 days, 287 of 1155
puzzles needed a relaxation, i.e. 75% held the full 5-day window. A
30-day window is mathematically impossible at 3 puzzles/day with this
corpus size; growing the corpus loosens this directly.

## 5. Regeneration runbook

- Puzzles are committed JSON under `public/games/crossword/puzzles/`,
  currently covering **2026-06-11 through 2027-06-30**.
- `src/data/crossword/puzzles.test.ts` fails CI when coverage drops below
  30 days ahead. When it trips:
  `node scripts/generate-crosswords.mjs --from <last date> --to <+1y>`
  and commit the new JSON. Same corpus + same range reproduces identical
  puzzles (date-seeded PRNG), so partial regeneration is safe.

## 6. zh-TW / zh-CN status (RiRi review queue)

Per the owner decision of 2026-06-11, the zh pages launched with fully
localized chrome but **English clue text**, plus a localized notice
(`games.crossword.zhClueNotice`). Gating mechanism: clue text simply is
not translated yet; there is no hidden flag to flip. When the translated
clue corpus is ready and reviewed, add per-locale clue fields to
`entries.ts`, extend the generator's `clueFor`, and regenerate.

**Review status: APPROVED 2026-06-11.** The owner approved every games
string in `zh-TW.ts` and `zh-CN.ts` (`nav.games`, the `pageMeta` games and
crossword keys, and the full `games` section) before the merge to main;
their DRAFT markers were removed in the merge commit. Clue text remains
English in all locales until a translated clue corpus exists and passes
its own review.

## 7. localStorage exception (documented)

Owner-approved 2026-06-11: crossword stats (played/solved counts, streaks,
best times, preferred difficulty) live in `localStorage` under one key,
on-device only, never transmitted. The privacy page gained a "Game data on
your device" section and its "Last updated" date was bumped. Every storage
access is feature-detected with an in-memory fallback, so private browsing
still plays. This is the only client-side storage on the site; nothing
else may use it without a fresh owner decision.
