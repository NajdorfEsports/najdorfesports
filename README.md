# najdorfesports.gg

Source for [najdorfesports.gg](https://najdorfesports.gg), the official site for **Najdorf Esports** — an Overwatch organization competing in OWCS Pacific.

## Stack

- [Astro](https://astro.build/) 5.x (static output, no SSR adapter)
- [Tailwind CSS v4](https://tailwindcss.com/) via the official Vite plugin (`@tailwindcss/vite`)
- TypeScript strict
- [Cloudflare Pages](https://pages.cloudflare.com/) deployment target
- Match data sourced from [Liquipedia](https://liquipedia.net/overwatch/) under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)

## Develop

```bash
npm install
npm run dev          # serves http://localhost:4321
```

## Build & preview

```bash
npm run build        # static output → ./dist
npm run preview      # serves ./dist on http://localhost:4321
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with HMR. |
| `npm run build` | Static build to `./dist`. |
| `npm run preview` | Serves the built site. |
| `npm run fetch:matches` | One-off Liquipedia pull (writes `src/data/{roster,matches,achievements}.json`). |
| `npm run fetch:heroes` | Refreshes hero icons in `public/heroes/`. |
| `npm run build:og` | Regenerates `public/branding/og-default.png` from inline SVG. |
| `npm run deploy` | Build and deploy directly via `wrangler deploy` (bypasses the Pages git integration). |

## Data files

| Path | Purpose |
| --- | --- |
| `src/data/site.ts` | Brand constants, OWCS season metadata, socials, shared TypeScript types, `mergeByKey` helper. |
| `src/data/roster.json` | Active roster — auto-populated by the Liquipedia fetcher. |
| `src/data/roster.manual.json` | Manual roster overrides — wins on `handle` collision against `roster.json`. |
| `src/data/matches.json` | Auto-populated by the Liquipedia fetcher. |
| `src/data/matches.manual.json` | Manual match overrides — wins on `id` collision. |
| `src/data/achievements.json` | Auto-populated by the Liquipedia fetcher. |
| `src/data/achievements.manual.json` | Manual achievement overrides — wins on `id` collision. |
| `src/data/sponsors.json` | Sponsor list. Hidden in the UI when empty. |
| `src/data/products.ts` | Product catalogue. Empty at launch. |
| `src/content/news/` | News posts as Markdown (Astro content collection). |

## Deployment

The site is hosted on **Cloudflare Pages**, connected to this GitHub repo. Pushes to `main` trigger a production deploy automatically. No manual upload step.

Build command: `npm run build`
Output directory: `dist`

## Liquipedia automation

`.github/workflows/update-matches.yml` defines a workflow that runs `scripts/fetch-liquipedia.mjs` and commits any changes back to `src/data/{roster,matches,achievements}.json`. It runs weekly on **Monday 09:07 UTC**, plus on-demand via `workflow_dispatch`.

The fetcher complies with Liquipedia's [API terms of use](https://liquipedia.net/api-terms-of-use): descriptive User-Agent, gzip-aware, rate-limit-respecting (one parse per 30s), and fail-soft (leaves the JSON file untouched on any error). Data displayed on the site is attributed to Liquipedia under CC BY-SA 3.0 in the footer and on `/matches` and `/roster`.

Manual corrections live in sibling `*.manual.json` files and win on collision — the auto file is rewritten by the action, so always edit the manual file.

## Brand

| Token | Value |
| --- | --- |
| Primary | `#C8102E` (crimson) |
| Secondary | `#C9A227` (tarnished gold) |
| Background | `#0B0B0F` (near-black, never pure black) |
| Body | `#E9ECF1` |
| Display font | Anton (self-hosted from `/fonts/`, SIL OFL 1.1) |
| Body font | Inter (self-hosted from `/fonts/`, SIL OFL 1.1) |

See `src/styles/tokens.css` for the full palette and `src/styles/global.css` for Tailwind theme bindings.

## Contact

[owner@najdorfesports.gg](mailto:owner@najdorfesports.gg)
