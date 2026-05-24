// One-shot generator: renders the org-default OG card, the per-route OG
// cards (used by social previews when a specific page is shared), and the
// icon set for the webmanifest / Apple touch icon. Re-run after editing any
// route copy, tone, or icon SVG:
//
//   npm run build:og
//
// Outputs (committed):
//   public/branding/og-default.png        — sitewide fallback (BaseLayout default)
//   public/branding/og/<route>.png        — per-route variants
//   public/apple-touch-icon.png + icon-{192,512}.png — PWA / Apple icons
//
// Build-time only. Sharp is a devDep; no Node code touches the browser.
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const NEWS_DIR = join(ROOT, 'src', 'content', 'news');

// ---------------------------------------------------------------------------
// SVG templates
// ---------------------------------------------------------------------------

/** Renders the OG card SVG. Tone toggles which accent leads on the bottom
 *  rail and the eyebrow color — crimson by default, gold as the secondary,
 *  split for posts that span both. */
function ogSvg({ eyebrow, title, tone = 'crimson' }) {
  const accentTop = '#C8102E';
  const accentBot = '#C9A227';
  const eyebrowColor = tone === 'gold' ? accentBot : accentTop;
  const railTop = tone === 'gold' ? accentBot : accentTop;
  const railBottom = tone === 'gold' ? accentTop : accentBot;
  // Hard-wrap long titles. Sized for a safe fit under the wide sans
  // fallback that librsvg/sharp uses when Anton isn't in the font cache.
  // Caps at 3 lines (ellipsis-truncated past that). Top-aligned at a
  // fixed first baseline so the eyebrow chip never collides with the
  // title regardless of line count.
  const lines = wrapTitle(title, 14, 3);
  const fontSize = 100;
  const lineHeight = 100;
  const firstBaselineY = 310; // always; subsequent lines step by +lineHeight

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B0B0F"/>
      <stop offset="100%" stop-color="#15151C"/>
    </linearGradient>
    <pattern id="hatch" patternUnits="userSpaceOnUse" width="32" height="32" patternTransform="rotate(135)">
      <line x1="0" y1="0" x2="0" y2="32" stroke="${eyebrowColor}" stroke-width="1" stroke-opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#hatch)"/>
  <rect x="0" y="0" width="1200" height="6" fill="${railTop}"/>
  <rect x="0" y="624" width="1200" height="6" fill="${railBottom}"/>

  <!-- Bishop motif: large, faint, anchored bottom-right so it doesn't fight the type. -->
  <g transform="translate(880 220) scale(4.6)" fill="none" stroke="${eyebrowColor}" stroke-width="1.4" stroke-opacity="0.18">
    <path fill-rule="evenodd" d="M32 6 C 40 18, 44 30, 44 38 C 44 46, 38 50, 32 50 C 26 50, 20 46, 20 38 C 20 30, 24 18, 32 6 Z"/>
    <path d="M28 12 L 38 22 L 36 24 L 26 14 Z"/>
    <rect x="26" y="46" width="12" height="12"/>
    <rect x="20" y="56" width="24" height="6" rx="1"/>
    <path d="M22 60 L 42 60 L 46 78 L 18 78 Z"/>
    <path d="M14 78 L 50 78 L 52 88 L 12 88 Z"/>
    <ellipse cx="32" cy="90" rx="22" ry="3.5"/>
  </g>

  <!-- Small org bishop, top-left, in accent crimson so it always reads as "Najdorf". -->
  <g transform="translate(96 200)" fill="#C8102E">
    <path fill-rule="evenodd" d="M48 9 C 60 27, 66 45, 66 57 C 66 69, 57 75, 48 75 C 39 75, 30 69, 30 57 C 30 45, 36 27, 48 9 Z M42 18 L 57 33 L 54 36 L 39 21 Z"/>
    <rect x="39" y="69" width="18" height="18"/>
    <rect x="30" y="84" width="36" height="9" rx="1.5"/>
    <path d="M33 90 L 63 90 L 69 117 L 27 117 Z"/>
    <path d="M21 117 L 75 117 L 78 132 L 18 132 Z"/>
    <ellipse cx="48" cy="135" rx="33" ry="5.25"/>
  </g>

  <!-- Eyebrow chip -->
  <text x="240" y="210" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="600" letter-spacing="6" fill="${eyebrowColor}">
    ${escapeXml(eyebrow.toUpperCase())}
  </text>

  <!-- Title — sized so it stays inside the column at any sans fallback width. -->
  ${lines.map((line, i) =>
    `<text x="240" y="${firstBaselineY + i * lineHeight}" font-family="Anton, Oswald, Impact, Arial Narrow, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="4" fill="#E9ECF1">${escapeXml(line)}</text>`,
  ).join('\n  ')}

  <!-- Domain — bottom-anchored, clear of even a 3-line title. -->
  <text x="240" y="585" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="400" fill="#9CA3AF">
    najdorfesports.gg
  </text>
</svg>`;
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Naive word wrap; collapses internal whitespace then greedily fills lines
 *  up to `maxChars`. Drops overflow lines past `maxLines`, appending an
 *  ellipsis to the last visible line. */
function wrapTitle(title, maxChars, maxLines) {
  const words = title.replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let buf = '';
  for (const w of words) {
    const test = buf ? `${buf} ${w}` : w;
    if (test.length <= maxChars) {
      buf = test;
    } else {
      if (buf) lines.push(buf);
      buf = w;
    }
  }
  if (buf) lines.push(buf);
  if (lines.length > maxLines) {
    const trimmed = lines.slice(0, maxLines);
    trimmed[maxLines - 1] = trimmed[maxLines - 1].replace(/\W?$/, '') + '…';
    return trimmed;
  }
  return lines;
}

// Maskable icon (PWA / Apple touch). Bishop in the safe zone.
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0B0B0F"/>
  <g transform="translate(176 96) scale(2.5)" fill="#C8102E">
    <path fill-rule="evenodd" d="M32 6 C 40 18, 44 30, 44 38 C 44 46, 38 50, 32 50 C 26 50, 20 46, 20 38 C 20 30, 24 18, 32 6 Z M28 12 L 38 22 L 36 24 L 26 14 Z"/>
    <rect x="26" y="46" width="12" height="12"/>
    <rect x="20" y="56" width="24" height="6" rx="1"/>
    <path d="M22 60 L 42 60 L 46 78 L 18 78 Z"/>
    <path d="M14 78 L 50 78 L 52 88 L 12 88 Z"/>
    <ellipse cx="32" cy="90" rx="22" ry="3.5"/>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Route → OG metadata. Keep this list in sync with src/pages/.
// ---------------------------------------------------------------------------

const STATIC_ROUTES = [
  // The default ships at the top-level branding folder so existing
  // BaseLayout fallback paths keep working without changes.
  { slug: '__default',  out: 'branding/og-default.png',  eyebrow: 'OWCS PACIFIC 2026', title: 'NAJDORF ESPORTS', tone: 'crimson' },
  { slug: 'home',       out: 'branding/og/home.png',     eyebrow: 'OWCS PACIFIC 2026', title: 'Najdorf Esports', tone: 'crimson' },
  { slug: 'roster',     out: 'branding/og/roster.png',   eyebrow: 'Active roster',     title: 'The Lineup',      tone: 'gold'    },
  { slug: 'matches',    out: 'branding/og/matches.png',  eyebrow: 'OWCS Pacific 2026', title: 'Matches',         tone: 'crimson' },
  { slug: 'news',       out: 'branding/og/news.png',     eyebrow: 'News',              title: 'From the team',   tone: 'split'   },
  { slug: 'about',      out: 'branding/og/about.png',    eyebrow: 'About',             title: 'Najdorf Esports', tone: 'gold'    },
  { slug: 'shop',       out: 'branding/og/shop.png',     eyebrow: 'Shop',              title: 'Opening soon',    tone: 'gold'    },
  { slug: 'privacy',    out: 'branding/og/privacy.png',  eyebrow: 'Legal',             title: 'Privacy Policy',  tone: 'crimson' },
  { slug: 'terms',      out: 'branding/og/terms.png',    eyebrow: 'Legal',             title: 'Terms of Use',    tone: 'crimson' },
];

/** Parse the YAML-ish frontmatter of a markdown post just well enough to
 *  pluck `title`, `eyebrow`, and `tone`. Avoids pulling a yaml dep for a
 *  build-time script with predictable input shape. */
function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]+?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    else if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    out[kv[1]] = val;
  }
  return out;
}

async function newsRoutes() {
  let files;
  try {
    files = await readdir(NEWS_DIR);
  } catch {
    return [];
  }
  const out = [];
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const slug = f.replace(/\.md$/, '');
    const md = await readFile(join(NEWS_DIR, f), 'utf8');
    const fm = parseFrontmatter(md);
    if (!fm.title) continue;
    out.push({
      slug: `news-${slug}`,
      out: `branding/og/news-${slug}.png`,
      eyebrow: fm.eyebrow || 'News',
      title: fm.title,
      tone: (fm.tone === 'gold' || fm.tone === 'split') ? fm.tone : 'crimson',
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

const routes = [...STATIC_ROUTES, ...(await newsRoutes())];

const tasks = [
  ...routes.map((r) => ({ svg: ogSvg(r), out: join(PUBLIC, r.out) })),
  { svg: iconSvg, out: join(PUBLIC, 'apple-touch-icon.png'), resize: 180 },
  { svg: iconSvg, out: join(PUBLIC, 'icon-192.png'), resize: 192 },
  { svg: iconSvg, out: join(PUBLIC, 'icon-512.png'), resize: 512 },
];

for (const { svg, out, resize } of tasks) {
  await mkdir(dirname(out), { recursive: true });
  let pipeline = sharp(Buffer.from(svg));
  if (resize) pipeline = pipeline.resize(resize, resize);
  await pipeline.png().toFile(out);
  console.log(`Wrote ${out}`);
}
