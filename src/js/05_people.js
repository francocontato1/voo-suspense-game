// ---------------------------------------------------------------------------
// Pessoas: avatares Microsoft Rocketbox (MIT) — malhas com esqueleto de 81 ossos,
// blendshapes faciais ARKit + visemas, animações de captura de movimento.
// Personagens principais são SkinnedMesh vivos; a multidão é "assada" em poses
// e instanciada (performance), com olhos fechados para quem dorme.
// ---------------------------------------------------------------------------
const CHARS = { tpl: {}, clips: {}, loader: null, boneNames: null };
const PEOPLE = { npcs: {}, crowd: [] };
async function assetBuf(name) {
  const A = window.__ASSETS || {}; if (A[name]) return b64ToBuf(A[name]);
  if (/\.glb$/.test(name)) { const r0 = await fetch('assets3d/' + name).catch(() => null); if (r0 && r0.ok) return r0.arrayBuffer(); const r = await fetch('assets3d/' + name + '.json'); if (!r.ok) throw new Error('asset ' + name); return b64ToBuf(await r.json()); }
  const r = await fetch('assets3d/' + name); if (!r.ok) throw new Error('asset ' + name); return r.arrayBuffer();
}
async function loadGLB(name) {
  if (!CHARS.loader) { CHARS.loader = new GLTFLoader(); CHARS.loader.setMeshoptDecoder(MeshoptDecoder); }
  return await CHARS.loader.parseAsync(await assetBuf(name), '');
}
const AVATARS = ['captain', 'helena', 'marta', 'camila', 'diego', 'padre', 'mattar', 'otavio', 'livia', 'davi', 'watcher'];
const CROWD_AV = ['f01', 'f02', 'f07', 'f09', 'f13', 'f17', 'm02', 'm05', 'm06', 'm12', 'm16', 'm20'];
const FEMALE = new Set(['helena', 'marta', 'camila', 'livia', 'f01', 'f02', 'f07', 'f09', 'f13', 'f17']);
const ANIMS = ['sit_chair_breathe_01', 'sit_chair_idle_neutral_01', 'sit_chair_idle_nervous_01', 'sit_chair_idle_look_around', 'sit_chair_gestic_shrug_01', 'sit_chair_gestic_thoughtful', 'sit_chair_idle_touch_face',
  'idle_neutral_01', 'idle_nervous_01', 'gestic_talk_neutral_01', 'gestic_talk_nervous_01', 'gestic_talk_angry_01', 'gestic_listen_neutral_01', 'walk_slow_01', 'walk_neutral_01', 'run_neutral_01', 'knock_door', 'crouch_idle',
  'idle_look_around_01', 'take_picture', 'cell_phone_talk_01', 'gestic_talk_femalestressed_01', 'trolley_idle'];
