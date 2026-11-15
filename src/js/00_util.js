// ---------------------------------------------------------------------------
// VOO 0471 — utilitários: matemática, ruído, geometria
// ---------------------------------------------------------------------------
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const easeInOut = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rand = mulberry32(471);
const rr = (a, b) => a + (b - a) * rand();
const pick = arr => arr[Math.floor(rand() * arr.length)];
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const IS_MOBILE = IS_TOUCH && Math.min(screen.width, screen.height) < 820;

// ---- ruído de valor 2D, tileável ------------------------------------------
function makeNoise(seed) {
  const r = mulberry32(seed); const perm = new Uint8Array(512); const g = new Float32Array(256);
  for (let i = 0; i < 256; i++) { perm[i] = i; g[i] = r(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const h = (x, y, P) => { x = ((x % P) + P) % P & 255; y = ((y % P) + P) % P & 255; return g[perm[perm[x] + y]]; };
  const n = (x, y, P = 256) => {
    const xi = Math.floor(x), yi = Math.floor(y); let xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = h(xi, yi, P), b = h(xi + 1, yi, P), c = h(xi, yi + 1, P), d = h(xi + 1, yi + 1, P);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  };
  n.fbm = (x, y, oct = 4, P = 8) => { let s = 0, a = .5, f = 1, t = 0; for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f, P * f); t += a; a *= .5; f *= 2; } return s / t; };
  return n;
}
const NOISE = makeNoise(1337);

// ---- canvas helpers --------------------------------------------------------
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; }
function texFromCanvas(c, srgb = true, rep = null) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
// gera textura de cor + altura por função de pixel (u,v em 0..1) -> {c:[r,g,b], h}
function genMaps(size, fn) {
  const cc = canvas(size), ctx = cc.getContext('2d'); const img = ctx.createImageData(size, size);
  const H = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const o = fn(x / size, y / size, x, y); const i = (y * size + x);
    img.data[i * 4] = clamp(o.c[0], 0, 255); img.data[i * 4 + 1] = clamp(o.c[1], 0, 255); img.data[i * 4 + 2] = clamp(o.c[2], 0, 255); img.data[i * 4 + 3] = 255;
    H[i] = o.h === undefined ? 0 : o.h;
  }
  ctx.putImageData(img, 0, 0);
  return { color: cc, height: H, size };
}
function normalFromHeight(H, size, strength = 2) {
  const cc = canvas(size), ctx = cc.getContext('2d'); const img = ctx.createImageData(size, size);
  const at = (x, y) => H[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength, dy = (at(x, y + 1) - at(x, y - 1)) * strength;
    const l = Math.hypot(dx, dy, 1); const i = (y * size + x) * 4;
    img.data[i] = (-dx / l * .5 + .5) * 255; img.data[i + 1] = (dy / l * .5 + .5) * 255; img.data[i + 2] = (1 / l * .5 + .5) * 255; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0); return cc;
}
function grayFromHeight(H, size, fn) {
  const cc = canvas(size), ctx = cc.getContext('2d'); const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) { const v = clamp(fn(H[i]), 0, 1) * 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  ctx.putImageData(img, 0, 0); return cc;
}

// ---- geometria -------------------------------------------------------------
// caixa arredondada (vértices concentrados nas bordas, normais analíticas)
function roundedBox(w, h, d, r, k = 3) {
  r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  const N = 2 * k + 1; const g = new THREE.BoxGeometry(w, h, d, N, N, N);
  const p = g.attributes.position, n = g.attributes.normal; const ext = [w / 2, h / 2, d / 2];
  const remap = (u, e) => { const i = Math.round((u + e) / (2 * e / N)); const inner = e - r; if (i <= k) return -e + r * (i / k); return inner + r * ((i - k - 1) / k); };
  const v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.set(remap(p.getX(i), ext[0]), remap(p.getY(i), ext[1]), remap(p.getZ(i), ext[2]));
    c.set(clamp(v.x, -ext[0] + r, ext[0] - r), clamp(v.y, -ext[1] + r, ext[1] - r), clamp(v.z, -ext[2] + r, ext[2] - r));
    const dn = v.clone().sub(c); if (dn.lengthSq() < 1e-12) dn.set(n.getX(i), n.getY(i), n.getZ(i)); dn.normalize();
    v.copy(c).addScaledVector(dn, r); p.setXYZ(i, v.x, v.y, v.z); n.setXYZ(i, dn.x, dn.y, dn.z);
  }
  return g;
}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
function xf(geo, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
  _e.set(r[0], r[1], r[2], 'YXZ'); _q.setFromEuler(_e); _m4.compose(_p.set(p[0], p[1], p[2]), _q, _s.set(s[0], s[1], s[2]));
  geo.applyMatrix4(_m4); return geo;
}
function mergeGeos(list) {
  let nv = 0, ni = 0; const geos = list.map(g => { g = g.index ? g : (() => { const c = g.clone(); const n = c.attributes.position.count; const idx = []; for (let i = 0; i < n; i++) idx.push(i); c.setIndex(idx); return c; })(); nv += g.attributes.position.count; ni += g.index.count; return g; });
  const P = new Float32Array(nv * 3), Nn = new Float32Array(nv * 3), U = new Float32Array(nv * 2); const I = new Uint32Array(ni);
  let ov = 0, oi = 0;
  for (const g of geos) {
    const c = g.attributes.position.count;
    P.set(g.attributes.position.array.subarray(0, c * 3), ov * 3);
    if (g.attributes.normal) Nn.set(g.attributes.normal.array.subarray(0, c * 3), ov * 3);
    if (g.attributes.uv) U.set(g.attributes.uv.array.subarray(0, c * 2), ov * 2);
    const ia = g.index.array; for (let i = 0; i < g.index.count; i++) I[oi + i] = ia[i] + ov;
    ov += c; oi += g.index.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  out.setIndex(new THREE.BufferAttribute(I, 1)); out.computeBoundingSphere(); out.computeBoundingBox();
  return out;
}
// tira extrudada ao longo de z a partir de um perfil 2D (x,y); uv: u = comprimento de arco, v = z
function profileStrip(pts, z0, z1, segZ = 1, uScale = 1, vScale = 1, flip = false) {
  const n = pts.length; const pos = [], uv = [], idx = [];
  const arc = [0]; for (let i = 1; i < n; i++) arc.push(arc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  for (let j = 0; j <= segZ; j++) { const z = lerp(z0, z1, j / segZ); for (let i = 0; i < n; i++) { pos.push(pts[i][0], pts[i][1], z); uv.push(arc[i] * uScale, z * vScale); } }
  for (let j = 0; j < segZ; j++) for (let i = 0; i < n - 1; i++) { const a = j * n + i, b = a + 1, c = a + n, d = c + 1; if (flip) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// placa com cantos arredondados (para molduras/janelas)
function roundRectShape(w, h, r) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
function roundRectPath(w, h, r) { const s = roundRectShape(w, h, r); const p = new THREE.Path(); p.curves = s.curves; return p; }
function planeUV(geo, sx, sy) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sx, uv.getY(i) * sy); return geo; }
function b64ToBuf(b64) { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; }
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
const fmt2 = n => String(n).padStart(2, '0');
