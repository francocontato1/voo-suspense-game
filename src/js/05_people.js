// ---------------------------------------------------------------------------
// Pessoas: cabeça escaneada em 3D (Lee Perry-Smith, Infinite Realities, CC BY 3.0)
// em LOD completo (personagens) e reduzido (multidão instanciada via meshoptimizer).
// ---------------------------------------------------------------------------
const HEAD = {}; const PEOPLE = { npcs: {}, crowd: [] };
const SKIN = [[1, .97, .95], [.9, .78, .68], [.72, .55, .44], [.52, .38, .3], [.36, .26, .2]];
const HAIRC = [0x0b0908, 0x1a120d, 0x2b1d14, 0x4a3524, 0x6b6560, 0x9d9890, 0x5a3b22];
async function loadHead() {
  const buf = b64ToBuf(window.__ASSETS.head); const h = new Uint32Array(buf, 0, 3); const nv = h[0], ni = h[1], nl = h[2]; let o = 12;
  const pos = new Float32Array(buf, o, nv * 3); o += nv * 12; const nrm = new Float32Array(buf, o, nv * 3); o += nv * 12; const uv = new Float32Array(buf, o, nv * 2); o += nv * 8;
  const idx = new Uint16Array(buf, o, ni); o += ni * 2; const lod = new Uint16Array(buf, o, nl);
  const mk = (index) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nrm), 3)); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2)); g.setIndex(new THREE.BufferAttribute(new Uint16Array(index), 1));
    g.translate(0, 1.9, 0); g.scale(.038, .038, .038); g.rotateY(Math.PI); g.computeBoundingSphere(); return g; };
  HEAD.full = mk(idx); HEAD.lod = mk(lod);
  const tl = async (src, srgb) => { const im = await loadImg(src); const t = new THREE.Texture(im); t.needsUpdate = true; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.flipY = false; return t; };
  HEAD.col = await tl(window.__ASSETS.head_col, true); HEAD.nrm = await tl(window.__ASSETS.head_nrm, false);
  // mapa especular -> rugosidade (invertido)
  const sp = await loadImg(window.__ASSETS.head_spec); const c = canvas(sp.width, sp.height), x = c.getContext('2d'); x.drawImage(sp, 0, 0); const d = x.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) { const v = 255 - d.data[i] * .55; d.data[i] = d.data[i + 1] = d.data[i + 2] = clamp(v, 90, 235); } x.putImageData(d, 0, 0);
  HEAD.rough = new THREE.CanvasTexture(c); HEAD.rough.flipY = false;
}
function skinMat(tint = [1, 1, 1], extra = {}) {
  const m = new THREE.MeshStandardMaterial({ map: HEAD.col, normalMap: HEAD.nrm, normalScale: new THREE.Vector2(.9, .9), roughnessMap: HEAD.rough, roughness: 1, color: new THREE.Color(tint[0], tint[1], tint[2]), ...extra });
  m.envMap = MAT.plastic.envMap; m.envMapIntensity = .25; return m;
}
function clothMat(col, rough = .92) { const m = new THREE.MeshStandardMaterial({ color: col, map: TEX.cloth, normalMap: TEX.clothN, normalScale: new THREE.Vector2(.6, .6), roughness: rough }); m.envMap = MAT.plastic.envMap; m.envMapIntensity = .12; return m; }

