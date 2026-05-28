# Maintenance cheat-sheet

Plain-language, copy-paste guide for the everyday jobs you do yourself. This
is the short version. `CLAUDE.md` has the full reasoning behind each rule;
read it when you need the "why" or hit an edge case.

Two house rules that apply everywhere:

- **No em-dashes** anywhere (copy, commits, code). Use a period, comma, colon,
  or parentheses. Hyphens and en-dashes in number ranges are fine.
- **No personal/owner names** in copy, commits, meta tags, or JSON-LD. The org
  is the only identity. Player handles on the roster are fine.

After any change: `git add <files> && git commit && git push`. Cloudflare
Pages auto-deploys `main`. There is no PR step. The CI workflow type-checks
and builds every push, so watch the Actions tab if a deploy looks wrong.

---

## Bench / remove a player

Liquipedia still lists benched players, and a manual override **cannot delete**
an auto entry. Instead, mark them inactive:

1. Open `src/data/roster.manual.json`.
2. Add (or edit) an entry with the **same `handle`** and `"status": "inactive"`:
   ```json
   { "handle": "PlayerName", "status": "inactive" }
   ```
3. Commit. They drop off the active roster and out of the headcount, and it
   survives the weekly Liquipedia refresh. To re-list them, delete the entry.

Only edit `src/data/roster.json` (the auto file) directly if Liquipedia is
flat-out wrong and you need someone gone immediately. Never invent a
`_delete` flag.

## Add / correct a player

- Mid-week join, pull from Liquipedia automatically:
  ```bash
  npm run fetch:player <liquipedia-url-or-handle> --apply
  npm run fetch:heroes   # so any new signature hero gets a portrait
  ```
  Without `--apply` it just prints the entry for you to review.
- Hand-correct a field (role, country, real name, socials): edit the player's
  entry in `src/data/roster.manual.json`. Manual values win over the auto file
  on `handle` collision.

## Add a player photo

1. Drop a real `.webp` at `public/roster/<handle>.webp` (lowercase handle).
2. Add the lowercase handle to `rosterPortraits` in
   `src/data/roster-portraits.ts`. A file alone does nothing until it is
   registered there.

## Add or fix a match result by hand

Edit `src/data/matches.manual.json`. Match on `id` to override an auto entry,
or use a fresh `id` for a manual-only match:

```json
{
  "id": "manual-2026-06-01-some-team",
  "date": "2026-06-01T10:00:00Z",
  "opponent": "Some Team",
  "tournament": "OWCS Pacific 2026 · Stage 2",
  "format": "BO5",
  "result": "win",
  "mapScores": [{ "map": "Busan", "ourScore": 2, "theirScore": 1 }]
}
```

`date` is ISO UTC. `result` is `win` / `loss` / `tbd`. `mapScores` is optional.

## Publish a news post

News is English-only, one Markdown file per post.

1. Create `src/content/news/<slug>.md`. The filename **is** the URL slug
   (`2026-06-recap.md` -> `/news/2026-06-recap/`), so name it carefully:
   renaming it later changes the URL and the OG image path.
2. Front matter:
   ```markdown
   ---
   title: "Your headline"
   date: 2026-06-01
   description: "One-line summary for cards and search."
   eyebrow: "Match Report"        # optional small label on the cover
   tone: primary                  # primary | secondary | split
   draft: false                   # true hides it from the build
   ---

   Body in Markdown.
   ```
3. **Generate the share card** (the gotcha): each post needs an OG image at
   `public/branding/og/news-<slug>.png`. Run:
   ```bash
   npm run build:og
   ```
   Skip this and the post's social-share image 404s. `build:og` reads every
   post in `src/content/news/` and emits one card per slug.
4. Commit the `.md` **and** the generated `public/branding/og/news-<slug>.png`.

## When to bump OG_VERSION

If you change OG **artwork** (the bishop logo, brand colors, the card layout in
`scripts/generate-og.mjs`), bump `OG_VERSION` in
`src/layouts/BaseLayout.astro` to a new string. That changes the `?v=` on every
`og:image` URL and forces Discord / Slack / X / Facebook to re-scrape instead
of serving a stale cached card. Adding a brand-new news post does **not** need
a bump (its URL is already unique).

## Refresh Liquipedia data now

The fetcher runs automatically every Monday 09:07 UTC. To pull a mid-week
roster move or match result sooner, open the repo's **Actions** tab ->
"Refresh Liquipedia data" -> **Run workflow**. It commits any changes back to
`main` itself, which triggers a deploy.

## Refresh hero / map artwork

```bash
npm run fetch:heroes   # signature-hero portraits -> public/heroes/
npm run fetch:maps     # map artwork -> public/maps/ (full OW2 pool)
```
Run `fetch:heroes` after adding a player with a new signature hero. New OW maps
get appended to the `OWCS_MAP_POOL` constant in `scripts/fetch-map-icons.mjs`.

---

## Things that need the Cloudflare dashboard (not in this repo)

- **DNS, custom domains, HSTS preload, "Manage robots.txt" AI-crawler rules**
  live in the Cloudflare dashboard. The repo's `_headers` already sets HSTS;
  the dashboard is where you'd enable HSTS preload submission or change DNS.
- The site is **fully static** and deploys via the Pages Git integration.
  `wrangler.jsonc` / `npm run deploy` is only a manual fallback (see the
  comment at the top of `wrangler.jsonc`).

## Privacy posture (do not break)

Zero own cookies, no analytics, no third-party scripts, self-hosted fonts,
click-to-load Twitch. If you are about to add a script tag, an embed, or a
font/CDN link, stop and check `CLAUDE.md` first. New embeds also need a
`frame-src` entry in `public/_headers`.
