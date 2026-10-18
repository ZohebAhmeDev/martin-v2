const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = path.join(__dirname, '..');
const FAVICON_IO_DIR = path.join(ROOT_DIR, 'favicon_io');
const ICONS_SRC_DIR = path.join(ROOT_DIR, 'src', 'assets', 'icons');
const ICONS_DIST_DIR = path.join(ROOT_DIR, 'dist', 'assets', 'icons');
const ICONS_ROOT_DIR = path.join(ROOT_DIR, 'assets', 'icons');

fs.mkdirSync(ICONS_SRC_DIR, { recursive: true });
fs.mkdirSync(ICONS_DIST_DIR, { recursive: true });
fs.mkdirSync(ICONS_ROOT_DIR, { recursive: true });

async function syncAndBuildFavicons() {
  console.log('Generating & syncing authentic round favicons...');

  const master512 = path.join(FAVICON_IO_DIR, 'android-chrome-512x512.png');
  if (!fs.existsSync(master512)) {
    throw new Error('Master icon favicon_io/android-chrome-512x512.png not found!');
  }

  // 1. Build authentic SVG with circle clip and embedded high-res master
  const pngBuffer = fs.readFileSync(master512);
  const base64Data = pngBuffer.toString('base64');
  const roundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <clipPath id="circleClip">
      <circle cx="256" cy="256" r="256" />
    </clipPath>
  </defs>
  <g clip-path="url(#circleClip)">
    <circle cx="256" cy="256" r="256" fill="#FFFFFF" />
    <image width="512" height="512" href="data:image/png;base64,${base64Data}" />
  </g>
</svg>`;

  const targets = [ICONS_SRC_DIR, ICONS_DIST_DIR, ICONS_ROOT_DIR];

  // Save SVG to all icon directories
  for (const dir of targets) {
    fs.writeFileSync(path.join(dir, 'favicon.svg'), roundSvg, 'utf8');
  }
  console.log('Generated: favicon.svg in src, dist, and root assets');

  // 2. Generate PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-512x512.png', size: 512 },
    { name: 'icon-maskable-512x512.png', size: 512 }
  ];

  for (const { name, size } of sizes) {
    const pngResized = await sharp(pngBuffer)
      .resize(size, size)
      .png()
      .toBuffer();

    for (const dir of targets) {
      fs.writeFileSync(path.join(dir, name), pngResized);
    }
    console.log(`Generated: ${name} (${size}x${size})`);
  }

  // 3. Multi-size favicon.ico
  // favicon_io/favicon.ico has authentic 16, 32, 48 round icons
  const icoSource = path.join(FAVICON_IO_DIR, 'favicon.ico');
  const icoBuffer = fs.readFileSync(icoSource);

  for (const dir of targets) {
    fs.writeFileSync(path.join(dir, 'favicon.ico'), icoBuffer);
  }
  fs.writeFileSync(path.join(ROOT_DIR, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(ROOT_DIR, 'dist', 'favicon.ico'), icoBuffer);
  console.log('Synchronized: multi-size round favicon.ico to root and icons directories');

  console.log('All round favicons successfully created and synchronized!');
}

syncAndBuildFavicons().catch(err => {
  console.error('Failed generating favicons:', err);
  process.exit(1);
});