// ---- geometrias de corpo
function capsuleBetween(a, b, r, seg = 10) {
  const A = V3(...a), B = V3(...b); const len = A.distanceTo(B); const g = new THREE.CapsuleGeometry(r, Math.max(.001, len), 4, seg);
  const mid = A.clone().add(B).multiplyScalar(.5); const dir = B.clone().sub(A).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), dir);
  g.applyMatrix4(new THREE.Matrix4().compose(mid, q, V3(1, 1, 1))); return g;
}
function seatedBodyGeo(female, slump) {
  const sw = female ? .19 : .215; const p = [];
  const t = new THREE.CapsuleGeometry(.16, .28, 6, 14); t.scale(female ? 1.02 : 1.12, 1, .78); t.rotateX(-.12); t.translate(0, .82, .1); p.push(t);
  const pel = new THREE.CapsuleGeometry(.13, .18, 4, 12); pel.rotateZ(Math.PI / 2); pel.scale(1, 1, 1.05); pel.translate(0, .58, .07); p.push(pel);
  for (const s of [-1, 1]) {
    p.push(capsuleBetween([s * .1, .58, .05], [s * .11, .57, -.33], .078));
    p.push(capsuleBetween([s * .11, .55, -.36], [s * .12, .12, -.42], .056));
    const f = roundedBox(.1, .08, .25, .035); f.translate(s * .12, .05, -.48); p.push(f);
    if (slump) { p.push(capsuleBetween([s * sw, 1.0, .14], [s * (sw + .05), .74, .14], .052)); p.push(capsuleBetween([s * (sw + .05), .74, .14], [s * (sw + .07), .5, .08], .045)); }
    else { p.push(capsuleBetween([s * sw, 1.0, .14], [s * (sw + .03), .76, .08], .052)); p.push(capsuleBetween([s * (sw + .03), .76, .08], [s * .12, .66, -.2], .045)); }
  }
  const nk = new THREE.CylinderGeometry(.055, .065, .12, 12); nk.translate(0, 1.08, .09); p.push(nk);
  return mergeGeos(p);
}
function handsGeo(standing) {
  const p = []; for (const s of [-1, 1]) { const g = new THREE.SphereGeometry(.045, 10, 8); g.scale(.8, 1.15, .55); if (standing) g.translate(s * .26, .78, .02); else g.translate(s * .12, .66, -.24); p.push(g); } return mergeGeos(p);
}
function standingBodyGeo(female) {
  const sw = female ? .185 : .215; const p = [];
  const t = new THREE.CapsuleGeometry(.155, .34, 6, 14); t.scale(female ? 1.0 : 1.12, 1, .74); t.translate(0, 1.27, 0); p.push(t);
  const pel = new THREE.CapsuleGeometry(.13, .14, 4, 12); pel.rotateZ(Math.PI / 2); pel.scale(1, 1, .95); pel.translate(0, .98, 0); p.push(pel);
  for (const s of [-1, 1]) {
    p.push(capsuleBetween([s * .095, .95, 0], [s * .1, .52, -.01], .075)); p.push(capsuleBetween([s * .1, .5, -.01], [s * .1, .1, .02], .055));
    const f = roundedBox(.1, .08, .26, .035); f.translate(s * .1, .04, -.04); p.push(f);
    p.push(capsuleBetween([s * sw, 1.43, 0], [s * (sw + .04), 1.13, .02], .052)); p.push(capsuleBetween([s * (sw + .04), 1.13, .02], [s * .26, .84, .02], .044));
  }
  const nk = new THREE.CylinderGeometry(.052, .062, .12, 12); nk.translate(0, 1.52, 0); p.push(nk);
  return mergeGeos(p);
}
function hairGeo(kind) {
  const p = [];
  const cap = new THREE.SphereGeometry(.112, 24, 14, 0, TAU, 0, Math.PI * (kind === 'bun' || kind === 'long' ? .62 : .56)); cap.scale(.9, 1, 1.08); cap.rotateX(.42); cap.translate(0, .125, .025); p.push(cap);
  if (kind === 'long') { const b = new THREE.CapsuleGeometry(.1, .16, 4, 12); b.scale(1.05, 1, .5); b.translate(0, .04, .085); p.push(b); }
  if (kind === 'bun') { const b = new THREE.SphereGeometry(.05, 12, 10); b.translate(0, .14, .13); p.push(b); }
  if (kind === 'hood') { const h = new THREE.SphereGeometry(.15, 20, 14, 0, TAU, 0, Math.PI * .7); h.scale(.95, 1.05, 1.15); h.rotateX(.6); h.translate(0, .1, .05); p.push(h); }
  const g = mergeGeos(p); const pa = g.attributes.position; const nn = makeNoise(kind.length * 7);
  for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); const d = 1 + (nn(x * 60 + 3, z * 60 + y * 40) - .5) * .09 + (nn(x * 140, y * 140 + z * 90) - .5) * .03; pa.setXYZ(i, x * d, .12 + (y - .12) * d, z * d); }
  g.computeVertexNormals(); return g;
}
function blanketGeo() {
  const g = new THREE.PlaneGeometry(.56, .8, 14, 18); const p = g.attributes.position; const uv = g.attributes.uv;
  const path = v => { if (v < .4) { const t = v / .4; return [lerp(.8, .64, t), lerp(.06, -.3, t)]; } if (v < .58) { const t = (v - .4) / .18; return [lerp(.64, .6, t) + Math.sin(t * Math.PI) * .03, lerp(-.3, -.43, t)]; } const t = (v - .58) / .42; return [lerp(.6, .18, t), lerp(-.43, -.5, t)]; };
  for (let i = 0; i < p.count; i++) { const u = uv.getX(i), v = 1 - uv.getY(i); const x = (u - .5) * .56; const [y, z] = path(v); const side = Math.max(0, Math.abs(x) - .17); const fold = Math.sin(x * 26 + v * 4) * .01 + NOISE(u * 6, v * 6) * .02; p.setXYZ(i, x * (1 - side * .6), y - side * 1.3 + fold, z - side * .1 * Math.sign(v - .5)); }
  g.computeVertexNormals(); return g;
}
function eyeMaskGeo() { const g = roundedBox(.16, .045, .03, .012); g.translate(0, .115, -.095); return g; }
function ensureBodyGeos() {
  if (HEAD.body) return; HEAD.body = { sm: seatedBodyGeo(false), sf: seatedBodyGeo(true), tm: standingBodyGeo(false), tf: standingBodyGeo(true), hs: handsGeo(false), ht: handsGeo(true) };
  HEAD.hair = { short: hairGeo('short'), long: hairGeo('long'), bun: hairGeo('bun'), hood: hairGeo('hood') }; HEAD.blanket = blanketGeo();
}

