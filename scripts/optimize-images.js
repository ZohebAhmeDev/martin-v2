const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcImagesDir = path.join(__dirname, '..', 'images');
const outDir = path.join(__dirname, '..', 'src', 'assets', 'img');
const iconOutDir = path.join(__dirname, '..', 'src', 'assets', 'icons');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(iconOutDir, { recursive: true });

// Copy and optimize favicon files
const faviconDir = path.join(__dirname, '..', 'favicon_io');
if (fs.existsSync(faviconDir)) {
  fs.readdirSync(faviconDir).forEach(file => {
    const srcFile = path.join(faviconDir, file);
    if (fs.statSync(srcFile).isFile()) {
      let destName = file;
      if (file === 'android-chrome-192x192.png') destName = 'icon-192x192.png';
      if (file === 'android-chrome-512x512.png') destName = 'icon-512x512.png';
      fs.copyFileSync(srcFile, path.join(iconOutDir, destName));
    }
  });
}

// Generate maskable 512x512 icon from icon-512x512.png with safe area padding
async function generateMaskableIcon() {
  const icon512 = path.join(iconOutDir, 'icon-512x512.png');
  if (fs.existsSync(icon512)) {
    // 80% size centered on black canvas
    const inner = await sharp(icon512).resize(410, 410, { fit: 'contain' }).toBuffer();
    await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      }
    })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toFile(path.join(iconOutDir, 'icon-maskable-512x512.png'));
    console.log('Generated icon-maskable-512x512.png');
  }
}

async function optimizeImages() {
  await generateMaskableIcon();

  const files = fs.readdirSync(srcImagesDir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const inputPath = path.join(srcImagesDir, file);
    const baseName = path.basename(file, ext).replace(/\s+/g, '-').toLowerCase();

    // 1. Optimized JPG/PNG
    const outFallbackPath = path.join(outDir, `${baseName}${ext}`);
    const img = sharp(inputPath);
    const meta = await img.metadata();

    if (ext === '.png') {
      await sharp(inputPath)
        .png({ quality: 85, compressionLevel: 9, effort: 7 })
        .toFile(outFallbackPath);
    } else {
      await sharp(inputPath)
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(outFallbackPath);
    }

    // 2. WebP version
    const outWebpPath = path.join(outDir, `${baseName}.webp`);
    await sharp(inputPath)
      .webp({ quality: 80, effort: 5 })
      .toFile(outWebpPath);

    // 3. AVIF version
    const outAvifPath = path.join(outDir, `${baseName}.avif`);
    await sharp(inputPath)
      .avif({ quality: 70, effort: 4 })
      .toFile(outAvifPath);

    console.log(`Optimized ${file} -> ${baseName} (fallback, webp, avif)`);
  }
}

optimizeImages().catch(console.error);
