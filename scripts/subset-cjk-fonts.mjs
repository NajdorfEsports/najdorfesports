#!/usr/bin/env node
/*
 * subset-cjk-fonts.mjs
 *
 * Builds the self-hosted CJK font subsets for the zh-TW / zh-CN locales.
 * One-shot, run on demand (`npm run build:fonts`) whenever Chinese copy is
 * added or changed; outputs are COMMITTED (same pattern as generate-og.mjs).
 * The font-coverage vitest fails when committed coverage falls behind the
 * source tree, so forgetting to re-run this is caught at commit time.
 *
 * What it does:
 *   1. Harvests every CJK codepoint from src/ (i18n dicts, zh markdown,
 *      coaching prose, component literals; the whole tree is walked so new
 *      string locations never need registering here).
 *   2. Downloads the Noto Sans TC / SC variable TTFs from a PINNED
 *      google/fonts commit into a gitignored cache (sources are ~30-45MB
 *      and never belong in the repo).
 *   3. Subsets to STATIC instances at weights 400 and 700 via subset-font
 *      (harfbuzzjs; pinning the wght axis drops the variation tables,
 *      which is what keeps a ~1000-glyph CJK subset small).
 *   4. Emits public/fonts/noto-sans-{tc,sc}-{400,700}.subset.woff2, the
 *      generated src/styles/fonts-cjk.css (@font-face with the computed
 *      unicode-range), and public/fonts/OFL-NOTICE.txt.
 *
 * Fail-soft: any download or subset error logs and exits 0, preserving the
 * committed outputs (the site keeps working on the previous subsets).
 *
 * Licensing: Noto Sans TC/SC are SIL OFL 1.1. The OFL notice file must
 * ship alongside the woff2 files; family names are unmodified.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';
import {
  extractCjkCodepoints,
  baselineCodepoints,
  toSubsetString,
  toUnicodeRange,
  localeBucketForPath,
} from '../src/lib/glyphs.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC_DIR = join(ROOT, 'src');
const FONTS_DIR = join(ROOT, 'public', 'fonts');
const CACHE_DIR = join(ROOT, 'scripts', '.cache', 'fonts');
const GENERATED_CSS = join(ROOT, 'public', 'styles', 'fonts-cjk.css');

// Pinned google/fonts commit: the URL content is immutable for a given
// commit, which is the integrity guarantee. Bump deliberately to pick up
// upstream glyph fixes, then re-run and re-commit.
const GOOGLE_FONTS_COMMIT = '877f8918ee661764418e085766dc0b073260a3ef';
const SOURCES = [
  {
    family: 'Noto Sans TC',
    id: 'tc',
    url: `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf`,
  },
  {
    family: 'Noto Sans SC',
    id: 'sc',
    url: `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf`,
  },
];
const WEIGHTS = [400, 700];
// Measured floor: CJK outlines cost ~160 bytes/glyph after woff2, and the
// current copy harvests ~890 glyphs per script (the per-script split
// already nearly halved the naive union). 160KB keeps the warning
// meaningful: tripping it means the copy grew enough to consider a lazy
// second face for article-only glyphs.
const BUDGET_BYTES = 160 * 1024;

const HARVEST_EXTS = new Set(['.ts', '.tsx', '.astro', '.md', '.mdx', '.json']);

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) {
      // Asset binaries can't contain copy; skip for speed.
      if (name === 'assets') continue;
      yield* walk(p);
    } else if (HARVEST_EXTS.has(extname(name))) {
      yield p;
    }
  }
}

/**
 * Per-script harvest: zh-TW sources feed only the TC subset, zh-CN only
 * the SC subset, shared files (mixed-script literals) feed both. Keeping
 * the two scripts apart nearly halves each font vs a naive union.
 */
async function harvest() {
  const tc = baselineCodepoints();
  const sc = baselineCodepoints();
  let files = 0;
  for await (const file of walk(SRC_DIR)) {
    files += 1;
    const text = await readFile(file, 'utf8');
    const cps = extractCjkCodepoints(text);
    if (cps.size === 0) continue;
    const bucket = localeBucketForPath(file);
    if (bucket === 'tc' || bucket === 'both') for (const cp of cps) tc.add(cp);
    if (bucket === 'sc' || bucket === 'both') for (const cp of cps) sc.add(cp);
  }
  console.log(
    `[fonts] harvested ${tc.size} TC / ${sc.size} SC codepoints from ${files} files under src/.`,
  );
  return { tc, sc };
}