async function loadPeople(progressCb) {
  const all = AVATARS.concat(CROWD_AV); let n = 0;
  for (const k of all) {
    const g = await loadGLB('av_' + k + '.glb'); const sc = g.scene;
    sc.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; const ms = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of ms) { m.envMap = MAT.plastic.envMap; m.envMapIntensity = .28; if (m.alphaTest > 0) { m.transparent = false; m.depthWrite = true; m.alphaToCoverage = true; m.alphaTest = .25; } if (/hat/.test(m.name)) m.userData.hat = true; if (/head/.test(m.name)) { m.roughness = .52; } } } });
    CHARS.tpl[k] = { scene: sc, female: FEMALE.has(k) };
    if (!CHARS.boneNames) { CHARS.boneNames = new Set(); sc.traverse(o => { if (o.isBone || /Bip01/.test(o.name)) CHARS.boneNames.add(o.name); }); computeFacing(sc); }
    progressCb && progressCb(++n / (all.length + ANIMS.length * 2));
  }
  for (const a of ANIMS) for (const s of ['m', 'f']) {
    const key = s + '_' + a; if (window.__MANIFEST && !window.__MANIFEST.includes('an_' + key + '.glb')) { n++; continue; } try {
      const g = await loadGLB('an_' + key + '.glb'); const clip = g.animations[0]; clip.name = key;
      clip.tracks = clip.tracks.filter(t => CHARS.boneNames.has(t.name.split('.')[0]));
      // remove deslocamento horizontal do quadril (andar no lugar; o jogo move o personagem)
      const root = clip.tracks.find(t => t.name === 'Bip01.position'); if (root && /walk|run/.test(a)) { const v = root.values; const n0 = [v[0], v[1], v[2]]; const ax = CHARS.horiz; for (let i = 0; i < v.length; i += 3) for (const k of ax) v[i + k] = n0[k]; }
      CHARS.clips[key] = clip;
    } catch (e) { }
    progressCb && progressCb(++n / (all.length + ANIMS.length * 2));
  }
}
function computeFacing(sc) {
  sc.updateMatrixWorld(true); const P = n => { const o = sc.getObjectByName(n); return o ? o.getWorldPosition(V3()) : V3(); };
  const right = P('Bip01_R_Thigh').sub(P('Bip01_L_Thigh')).normalize(); const fwd = V3(0, 1, 0).cross(right).normalize();
  CHARS.yawFix = Math.PI - Math.atan2(fwd.x, fwd.z);
  // eixos horizontais no espaço do pai de Bip01 (para remover deslocamento de raiz)
  const b = sc.getObjectByName('Bip01'); const pm = new THREE.Matrix4().copy(b.parent.matrixWorld).invert(); const up = V3(0, 1, 0).transformDirection(pm);
  const comps = [Math.abs(up.x), Math.abs(up.y), Math.abs(up.z)]; const upAx = comps.indexOf(Math.max(...comps)); CHARS.horiz = [0, 1, 2].filter(i => i !== upAx);
}
function clipFor(name, female) { return CHARS.clips[(female ? 'f_' : 'm_') + name] || CHARS.clips[(female ? 'm_' : 'f_') + name]; }

// ---- expressões faciais (pesos de blendshapes ARKit/visemas)
const EXPR = {
  neutral: {}, calm: { MouthSmileLeft: .06, MouthSmileRight: .06 },
  worried: { BrowInnerUp: .55, MouthPressLeft: .25, MouthPressRight: .25, MouthFrownLeft: .2, MouthFrownRight: .2 },
  fear: { BrowInnerUp: .95, BrowOuterUpLeft: .55, BrowOuterUpRight: .55, EyeWideLeft: .85, EyeWideRight: .85, MouthStretchLeft: .45, MouthStretchRight: .45, JawOpen: .12 },
  terror: { BrowInnerUp: 1, BrowOuterUpLeft: .8, BrowOuterUpRight: .8, EyeWideLeft: 1, EyeWideRight: 1, MouthStretchLeft: .8, MouthStretchRight: .8, JawOpen: .45 },
  anger: { BrowDownLeft: .9, BrowDownRight: .9, EyeSquintLeft: .45, EyeSquintRight: .45, NoseSneerLeft: .5, NoseSneerRight: .5, MouthPressLeft: .5, MouthPressRight: .5, MouthFrownLeft: .25, MouthFrownRight: .25 },
  rage: { BrowDownLeft: 1, BrowDownRight: 1, EyeWideLeft: .3, EyeWideRight: .3, NoseSneerLeft: .8, NoseSneerRight: .8, MouthUpperUpLeft: .6, MouthUpperUpRight: .6, MouthStretchLeft: .5, MouthStretchRight: .5, JawOpen: .25 },
  sad: { BrowInnerUp: .75, MouthFrownLeft: .7, MouthFrownRight: .7, EyeSquintLeft: .25, EyeSquintRight: .25, LidDroop: .2, MouthPressLeft: .2, MouthPressRight: .2 },
  cry: { BrowInnerUp: 1, MouthFrownLeft: .9, MouthFrownRight: .9, EyeSquintLeft: .7, EyeSquintRight: .7, CheekSquintLeft: .5, CheekSquintRight: .5, MouthStretchLeft: .3, MouthStretchRight: .3, JawOpen: .15 },
  smirk: { MouthSmileLeft: .45, EyeSquintLeft: .2, EyeSquintRight: .1, BrowDownRight: .15 },
  sinister: { MouthSmileLeft: .22, MouthSmileRight: .12, EyeSquintLeft: .3, EyeSquintRight: .3, BrowDownLeft: .2, BrowDownRight: .2, LidDroop: .15 },
  smile: { MouthSmileLeft: .6, MouthSmileRight: .6, CheekSquintLeft: .35, CheekSquintRight: .35 },
  pain: { EyeSquintLeft: .9, EyeSquintRight: .9, BrowDownLeft: .6, BrowDownRight: .6, MouthStretchLeft: .6, MouthStretchRight: .6, NoseSneerLeft: .4, NoseSneerRight: .4, JawOpen: .2 },
  nervous: { BrowInnerUp: .4, MouthPressLeft: .45, MouthPressRight: .45, EyeWideLeft: .2, EyeWideRight: .2 },
  dead: { LidDroop: .8, EyeBlinkLeft: .62, EyeBlinkRight: .55, JawOpen: .32, MouthFrownLeft: .2, MouthFrownRight: .2 },
  sleep: { EyeBlinkLeft: 1, EyeBlinkRight: 1, JawOpen: .08 }, stern: { BrowDownLeft: .35, BrowDownRight: .35, MouthPressLeft: .35, MouthPressRight: .35 },
};
const VIS = ['aa', 'E', 'I', 'O', 'U', 'PP', 'FF', 'SS', 'CH', 'aa', 'E', 'O'];
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _m1 = new THREE.Matrix4();

