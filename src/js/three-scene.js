import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  Vector3,
  LineBasicMaterial,
  LineSegments,
  EdgesGeometry,
  BoxGeometry,
  BufferGeometry,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  CylinderGeometry
} from 'three';

const WHITE = 0xffffff;
const RED = 0xe3000f;
const lm = (c, o) => new LineBasicMaterial({
  color: c,
  transparent: o !== undefined && o < 1,
  opacity: o === undefined ? 1 : o
});

function wireBox(w, h, d, x, y, z, c, o) {
  const geom = new BoxGeometry(w, h, d);
  const edges = new EdgesGeometry(geom);
  const m = new LineSegments(edges, lm(c, o));
  m.position.set(x, y, z);
  return m;
}

function segs(pts, c, o) {
  const geom = new BufferGeometry().setFromPoints(pts);
  return new LineSegments(geom, lm(c, o));
}

function makeRenderer(host) {
  let r;
  try {
    r = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) {
    return null;
  }
  const isMobile = window.innerWidth < 768;
  const maxPr = isMobile ? 1.5 : Math.min(window.devicePixelRatio || 1, 2);
  r.setPixelRatio(maxPr);
  const cv = r.domElement;
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;left:0;top:0;display:block;width:100%;height:100%;pointer-events:none;';
  host.insertBefore(cv, host.firstChild);
  return r;
}

const ease = (t) => 1 - Math.pow(1 - t, 3);
const inout = (t) => t * t * (3 - 2 * t);
const clamp = (t) => Math.max(0, Math.min(1, t));

