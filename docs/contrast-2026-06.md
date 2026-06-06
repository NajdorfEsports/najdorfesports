# Contrast measurements, June 2026

Token values from `src/styles/global.css`. Ratios are WCAG 2.1 relative-luminance
contrast against the page background `--color-bg` #0B0B0F (and against the card
surface `--color-surface` #15151C where relevant). WCAG AA thresholds: 4.5:1 for
normal text, 3:1 for large text (>= 24 px, or >= 18.66 px bold) and for
non-text UI/graphics (SC 1.4.11).

| Foreground | Hex | On | Ratio | Verdict |
|---|---|---|:---:|---|
| `--color-text`     | #E9ECF1 | #0B0B0F | ~15.8:1 | Pass (normal + large) |
| `--color-text-dim` | #9CA3AF | #0B0B0F | ~8.0:1  | Pass (normal + large) |
| `--color-accent-2` | #6B8DFF | #0B0B0F | ~6.7:1  | Pass (normal + large) |
| `--color-accent`   | #215BFF | #0B0B0F | ~3.8:1  | Pass large text / UI only (fails 4.5:1 normal) |
| `--color-accent`   | #215BFF | #15151C | ~3.5:1  | Pass large text / UI only |
| `--color-win`      | #4ADE80 | #0B0B0F | ~11:1   | Pass (normal + large) |
| `--color-loss`     | #F87171 | #0B0B0F | ~6.1:1  | Pass (normal + large) |

## Usage rules that follow from this

- **`--color-accent` (#215BFF):** large display type and UI/graphics only (the
  hero wordmark, rails, focus rings, badges). At ~3.8:1 it clears the 3:1
  large-text and non-text thresholds but not the 4.5:1 normal-text bar, so it is
  never used for body-size text. Lighthouse flags the hero wordmark for this,
  but the wordmark is large display text and the blue is the fixed brand color,
  so it is intentionally kept.
- **`--color-accent-2` (#6B8DFF):** safe for normal-size text on dark at
  ~6.7:1; used for eyebrows, links, and secondary labels.
- **Body text** (`--color-text`, `--color-text-dim`): both clear 4.5:1
  comfortably for any size.
- Win/loss chips clear 3:1 as non-text indicators and 4.5:1 as text.
