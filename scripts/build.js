const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const esbuild = require('esbuild');

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const TEMPLATES_DIR = path.join(SRC_DIR, 'templates');
const PARTIALS_DIR = path.join(TEMPLATES_DIR, 'partials');
const PAGES_DIR = path.join(TEMPLATES_DIR, 'pages');

console.log('--- Starting Martin Engineering Production Build ---');

// 1. Clean and setup dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, 'assets', 'css'), { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, 'assets', 'js'), { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, 'assets', 'fonts'), { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, 'assets', 'img'), { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, 'assets', 'icons'), { recursive: true });

// 2. Helper to copy directories recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 3. Copy static assets
console.log('Copying static assets (fonts, images, icons, configs)...');
copyDirSync(path.join(SRC_DIR, 'assets', 'fonts'), path.join(DIST_DIR, 'assets', 'fonts'));
copyDirSync(path.join(SRC_DIR, 'assets', 'img'), path.join(DIST_DIR, 'assets', 'img'));
copyDirSync(path.join(SRC_DIR, 'assets', 'icons'), path.join(DIST_DIR, 'assets', 'icons'));

// Copy root static files
const rootFiles = ['manifest.webmanifest', 'sw.js', '.htaccess', 'robots.txt', 'sitemap.xml', 'send.php'];
rootFiles.forEach(file => {
  const srcFile = path.join(SRC_DIR, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(DIST_DIR, file));
  }
});
// Copy root favicon.ico
if (fs.existsSync(path.join(SRC_DIR, 'assets', 'icons', 'favicon.ico'))) {
  fs.copyFileSync(path.join(SRC_DIR, 'assets', 'icons', 'favicon.ico'), path.join(DIST_DIR, 'favicon.ico'));
}

// 4. Bundle JS with esbuild
console.log('Bundling JavaScript with esbuild...');
// Bundle Three.js scene as standalone lazy-loadable module
esbuild.buildSync({
  entryPoints: [path.join(SRC_DIR, 'js', 'three-scene.js')],
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020'],
  outfile: path.join(DIST_DIR, 'assets', 'js', 'three-scene.bundle.js'),
});

// Bundle main client script
esbuild.buildSync({
  entryPoints: [path.join(SRC_DIR, 'js', 'main.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: path.join(DIST_DIR, 'assets', 'js', 'main.js'),
});

// Bundle contact form script
esbuild.buildSync({
  entryPoints: [path.join(SRC_DIR, 'js', 'contact-form.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: path.join(DIST_DIR, 'assets', 'js', 'contact-form.js'),
});

// 5. Read Partials
const headPartial = fs.readFileSync(path.join(PARTIALS_DIR, 'head.html'), 'utf8');
const headerPartial = fs.readFileSync(path.join(PARTIALS_DIR, 'header.html'), 'utf8');
const footerPartial = fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf8');
const bottomBarPartial = fs.readFileSync(path.join(PARTIALS_DIR, 'bottom-bar.html'), 'utf8');

// Global Business Schemas
const LOCAL_BUSINESS_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Organization"],
  "@id": "https://martinengineering.in/#organization",
  "name": "Martin Engineering & Trading Co.",
  "legalName": "Martin Engineering & Trading Co.",
  "alternateName": "Martin Engineering",
  "url": "https://martinengineering.in/",
  "logo": "https://martinengineering.in/assets/img/logo.png",
  "image": "https://martinengineering.in/assets/img/martin-factory.png",
  "description": "Manufacturer of pitless and pit type weighbridges, tank weighing systems, weighing scales and load cells in India since 1998. ISO 9001 certified.",
  "foundingDate": "1998",
  "telephone": ["+919811535035", "+919354718898"],
  "email": "martinengg.gzb@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "AO-133, Amrit Steel Compound, South Side of G.T. Road, UPSIDC Industrial Area, Bulandshahr Road Industrial Area",
    "addressLocality": "Ghaziabad",
    "addressRegion": "Uttar Pradesh",
    "postalCode": "201009",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 28.643038,
    "longitude": 77.439669
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "09:00",
    "closes": "19:00"
  },
  "sameAs": [
    "https://wa.me/919811535035"
  ]
});

const WEBSITE_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://martinengineering.in/#website",
  "url": "https://martinengineering.in/",
  "name": "Martin Engineering",
  "publisher": { "@id": "https://martinengineering.in/#organization" }
});

