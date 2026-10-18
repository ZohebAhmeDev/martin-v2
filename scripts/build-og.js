const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'src', 'assets', 'img', 'og');
fs.mkdirSync(outDir, { recursive: true });

const ogPages = [
  {
    name: 'og-home.jpg',
    badge: 'ESTABLISHED 1998 • ISO 9001 CERTIFIED',
    title: 'WEIGHBRIDGES MANUFACTURED IN INDIA',
    subtitle: 'Pitless & Pit Type Weighbridges | Industrial Scales | Nationwide Supply'
  },
  {
    name: 'og-pitless.jpg',
    badge: 'HEAVY-DUTY INDUSTRIAL TRUCK SCALES',
    title: 'PITLESS TYPE WEIGHBRIDGES',
    subtitle: 'Capacities 30t - 100t | Platform Lengths 7.5m - 20m | Zero Pit Maintenance'
  },
  {
    name: 'og-pittype.jpg',
    badge: 'SPACE-SAVING FLUSH GROUND INSTALLATION',
    title: 'PIT TYPE RCC WEIGHBRIDGES',
    subtitle: 'Capacities 30t - 100t | Multi-Directional Approach | Robust Concrete Deck'
  },
  {
    name: 'og-tank.jpg',
    badge: 'ACCURATE INDUSTRIAL SILO & VESSEL WEIGHING',
    title: 'TANK WEIGHING & WEIGH MODULES',
    subtitle: 'Compression Weigh Modules | Moisture & Dust Protected Load Cells'
  },
  {
    name: 'og-scales.jpg',
    badge: 'PRECISION COMMERCIAL & INDUSTRIAL SCALES',
    title: 'INDUSTRIAL WEIGHING SCALES',
    subtitle: 'Platform Scales | Barcode Bench Scales | Heavy Duty & Hanging Scales'
  },
  {
    name: 'og-loadcell.jpg',
    badge: 'HIGH-PRECISION SENSING TECHNOLOGY',
    title: 'INDUSTRIAL LOAD CELLS',
    subtitle: 'Compression, Tension & Shear Beam Configurations | Harsh Environment Tested'
  },
  {
    name: 'og-services.jpg',
    badge: 'NATIONWIDE ON-SITE ENGINEERING SUPPORT',
    title: 'INSTALLATION, CALIBRATION & AMC',
    subtitle: 'Certified Test Weights | Legal Metrology Verification | 24/7 Breakdown Repair'
  },
  {
    name: 'og-about.jpg',
    badge: 'TRUSTED MANUFACTURING PARTNER SINCE 1998',
    title: 'MARTIN ENGINEERING & TRADING CO.',
    subtitle: 'Over 25 Years of Weighbridge Engineering Excellence | Ghaziabad, UP'
  },
  {
    name: 'og-contact.jpg',
    badge: 'GET IN TOUCH WITH ENGINEERING SALES',
    title: 'CONTACT MARTIN ENGINEERING',
    subtitle: 'Factory: Bulandshahr Road Industrial Area, Ghaziabad | Call +91 98115 35035'
  }
];

async function createOgImages() {
  for (const item of ogPages) {
    const gridLines = [];
    for (let i = 0; i < 22; i++) {
      gridLines.push(`<line x1="${i * 56}" y1="0" x2="${i * 56}" y2="630"/>`);
    }
    for (let i = 0; i < 12; i++) {
      gridLines.push(`<line x1="0" y1="${i * 56}" x2="1200" y2="${i * 56}"/>`);
    }

    const escapeXml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const svg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#000000"/>
            <stop offset="100%" stop-color="#141414"/>
          </linearGradient>
          <radialGradient id="glow" cx="80%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#E3000F" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <rect width="1200" height="630" fill="url(#bg)"/>
        <rect width="1200" height="630" fill="url(#glow)"/>

        <!-- Grid Pattern -->
        <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
          ${gridLines.join('')}
        </g>

        <!-- Red Accent Bars -->
        <rect x="0" y="0" width="1200" height="8" fill="#E3000F"/>
        <rect x="80" y="75" width="6" height="52" fill="#E3000F"/>

        <!-- Brand Top Header -->
        <text x="100" y="100" font-family="'Archivo', system-ui, sans-serif" font-size="20" font-weight="900" fill="#E3000F" letter-spacing="2">MARTIN ENGINEERING &amp; TRADING CO.</text>
        <text x="100" y="122" font-family="'Archivo', system-ui, sans-serif" font-size="13" font-weight="700" fill="rgba(255,255,255,0.7)">${escapeXml(item.badge)}</text>

        <!-- Main Title -->
        <text x="80" y="270" font-family="'Archivo', system-ui, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">${escapeXml(item.title)}</text>

        <!-- Subtitle -->
        <text x="80" y="340" font-family="'Archivo', system-ui, sans-serif" font-size="24" font-weight="600" fill="rgba(255,255,255,0.85)">${escapeXml(item.subtitle)}</text>

        <!-- Footer Strip -->
        <line x1="80" y1="480" x2="1120" y2="480" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        
        <text x="80" y="525" font-family="'Archivo', system-ui, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF">https://martinengineering.in</text>
        <text x="80" y="555" font-family="'Archivo', system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.6)">Ghaziabad, Uttar Pradesh, India</text>

        <text x="760" y="525" font-family="'Archivo', system-ui, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF">Phone: +91 98115 35035 / +91 93547 18898</text>
        <text x="760" y="555" font-family="'Archivo', system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.6)">Email: martinengg.gzb@gmail.com</text>

        <!-- Corner Frame Marks -->
        <path d="M1120 120 h-40 M1120 120 v40" stroke="#E3000F" stroke-width="3" fill="none"/>
        <path d="M1080 440 h40 M1120 440 v-40" stroke="#E3000F" stroke-width="3" fill="none"/>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(path.join(outDir, item.name));

    console.log('Generated ' + item.name);
  }
}

createOgImages().catch(console.error);