export function initHeroScene() {
  const host = document.getElementById('scene');
  if (!host) return;

  const renderer = makeRenderer(host);
  if (!renderer) return;

  // Remove fallback poster if WebGL succeeds
  const poster = host.querySelector('.hero-wireframe-poster');
  if (poster) poster.style.display = 'none';

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 300);
  const root = new Group();
  scene.add(root);

  const L = 16, W = 3.4, T = 0.5;
  root.add(wireBox(L, T, W, 0, 0, 0, WHITE));
  const p = [];
  for (let i = 1; i < L; i++) {
    const x = -L / 2 + i;
    p.push(new Vector3(x, T / 2, -W / 2), new Vector3(x, T / 2, W / 2));
    p.push(new Vector3(x, -T / 2, -W / 2), new Vector3(x, -T / 2, W / 2));
  }
  [-0.85, 0.85].forEach((z) => p.push(new Vector3(-L / 2, T / 2, z), new Vector3(L / 2, T / 2, z)));
  root.add(segs(p, WHITE, 0.28));

  [-1, 1].forEach((s) => {
    const r = wireBox(3, 0.25, W, s * (L / 2 + 1.45), -0.05, 0, WHITE, 0.75);
    r.rotation.z = -s * 0.1;
    root.add(r);
  });

  const cells = [];
  [-6.5, 0, 6.5].forEach((x) => [-1.4, 1.4].forEach((z) => {
    root.add(wireBox(0.7, 0.5, 0.7, x, -0.5, z, RED));
    const fill = new Mesh(new BoxGeometry(0.7, 0.5, 0.7), new MeshBasicMaterial({ color: RED, transparent: true, opacity: 0 }));
    fill.position.set(x, -0.5, z);
    root.add(fill);
    cells.push(fill);
    root.add(wireBox(1.3, 0.8, 1.3, x, -1.15, z, 0x777777));
  }));
  root.add(wireBox(L + 2, 0.3, W + 1.6, 0, -1.7, 0, 0x666666));
  const grid = new GridHelper(110, 110, 0x3a3a3a, 0x222222);
  grid.position.y = -1.85;
  root.add(grid);

  // Red scan frame sweeps along truck while weighing
  const scan = wireBox(0.06, 6.2, 3.8, 0, 2.4, 0, RED);
  scan.visible = false;
  root.add(scan);

  const truck = new Group();
  root.add(truck);
  truck.add(wireBox(11.2, 0.3, 2.2, 0, 1.2, 0, WHITE));
  truck.add(wireBox(8, 3, 2.4, -1.6, 2.95, 0, WHITE));
  truck.add(wireBox(2.4, 2.6, 2.3, 4.4, 2.65, 0, WHITE));
  truck.add(wireBox(1.0, 0.9, 2.34, 5.0, 3.3, 0, RED));
  const ribs = [];
  for (let x = -4.6; x <= 1.4; x += 1) {
    [-1.2, 1.2].forEach((z) => ribs.push(new Vector3(x, 1.45, z), new Vector3(x, 4.45, z)));
  }
  truck.add(segs(ribs, WHITE, 0.25));

  const wheels = [];
  [-4.2, -3.0, 4.4].forEach((x) => [-1, 1].forEach((s) => {
    const piv = new Group();
    piv.position.set(x, 0.8, s * 1.1);
    const cyl = new LineSegments(new EdgesGeometry(new CylinderGeometry(0.55, 0.55, 0.4, 16)), lm(WHITE));
    cyl.rotation.x = Math.PI / 2;
    piv.add(cyl);
    piv.add(segs([new Vector3(-0.55, 0, s * 0.21), new Vector3(0.55, 0, s * 0.21), new Vector3(0, -0.55, s * 0.21), new Vector3(0, 0.55, s * 0.21)], RED));
    truck.add(piv);
    wheels.push(piv);
  }));

  const TARGET = 42860, CYCLE = 15;
  function state(t) {
    const c = t % CYCLE;
    let x = 0, w = 0, lit = 0, q = 0, status;
    if (c < 4.5) {
      x = -26 + 26 * ease(c / 4.5);
      status = 'Vehicle approaching';
    } else if (c < 5.5) {
      status = 'Vehicle on platform';
      lit = 0.15;
    } else if (c < 9) {
      q = (c - 5.5) / 3.5;
      w = TARGET * inout(q) + (Math.random() - 0.5) * (1 - q) * 600;
      lit = q;
      status = 'Weighing';
    } else if (c < 12) {
      w = TARGET;
      lit = 1;
      status = 'Stable. Ticket ready';
    } else {
      const k = (c - 12) / 3;
      x = k * k * 28;
      w = TARGET * (1 - clamp(k * 2.4));
      lit = 1 - clamp(k * 2);
      status = 'Vehicle leaving';
    }
    return { x, w: Math.max(0, Math.round(w / 10) * 10), lit, status, scanning: status === 'Weighing', q };
  }

  const elW = document.getElementById('tWeight');
  const elS = document.getElementById('tStatus');
  const bars = Array.from(document.querySelectorAll('#tBars .bar'));
  const share = [0.14, 0.19, 0.17, 0.18, 0.16, 0.16];
  let lastW = -1, lastS = '';

  function apply(s, t) {
    truck.position.x = s.x;
    wheels.forEach((wh) => { wh.rotation.z = -s.x / 0.55; });
    cells.forEach((c, i) => { c.material.opacity = s.lit * (0.55 + 0.4 * Math.sin(t * 6 + i)); });
    scan.visible = s.scanning;
    if (s.scanning) scan.position.x = -7 + 14 * s.q;
    if (s.w !== lastW && elW) {
      elW.textContent = s.w.toLocaleString('en-IN');
      lastW = s.w;
    }
    if (s.status !== lastS && elS) {
      elS.textContent = s.status;
      lastS = s.status;
    }
    bars.forEach((b, i) => {
      const v = s.w ? (s.w / TARGET) * share[i] * 5.2 * (0.96 + 0.04 * Math.sin(t * 9 + i * 2)) : 0;
      b.style.transform = 'scaleY(' + Math.max(0.04, Math.min(1, v)) + ')';
    });
  }

  const tmp = new Vector3();
  const anchors = Array.from(host.querySelectorAll('.tag')).map((el) => {
    const k = el.dataset.a;
    const get = {
      cell: () => tmp.set(6.5, -0.5, 1.75),
      platform: () => tmp.set(-4.5, 0.25, 1.7),
      ramp: () => tmp.set(-(L / 2 + 2.6), -0.35, 1.7),
      truck: () => tmp.set(truck.position.x + 4.4, 3.95, 0.9)
    }[k];
    return { el, get };
  }).filter(a => !!a.get);

  let W_ = 1, H_ = 1;
  function placeTags() {
    root.updateMatrixWorld(true);
    anchors.forEach((a) => {
      a.get();
      root.localToWorld(tmp);
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * W_, y = (-tmp.y * 0.5 + 0.5) * H_;
      a.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translateY(-50%)';
      a.el.style.opacity = (x < 20 || x > W_ - 150 || y < 90 || y > H_ - 60) ? 0 : 1;
    });
  }

  const base = new Vector3(20, 11.5, 23.5);
  const camBase = new Vector3();
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    W_ = w; H_ = h;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = w + 'px';
    renderer.domElement.style.height = h + 'px';
    camera.aspect = w / h;
    const k = Math.max(1, 1.2 / camera.aspect);
    camBase.copy(base).multiplyScalar(Math.min(k, 1.75));
    if (camera.aspect > 1.3) root.position.set(5.5, 2.4, 0); else root.position.set(0, 3.2, 0);
    camera.position.copy(camBase);
    camera.lookAt(0, 0.4, 0);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let tx = 0, cx = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.4;
  }, { passive: true });

  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(host);
  }

  const t0 = performance.now();
  let rafId;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (!isVisible || document.hidden) return;
    const t = (now - t0) / 1000;
    apply(state(t), t);
    const dolly = 1 + 0.45 * (1 - ease(clamp(t / 3)));
    camera.position.copy(camBase).multiplyScalar(dolly);
    camera.lookAt(0, 0.4, 0);
    cx += (tx - cx) * 0.05;
    root.rotation.y = cx + Math.sin(t * 0.18) * 0.07;
    renderer.render(scene, camera);
    placeTags();
  }
  rafId = requestAnimationFrame(frame);
}

