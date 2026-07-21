import sharp from 'sharp';
import { readdirSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imgDir = join(__dirname, '..', 'src', 'assets', 'images', 'escape-rooms');

if (!existsSync(imgDir)) {
  console.error(`Directory not found: ${imgDir}`);
  process.exit(1);
}

const files = readdirSync(imgDir).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

if (files.length === 0) {
  console.log('No non-WebP images found.');
  process.exit(0);
}

for (const file of files) {
  const inputPath = join(imgDir, file);
  const outputName = file.replace(/\.\w+$/, '.webp');
  const outputPath = join(imgDir, outputName);

  await sharp(inputPath)
    .resize(640, 360, { fit: 'cover', position: 'centre' })
    .webp({ quality: 100 })
    .toFile(outputPath);

  const oldSize = (await sharp(inputPath).metadata()).size || 0;
  const newSize = (await sharp(outputPath).metadata()).size || 0;

  console.log(
    `${file} → ${outputName}: ${(oldSize / 1024 / 1024).toFixed(1)}MB → ${(newSize / 1024).toFixed(0)}KB`
  );

  unlinkSync(inputPath);
}

console.log(`Done — ${files.length} image${files.length > 1 ? 's' : ''} converted.`);
