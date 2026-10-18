# Prompt for Antigravity: make the Martin Engineering website production-ready

Paste everything below this line into Antigravity as the first message. Before you do, put `index-v2.html` (the approved design) in the project folder next to your downloaded site files and rename it `design-reference.html`.

---

## Role

You are a senior front-end engineer and technical SEO specialist. Take the approved design in `design-reference.html` and turn it into a complete, fast, search-optimised, installable (PWA) website for a real business. Work autonomously and in stages. Do not stop to ask questions unless something is truly blocking. Where you must assume something, note it in `NOTES.md`.

## The business

- Martin Engineering & Trading Co., Ghaziabad, Uttar Pradesh, India. Weighbridge manufacturer since 1998, ISO 9001 certified, nationwide supply.
- Domain: https://martinengineering.in/
- Address: AO-133, Amrit Steel Compound, South Side of G.T. Road, UPSIDC Industrial Area, Bulandshahr Road Industrial Area, Ghaziabad (U.P.) 201009
- Phones: +919811535035, +919354718898. WhatsApp: https://wa.me/919811535035. Email: martinengg.gzb@gmail.com
- Pages that exist today (keep these exact URLs so existing Google rankings are not lost): `index.html`, `aboutus.html`, `services.html`, `contactus.html`, `pitless.html`, `pittype.html`, `tank.html`, `scales.html`, `loadcell.html`
- Audience: factory owners, mines, transporters, cement/steel/agri buyers across India, mostly on mobile phones with average connections.

## Inputs