export function initMiniScene() {
  const host = document.getElementById('mini');
  if (!host) return;

  const renderer = makeRenderer(host);
  if (!renderer) return;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 3.2, 12.5);
  camera.lookAt(0, 0, 0);

  const g = new Group();
  scene.add(g);
  g.add(wireBox(6.4, 1.7, 1.7, 0, 0, 0, WHITE));
  [-1.15, 1.15].forEach((x) => {
    const c = new LineSegments(new EdgesGeometry(new CylinderGeometry(0.5, 0.5, 1.72, 22)), lm(WHITE, 0.9));
    c.rotation.x = Math.PI / 2;
    c.position.set(x, 0, 0);
    g.add(c);
  });
  g.add(wireBox(2.3, 0.34, 1.72, 0, 0, 0, RED));
  g.add(wireBox(0.9, 0.06, 1.0, 0, 0.88, 0, RED));
  [-2.45, 2.45].forEach((x) => {
    const c = new LineSegments(new EdgesGeometry(new CylinderGeometry(0.32, 0.32, 1.72, 16)), lm(WHITE, 0.7));
    c.position.set(x, 0, 0);
    g.add(c);
  });

  const ticks = [];
  for (let x = -3.2; x <= 3.2; x += 0.4) {
    ticks.push(new Vector3(x, -1.5, 0.9), new Vector3(x, -1.3, 0.9));
  }
  ticks.push(new Vector3(-3.2, -1.4, 0.9), new Vector3(3.2, -1.4, 0.9));
  g.add(segs(ticks, RED, 0.9));
  g.rotation.x = 0.35;

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = w + 'px';
    renderer.domElement.style.height = h + 'px';
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 1 ? 12.5 / Math.max(camera.aspect, 0.6) * 0.85 : 12.5;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let isVisible = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }).observe(host);
  } else {
    isVisible = true;
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!isVisible || document.hidden) return;
    g.rotation.y = (now / 1000) * 0.45;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}

// Auto-init scenes when loaded
initHeroScene();
initMiniScene();
