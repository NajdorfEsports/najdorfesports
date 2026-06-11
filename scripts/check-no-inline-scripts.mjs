/**
 * CSP invariant guard: the production policy ships `script-src` WITHOUT
 * 'unsafe-inline', so no built page may contain an executable inline
 * script. Every <script> in dist/ must either load from src= or be a
 * non-executable JSON-LD data block. Run after `astro build`; exits 1
 * with a file list when the invariant is broken (e.g. someone adds an
 * is:inline script or an inline event handler attribute).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith('.html')) yield p;
  }
}

const SCRIPT_TAG = /<script\b([^>]*)>/gi;
const HANDLER_ATTR = /\son(?:click|load|error|mouseover|focus|submit|input|change)\s*=/i;

const offenders = [];
let pages = 0;

for (const file of htmlFiles(DIST)) {
  pages += 1;
  const html = readFileSync(file, 'utf8');
  for (const [, attrs] of html.matchAll(SCRIPT_TAG)) {
    const hasSrc = /\bsrc\s*=/.test(attrs);
    const isJsonLd = /type\s*=\s*["']application\/ld\+json["']/.test(attrs);
    if (!hasSrc && !isJsonLd) {
      offenders.push(`${file}: <script${attrs}>`);
    }
  }
  if (HANDLER_ATTR.test(html)) {
    offenders.push(`${file}: inline event handler attribute`);
  }
}

if (pages === 0) {
  console.error('check-no-inline-scripts: no HTML found in dist/. Run `npm run build` first.');
  process.exit(1);
}

if (offenders.length > 0) {
  console.error('Executable inline script(s) found; the CSP ships without unsafe-inline:');
  for (const o of offenders) console.error('  ' + o);
  process.exit(1);
}

console.log(`check-no-inline-scripts: ${pages} pages clean.`);