// Page Specific Definitions
const pages = [
  {
    filename: 'index.html',
    title: 'Martin Engineering | Weighbridges Manufacturer in India',
    description: 'Martin Engineering & Trading Co., manufacturer of weighbridges in India since 1998. Pitless and pit type weighbridges, tank weighing systems, and load cells.',
    canonical: 'https://martinengineering.in/',
    ogImage: 'https://martinengineering.in/assets/img/og/og-home.jpg',
    ogImageAlt: 'Martin Engineering Weighbridges manufactured in India since 1998',
    ogType: 'website',
    activeNav: 'home',
    schemas: [LOCAL_BUSINESS_SCHEMA, WEBSITE_SCHEMA]
  },
  {
    filename: 'aboutus.html',
    title: 'About Us | Martin Engineering & Trading Co. Ghaziabad',
    description: 'Learn about Martin Engineering & Trading Co., established in 1998 in Ghaziabad. ISO 9001 certified weighbridge and industrial scale manufacturer in India.',
    canonical: 'https://martinengineering.in/aboutus.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-about.jpg',
    ogImageAlt: 'About Martin Engineering Weighbridge Manufacturer',
    ogType: 'website',
    activeNav: 'about',
    schemas: [
      LOCAL_BUSINESS_SCHEMA,
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://martinengineering.in/" },
          { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://martinengineering.in/aboutus.html" }
        ]
      })
    ]
  },
  {
    filename: 'services.html',
    title: 'Weighbridge Installation, Calibration & Repair Services',
    description: 'Weighbridge and industrial scale installation, calibration certificates, AMC preventive maintenance, and repair services across India by Martin Engineering.',
    canonical: 'https://martinengineering.in/services.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-services.jpg',
    ogImageAlt: 'Weighbridge calibration and repair services by Martin Engineering',
    ogType: 'website',
    activeNav: 'services',
    schemas: [
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Weighing Scale Installation, Calibration, Maintenance & Repair",
        "provider": { "@id": "https://martinengineering.in/#organization" },
        "serviceType": "Weighbridge & Industrial Scale Maintenance",
        "areaServed": "IN",
        "description": "Complete service support for industrial and commercial weighing scales, platform scales, weighbridges, counter scales, and laboratory balances."
      }),
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://martinengineering.in/" },
          { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://martinengineering.in/services.html" }
        ]
      })
    ]
  },
  {
    filename: 'contactus.html',
    title: 'Contact Martin Engineering | Weighbridge Sales & Support',
    description: 'Contact Martin Engineering in Ghaziabad, UP. Call +91 98115 35035 or +91 9354718898 for weighbridge sales, installation, service, and custom quotes.',
    canonical: 'https://martinengineering.in/contactus.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-contact.jpg',
    ogImageAlt: 'Contact Martin Engineering Ghaziabad',
    ogType: 'website',
    activeNav: 'contact',
    schemas: [
      LOCAL_BUSINESS_SCHEMA,
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact Martin Engineering",
        "url": "https://martinengineering.in/contactus.html"
      }),
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://martinengineering.in/" },
          { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://martinengineering.in/contactus.html" }
        ]
      })
    ]
  },
  {
    filename: 'pitless.html',
    title: 'Pitless Type Weighbridges | Martin Engineering India',
    description: 'Pitless type weighbridges manufactured in India by Martin Engineering. 30t to 100t capacities, 7.5m to 20m platforms, steel and concrete site-cast deck.',
    canonical: 'https://martinengineering.in/pitless.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-pitless.jpg',
    ogImageAlt: 'Pitless Type Weighbridges manufactured by Martin Engineering',
    ogType: 'product',
    activeNav: 'pitless',
    schemas: [
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Pitless Type Weighbridge",
        "image": "https://martinengineering.in/assets/img/pitless.jpg",
        "description": "Full steel and concrete composite platform weighbridge installed above ground level. Capacities from 30t to 100t, platform sizes from 7.5x3m to 20x3m.",
        "brand": { "@type": "Brand", "name": "Martin Engineering" },
        "manufacturer": { "@id": "https://martinengineering.in/#organization" }
      }),
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://martinengineering.in/" },
          { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://martinengineering.in/#products" },
          { "@type": "ListItem", "position": 3, "name": "Pitless Type Weighbridges", "item": "https://martinengineering.in/pitless.html" }
        ]
      }),
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Why choose a pitless weighbridge over a pit type?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Pitless weighbridges eliminate costly foundation excavation and pit construction. Because the platform sits entirely above ground level, it avoids water logging in rainy seasons and offers easy access to all load cells for maintenance."
            }
          },
          {
            "@type": "Question",
            "name": "What capacities and platform sizes are available for pitless weighbridges?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Martin Engineering manufactures pitless weighbridges from 7.5 x 3 m (30t) up to 20 x 3 m (100t) with 4, 6, or 8 precision load cells depending on length."
            }
          }
        ]
      })
    ]
  },
  {
    filename: 'pittype.html',
    title: 'Pit Type RCC Weighbridge | Martin Engineering India',
    description: 'Pit type RCC weighbridges by Martin Engineering. Space-saving, level-to-ground truck scales from 30t to 100t capacity with high durability and safety.',
    canonical: 'https://martinengineering.in/pittype.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-pittype.jpg',
    ogImageAlt: 'Pit Type RCC Weighbridge by Martin Engineering',
    ogType: 'product',
    activeNav: 'pittype',
    schemas: [
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Pit Type RCC Weighbridge",
        "image": "https://martinengineering.in/assets/img/pittype.jpg",
        "description": "Reinforced concrete deck truck scale installed in a pit level with the ground. Allows multi-directional vehicular access in compact yards.",
        "brand": { "@type": "Brand", "name": "Martin Engineering" },
        "manufacturer": { "@id": "https://martinengineering.in/#organization" }
      }),
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://martinengineering.in/" },
          { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://martinengineering.in/#products" },
          { "@type": "ListItem", "position": 3, "name": "Pit Type RCC Weighbridge", "item": "https://martinengineering.in/pittype.html" }
        ]
      }),
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "When is a pit type weighbridge recommended?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Pit type weighbridges are recommended when space is limited on site, as they do not require approach ramps and allow vehicles to enter or turn onto the deck from multiple directions."
            }
          },
          {
            "@type": "Question",
            "name": "Does the RCC platform require regular painting?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Because the deck is constructed from heavy-duty reinforced concrete cast on-site, it is maintenance-free and requires no painting or re-painting over its lifespan."
            }
          }
        ]
      })
    ]
  },
  {
    filename: 'tank.html',
    title: 'Tank Weighing System & Compression Modules | Martin',
    description: 'Industrial tank weighing systems and compression weigh modules by Martin Engineering. Moisture-proof, dust-proof load cell solutions for tanks and silos.',
    canonical: 'https://martinengineering.in/tank.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-tank.jpg',
    ogImageAlt: 'Tank Weighing System Compression Weigh Modules',
    ogType: 'product',
    activeNav: 'tank',
    schemas: [
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Tank Weighing System & Compression Weigh Modules",
        "image": "https://martinengineering.in/assets/img/tank.jpg",
        "description": "High-accuracy compression weight modules for measuring weight of industrial liquid tanks, silos, hoppers, and batching vessels.",
        "brand": { "@type": "Brand", "name": "Martin Engineering" },
        "manufacturer": { "@id": "https://martinengineering.in/#organization" }
      }),
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://martinengineering.in/" },
          { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://martinengineering.in/#products" },
          { "@type": "ListItem", "position": 3, "name": "Tank Weighing System", "item": "https://martinengineering.in/tank.html" }
        ]
      })
    ]
  },
  {
    filename: 'scales.html',
    title: 'Industrial Weighing Scales Catalog | Martin Engineering',
    description: 'Industrial weighing scales: packing scales, platform scales, bench scales with barcode label printers, and hanging crane scales from Martin Engineering.',
    canonical: 'https://martinengineering.in/scales.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-scales.jpg',
    ogImageAlt: 'Industrial Weighing Scales Catalog by Martin Engineering',
    ogType: 'product',
    activeNav: 'scales',
    schemas: [
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Industrial Weighing Scales",
        "image": "https://martinengineering.in/assets/img/scales.jpg",
        "description": "Industrial and commercial scales: packing scales, electronic platform scales, barcode label printing bench scales, and crane hanging scales.",
        "brand": { "@type": "Brand", "name": "Martin Engineering" },
        "manufacturer": { "@id": "https://martinengineering.in/#organization" }
      }),
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://martinengineering.in/" },
          { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://martinengineering.in/#products" },
          { "@type": "ListItem", "position": 3, "name": "Weighing Scales", "item": "https://martinengineering.in/scales.html" }
        ]
      })
    ]
  },
  {
    filename: 'loadcell.html',
    title: 'Industrial Load Cells | Martin Engineering India',
    description: 'High-precision load cells for weighbridges and industrial scales. Compression, shear beam, and tension load cells manufactured by Martin Engineering.',
    canonical: 'https://martinengineering.in/loadcell.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-loadcell.jpg',
    ogImageAlt: 'Industrial Load Cells by Martin Engineering',
    ogType: 'product',
    activeNav: 'loadcell',
    schemas: [
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Industrial Load Cells",
        "image": "https://martinengineering.in/assets/img/loadcell.jpg",
        "description": "Precision load cells in compression, tension, and shear beam configurations for vehicle weighbridges, scales, and industrial testing.",
        "brand": { "@type": "Brand", "name": "Martin Engineering" },
        "manufacturer": { "@id": "https://martinengineering.in/#organization" }
      }),
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://martinengineering.in/" },
          { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://martinengineering.in/#products" },
          { "@type": "ListItem", "position": 3, "name": "Loadcell", "item": "https://martinengineering.in/loadcell.html" }
        ]
      })
    ]
  },
  {
    filename: 'thankyou.html',
    title: 'Inquiry Received | Martin Engineering & Trading Co.',
    description: 'Thank you for contacting Martin Engineering. Our technical sales team will review your inquiry and connect with you shortly.',
    canonical: 'https://martinengineering.in/thankyou.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-home.jpg',
    ogImageAlt: 'Martin Engineering Ghaziabad',
    ogType: 'website',
    activeNav: '',
    schemas: []
  },
  {
    filename: '404.html',
    title: '404 Page Not Found | Martin Engineering',
    description: 'The requested page could not be found. Explore our weighbridges, industrial weighing scales, and load cells.',
    canonical: 'https://martinengineering.in/404.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-home.jpg',
    ogImageAlt: 'Martin Engineering 404',
    ogType: 'website',
    activeNav: '',
    schemas: []
  },
  {
    filename: 'offline.html',
    title: 'Offline | Martin Engineering',
    description: 'You are currently offline. Access cached technical information and contact Martin Engineering directly.',
    canonical: 'https://martinengineering.in/offline.html',
    ogImage: 'https://martinengineering.in/assets/img/og/og-home.jpg',
    ogImageAlt: 'Martin Engineering Offline',
    ogType: 'website',
    activeNav: '',
    schemas: []
  }
];