// ---- multidão instanciada
function buildCrowd(reserved) {
  ensureBodyGeos(); const S = R.scene; const list = [];
  for (const id of WORLD.seatList) { if (reserved.has(id)) continue; const r = parseInt(id); const occ = r <= 4 ? .7 : .84; if (rand() < occ) list.push(id); }
  const n = list.length; const sexes = list.map(() => rand() < .5);
  const headM = skinMat(); const hairM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .88, normalMap: TEX.clothN, normalScale: new THREE.Vector2(1.5, 1.5) }); hairM.envMap = MAT.plastic.envMap; hairM.envMapIntensity = .3;
  const clothM = clothMat(0xffffff); const blM = new THREE.MeshStandardMaterial({ map: TEX.blanket, normalMap: TEX.blanketN, roughness: .97, color: 0xffffff, side: THREE.DoubleSide });
  const heads = new THREE.InstancedMesh(HEAD.lod, headM, n); const bodyM = new THREE.InstancedMesh(HEAD.body.sm, clothM, n), bodyF = new THREE.InstancedMesh(HEAD.body.sf, clothM, n);
  const handM = new THREE.MeshStandardMaterial({ color: 0xc89a82, roughness: .6 }); const hands = new THREE.InstancedMesh(HEAD.body.hs, handM, n);
  const hairs = {}; for (const k of ['short', 'long', 'bun', 'hood']) hairs[k] = new THREE.InstancedMesh(HEAD.hair[k], k === 'hood' ? clothM : hairM, n);
  const bl = new THREE.InstancedMesh(HEAD.blanket, blM, n);
  const cnt = { m: 0, f: 0, h: { short: 0, long: 0, bun: 0, hood: 0 }, b: 0 };
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const clothes = [0x1d2230, 0x2a2a2c, 0x3b3f46, 0x4c3a2e, 0x6b6b70, 0x22303d, 0x5b2128, 0x2f3d2c, 0xb9b4a8, 0x111111, 0x7a6a55];
  list.forEach((id, i) => {
    const p = seatPos(id); const f = sexes[i]; const rec = WORLD.recline[id] || .1; const lean = rec * .45;
    const asleep = rand() < .72; const win = id.includes('A') || id.includes('F');
    // corpo
    e.set(lean * .6, rr(-.06, .06), 0); q.setFromEuler(e); m.compose(V3(p.x, 0, p.z + .04), q, V3(1, 1, 1));
    (f ? bodyF : bodyM).setMatrixAt(f ? cnt.f : cnt.m, m); (f ? bodyF : bodyM).setColorAt(f ? cnt.f++ : cnt.m++, col.setHex(pick(clothes)));
    hands.setMatrixAt(i, m);
    // cabeça (pivô no pescoço)
    const tone = SKIN[Math.floor(Math.pow(rand(), .9) * SKIN.length)];
    let pitch = asleep ? rr(-.55, -.2) : rr(-.25, .05), roll = asleep ? rr(-.35, .35) : rr(-.08, .08), yaw = asleep ? rr(-.3, .3) : rr(-.25, .25);
    if (asleep && win && rand() < .6) roll = (p.x < 0 ? 1 : -1) * rr(.25, .45);
    const neck = V3(p.x, 1.08, p.z + .14 + lean * .65); e.set(pitch + lean * .3, yaw, roll, 'YXZ'); q.setFromEuler(e);
    const hm = new THREE.Matrix4().compose(neck, q, V3(f ? .93 : 1, f ? .95 : 1, f ? .95 : 1)).multiply(new THREE.Matrix4().makeTranslation(0, .05, -.01));
    heads.setMatrixAt(i, hm); heads.setColorAt(i, col.setRGB(tone[0], tone[1], tone[2])); hands.setColorAt(i, col);
    const hk = f ? (rand() < .55 ? 'long' : 'bun') : (rand() < .12 ? 'hood' : 'short'); const bald = !f && rand() < .12;
    if (!bald) { hairs[hk].setMatrixAt(cnt.h[hk], hm); hairs[hk].setColorAt(cnt.h[hk]++, hk === 'hood' ? col.setHex(pick(clothes)) : col.setHex(rand() < .15 ? HAIRC[4 + Math.floor(rand() * 2)] : pick(HAIRC))); }
    if (asleep && rand() < .75) { e.set(lean * .4, 0, 0); q.setFromEuler(e); m.compose(V3(p.x, 0, p.z + .02), q, V3(rr(.95, 1.05), 1, 1)); bl.setMatrixAt(cnt.b, m); bl.setColorAt(cnt.b++, col.setHex(pick([0x1d2a4a, 0x26324f, 0x3a3f4a, 0x1a2238]))); }
    PEOPLE.crowd.push({ id, neck, q: q.clone(), i, f, asleep, hm, scale: f ? .95 : 1 });
  });
  const fin = (im, c) => { im.count = c; im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; S.add(im); };
  fin(heads, n); fin(hands, n); fin(bodyM, cnt.m); fin(bodyF, cnt.f); for (const k in hairs) fin(hairs[k], cnt.h[k]); fin(bl, cnt.b);
  PEOPLE.crowdHeads = heads; PEOPLE.crowdHair = hairs;
}