class Person {
  constructor(key, o = {}) {
    const tpl = CHARS.tpl[o.model || key]; this.key = key; this.o = o; this.female = tpl.female; this.name = o.name || key;
    this.root = SkeletonUtils.clone(tpl.scene); this.root.rotation.y = CHARS.yawFix; this.g = new THREE.Group(); this.g.add(this.root); R.scene.add(this.g);
    this.bones = {}; this.faces = []; this.mats = [];
    this.root.traverse(o2 => { if (o2.isBone || /Bip01/.test(o2.name)) this.bones[o2.name] = o2; if (o2.isMesh) { if (o2.morphTargetDictionary && o2.morphTargetInfluences) this.faces.push(o2);
      if (o.tint || o.hideHat) { const ms = Array.isArray(o2.material) ? o2.material : [o2.material]; const nm = ms.map(m => { const c = m.clone(); if (o.tint) c.color.multiply(new THREE.Color(...o.tint)); if (o.hideHat && m.userData.hat) c.visible = false; return c; }); o2.material = Array.isArray(o2.material) ? nm : nm[0]; } } });
    this.mixer = new THREE.AnimationMixer(this.root); this.cur = null;
    this.w = {}; this.wt = {}; this.exprName = 'neutral'; this.exprK = 1; this.blinkT = rr(1, 4); this.blink = 0; this.talkT = 0; this.visT = 0; this.vis = {};
    this.look = { yaw: 0, pitch: 0, ty: 0, tp: 0 }; this.lookTarget = null; this.tracking = !!o.track; this.trackRange = o.trackRange || 5.5;
    this.extraRot = {}; this.walk = null; this.ik = null;
    if (o.pos) this.g.position.copy(o.pos); this.g.rotation.y = o.rotY || 0;
    this.hit = hitbox(.55, o.standing === false || o.sit ? 1.3 : 1.8, .55, [0, o.sit ? .7 : .9, 0], this.g); this.hit.userData.npc = this;
    if (o.anim) this.play(o.anim, { fade: 0, at: rand() * 4 });
    if (o.expr) this.setExpr(o.expr);
    PEOPLE.npcs[key] = this;
  }
  play(name, op = {}) {
    const clip = clipFor(name, this.female); if (!clip) return; const a = this.mixer.clipAction(clip); if (this.cur === a && !op.restart) return a;
    a.reset(); a.setLoop(op.once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = !!op.once; a.timeScale = op.speed || 1; if (op.at) a.time = op.at % clip.duration;
    a.enabled = true; a.setEffectiveWeight(1); a.play(); if (this.cur && op.fade !== 0) this.cur.crossFadeTo(a, op.fade || .45, false); else if (this.cur) this.cur.stop(); this.cur = a; return a;
  }
  setExpr(name, k = 1) { this.exprName = name; this.exprK = k; }
  speak(sec) { this.talkT = Math.max(this.talkT, sec); }
  setVisible(v) { this.g.visible = v; }
  headWorld() { const h = this.bones.Bip01_Head; return h ? h.getWorldPosition(V3()).add(V3(0, .06, 0)) : this.g.position.clone().add(V3(0, 1.6, 0)); }
  bonePos(n) { return this.bones['Bip01_' + n].getWorldPosition(V3()); }
  walkTo(points, speed = 1.0, anim = 'walk_slow_01', endAnim = 'idle_neutral_01') {
    return new Promise(res => { this.walk = { pts: points.map(p => p.clone ? p.clone() : V3(p[0], 0, p[1])), i: 0, speed, res, endAnim }; this.play(anim, { speed: speed / (anim.includes('run') ? 3.2 : (anim.includes('slow') ? .9 : 1.3)) }); });
  }
  faceTo(p, k = 1) { const d = V3().subVectors(p, this.g.position); const t = Math.atan2(-d.x, -d.z); this.g.rotation.y += angDiff(this.g.rotation.y, t) * k; }
  update(dt, t, camPos) {
    this.mixer.update(dt);
    if (this.walk) { const W = this.walk, p = this.g.position, tg = W.pts[W.i]; const d = V3(tg.x - p.x, 0, tg.z - p.z); const L = d.length();
      if (L < .06) { W.i++; if (W.i >= W.pts.length) { this.walk = null; if (W.endAnim) this.play(W.endAnim); W.res(); } }
      else { d.normalize(); p.addScaledVector(d, Math.min(L, W.speed * dt)); const ty = Math.atan2(-d.x, -d.z); this.g.rotation.y += angDiff(this.g.rotation.y, ty) * Math.min(1, dt * 7); } }
    this.root.updateMatrixWorld(true);
    // olhar (cabeça/pescoço) aditivo sobre a animação
    let tgt = this.lookTarget || (this.tracking && camPos && this.g.position.distanceTo(camPos) < this.trackRange ? camPos : null);
    if (tgt) { const hp = this.headWorld(); const lp = this.g.worldToLocal(tgt.clone()); const lh = this.g.worldToLocal(hp.clone()); const dx = lp.x - lh.x, dy = lp.y - lh.y, dz = lp.z - lh.z;
      const yaw = Math.atan2(-dx, -dz), pitch = Math.atan2(dy, Math.hypot(dx, dz)); const ok = Math.abs(yaw) < 1.6; this.look.ty = ok ? clamp(yaw, -1.05, 1.05) : 0; this.look.tp = ok ? clamp(pitch, -.5, .4) : 0; }
    else { this.look.ty = 0; this.look.tp = 0; }
    this.look.yaw = damp(this.look.yaw, this.look.ty, 3.5, dt); this.look.pitch = damp(this.look.pitch, this.look.tp, 3.5, dt);
    const ex = this.extraRot; this.rotBoneWorld('Bip01_Neck', this.look.yaw * .4 + (ex.neckYaw || 0), -this.look.pitch * .35 + (ex.neckPitch || 0), ex.neckRoll || 0);
    this.rotBoneWorld('Bip01_Head', this.look.yaw * .6 + (ex.headYaw || 0), -this.look.pitch * .65 + (ex.headPitch || 0), ex.headRoll || 0);
    if (ex.spinePitch) this.rotBoneWorld('Bip01_Spine1', 0, ex.spinePitch, ex.spineRoll || 0);
    if (this.ik) this.solveIK(this.ik);
    // rosto
    this.blinkT -= dt; if (this.blinkT < 0) { this.blink = 1; this.blinkT = rr(2, 5.5); } this.blink = Math.max(0, this.blink - dt * 7);
    this.talkT = Math.max(0, this.talkT - dt); this.visT -= dt;
    if (this.visT < 0) { this.vis = {}; if (this.talkT > 0) { const v = pick(VIS); this.vis[v] = rr(.45, .9); this.vis.JawOpen = rr(.05, .25); } this.visT = rr(.07, .13); }
    const E = EXPR[this.exprName] || {}; const target = {}; for (const k in E) target[k] = E[k] * this.exprK; for (const k in this.vis) target[k] = Math.max(target[k] || 0, this.vis[k]);
    const bl = Math.max(this.blink, target.EyeBlinkLeft || 0), br = Math.max(this.blink, target.EyeBlinkRight || 0); target.EyeBlinkLeft = bl; target.EyeBlinkRight = br;
    for (const f of this.faces) { const D = f.morphTargetDictionary, I = f.morphTargetInfluences; for (const k in D) { const i = D[k]; const tv = target[k] || 0; I[i] = damp(I[i], tv, k.startsWith('EyeBlink') ? 30 : 12, dt); } }
  }
  rotBoneWorld(name, yaw, pitch, roll) {
    const b = this.bones[name]; if (!b || (!yaw && !pitch && !roll)) return;
    // rotação no espaço do personagem (y = cima, x = direita), convertida para o espaço local do osso
    b.updateMatrixWorld(true); const gq = this.g.getWorldQuaternion(_q1); const dq = _q2.setFromEuler(_e.set(pitch, yaw, roll, 'YXZ')); const wq = gq.clone().multiply(dq).multiply(gq.clone().invert());
    const bw = b.getWorldQuaternion(new THREE.Quaternion()); const nw = wq.multiply(bw); const pw = b.parent.getWorldQuaternion(_qp); b.quaternion.copy(pw.invert().multiply(nw)); b.updateMatrixWorld(true);
  }
  // IK simples (CCD) para levar a mão a um ponto do mundo
  solveIK({ side = 'R', target, w = 1 }) {
    const chain = [`Bip01_${side}_Forearm`, `Bip01_${side}_UpperArm`].map(n => this.bones[n]); const eff = this.bones[`Bip01_${side}_Hand`]; if (!eff || !chain[0]) return;
    for (let it = 0; it < 6; it++) for (const b of chain) {
      const bp = b.getWorldPosition(_v1), ep = eff.getWorldPosition(_v2); const toE = ep.clone().sub(bp).normalize(), toT = target.clone().sub(bp).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(toE, toT); const id = new THREE.Quaternion(); q.slerp(id, 1 - w * .6);
      const bw = b.getWorldQuaternion(new THREE.Quaternion()); const nw = q.multiply(bw); const pw = b.parent.getWorldQuaternion(new THREE.Quaternion()).invert(); b.quaternion.copy(pw.multiply(nw)); b.updateMatrixWorld(true);
    }
  }
  attach(obj, bone, pos, rot) { const b = this.bones['Bip01_' + bone]; if (!b) return; b.add(obj); if (pos) obj.position.set(...pos); if (rot) obj.rotation.set(...rot); }
}

// ---- multidão: poses assadas em geometria estática + instancing
const SEAT_DY = .02, SEAT_DZ = .06;
function bakeAvatar(key, clipName, time, tweak, morph) {
  const tpl = CHARS.tpl[key]; const root = SkeletonUtils.clone(tpl.scene); root.rotation.y = CHARS.yawFix; const holder = new THREE.Group(); holder.add(root);
  const mixer = new THREE.AnimationMixer(root); const clip = clipFor(clipName, tpl.female); if (clip) { const a = mixer.clipAction(clip); a.play(); mixer.update(time % clip.duration); }
  holder.updateMatrixWorld(true); const bones = {}; root.traverse(o => { if (/Bip01/.test(o.name)) bones[o.name] = o; });
  if (tweak) { const fake = Object.create(Person.prototype); fake.bones = bones; fake.g = holder; for (const k in tweak) fake.rotBoneWorld(k, tweak[k][0], tweak[k][1], tweak[k][2]); }
  holder.updateMatrixWorld(true); const out = [];
  const hInv = new THREE.Matrix4().copy(holder.matrixWorld).invert();
  root.traverse(m => {
    if (!m.isSkinnedMesh) return; m.skeleton.update(); const G = m.geometry; const pos = G.attributes.position, nor = G.attributes.normal, si = G.attributes.skinIndex, sw = G.attributes.skinWeight; const n = pos.count;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3); const bm = m.skeleton.boneMatrices; const toH = new THREE.Matrix4().multiplyMatrices(hInv, m.matrixWorld); const nm = new THREE.Matrix3().getNormalMatrix(toH);
    const v = V3(), nn = V3(), acc = new THREE.Matrix4(), tmp = new THREE.Matrix4(); const mDict = G.morphAttributes.position && m.morphTargetDictionary;
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i); if (morph && mDict) for (const k in morph) { const ti = mDict[k]; if (ti !== undefined) { const ma = G.morphAttributes.position[ti]; v.x += ma.getX(i) * morph[k]; v.y += ma.getY(i) * morph[k]; v.z += ma.getZ(i) * morph[k]; } }
      nn.fromBufferAttribute(nor, i); acc.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); const e = acc.elements;
      for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (!w) continue; const bi = si.getComponent(i, k); for (let q = 0; q < 16; q++) e[q] += bm[bi * 16 + q] * w; }
      tmp.multiplyMatrices(m.bindMatrixInverse, acc).multiply(m.bindMatrix); v.applyMatrix4(tmp).applyMatrix4(toH); nn.transformDirection(tmp).applyMatrix3(nm).normalize();
      P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z; N[i * 3] = nn.x; N[i * 3 + 1] = nn.y; N[i * 3 + 2] = nn.z;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); g.setAttribute('uv', G.attributes.uv); g.setIndex(G.index);
    if (G.groups && G.groups.length) G.groups.forEach(gr => g.addGroup(gr.start, gr.count, gr.materialIndex)); g.computeBoundingSphere();
    out.push({ geo: g, mat: m.material });
  });
  return out;
}
const POSES = {
  awake: { clip: 'sit_chair_idle_neutral_01', t: () => rr(0, 8), tweak: () => ({ Bip01_Head: [rr(-.25, .25), rr(-.1, .05), 0] }), morph: {} },
  sleepSide: { clip: 'sit_chair_breathe_01', t: () => rr(0, 6), tweak: () => { const s = rand() < .5 ? 1 : -1; return { Bip01_Neck: [s * .15, .25, s * .3], Bip01_Head: [s * .2, .35, s * .4] }; }, morph: { EyeBlinkLeft: 1, EyeBlinkRight: 1, JawOpen: .18 } },
  sleepFwd: { clip: 'sit_chair_breathe_01', t: () => rr(0, 6), tweak: () => ({ Bip01_Neck: [0, .4, 0], Bip01_Head: [rr(-.2, .2), .45, rr(-.15, .15)], Bip01_Spine1: [0, .12, 0] }), morph: { EyeBlinkLeft: 1, EyeBlinkRight: 1, JawOpen: .06 } },
};
function buildCrowd(reserved) {
  const S = R.scene; const seats = WORLD.seatList.filter(id => !reserved.has(id)); const occ = R.Q >= 1 ? .86 : .62;
  const variants = {}; const assign = []; let prev = null;
  for (const id of seats) {
    if (rand() > (parseInt(id) <= 4 ? .7 : occ)) continue;
    let k; do { k = pick(CROWD_AV); } while (k === prev && CROWD_AV.length > 1); prev = k;
    const r = rand(); const pose = r < .32 ? 'awake' : (r < .7 ? 'sleepSide' : 'sleepFwd'); const vi = Math.floor(rand() * 2);
    const vk = `${k}|${pose}|${vi}`; (variants[vk] = variants[vk] || []).push(id); assign.push([id, vk]);
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (const vk in variants) {
    const [k, pose, vi] = vk.split('|'); const P = POSES[pose]; const baked = bakeAvatar(k, P.clip, P.t(), P.tweak(), P.morph); const ids = variants[vk];
    for (const b of baked) {
      const im = new THREE.InstancedMesh(b.geo, b.mat, ids.length); im.castShadow = true; im.receiveShadow = true;
      ids.forEach((id, i) => { const p = seatPos(id); e.set(0, rr(-.06, .06), 0); q.setFromEuler(e); m.compose(V3(p.x, SEAT_DY, p.z + SEAT_DZ), q, V3(1, 1, 1)); im.setMatrixAt(i, m); });
      im.computeBoundingSphere(); S.add(im);
    }
    for (const id of ids) PEOPLE.crowd.push({ id, pose });
  }
  // cobertores sobre parte dos que dormem
  const blM = new THREE.MeshStandardMaterial({ map: TEX.blanket, normalMap: TEX.blanketN, roughness: .97, color: 0xffffff, side: THREE.DoubleSide });
  const sleepers = PEOPLE.crowd.filter(c => c.pose !== 'awake' && rand() < .55); const bl = new THREE.InstancedMesh(blanketGeo(), blM, Math.max(1, sleepers.length)); const col = new THREE.Color();
  sleepers.forEach((c, i) => { const p = seatPos(c.id); m.compose(V3(p.x, 0, p.z + .02), q.identity(), V3(rr(.95, 1.05), 1, 1)); bl.setMatrixAt(i, m); bl.setColorAt(i, col.setHex(pick([0x1d2a4a, 0x26324f, 0x3a3f4a, 0x1a2238]))); });
  bl.count = sleepers.length; bl.castShadow = bl.receiveShadow = true; S.add(bl);
}
function blanketGeo() {
  const g = new THREE.PlaneGeometry(.56, .8, 14, 18); const p = g.attributes.position; const uv = g.attributes.uv;
  const path = v => { if (v < .4) { const t = v / .4; return [lerp(.76, .64, t), lerp(.02, -.3, t)]; } if (v < .58) { const t = (v - .4) / .18; return [lerp(.64, .6, t) + Math.sin(t * Math.PI) * .03, lerp(-.3, -.43, t)]; } const t = (v - .58) / .42; return [lerp(.6, .18, t), lerp(-.43, -.5, t)]; };
  for (let i = 0; i < p.count; i++) { const u = uv.getX(i), v = 1 - uv.getY(i); const x = (u - .5) * .56; const [y, z] = path(v); const side = Math.max(0, Math.abs(x) - .17); const fold = Math.sin(x * 26 + v * 4) * .01 + NOISE(u * 6, v * 6) * .02; p.setXYZ(i, x * (1 - side * .6), y - side * 1.3 + fold, z - side * .1 * Math.sign(v - .5)); }
  g.computeVertexNormals(); return g;
}
function clothMat(col, rough = .92) { const m = new THREE.MeshStandardMaterial({ color: col, map: TEX.cloth, normalMap: TEX.clothN, normalScale: new THREE.Vector2(.6, .6), roughness: rough }); m.envMap = MAT.plastic.envMap; m.envMapIntensity = .12; return m; }
function updatePeople(dt, t, camPos) { for (const k in PEOPLE.npcs) { const n = PEOPLE.npcs[k]; if (n.g.visible && (n.always || n.g.position.distanceTo(camPos) < 16)) n.update(dt, t, camPos); } }
