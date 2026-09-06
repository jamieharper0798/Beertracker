import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptsDir = fileURLToPath(new URL('.', import.meta.url));
const src = path.join(scriptsDir, 'icon-source.png');
const outDir = path.join(scriptsDir, '../public/icons/');
mkdirSync(outDir, { recursive: true });

const jobs = [
  { out: 'icon-192.png', size: 192 },
  { out: 'icon-512.png', size: 512 },
  { out: 'apple-touch-icon.png', size: 180 },
  { out: 'favicon-48.png', size: 48 },
  // The source art already has generous padding around the mug and a
  // full-bleed background, so it doubles as a safe maskable icon without a
  // separate safe-zone artwork.
  { out: 'icon-maskable-192.png', size: 192 },
  { out: 'icon-maskable-512.png', size: 512 },
];

for (const job of jobs) {
  const out = path.join(outDir, job.out);
  await sharp(src).resize(job.size, job.size).png().toFile(out);
  console.log('wrote', job.out);
}