async function fetchSource({ family, url }) {
  const cacheKey = createHash('sha256').update(url).digest('hex').slice(0, 16);
  const cachePath = join(CACHE_DIR, `${cacheKey}.ttf`);
  if (existsSync(cachePath)) {
    console.log(`[fonts] ${family}: using cached source.`);
    return readFile(cachePath);
  }
  console.log(`[fonts] ${family}: downloading source (~30-45MB, one-time)...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NajdorfEsportsSite/1.0 (https://najdorfesports.gg; owner@najdorfesports.gg)',
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(cachePath, buf);
  console.log(`[fonts] ${family}: cached ${(buf.length / 1024 / 1024).toFixed(1)}MB.`);
  return buf;
}

const OFL_NOTICE = `The web fonts served from this directory are licensed under the SIL Open
Font License, Version 1.1 (https://openfontlicense.org/).

  Anton           Copyright 2020 The Anton Project Authors
                  https://github.com/googlefonts/AntonFont
  Inter           Copyright 2016 The Inter Project Authors
                  https://github.com/rsms/inter
  Noto Sans TC    Copyright 2022 The Noto Project Authors
  Noto Sans SC    https://github.com/notofonts/noto-cjk

The Noto Sans TC/SC files are subsets (reduced glyph repertoires, static
weight instances) of the upstream variable fonts; family names are
unmodified. Subsets are regenerated by scripts/subset-cjk-fonts.mjs.
`;

(async () => {
  try {
    const sets = await harvest();

    await mkdir(FONTS_DIR, { recursive: true });
    const faces = [];

    for (const source of SOURCES) {
      const cps = sets[source.id];
      const text = toSubsetString(cps);
      const unicodeRange = toUnicodeRange(cps);
      const ttf = await fetchSource(source);
      for (const weight of WEIGHTS) {
        const woff2 = await subsetFont(ttf, text, {
          targetFormat: 'woff2',
          variationAxes: { wght: weight },
        });
        const file = `noto-sans-${source.id}-${weight}.subset.woff2`;
        await writeFile(join(FONTS_DIR, file), woff2);
        const kb = (woff2.length / 1024).toFixed(1);
        if (woff2.length > BUDGET_BYTES) {
          console.warn(
            `[fonts] WARNING ${file} is ${kb}KB (> ${BUDGET_BYTES / 1024}KB budget) at ` +
              `${cps.size} glyphs. Consider splitting article glyphs into a lazy second face.`,
          );
        } else {
          console.log(`[fonts] ${file}: ${kb}KB.`);
        }
        faces.push({ family: source.family, id: source.id, weight, file, unicodeRange });
      }
    }

    const css = [
      '/* GENERATED by scripts/subset-cjk-fonts.mjs. Do not hand-edit:',
      ' * run `npm run build:fonts` after adding or changing Chinese copy',
      ' * and commit the regenerated fonts + this file together. This',
      ' * stylesheet is injected POST-IDLE by src/scripts/fonts.ts on zh',
      ' * pages only: the faces are real branding but never',
      ' * render-critical (the system stacks are metrics-matched), so',
      ' * they stay out of the LCP window. The',
      ' * unicode-range keeps these faces inert on pure-Latin pages (zero',
      ' * bytes downloaded) and the font-coverage vitest asserts the range',
      ' * still covers every CJK codepoint in src/. */',
      '',
      ...faces.flatMap(({ family, weight, file, unicodeRange }) => [
        '@font-face {',
        `  font-family: '${family}';`,
        '  font-style: normal;',
        `  font-weight: ${weight};`,
        '  font-display: swap;',
        `  src: url('/fonts/${file}') format('woff2');`,
        `  unicode-range: ${unicodeRange};`,
        '}',
      ]),
      ...faces
        .filter((f) => f.weight === 700)
        .flatMap(({ family, file, unicodeRange }) => [
          `/* Display alias: the 700 instance registered AT weight 400 so it`,
          ` * slots in behind Anton (a 400-only face) for zh headings without`,
          ` * synthetic bolding of the Latin glyphs. */`,
          '@font-face {',
          `  font-family: '${family} Display';`,
          '  font-style: normal;',
          '  font-weight: 400;',
          '  font-display: swap;',
          `  src: url('/fonts/${file}') format('woff2');`,
          `  unicode-range: ${unicodeRange};`,
          '}',
        ]),
      '',
    ].join('\n');
    await mkdir(join(ROOT, 'public', 'styles'), { recursive: true });
    await writeFile(GENERATED_CSS, css);
    console.log(`[fonts] wrote ${GENERATED_CSS.replace(ROOT, '')}.`);

    await writeFile(join(FONTS_DIR, 'OFL-NOTICE.txt'), OFL_NOTICE);
    console.log('[fonts] wrote public/fonts/OFL-NOTICE.txt. Done.');
  } catch (err) {
    console.error('[fonts] failed, preserving committed outputs:', err?.message ?? err);
    process.exit(0);
  }
})();