// ---- personagens individuais
class NPC {
  constructor(o) {
    ensureBodyGeos(); this.o = o; this.name = o.name; const g = new THREE.Group(); this.g = g; R.scene.add(g);
    const tone = o.skin || SKIN[1]; this.skin = skinMat(tone, o.skinExtra || {}); const cm = clothMat(o.cloth || 0x222833); this.clothM = cm;
    const body = new THREE.Mesh(o.slump ? seatedBodyGeo(false, true) : o.standing ? (o.female ? HEAD.body.tf : HEAD.body.tm) : (o.female ? HEAD.body.sf : HEAD.body.sm), cm); body.castShadow = body.receiveShadow = true; g.add(body); this.body = body;
    const hands = new THREE.Mesh(o.slump ? (() => { const q = []; for (const s of [-1, 1]) { const g = new THREE.SphereGeometry(.045, 10, 8); g.scale(.8, 1.2, .55); g.translate(s * .3, .44, .07); q.push(g); } return mergeGeos(q); })() : o.standing ? HEAD.body.ht : HEAD.body.hs, new THREE.MeshStandardMaterial({ color: new THREE.Color(.78 * tone[0], .6 * tone[1], .5 * tone[2]), roughness: .6 })); hands.castShadow = true; g.add(hands);
    this.neck = new THREE.Group(); this.neck.position.set(0, o.standing ? 1.52 : 1.08, o.standing ? 0 : .1); g.add(this.neck);
    this.headPivot = new THREE.Group(); this.neck.add(this.headPivot);
    const head = new THREE.Mesh(HEAD.full, this.skin); head.position.set(0, .05, -.01); head.castShadow = true; head.receiveShadow = true; if (o.female) head.scale.set(.92, .95, .94); this.headPivot.add(head); this.head = head;
    if (o.hair) { const hm = new THREE.MeshStandardMaterial({ color: o.hairColor || 0x1a120d, roughness: .72, normalMap: TEX.clothN, normalScale: new THREE.Vector2(1.5, 1.5) }); hm.envMap = MAT.plastic.envMap; hm.envMapIntensity = .3; const h = new THREE.Mesh(HEAD.hair[o.hair], hm); h.castShadow = true; h.position.copy(head.position); h.scale.copy(head.scale); this.headPivot.add(h); }
    if (o.uniform) this.addUniform(o.uniform);
    if (o.blanket) { const b = new THREE.Mesh(HEAD.blanket, new THREE.MeshStandardMaterial({ map: TEX.blanket, normalMap: TEX.blanketN, roughness: .97, color: o.blanket, side: THREE.DoubleSide })); b.castShadow = b.receiveShadow = true; g.add(b); }
    if (o.mask) { const mk = new THREE.Mesh(eyeMaskGeo(), new THREE.MeshStandardMaterial({ color: 0x15151a, roughness: .8 })); mk.position.copy(head.position); this.headPivot.add(mk); }
    g.position.copy(o.pos); g.rotation.y = o.rotY || 0;
    this.look = { yaw: 0, pitch: 0, ty: 0, tp: 0 }; this.base = { pitch: o.pitch || 0, roll: o.roll || 0, yaw: o.yaw || 0 }; this.tracking = !!o.track; this.breath = rand() * 10;
    this.hit = hitbox(.6, o.standing ? 1.8 : 1.3, .6, [0, o.standing ? .9 : .7, 0], g); this.hit.userData.npc = this;
    PEOPLE.npcs[o.key] = this;
  }
  addUniform(kind) {
    const g = this.g; const st = this.o.standing;
    if (kind === 'pilot' || kind === 'crewM') { const sh = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, .06, 14), clothMat(0xf2f2f0)); sh.position.set(0, st ? 1.47 : 1.03, st ? 0 : .1); g.add(sh); }
    if (kind === 'pilot') for (const s of [-1, 1]) { const ep = new THREE.Mesh(roundedBox(.05, .012, .12, .004), new THREE.MeshStandardMaterial({ color: 0x1a1d29, roughness: .6 })); ep.position.set(s * .17, st ? 1.47 : 1.03, st ? 0 : .12); g.add(ep); for (let i = 0; i < 4; i++) { const st2 = new THREE.Mesh(new THREE.BoxGeometry(.052, .004, .008), new THREE.MeshStandardMaterial({ color: 0xc9a54a, metalness: 1, roughness: .3 })); st2.position.set(s * .17, (st ? 1.477 : 1.037), (st ? 0 : .12) - .04 + i * .022); g.add(st2); } }
    if (kind === 'crewF') { const sc = new THREE.Mesh(new THREE.TorusGeometry(.07, .025, 8, 18), clothMat(0xb3241c, .7)); sc.rotation.x = Math.PI / 2; sc.position.set(0, st ? 1.48 : 1.04, st ? -.01 : .09); g.add(sc); }
    if (kind === 'crewM' || kind === 'crewF') { const b = new THREE.Mesh(new THREE.BoxGeometry(.05, .012, .003), new THREE.MeshStandardMaterial({ color: 0xc9a54a, metalness: 1, roughness: .3 })); b.position.set(-.09, st ? 1.38 : .95, st ? -.12 : -.02); g.add(b); }
  }
  setVisible(v) { this.g.visible = v; }
  update(dt, t, camPos) {
    this.breath += dt; const br = Math.sin(this.breath * 1.6) * .006; this.body.scale.set(1 + br * .5, 1 + br * .3, 1 + br);
    if (this.tracking) {
      const lp = this.g.worldToLocal(camPos.clone()); const n = this.neck.position; const dx = lp.x - n.x, dy = lp.y - (n.y + .1), dz = lp.z - n.z;
      let yaw = Math.atan2(-dx, -dz), pitch = Math.atan2(dy, Math.hypot(dx, dz)); const ok = Math.abs(yaw) < 1.5 && Math.hypot(dx, dz) < 6;
      this.look.ty = ok ? clamp(yaw, -1.1, 1.1) : 0; this.look.tp = ok ? clamp(pitch, -.45, .35) : 0;
    } else { this.look.ty = 0; this.look.tp = 0; }
    this.look.yaw = damp(this.look.yaw, this.look.ty, 3, dt); this.look.pitch = damp(this.look.pitch, this.look.tp, 3, dt);
    this.headPivot.rotation.set(this.base.pitch + this.look.pitch, this.base.yaw + this.look.yaw, this.base.roll, 'YXZ');
  }
  headWorld() { return this.head.getWorldPosition(V3()).add(V3(0, .12, 0)); }
}
