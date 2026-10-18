// Versión larga: las golosinas cuentan la historia de Chiches por capítulos.
// orbitan → se ordenan en 4 familias → (fábrica) → forman un globo → forman la corona
// → escriben el logo de Chiches (letras amarillas, borde de grageas rojas).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const story = document.querySelector('.story');
const stage = story.querySelector('.stage');
const canvas = document.getElementById('candy');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width:760px)').matches;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

let renderer = null;
if (!reduce) try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { renderer = null; }
if (!renderer) story.classList.add('static');
else { window.__story3d = true; run(); }

function run() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 120);
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff3b55, 1.8); rim.position.set(-6, 2, -5); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xff8fb5, 0.35));

  /* ---------- geometrías ---------- */
  function wheelGeo() {
    const pts = [], turns = 3.2, n = 170;
    for (let i = 0; i <= n; i++) {
      const t = i / n, th = t * turns * Math.PI * 2, r = 0.07 + t * 0.5;
      pts.push(new THREE.Vector3(Math.cos(th) * r, Math.sin(th) * r, 0));
    }
    const l = pts[pts.length - 1];
    pts.push(new THREE.Vector3(l.x + 0.12, l.y - 0.2, 0), new THREE.Vector3(l.x + 0.18, l.y - 0.42, 0));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 0.075, 10, false);
  }
  function flower(R) {
    const s = new THREE.Shape();
    for (let i = 0; i <= 120; i++) {
      const a = i / 120 * Math.PI * 2, r = R * (0.7 + 0.3 * Math.cos(a * 5));
      i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    return new THREE.ShapeGeometry(s, 4);
  }
  const H = 0.42, RR = 0.11;
  const capTop = g => g.rotateX(-Math.PI / 2).translate(0, H / 2, 0);
  const capBot = g => g.rotateX(Math.PI / 2).translate(0, -H / 2, 0);
  const rellenoBody = mergeGeometries([
    new THREE.CylinderGeometry(RR, RR, H, 22, 1, true),
    capTop(new THREE.CircleGeometry(RR, 22)), capBot(new THREE.CircleGeometry(RR, 22)),
  ]);
  const rellenoCore = mergeGeometries([
    flower(RR * 0.78).rotateX(-Math.PI / 2).translate(0, H / 2 + 0.002, 0),
    flower(RR * 0.78).rotateX(Math.PI / 2).translate(0, -H / 2 - 0.002, 0),
  ]);
  const pill = new THREE.CapsuleGeometry(0.078, 0.26, 6, 14);
  const choco = new THREE.SphereGeometry(0.15, 24, 16).scale(1, 0.8, 1.38);
  const chicle = new THREE.SphereGeometry(0.15, 26, 18).scale(1.4, 1, 1);
  { const p = chicle.attributes.position, c = [];
    for (let i = 0; i < p.count; i++) { const s = Math.sin(Math.atan2(p.getZ(i), p.getY(i)) * 7) > 0 ? 1 : 0.78; c.push(s, s, s); }
    chicle.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); }
  const ring = new THREE.TorusGeometry(0.13, 0.068, 14, 30);

  const M = o => new THREE.MeshPhysicalMaterial({ color: 0xffffff, ...o });
  const mats = {
    wheel: M({ color: 0xd8202e, roughness: .32, clearcoat: .7, clearcoatRoughness: .25 }),
    body: M({ roughness: .42, clearcoat: .35 }), core: M({ color: 0xfff4e6, roughness: .6 }),
    pill: M({ roughness: .16, clearcoat: 1, clearcoatRoughness: .1 }),
    choco: M({ roughness: .3, clearcoat: .55 }),
    chicle: M({ roughness: .22, clearcoat: .9, vertexColors: true }),
    gummy: M({ roughness: .85, sheen: 1, sheenRoughness: .45, sheenColor: new THREE.Color(0xffffff) }),
  };
  const candy = ['#e8253a', '#2f6fe0', '#3cc24a', '#ffcf2e', '#ff6fa8', '#ff8a1f', '#8a4fd8', '#f4f1ea'];
  const browns = ['#5a3420', '#6e4128', '#3f2416', '#e9d8bf'];
  const pick = a => a[Math.floor(rnd() * a.length)];

  // group: 0 golosinas · 1 grageados · 2 chocolateados · 3 chicles
  const k = mobile ? 0.78 : 1;
  const types = [
    { g: 0, n: mobile ? 6 : 10, parts: [[wheelGeo(), mats.wheel, null]], s: [0.62, 0.62], wheel: true },
    { g: 0, n: Math.round(46 * k), parts: [[rellenoBody, mats.body, candy.slice(0, 6)], [rellenoCore, mats.core, null]], s: [0.95, 1.15] },
    { g: 1, n: Math.round(72 * k), parts: [[pill, mats.pill, candy]], s: [0.95, 1.2] },
    { g: 2, n: Math.round(50 * k), parts: [[choco, mats.choco, browns]], s: [0.9, 1.15] },
    { g: 3, n: Math.round(40 * k), parts: [[chicle, mats.chicle, ['#9bdc4a', '#ff8fb5', '#ffd84d', '#7fc8ff', '#ff9a4a']]], s: [0.9, 1.1] },
    { g: 0, n: Math.round(30 * k), parts: [[ring, mats.gummy, ['#e8253a', '#ffcf2e', '#3cc24a', '#ff8a1f']]], s: [0.95, 1.2] },
  ];
  const groupCount = [0, 0, 0, 0]; types.forEach(t => groupCount[t.g] += t.n);

  /* ---------- corona ---------- */
  const R = 3.0, BAND = 1.0, SPIKE = 1.9, NSP = 5, BASE = -1.55;
  const topAt = th => { let f = (th / (Math.PI * 2) * NSP) % 1; if (f < 0) f += 1; return BAND + SPIKE * Math.pow(1 - Math.abs(f - 0.5) * 2, 1.05); };
  const nOthers = types.slice(1).reduce((a, t) => a + t.n, 0);
  const step = Math.sqrt(2 * Math.PI * R * (BAND + SPIKE / 2.05) / nOthers) * 0.98;
  let slots = [];
  for (let y = 0.12; y < BAND + SPIKE; y += step * 0.88) {
    const cnt = Math.floor(2 * Math.PI * R / step), off = rnd();
    for (let j = 0; j < cnt; j++) {
      const th = (j + off + (rnd() - .5) * .3) / cnt * Math.PI * 2, yy = y + (rnd() - .5) * step * .25;
      if (yy < topAt(th) - 0.08) slots.push([th, yy]);
    }
  }
  slots.sort(() => rnd() - .5);
  while (slots.length < nOthers) { const th = rnd() * Math.PI * 2; slots.push([th, rnd() * topAt(th)]); }
  slots = slots.slice(0, nOthers);
  const wheelSlots = [];
  for (let i = 0; i < NSP; i++) { const th = (i + .5) / NSP * Math.PI * 2; wheelSlots.push([th, topAt(th) + 0.12, 0.8]); }
  for (let i = 0; i < NSP; i++) { const th = i / NSP * Math.PI * 2; wheelSlots.push([th, BAND * 0.5, 0.58]); }

  /* ---------- familias y globo ---------- */
  const CL = mobile
    ? [[-1.95, 2.5], [1.95, 2.5], [-1.95, -2.5], [1.95, -2.5]]
    : [[-5.4, -0.1], [-1.8, -0.1], [1.8, -0.1], [5.4, -0.1]];
  const clR = g => (mobile ? 0.3 : 0.36) * Math.cbrt(groupCount[g]);
  const total = types.reduce((a, t) => a + t.n, 0);
  const SPH_R = mobile ? 2.05 : 2.35;
  const fib = i => { const y = 1 - (i + .5) / total * 2, r = Math.sqrt(1 - y * y), a = i * 2.399963; return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); };
  const order = [...Array(total).keys()].sort(() => rnd() - .5);

  /* ---------- instancias ---------- */
  const items = [], meshes = [];
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  let si = 0, ii = 0;
  types.forEach(t => {
    const parts = t.parts.map(([g, m]) => {
      const im = new THREE.InstancedMesh(g, m, t.n);
      im.frustumCulled = false; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(im); meshes.push(im); return im;
    });
    for (let i = 0; i < t.n; i++) {
      let th, y, sc;
      if (t.wheel) { [th, y, sc] = wheelSlots[i % wheelSlots.length]; }
      else { [th, y] = slots[si++]; sc = t.s[0] + rnd() * (t.s[1] - t.s[0]); }
      const r = R + (t.wheel ? 0.1 : (rnd() - .5) * 0.12);
      const target = new THREE.Vector3(Math.cos(th) * r, BASE + y, Math.sin(th) * r);
      const tq = new THREE.Quaternion();
      if (t.wheel) { dummy.position.copy(target); dummy.lookAt(target.x * 2, target.y, target.z * 2); tq.copy(dummy.quaternion); }
      else tq.setFromEuler(new THREE.Euler(rnd() * 6.3, rnd() * 6.3, rnd() * 6.3));
      t.parts.forEach(([, , pal], pi) => { if (pal) { col.set(pick(pal)); parts[pi].setColorAt(i, col); } });
      const dir = new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize();
      const cl = dir.multiplyScalar(Math.cbrt(rnd()) * clR(t.g));
      items.push({
        parts, i, g: t.g, wheel: !!t.wheel, sc: sc * (mobile ? 1.3 : 1), target, tq, cl,
        sph: fib(order[ii++]).multiplyScalar(SPH_R),
        or: 2.4 + rnd() * 6, oa: rnd() * Math.PI * 2, os: (0.1 + rnd() * 0.22) * (rnd() < .5 ? 1 : -1),
        oy: (rnd() - .5) * 7, ph: rnd() * 6.3,
        axis: new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize(), spin: 0.4 + rnd() * 1.2,
        delay: clamp((y / (BAND + SPIKE)) * 0.65 + rnd() * 0.35), arrive: rnd() * 0.5, push: new THREE.Vector3(),
      });
    }
    parts.forEach(p => { if (p.instanceColor) p.instanceColor.needsUpdate = true; });
  });

  /* ---------- logo de Chiches escrito con chuches ---------- */
  // se muestrea logo.png: el relleno amarillo lo ocupan las golosinas de la escena
  // y el borde rojo, grageas nuevas que entran volando.
  const LW = mobile ? 5.6 : 9.4;
  // muchas grageas pequeñas: rellenan las letras (amarillas) y dibujan el borde (rojas)
  const NBF = mobile ? 520 : 1000, NBL = mobile ? 560 : 1050, NB = NBF + NBL;
  const beanGeo = new THREE.SphereGeometry(0.1, 12, 9).scale(1.45, 1, 1);
  const beans = new THREE.InstancedMesh(beanGeo, M({ roughness: .24, clearcoat: .9, clearcoatRoughness: .2 }), NB);
  beans.frustumCulled = false; beans.instanceMatrix.setUsage(THREE.DynamicDrawUsage); beans.visible = false;
  scene.add(beans);
  const yellows = ['#ffd800', '#ffcc00', '#ffe41a', '#ffc000'].map(c => new THREE.Color(c));
  const reds = ['#e80038', '#d4002f', '#ff1f4f', '#b8002a'];
  items.forEach(it => {
    it.base = it.parts.map(pt => { if (!pt.instanceColor) return null; const c = new THREE.Color(); pt.getColorAt(it.i, c); return c; });
    it.ly = yellows[Math.floor(rnd() * yellows.length)];
  });
  const beanItems = [];
  let logoReady = false;

  function sampleGrid(data, w, h, test, want) {
    for (let step = 3; step < 60; step += 0.25) {
      const pts = [];
      for (let y = step / 2, row = 0; y < h; y += step * 0.866, row++)
        for (let x = (row % 2 ? step / 2 : 0) + step / 4; x < w; x += step) {
          const i = (Math.floor(y) * w + Math.floor(x)) * 4;
          if (test(data, i)) pts.push([x, y]);
        }
      if (pts.length <= want) {
        const n0 = pts.length;
        while (pts.length < want) { const [x, y] = pts[Math.floor(rnd() * n0)]; pts.push([x + (rnd() - .5) * step * .5, y + (rnd() - .5) * step * .5]); }
        for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
        return { pts, step };
      }
    }
    return { pts: [], step: 1 };
  }

  const logoImg = new Image();
  logoImg.onload = () => {
    const w = logoImg.naturalWidth, h = logoImg.naturalHeight;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx2 = cv.getContext('2d', { willReadFrequently: true }); cx2.drawImage(logoImg, 0, 0);
    const d = cx2.getImageData(0, 0, w, h).data;
    const isFill = (d, i) => d[i + 3] > 200 && d[i] > 200 && d[i + 1] > 150 && d[i + 2] < 150;
    const isLine = (d, i) => d[i + 3] > 200 && d[i] > 110 && d[i + 1] < 90;
    const toW = ([x, y], z) => new THREE.Vector3((x / w - .5) * LW, -(y / h - .5) * LW * h / w, z);
    const fillers = items.filter(it => !it.wheel), wheels = items.filter(it => it.wheel);
    const F = sampleGrid(d, w, h, isFill, fillers.length + NBF);
    const L = sampleGrid(d, w, h, isLine, NBL + wheels.length);
    if (!F.pts.length || !L.pts.length) return;
    // tamaño de cada pieza ≈ separación de la rejilla, para que las letras se lean
    const fStep = F.step * LW / w, lStep = L.step * LW / w;
    const fillScale = clamp(fStep * 1.5 / 0.42, 0.18, 1);
    const beanF = fStep * 1.35 / 0.29, beanL = lStep * 1.35 / 0.29;
    const tilt = () => new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd() - .5) * .5, (rnd() - .5) * .5, rnd() * 6.3));
    const ldel = v => clamp(v.x / LW + .5) * 0.55 + rnd() * 0.15;  // se escribe de izquierda a derecha
    fillers.forEach((it, i) => { it.logo = toW(F.pts[i], 0.14 + (rnd() - .5) * .08); it.lq = tilt(); it.lsc = fillScale; it.ldel = ldel(it.logo); });
    wheels.forEach((it, i) => { it.logo = toW(L.pts[i], 0.02); it.lq = tilt(); it.lsc = clamp(lStep * 2.2 / 1.1, 0.15, 0.4); it.ldel = ldel(it.logo); });
    for (let i = 0; i < NB; i++) {
      const fill = i < NBF;
      const target = fill ? toW(F.pts[fillers.length + i], 0.06 + rnd() * .06) : toW(L.pts[wheels.length + i - NBF], -0.1 + rnd() * .06);
      const from = new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() * .6 - .1).normalize().multiplyScalar(13 + rnd() * 8);
      beanItems.push({ target, from, lq: tilt(), sc: (0.85 + rnd() * .3) * (fill ? beanF : beanL), ldel: ldel(target),
        axis: new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize(), spin: 0.6 + rnd() * 1.4, ph: rnd() * 6.3 });
      if (fill) col.copy(yellows[Math.floor(rnd() * yellows.length)]); else col.set(reds[Math.floor(rnd() * reds.length)]);
      beans.setColorAt(i, col);
    }
    beans.instanceColor.needsUpdate = true;
    beans.visible = true; logoReady = true;
  };
  logoImg.src = 'chuches/logo.png';

  /* ---------- azúcar y brillo ---------- */
  const sugarN = mobile ? 180 : 380, sp = new Float32Array(sugarN * 3);
  for (let i = 0; i < sugarN; i++) { sp[i * 3] = (rnd() - .5) * 26; sp[i * 3 + 1] = (rnd() - .5) * 16; sp[i * 3 + 2] = (rnd() - .5) * 12 - 2; }
  const sugarGeo = new THREE.BufferGeometry(); sugarGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sugar = new THREE.Points(sugarGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: .55, depthWrite: false }));
  scene.add(sugar);
  const gc = document.createElement('canvas'); gc.width = gc.height = 128;
  const gx = gc.getContext('2d'), grd = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,70,90,0.9)'); grd.addColorStop(1, 'rgba(255,70,90,0)');
  gx.fillStyle = grd; gx.fillRect(0, 0, 128, 128);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  glow.rotation.x = -Math.PI / 2; scene.add(glow);

  /* ---------- capas HTML ---------- */
  const W = 0.018;
  const layers = [...story.querySelectorAll('[data-range]')].map(el => {
    const [a, b, flag] = el.dataset.range.split(',');
    return { el, a: +a, b: +b, flag, base: (mobile && el.hasAttribute('data-base-m') ? el.dataset.baseM : el.dataset.base) || '', words: [...el.querySelectorAll('.w')] };
  });
  const counters = [...story.querySelectorAll('span[data-count]')];
  let counted = false;
  function countUp() {
    counted = true; const t0 = performance.now();
    (function f(t) { const kk = clamp((t - t0) / 1800), v = 1 - Math.pow(1 - kk, 4);
      counters.forEach(c => c.textContent = Math.round(+c.dataset.count * v).toLocaleString('es-ES'));
      if (kk < 1) requestAnimationFrame(f); })(t0);
  }
  function updateLayers(p) {
    for (const L of layers) {
      const fin = L.flag === 'first' ? 1 : smooth(L.a, L.a + W, p);
      const fout = L.flag === 'last' ? 1 : 1 - smooth(L.b - W, L.b, p);
      const op = fin * fout, lp = clamp((p - L.a) / (L.b - L.a));
      L.el.style.opacity = op.toFixed(3);
      L.el.style.transform = `${L.base} translate3d(0,${((1 - fin) * 36 - (1 - fout) * 36).toFixed(1)}px,0)`;
      L.el.style.setProperty('--lp', lp.toFixed(3));
      L.el.classList.toggle('live', op > 0.6);
      if (L.words.length) { const n = Math.round(clamp(lp * 1.25) * L.words.length); L.words.forEach((w, i) => w.classList.toggle('on', i < n)); }
      if (L.el.hasAttribute('data-trigger-count') && op > .5 && !counted) countUp();
    }
  }
  const lbls = [...story.querySelectorAll('.lbl')];

  /* ---------- entrada ---------- */
  let pRaw = 0, p = 0;
  const readScroll = () => { const tt = story.offsetHeight - innerHeight; pRaw = tt > 0 ? clamp(-story.getBoundingClientRect().top / tt) : 0; };
  addEventListener('scroll', readScroll, { passive: true });
  const ndc = new THREE.Vector2(9, 9), pw = new THREE.Vector3(), ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let pointerAt = -10; const par = { x: 0, y: 0 }, parT = { x: 0, y: 0 };
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    parT.x = ndc.x; parT.y = ndc.y; pointerAt = performance.now();
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { ndc.set(9, 9); parT.x = parT.y = 0; });

  let camZ = 15, sw = 1, sh = 1;
  function resize() {
    sw = stage.clientWidth; sh = stage.clientHeight;
    renderer.setSize(sw, sh, false);
    camera.aspect = sw / sh; camera.updateProjectionMatrix();
    camZ = Math.max(15, 7.4 / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * camera.aspect));
  }
  addEventListener('resize', resize); resize();

  /* ---------- bucle ---------- */
  const q = new THREE.Quaternion(), qT = new THREE.Quaternion(), crownQ = new THREE.Quaternion(), sphQ = new THREE.Quaternion();
  const eul = new THREE.Euler(), orbit = new THREE.Vector3(), world = new THREE.Vector3(), push = new THREE.Vector3();
  const crownPos = new THREE.Vector3(), sphPos = new THREE.Vector3(), clp = new THREE.Vector3(), tmp = new THREE.Vector3(), scaleV = new THREE.Vector3();
  const logoPos = new THREE.Vector3(), logoQ = new THREE.Quaternion();
  let lastWl = 0;
  const t0 = performance.now(); let last = t0, visible = true;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    p += (pRaw - p) * (1 - Math.exp(-dt * 7));

    const arrival = easeIO(clamp((t - 0.15) / 1.9));
    // pesos de cada estado (la órbita suelta es el estado base)
    const wc = smooth(0.255, 0.31, p) * (1 - smooth(0.485, 0.53, p));
    const ws = smooth(0.635, 0.725, p);
    const wk = smooth(0.76, 0.845, p);
    const wl = logoReady ? smooth(0.872, 0.94, p) : 0;
    const move = smooth(0.958, 0.99, p);
    const pop = 1 + Math.sin(clamp((p - 0.8) / 0.065) * Math.PI) * 0.06;

    sphPos.set(mobile ? 0 : 3.5, mobile ? 3.3 : 0.1, 0);
    sphQ.setFromEuler(eul.set(0.15, t * 0.35, 0));
    crownPos.set(0, mobile ? 1.4 : 0.95, 0);
    const crownScale = (mobile ? 0.86 : 1) * pop;
    // el logo se centra y, en el cierre, se aparta para dejar sitio al texto
    logoPos.set(mobile ? 0 : THREE.MathUtils.lerp(0, 3.85, move), mobile ? THREE.MathUtils.lerp(1.1, 3.4, move) : THREE.MathUtils.lerp(0.75, 0.45, move), 0);
    const logoScale = THREE.MathUtils.lerp(1, mobile ? 0.74 : 0.5, move);
    logoQ.setFromEuler(eul.set(Math.sin(t * 0.45) * 0.07, Math.sin(t * 0.6) * 0.2, 0));
    const tint = wl > 0.001 || lastWl > 0.001;
    crownQ.setFromEuler(eul.set(0.24, t * 0.22 + p * 2.2, 0));

    const bB = smooth(0.1, 0.14, p) * (1 - smooth(0.25, 0.28, p));
    const cx = (mobile ? 0 : 2.2 + 1.8 * bB), cy = mobile ? 1.8 + 1.4 * bB : 0;
    const tighten = 1 - 0.3 * smooth(0, 0.12, p);
    const pushOn = now - pointerAt < 2500 && ndc.x < 5;
    if (pushOn) { ray.setFromCamera(ndc, camera); ray.ray.intersectPlane(plane, pw); }
    const cAng = t * 0.28;

    for (const it of items) {
      const a = it.oa + t * it.os * (1 + p * 2);
      const arr = clamp((arrival - it.arrive * 0.4) / 0.6), far = 1 - arr;
      const r = it.or * tighten * (1 + far * 1.6);
      orbit.set(cx + Math.cos(a) * r, cy + it.oy * (mobile ? 0.7 : 1) + Math.sin(t * 0.6 + it.ph) * 0.4, Math.sin(a) * r * 0.55 - 1 - far * 26);
      world.copy(orbit);

      if (wc > 0.001) { // familias
        const c = CL[it.g];
        clp.copy(it.cl).applyAxisAngle(THREE.Object3D.DEFAULT_UP, cAng + it.g).add(tmp.set(c[0], c[1], 0));
        const e = easeIO(clamp((wc - it.delay * 0.12) / 0.88));
        world.lerp(clp, e);
      }
      if (ws > 0.001) { // globo
        clp.copy(it.sph).applyQuaternion(sphQ).add(sphPos);
        const e = easeIO(clamp((ws - it.delay * 0.14) / 0.86));
        world.lerp(clp, e); const arc = Math.sin(e * Math.PI); world.y += arc * 0.6; world.z += arc * 1.8;
      }
      let m = 0;
      if (wk > 0.001) { // corona
        m = easeIO(clamp((wk - it.delay * 0.16) / 0.84));
        clp.copy(it.target).applyQuaternion(crownQ).multiplyScalar(crownScale).add(crownPos);
        world.lerp(clp, m); const arc = Math.sin(m * Math.PI); world.y += arc * 0.8; world.z += arc * 2.6;
      }
      let l = 0;
      if (wl > 0.001 && it.logo) { // logo
        l = easeIO(clamp((wl - it.ldel * 0.3) / 0.7));
        clp.copy(it.logo).applyQuaternion(logoQ).multiplyScalar(logoScale).add(logoPos);
        world.lerp(clp, l); world.z += Math.sin(l * Math.PI) * 2.2;
      }

      push.set(0, 0, 0);
      if (pushOn) {
        const dx = world.x - pw.x, dy = world.y - pw.y, d = Math.hypot(dx, dy);
        if (d < 1.4 && d > 1e-4) { const f = (1.4 - d) / 1.4; push.set(dx / d * f * 1.1, dy / d * f * 1.1, f * 1.4); }
      }
      it.push.lerp(push, 1 - Math.exp(-dt * (push.lengthSq() > 0 ? 14 : 4)));
      world.add(it.push);

      q.setFromAxisAngle(it.axis, t * it.spin + it.ph);
      if (m > 0) { qT.copy(crownQ).multiply(it.tq); q.slerp(qT, m); }
      if (l > 0) { qT.copy(logoQ).multiply(it.lq); q.slerp(qT, l); }
      let f = m > 0 ? THREE.MathUtils.lerp(1, crownScale, m) : 1;
      if (l > 0) f = THREE.MathUtils.lerp(f, it.lsc * logoScale, l);
      const s = it.sc * arr * f;
      if (tint) it.parts.forEach((pt, pi) => { const b = it.base[pi]; if (b) { col.copy(b).lerp(it.ly, l * 0.85); pt.setColorAt(it.i, col); } });
      dummy.position.copy(world); dummy.quaternion.copy(q); dummy.scale.copy(scaleV.setScalar(s));
      dummy.updateMatrix();
      for (const part of it.parts) part.setMatrixAt(it.i, dummy.matrix);
    }
    for (const mm of meshes) { mm.instanceMatrix.needsUpdate = true; if (tint && mm.instanceColor) mm.instanceColor.needsUpdate = true; }
    lastWl = wl;

    if (logoReady) { // borde de grageas
      beanItems.forEach((b, i) => {
        const l = easeIO(clamp((wl - b.ldel * 0.3) / 0.7));
        if (l < 0.002) { dummy.scale.setScalar(0); dummy.updateMatrix(); beans.setMatrixAt(i, dummy.matrix); return; }
        clp.copy(b.target).applyQuaternion(logoQ).multiplyScalar(logoScale).add(logoPos);
        dummy.position.copy(b.from).lerp(clp, l);
        q.setFromAxisAngle(b.axis, t * b.spin + b.ph); qT.copy(logoQ).multiply(b.lq); q.slerp(qT, l);
        dummy.quaternion.copy(q); dummy.scale.setScalar(b.sc * logoScale * (0.5 + 0.5 * l));
        dummy.updateMatrix(); beans.setMatrixAt(i, dummy.matrix);
      });
      beans.instanceMatrix.needsUpdate = true;
    }

    glow.position.set(crownPos.x, crownPos.y + BASE * crownScale - 0.15, 0);
    glow.material.opacity = smooth(0.8, 0.86, p) * (1 - wl) * 0.55; glow.scale.setScalar(crownScale);
    sugar.rotation.y = t * 0.02; sugar.position.y = Math.sin(t * 0.3) * 0.3;

    par.x += (parT.x - par.x) * (1 - Math.exp(-dt * 3)); par.y += (parT.y - par.y) * (1 - Math.exp(-dt * 3));
    const z = camZ * (1 - 0.08 * smooth(0.1, 0.26, p) + 0.05 * wc);
    camera.position.set(par.x * 0.7, 0.3 + par.y * 0.45, z);
    camera.lookAt(0, 0.35, 0);

    // en la fábrica la foto manda: la escena se apaga y vuelve
    const dim = smooth(0.5, 0.535, p) * (1 - smooth(0.615, 0.65, p));
    canvas.style.opacity = (1 - 0.88 * dim).toFixed(3);

    renderer.render(scene, camera);
    updateLayers(p);

    // etiquetas de familia ancladas a cada grupo 3D
    camera.updateMatrixWorld();
    const la = (smooth(0.315, 0.355, p) * (1 - smooth(0.465, 0.495, p))).toFixed(3);
    lbls.forEach((el, g) => {
      el.style.opacity = la;
      const c = CL[g]; tmp.set(c[0], c[1] - clR(g) - 0.55, 0).project(camera);
      el.style.left = ((tmp.x * .5 + .5) * sw).toFixed(1) + 'px';
      el.style.top = ((-tmp.y * .5 + .5) * sh).toFixed(1) + 'px';
    });
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(story);
  readScroll();
  (function loop(now) { if (visible) frame(now); else last = now; requestAnimationFrame(loop); })(performance.now());
}
