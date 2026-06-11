import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractCjkCodepoints, fromUnicodeRange, localeBucketForPath } from './glyphs';

/**
 * Tripwire: the committed CJK font subsets must cover every CJK codepoint
 * present anywhere under src/. When this fails, someone added or changed
 * Chinese copy without re-running `npm run build:fonts`; the failure lists
 * the missing characters. (Rendering still degrades gracefully to system
 * fonts in the meantime; this test is the honesty mechanism.)
 */

const SRC = fileURLToPath(new URL('..', import.meta.url));
const CSS = join(SRC, '..', 'public', 'styles', 'fonts-cjk.css');
const HARVEST_EXTS = new Set(['.ts', '.tsx', '.astro', '.md', '.mdx', '.json']);

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'assets') continue;
      yield* walk(p);
    } else if (HARVEST_EXTS.has(extname(name))) {
      yield p;
    }
  }
}

function coveredRange(css: string, family: string): Set<number> {
  // Every face of a family carries the same range; take the first.
  const block = css.split('@font-face').find((b) => b.includes(`'${family}'`));
  const m = block?.match(/unicode-range:\s*([^;]+);/);
  return m ? fromUnicodeRange(m[1]!) : new Set();
}

describe('CJK font subset coverage', () => {
  const css = readFileSync(CSS, 'utf8');
  const covered = { tc: coveredRange(css, 'Noto Sans TC'), sc: coveredRange(css, 'Noto Sans SC') };

  it('covers every CJK codepoint in src/ (run npm run build:fonts if not)', () => {
    const missing: string[] = [];
    for (const file of walk(SRC)) {
      const cps = extractCjkCodepoints(readFileSync(file, 'utf8'));
      if (cps.size === 0) continue;
      const bucket = localeBucketForPath(file);
      const targets = bucket === 'both' ? (['tc', 'sc'] as const) : ([bucket] as const);
      for (const target of targets) {
        for (const cp of cps) {
          if (!covered[target].has(cp)) {
            missing.push(
              `${String.fromCodePoint(cp)} (U+${cp.toString(16).toUpperCase()}) [${target}] in ${file.replace(SRC, 'src/')}`,
            );
          }
        }
      }
    }
    expect(missing, `Missing from the committed subsets:\n${missing.join('\n')}`).toEqual([]);
  });

  it('parsed a non-trivial range for both families', () => {
    expect(covered.tc.size).toBeGreaterThan(300);
    expect(covered.sc.size).toBeGreaterThan(300);
  });
});