// Compile each page
pages.forEach(p => {
  const pageFile = path.join(PAGES_DIR, p.filename);
  if (!fs.existsSync(pageFile)) {
    console.warn(`Warning: Page template ${p.filename} not found!`);
    return;
  }
  const pageBody = fs.readFileSync(pageFile, 'utf8');

  // Prepare Schemas
  const schemasHtml = p.schemas.map(s => `<script type="application/ld+json">\n${s}\n</script>`).join('\n');

  // Prepare Head
  let head = headPartial
    .replace(/\{\{TITLE\}\}/g, p.title)
    .replace(/\{\{DESCRIPTION\}\}/g, p.description)
    .replace(/\{\{CANONICAL_URL\}\}/g, p.canonical)
    .replace(/\{\{OG_IMAGE\}\}/g, p.ogImage)
    .replace(/\{\{OG_IMAGE_ALT\}\}/g, p.ogImageAlt)
    .replace(/\{\{OG_TYPE\}\}/g, p.ogType)
    .replace(/\{\{JSON_LD\}\}/g, schemasHtml);

  // Prepare Header active states
  let header = headerPartial
    .replace('{{NAV_ACTIVE_HOME}}', p.activeNav === 'home' ? 'text-brand' : '')
    .replace('{{NAV_ACTIVE_PRODUCTS}}', ['pitless', 'pittype', 'tank', 'scales', 'loadcell'].includes(p.activeNav) ? 'text-brand' : '')
    .replace('{{NAV_ACTIVE_PITLESS}}', p.activeNav === 'pitless' ? 'bg-brand text-white' : '')
    .replace('{{NAV_ACTIVE_PITTYPE}}', p.activeNav === 'pittype' ? 'bg-brand text-white' : '')
    .replace('{{NAV_ACTIVE_TANK}}', p.activeNav === 'tank' ? 'bg-brand text-white' : '')
    .replace('{{NAV_ACTIVE_SCALES}}', p.activeNav === 'scales' ? 'bg-brand text-white' : '')
    .replace('{{NAV_ACTIVE_LOADCELL}}', p.activeNav === 'loadcell' ? 'bg-brand text-white' : '')
    .replace('{{NAV_ACTIVE_ABOUT}}', p.activeNav === 'about' ? 'text-brand' : '')
    .replace('{{NAV_ACTIVE_SERVICES}}', p.activeNav === 'services' ? 'text-brand' : '')
    .replace('{{NAV_ACTIVE_CONTACT}}', p.activeNav === 'contact' ? 'text-brand' : '');

  // Assemble Complete Document
  const fullHtml = `<!doctype html>
<html lang="en-IN">
<head>
${head}
</head>
<body class="bg-black text-white selection:bg-brand selection:text-white">
${header}
${pageBody}
${footerPartial}
${bottomBarPartial}
<script src="/assets/js/main.js" defer></script>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST_DIR, p.filename), fullHtml, 'utf8');
  console.log(`Generated HTML: dist/${p.filename}`);
});

// 6. Run Tailwind CLI to compile and minify CSS for production
console.log('Compiling Tailwind CSS with Tailwind CLI...');
try {
  execSync('npx tailwindcss -i ./src/styles/input.css -o ./dist/assets/css/style.css --minify', {
    cwd: ROOT_DIR,
    stdio: 'inherit'
  });
  console.log('Tailwind CSS compilation successful: dist/assets/css/style.css');
} catch (err) {
  console.error('Error compiling Tailwind CSS:', err);
  process.exit(1);
}

// 7. Sync dist files to workspace root for Live Server compatibility
console.log('Syncing dist output to workspace root for IDE Live Server compatibility...');
copyDirSync(path.join(DIST_DIR, 'assets'), path.join(ROOT_DIR, 'assets'));
pages.forEach(p => {
  const distFile = path.join(DIST_DIR, p.filename);
  if (fs.existsSync(distFile)) {
    fs.copyFileSync(distFile, path.join(ROOT_DIR, p.filename));
  }
});

console.log('--- Production Build Complete! ---');
