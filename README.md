# Martin Engineering & Trading Co. — Production Website

A fast, search-optimised, accessible, installable (PWA) website for **Martin Engineering & Trading Co.** (Ghaziabad, Uttar Pradesh, India), weighbridge and industrial scale manufacturers since 1998 (ISO 9001 certified).

All deliverables are fully built and self-contained in the `/dist` directory, ready for immediate upload to Hostinger shared hosting (`public_html`).

---

## 1. Quick Start & Build Commands

This project uses a zero-runtime-CDN, modular pipeline combining Node.js static assembly, pure Tailwind CSS v3 CLI (purged and minified), self-hosted Latin variable fonts, and lazy-loaded Three.js 3D wireframe simulations.

### Prerequisites
- Node.js (v18+) & npm

### Available Scripts in `package.json`

| Script | Command | Description |
|---|---|---|
| **Build** | `npm run build` | Compiles Tailwind CSS, bundles JS modules with esbuild, and outputs the production site to `/dist`. |
| **Full Build** | `npm run build:all` | Optimizes and converts all product images to WebP/AVIF, generates branded 1200x630 Open Graph cards, and builds `/dist`. |
| **Development** | `npm run dev` | Builds the site and launches a local hot-reloading development preview server on `http://localhost:3000`. |
| **Preview** | `npm run preview` | Starts a high-performance static server serving `/dist` on `http://localhost:3000`. |
| **Lighthouse** | `npm run lighthouse` | Runs a full mobile audit for Performance, Accessibility, Best Practices, and SEO. |

---

## 2. Hostinger Shared Hosting Deployment Guide

### Step 1: Prepare the Files
1. Run the production build locally:
   ```bash
   npm run build
   ```
2. Navigate into the `dist/` directory. All production assets are located here:
   - 9 canonical HTML pages: `index.html`, `aboutus.html`, `services.html`, `contactus.html`, `pitless.html`, `pittype.html`, `tank.html`, `scales.html`, `loadcell.html`
   - Auxiliary pages: `thankyou.html`, `404.html`, `offline.html`
   - Server & SEO files: `.htaccess`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `sw.js`, `favicon.ico`, `send.php`
   - Asset directories: `/assets/css/`, `/assets/js/`, `/assets/fonts/`, `/assets/img/`, `/assets/icons/`

### Step 2: Upload to Hostinger `public_html`
#### Option A: Using Hostinger File Manager (Recommended & Fast)
1. Log in to your Hostinger hPanel (`https://hpanel.hostinger.com/`).
2. Go to **Websites** &rarr; Select `martinengineering.in` &rarr; Open **File Manager**.
3. Open the `public_html/` folder.
4. Back up or remove old legacy site files.
5. Zip the contents of your local `dist/` folder (select all files *inside* `dist`, not the `dist` folder itself).
6. Upload `dist.zip` to `public_html/` and click **Extract**.
7. Ensure files are directly in `public_html/` (e.g., `public_html/index.html`, `public_html/.htaccess`).

#### Option B: Using FTP (FileZilla)
1. Connect using your Hostinger FTP credentials:
   - Host: `ftp.martinengineering.in` (or IP address from hPanel)
   - Port: `21`
   - User & Password: (from hPanel FTP Accounts)
2. Drag and drop all contents of `dist/` into `/public_html/`.

### Step 3: Server Configuration Check
1. **PHP Version**: Ensure PHP 8.1 or 8.2 is enabled in hPanel &rarr; **PHP Configuration**.
2. **Mail Handler**: Verify `send.php` permissions are set to `0644`. Native `mail()` is enabled by default on Hostinger shared plans. Form submissions will be routed to `martinengg.gzb@gmail.com`.
3. **SSL / HTTPS**: Verify Hostinger's Free Lifetime SSL is active. The `.htaccess` file will automatically force HTTPS and canonicalize non-www requests.

---

## 3. Post-Launch SEO & Marketing Checklist

### 1. Google Search Console Sitemap Submission
- Access [Google Search Console](https://search.google.com/search-console).
- Verify domain ownership (the property is pre-verified using the existing meta verification tag: `ULF4zmHbM7jnqBC2epiKeEZS0wfyaHVB-6bFg_TcarI`).
- Go to **Sitemaps** in the left menu.
- Submit the sitemap URL: `https://martinengineering.in/sitemap.xml`.
- Request indexing for the homepage and product URLs.

### 2. Google Business Profile (Local SEO Sync)
Ensure your Google Business Profile exactly matches the website's verified NAP (Name, Address, Phone) details:
- **Business Name**: Martin Engineering & Trading Co.
- **Address**: AO-133, Amrit Steel Compound, South Side of G.T. Road, UPSIDC Industrial Area, Bulandshahr Road Industrial Area, Ghaziabad (U.P.) 201009
- **Phone Numbers**: +91 98115 35035 / +91 93547 18898
- **Website URL**: https://martinengineering.in/
- **Google Maps Pin CID**: `5059247653765116039`

### 3. Google Tag Manager & Google Analytics 4
- The site includes single-point configuration for GTM and GA4:
  - **GTM ID**: `GTM-NTZDMDF4`
  - **GA4 Measurement ID**: `G-ZL164V4PBJ`
- Scripts are deferred until user interaction or idle to guarantee a 100/100 Core Web Vitals score.
- Telemetry pushes events to `window.dataLayer` for all button clicks, phone calls, WhatsApp messages, form submissions, section views, and scroll depth.

### 4. Contact Form Testing
1. Visit `https://martinengineering.in/contactus.html`.
2. Fill out and submit a test inquiry.
3. Verify receipt in `martinengg.gzb@gmail.com` and test the immediate WhatsApp confirmation button.

---

## 4. Key Architectural & Performance Features

- **Zero Bootstrap & Zero External Runtime Dependencies**: All legacy Bootstrap CSS, JS, and jQuery libraries have been purged. Styles are compiled solely via pure Tailwind CSS.
- **Self-Hosted Variable Typography**: Archivo variable font (.woff2) subsetted to Latin and preloaded. Zero external font requests to Google Fonts.
- **Adaptive 3D Wireframe Visuals**:
  - Modular Three.js bundle (`three-scene.bundle.js`, ~529 KB) lazy-loaded only when the hero canvas is in view, after first paint, and when the CPU is idle.
  - Automatically disabled on low-end devices (`navigator.hardwareConcurrency <= 2`), data-saver mode (`Save-Data`), and `prefers-reduced-motion`.
  - Instant SVG wireframe poster pre-rendered in HTML ensuring zero CLS and instant LCP (< 1.5s).
- **Image Optimization**: All photos converted to next-generation AVIF and WebP with fallback JPEG/PNG, responsive `<picture>` tags, and hard compression.
- **PWA Ready**: Web App Manifest with app shortcuts (Call, WhatsApp, Products), multi-resolution icons (including 512x512 maskable), and an offline-first Service Worker with branded `offline.html` fallback.
