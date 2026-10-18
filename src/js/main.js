/**
 * Martin Engineering - Production Client Core
 * Fast, accessible, privacy-respecting, zero-dependency vanilla JS.
 */

// 1. Interaction Telemetry (Google Tag Manager / GA4 dataLayer)
window.dataLayer = window.dataLayer || [];
export const track = (event, props = {}) => {
  window.dataLayer.push(Object.assign({ event, timestamp: Date.now() }, props));
};

// Track data-track clicks, phone, whatsapp, email
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-track]');
  if (el) {
    track(el.dataset.track, {
      href: el.getAttribute('href') || '',
      text: (el.textContent || '').trim().slice(0, 50)
    });
  }
});

// 2. Deferred Analytics Loader (GTM / GA4)
// Loads only after first user interaction or idle, ensuring zero impact on Lighthouse / Core Web Vitals
(function initAnalytics() {
  const GTM_ID = 'GTM-NTZDMDF4';
  const GA4_ID = 'G-ZL164V4PBJ';
  let loaded = false;

  function loadTracking() {
    if (loaded) return;
    loaded = true;

    // GTM Script
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(gtmScript);

    // GA4 Script
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(gaScript);

    window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA4_ID);

    cleanup();
  }

  const triggerEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  function cleanup() {
    triggerEvents.forEach(evt => window.removeEventListener(evt, loadTracking, { passive: true }));
  }

  triggerEvents.forEach(evt => window.addEventListener(evt, loadTracking, { passive: true, once: true }));

  // Fallback idle load after 4 seconds
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => setTimeout(loadTracking, 4000));
  } else {
    setTimeout(loadTracking, 5000);
  }
})();

// 3. Mobile Navigation Drawer
(function initMobileNav() {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileNav');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isHidden = menu.classList.toggle('hidden');
    const isOpen = !isHidden;
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    btn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  // Close when clicking an anchor
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

// 4. Reading Progress & Scroll Depth Telemetry
(function initScroll() {
  const bar = document.getElementById('progress');
  const hit = { 25: false, 50: false, 75: false, 100: false };

  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const p = (h.scrollTop || document.body.scrollTop) / ((h.scrollHeight - h.clientHeight) || 1);
    if (bar) bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';

    const pct = p * 100;
    [25, 50, 75, 100].forEach((m) => {
      if (!hit[m] && pct >= m - 1) {
        hit[m] = true;
        track('scroll_depth', { percent: m });
      }
    });
  }, { passive: true });

  // Section visibility tracking
  if ('IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const id = en.target.dataset.section;
        if (en.isIntersecting && id && !seen.has(id)) {
          seen.add(id);
          track('section_view', { section: id });
        }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('[data-section]').forEach((s) => io.observe(s));
  }
})();

// 5. Scroll Reveal & Interactive Card Spotlight
(function initReveals() {
  const els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(e => io.observe(e));
  }

  // Spotlight cards pointer effect
  document.querySelectorAll('.pcard').forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  });
})();

// 6. Google Maps Click-to-Load Facade
(function initMapFacades() {
  document.querySelectorAll('.map-facade').forEach((facade) => {
    const btn = facade.querySelector('.load-map-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const src = facade.dataset.src;
      if (!src) return;
      track('map_loaded', { location: 'Ghaziabad' });
      const iframe = document.createElement('iframe');
      iframe.className = 'mapframe absolute inset-0 h-full w-full bg-[#111] border-0';
      iframe.src = src;
      iframe.title = 'Martin Engineering & Trading Co. location map';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';

      facade.innerHTML = '';
      facade.appendChild(iframe);
    });
  });
})();

// 7. Three.js Wireframe 3D Lazy Loader
(function init3DLazyLoader() {
  const hasScene = document.getElementById('scene');
  const hasMini = document.getElementById('mini');
  if (!hasScene && !hasMini) return;

  // Verification checks for low-end devices, reduced motion, data saver
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const lowConcurrency = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

  // Test basic WebGL availability
  let hasWebGL = false;
  try {
    const testCanvas = document.createElement('canvas');
    hasWebGL = !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
  } catch (e) {
    hasWebGL = false;
  }

  // If user prefers reduced motion or device cannot handle 3D, keep the SVG wireframe poster
  if (reduceMotion || saveData || lowConcurrency || !hasWebGL) {
    return;
  }

  // Function to load the 3D bundle
  let bundleLoaded = false;
  function loadThreeBundle() {
    if (bundleLoaded) return;
    bundleLoaded = true;
    const script = document.createElement('script');
    script.src = '/assets/js/three-scene.bundle.js';
    script.type = 'module';
    script.async = true;
    document.body.appendChild(script);
  }

  // Lazy-load after first paint when scene is near view or browser is idle
  if ('IntersectionObserver' in window && hasScene) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => loadThreeBundle());
        } else {
          setTimeout(loadThreeBundle, 300);
        }
      }
    }, { rootMargin: '200px' });
    observer.observe(hasScene);
  } else if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadThreeBundle());
  } else {
    window.addEventListener('load', () => setTimeout(loadThreeBundle, 500));
  }
})();

// 8. Service Worker Registration (PWA)
(function initSW() {
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        // Registration successful
      }).catch((err) => {
        // Registration failed
      });
    });
  }
})();