1. `design-reference.html`: the approved visual design for the home page. Keep its look: black, white and red (#E3000F), Archivo font (wide and heavy headlines), full-screen 3D wireframe weighbridge hero, red marquee, red expertise section, spotlight product cards, scroll reveals, interaction telemetry (dataLayer events), 3D wireframe load cell.
2. The existing site folder (Bootstrap, plus a Gemini-modified version with Tailwind). Use it only for images and page structure.

## Content rules (important)

- **The live site is the source of truth for text.** Fetch each page from https://martinengineering.in/ and copy its text verbatim. Earlier AI edits in my local folder added gibberish text. Remove it. If local text differs from the live site, use the live site.
- Keep the logo and all product photos, downloaded from the live site into `/assets/img/` and then optimised.
- Never invent claims: no made-up capacities, accuracy classes, prices, awards, client names, testimonials, ratings or years. If a page needs more copy for SEO (intro line, FAQ), write it conservatively from facts already on the site, and list every piece of new copy in `NOTES.md` under "New copy for owner review".
- The hero weight readout is a labelled simulation ("Weighing simulation"). Keep that label.

## Stack and structure

- **The old site uses Bootstrap. Remove Bootstrap completely** (its CSS, JS bundle, jQuery, Popper, carousel/navbar/grid classes and any Bootstrap CDN links) from every page. The new site must be Tailwind only, with no Bootstrap class names or leftover Bootstrap scripts anywhere. If my folder also contains a Gemini-made Tailwind setup, don't reuse its markup or CSS; start the Tailwind config clean from the design tokens in `design-reference.html` (colors black, white, #E3000F; Archivo font).
- Static multi-page site. No framework. HTML + Tailwind CSS (compiled with the Tailwind CLI, purged and minified, **no Tailwind CDN**) + small vanilla JS modules.
- Shared partials for header, footer and head tags, assembled at build time (a simple Node build script or Eleventy; keep it light). Output to `/dist`, ready to upload to Hostinger `public_html`.
- Three.js: install via npm, import only what is used, bundle with esbuild, and **lazy-load it** after first paint (when the hero is visible and the browser is idle). Do not load it for: `prefers-reduced-motion`, `Save-Data`, very low-end devices (`navigator.hardwareConcurrency <= 2`), or when WebGL fails. In those cases show a static SVG/CSS wireframe poster of the weighbridge instead. The hero headline, text and buttons are the LCP element, never the canvas.
- Fonts: self-host Archivo (variable, subset to Latin, woff2), `font-display: swap`, preload the one critical file. No Google Fonts requests.
- Build scripts in `package.json`: `dev`, `build`, `preview`, `lighthouse`.

## Performance targets (mobile, throttled)

- Lighthouse mobile: Performance ≥ 95, Accessibility ≥ 95, Best Practices 100, SEO 100.
- LCP < 2.0 s, CLS < 0.05, INP < 200 ms, total transfer for the home page < 250 KB before the lazy 3D chunk.
- Images: AVIF + WebP with JPEG/PNG fallback, `srcset`/`sizes`, explicit `width`/`height`, `loading="lazy"` below the fold, `fetchpriority="high"` only on the true LCP asset. Compress hard.
- Inline critical CSS, defer everything else. No render-blocking JS.
- 3D: cap pixel ratio at 1.5 on mobile, pause the render loop when off screen or the tab is hidden, dispose geometries, keep draw calls minimal.
- Google Maps: use a click-to-load facade (static image + "Load map" button) so the iframe is not loaded until needed, plus a plain "Open in Google Maps" link.

## SEO (every page)

- One unique `<title>` (≤ 60 chars) and meta description (≤ 155 chars) per page, one `<h1>`, a logical H2/H3 order, semantic landmarks (`header`, `nav`, `main`, `section`, `footer`).
- `lang="en-IN"`, canonical URL, `meta robots`, keep the existing Google Search Console verification meta tag: `google-site-verification` content `ULF4zmHbM7jnqBC2epiKeEZS0wfyaHVB-6bFg_TcarI`.
- Open Graph and Twitter cards on every page: `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`, `og:locale=en_IN`, `og:image` (1200×630, generate a branded image per page group, black/white/red, with the logo), `og:image:alt`, `twitter:card=summary_large_image`.
- JSON-LD: `Organization` + `LocalBusiness` (address, phones, email, founding year 1998, opening hours only if known) on the home and contact pages, `WebSite`, `BreadcrumbList` on inner pages, and `Product` on each product page (name, description, image, brand, manufacturer). **No fake ratings, reviews or prices.** Add `FAQPage` only where real FAQ content exists.
- `sitemap.xml`, `robots.txt` (reference the sitemap), clean internal linking between product pages, descriptive link text, descriptive image `alt` text.
- Target topics, used naturally and never stuffed: weighbridge manufacturer in India / Ghaziabad, pitless type weighbridge, pit type RCC weighbridge, electronic weighbridge, tank weighing system / compression weigh modules, hanging weighing scale, load cell.
- Keep local NAP data (name, address, phone) identical everywhere.
- Provide a short 301-redirect section in `.htaccess` for any URL that changes (ideally none).

## PWA

- `manifest.webmanifest`: name "Martin Engineering", short_name "Martin Eng", `display: standalone`, `theme_color #000000`, `background_color #000000`, `lang en-IN`, icons 192, 512 and maskable 512, plus app shortcuts: Call us, WhatsApp, Products.
- Favicon set: `favicon.ico`, SVG favicon, `apple-touch-icon` 180. Generate all icons from the logo.
- Service worker: precache the app shell and fonts, stale-while-revalidate for images and static assets, network-first for HTML, and a branded `offline.html` fallback with the phone and WhatsApp buttons. Version the cache and clean up old caches. Register after `load`. No push notifications, no intrusive install prompts.

## Mobile-first and UX

- Design from 360 px up; verify at 360, 390, 768, 1024 and 1440.
- Touch targets ≥ 44 px, readable type, no horizontal scroll.
- A sticky bottom action bar on mobile with Call and WhatsApp (and a Quote link). Use `tel:` and `wa.me` links with a prefilled message such as "Hello, I'd like a quote for a weighbridge."
- Contact page form: name, phone, email, product dropdown, message. Client-side validation, honeypot spam field, and a small PHP handler (`send.php`) that works on Hostinger shared hosting. Include a clear success/error state and a WhatsApp fallback button. Do not use paid services.
- Keep and extend the telemetry: every CTA, phone, WhatsApp, email and product click and form submit pushes a named event to `window.dataLayer`. Add a GTM/GA4 snippet with a placeholder ID in a single config location. Load it after first interaction or idle so it does not hurt performance.

## Accessibility (WCAG 2.2 AA)

- Check contrast. **Red #E3000F text on black is only about 4.2:1, so use it only for large text and graphics on black. Use white text on red, and fix anything that fails.**
- Visible keyboard focus, a skip link, labelled controls, and proper `aria` on the mobile menu and dropdown. The decorative 3D canvas and HUD get `aria-hidden` or a text alternative. Respect `prefers-reduced-motion` everywhere (no marquee, no reveals, static hero).

## Security and hosting (Hostinger / Apache)

- `.htaccess`: force HTTPS and a single canonical host (non-www or www, pick one and match the canonical tags), gzip/brotli, long immutable cache for hashed assets, short cache for HTML, security headers (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, a sensible CSP that allows self, the Maps embed and the analytics ID), and a custom `404.html` in the same design.

## Pages to build

Apply the same design system (header, footer, marquee strip where useful, black/white/red sections, wireframe line-art, spotlight cards) to all nine pages. Home comes from `design-reference.html`. For product pages, each gets a hero with its own animated wireframe/line drawing, the live-site text, a spec/feature area using only existing content, a related-products block, and a quote CTA.

## Process

1. Inspect the folder and the live site, then write a short plan in `NOTES.md` (don't wait for approval).
2. Set up the build, design tokens and shared partials.
3. Build the home page, then the other eight pages.
4. Add SEO, Open Graph, schema, sitemap, robots, PWA, `.htaccess`.
5. Optimise images and assets; lazy-load 3D.
6. Test with a real browser at the five widths, take screenshots, and fix visual bugs. Run Lighthouse (mobile), an accessibility check, an HTML validator, a structured-data validator, and a broken-link check. Fix everything you find.
7. Final output: `/dist` ready to upload, a `README.md` with exact Hostinger deploy steps and post-launch tasks (Search Console sitemap submit, Google Business Profile, GA4 ID), plus a Lighthouse score summary and the "New copy for owner review" list in `NOTES.md`.

## Definition of done

- No Bootstrap left anywhere (search the final `/dist` for "bootstrap", "navbar", "carousel" and "jquery" to confirm).
- All nine pages share one design system, look like `design-reference.html`, and work well at 360 px.
- Real content only, nothing invented, no leftover gibberish text, logo unchanged.
- Lighthouse and Core Web Vitals targets met, or the shortfall is explained with a fix plan.
- Every page has unique metadata, Open Graph, canonical and valid structured data.
- Installable PWA with offline fallback.
- No runtime CDN dependencies; everything is self-hosted.
