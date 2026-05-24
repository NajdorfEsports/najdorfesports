// One-shot script: renders the OG card and the icon set used by site.webmanifest
// and apple-touch-icon. Re-run after editing any of the inline SVGs: `npm run build:og`.
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = `${__dirname}/../public`;

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B0B0F"/>
      <stop offset="100%" stop-color="#15151C"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="6" fill="#C8102E"/>
  <rect x="0" y="624" width="1200" height="6" fill="#C9A227"/>

  <g transform="translate(96 200)" fill="#C8102E">
    <path fill-rule="evenodd" d="M48 9 C 60 27, 66 45, 66 57 C 66 69, 57 75, 48 75 C 39 75, 30 69, 30 57 C 30 45, 36 27, 48 9 Z M42 18 L 57 33 L 54 36 L 39 21 Z"/>
    <rect x="39" y="69" width="18" height="18"/>
    <rect x="30" y="84" width="36" height="9" rx="1.5"/>
    <path d="M33 90 L 63 90 L 69 117 L 27 117 Z"/>
    <path d="M21 117 L 75 117 L 78 132 L 18 132 Z"/>
    <ellipse cx="48" cy="135" rx="33" ry="5.25"/>
  </g>

  <text x="240" y="320" font-family="Anton, Oswald, Impact, sans-serif" font-size="140" font-weight="400" letter-spacing="6">
    <tspan fill="#C8102E">NAJDORF</tspan><tspan fill="#E9ECF1">&#160;ESPORTS</tspan>
  </text>

  <text x="240" y="400" font-family="Inter, system-ui, sans-serif" font-size="36" font-weight="600" letter-spacing="8" fill="#C9A227">
    OWCS PACIFIC 2026
  </text>

  <text x="240" y="460" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="400" fill="#9CA3AF">
    najdorfesports.gg
  </text>
</svg>`;

// Icon: dark square with the bishop centered. The bishop sits inside the maskable
// safe zone (80% center diameter) so it survives Android adaptive masking.
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

const tasks = [
  { svg: ogSvg, out: `${PUBLIC}/branding/og-default.png` },
  { svg: iconSvg, out: `${PUBLIC}/apple-touch-icon.png`, resize: 180 },
  { svg: iconSvg, out: `${PUBLIC}/icon-192.png`, resize: 192 },
  { svg: iconSvg, out: `${PUBLIC}/icon-512.png`, resize: 512 },
];

for (const { svg, out, resize } of tasks) {
  await mkdir(dirname(out), { recursive: true });
  let pipeline = sharp(Buffer.from(svg));
  if (resize) pipeline = pipeline.resize(resize, resize);
  await pipeline.png().toFile(out);
  console.log(`Wrote ${out}`);
}
