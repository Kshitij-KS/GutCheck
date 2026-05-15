/**
 * One-off: generates public/icons/icon-192.png and icon-512.png (sage tile + "G").
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../public/icons');
const bg = '#5A7A5A';
const fg = '#FAF8F4';

await mkdir(outDir, { recursive: true });

for (const size of [192, 512]) {
  const r = Math.floor(size * 0.2);
  const fontSize = Math.floor(size * 0.36);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bg}" rx="${r}" ry="${r}"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="500" fill="${fg}">G</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`Wrote public/icons/icon-${size}.png`);
}
