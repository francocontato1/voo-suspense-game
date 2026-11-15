// ---------------------------------------------------------------------------
// Jogador: primeira pessoa, colisão por áreas caminháveis, balanço de cabeça,
// passos, lanterna, interação por mira; mouse (pointer lock / arrastar) e toque.
// ---------------------------------------------------------------------------
const P = { x: -.53, z: -4.95, y: 1.18, yaw: 0, pitch: -.12, eye: 1.7, mode: 'seated', speed: 0, bob: 0, stepAcc: 0, torch: false, hasTorch: false, sens: 1, run: false, canRun: false, shake: 0, lavOpen: false, vel: V3(), lockedLook: null, extraWalk: [] };
const KEYS = {}; const INPUT = { mx: 0, my: 0, joy: { x: 0, y: 0 }, locked: false, dragging: false };
const WALK = [
  [-.85, .85, -4.75, -3.62], [-.32, .32, -3.75, -3.4], [-.3, .42, -3.45, -2.2], [-1.45, 1.45, -2.25, -.25],
  [-.24, .24, -.3, 4.5], [-.1, .1, 4.4, LAY.lavZ0 + .05], [-.16, .16, rowZ(20) + .1, rowZ(21) - .12], [-.24, .24, LAY.lavZ0, LAY.lavZ1 + .1], [-1.45, 1.45, LAY.lavZ1 + .05, LAY.galleyZ - .3],
];
const LAVWALK = [-.72, -.24, LAY.lavZ0 + .32, LAY.lavZ1 - .24];
function inWalk(x, z) {
  if (z < -3.42 && !P.ckOpen) return false;
  if (z > -3.62 && (GAME.chapter === 'cockpit' || GAME.chapter === 'prologue') && !GAME.flags.ckOpened) return false;
  for (const r of WALK) if (x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3]) return true;
  if (P.lavOpen && x >= LAVWALK[0] && x <= LAVWALK[1] && z >= LAVWALK[2] && z <= LAVWALK[3]) return true;
  for (const r of P.extraWalk) if (x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3]) return true;
  return false;
}
function zoneOf(x, z) { if (z < LAY.ckDoor) return 'cockpit'; if (x < -.3 && z > LAY.lavZ0 && z < LAY.lavZ1) return 'lav'; if (z > LAY.lavZ0) return 'aft'; if (z < -.3) return 'fwd'; return 'cabin'; }
function initInput() {
  const el = R.renderer.domElement;
  addEventListener('keydown', e => { KEYS[e.code] = true; onKey(e); if (['Tab', 'Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', e => { KEYS[e.code] = false; });
  addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; });
  document.addEventListener('pointerlockchange', () => { INPUT.locked = document.pointerLockElement === el; if (INPUT.locked) { INPUT.everLocked = true; INPUT.lockT = performance.now(); } if (!INPUT.locked && GAME.playing && !GAME.overlay && !UI.docOpen && !UI.nbOpen && !IS_TOUCH && !GAME.ending && performance.now() - (INPUT.lockT || 0) > 900) showPause(true); });
  document.addEventListener('pointerlockerror', () => { if (!INPUT.everLocked) INPUT.lockFailed = true; });
  el.addEventListener('mousedown', e => { if (!GAME.playing || GAME.overlay) return; if (!INPUT.locked && !INPUT.lockFailed && !IS_TOUCH) { try { const p = el.requestPointerLock(); if (p && p.catch) p.catch(() => { if (!INPUT.everLocked) INPUT.lockFailed = true; }); } catch (err) { if (!INPUT.everLocked) INPUT.lockFailed = true; } } INPUT.dragging = true; INPUT.lx = e.clientX; INPUT.ly = e.clientY; });
  addEventListener('mouseup', () => { INPUT.dragging = false; });
  addEventListener('mousemove', e => {
    if (UI.dlg.active && UI.dlg.choices && INPUT.locked) { INPUT.selAcc = (INPUT.selAcc || 0) + e.movementY; if (Math.abs(INPUT.selAcc) > 40) { const n = UI.dlg.choices.length; UI.dlg.sel = (UI.dlg.sel + Math.sign(INPUT.selAcc) + n) % n; INPUT.selAcc = 0; markSel(); } return; }
    if (!GAME.playing || GAME.overlay) return;
    if (INPUT.locked) { INPUT.mx += e.movementX; INPUT.my += e.movementY; }
    else if (INPUT.dragging) { INPUT.mx += (e.clientX - INPUT.lx) * 1.4; INPUT.my += (e.clientY - INPUT.ly) * 1.4; INPUT.lx = e.clientX; INPUT.ly = e.clientY; }
  });
  // toque
  const joy = document.getElementById('joy'), knob = joy.querySelector('i'); let jid = null, jc = null, lid = null, lp = null;
  joy.addEventListener('touchstart', e => { const t = e.changedTouches[0]; jid = t.identifier; const r = joy.getBoundingClientRect(); jc = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; e.preventDefault(); }, { passive: false });
  addEventListener('touchmove', e => { for (const t of e.changedTouches) { if (t.identifier === jid) { let dx = (t.clientX - jc.x) / 50, dy = (t.clientY - jc.y) / 50; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } INPUT.joy.x = dx; INPUT.joy.y = dy; knob.style.transform = `translate(${dx * 36}px,${dy * 36}px)`; } else if (t.identifier === lid) { INPUT.mx += (t.clientX - lp.x) * 2.2; INPUT.my += (t.clientY - lp.y) * 2.2; lp = { x: t.clientX, y: t.clientY }; } } }, { passive: false });
  const end = e => { for (const t of e.changedTouches) { if (t.identifier === jid) { jid = null; INPUT.joy.x = INPUT.joy.y = 0; knob.style.transform = ''; } if (t.identifier === lid) lid = null; } };
  addEventListener('touchend', end); addEventListener('touchcancel', end);
  el.addEventListener('touchstart', e => { const t = e.changedTouches[0]; if (lid === null) { lid = t.identifier; lp = { x: t.clientX, y: t.clientY }; } }, { passive: true });
  const tb = (id, fn) => { const b = document.getElementById(id); b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); fn(true); }, { passive: false }); b.addEventListener('touchend', e => { e.preventDefault(); fn(false); }, { passive: false }); b.addEventListener('click', () => fn(true)); };
  tb('tE', d => d && pressAction()); tb('tF', d => d && toggleTorch()); tb('tN', d => d && toggleNotebook()); tb('tRun', d => { P.run = d; });
}
function onKey(e) {
  if (!GAME.started) return;
  if (e.code === 'Escape') { if (UI.docOpen) { closeDoc(); return; } if (UI.nbOpen) { toggleNotebook(); return; } if (GAME.playing && !GAME.overlay) showPause(!GAME.paused); return; }
  if (UI.docOpen) { if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') closeDoc(); return; }
  if (e.code === 'Tab' || e.code === 'KeyN') { toggleNotebook(); return; }
  if (UI.dlg.active) { dialogKey(e); return; }
  if (e.code === 'KeyE' || e.code === 'Enter') pressAction();
  if (e.code === 'KeyF') toggleTorch();
}
function toggleTorch() { if (!P.hasTorch || GAME.paused) return; P.torch = !P.torch; SFX.click(); WORLD.lights.torch.intensity = P.torch ? 9 : 0; }
function pressAction() { if (UI.dlg.active) { dialogAdvance(); return; } if (UI.docOpen) { closeDoc(); return; } if (P.focus && (P.mode === 'walk' || P.mode === 'seated') && !GAME.busy) { const f = P.focus; f.action(f); } }
const _ray = new THREE.Raycaster(); _ray.far = 2.3;
function updatePlayer(dt) {
  const cam = R.camera;
  // olhar
  const s = .0022 * P.sens; if (!GAME.overlay && !GAME.paused && (P.mode === 'walk' || P.mode === 'seated')) { P.yaw -= INPUT.mx * s; P.pitch -= INPUT.my * s; }
  INPUT.mx = INPUT.my = 0;
  if (P.mode === 'seated') { P.yaw = clamp(P.yaw, -1.9, 1.9); P.pitch = clamp(P.pitch, -1.0, .9); }
  else P.pitch = clamp(P.pitch, -1.35, 1.35);
  if (P.mode === 'walk' && !GAME.overlay && !GAME.paused) {
    let fx = 0, fz = 0; if (KEYS.KeyW || KEYS.ArrowUp) fz -= 1; if (KEYS.KeyS || KEYS.ArrowDown) fz += 1; if (KEYS.KeyA || KEYS.ArrowLeft) fx -= 1; if (KEYS.KeyD || KEYS.ArrowRight) fx += 1;
    fx += INPUT.joy.x; fz += INPUT.joy.y; const l = Math.hypot(fx, fz); if (l > 1) { fx /= l; fz /= l; }
    const running = (KEYS.ShiftLeft || KEYS.ShiftRight || P.run) && P.canRun; const max = running ? 3.0 : 1.25;
    const sn = Math.sin(P.yaw), cs = Math.cos(P.yaw); const wx = fx * cs + fz * sn, wz = -fx * sn + fz * cs;
    P.vel.x = damp(P.vel.x, wx * max, 9, dt); P.vel.z = damp(P.vel.z, wz * max, 9, dt);
    const nx = P.x + P.vel.x * dt, nz = P.z + P.vel.z * dt;
    if (inWalk(nx, nz)) { P.x = nx; P.z = nz; } else if (inWalk(nx, P.z)) { P.x = nx; P.vel.z *= .5; } else if (inWalk(P.x, nz)) { P.z = nz; P.vel.x *= .5; } else { P.vel.multiplyScalar(.3); }
    const sp = Math.hypot(P.vel.x, P.vel.z); P.speed = sp;
    P.bob += sp * dt * (running ? 2.6 : 2.9); P.stepAcc += sp * dt;
    const stride = running ? .8 : .68; if (P.stepAcc > stride) { P.stepAcc = 0; const z = zoneOf(P.x, P.z); SFX.step(z === 'cabin' || z === 'cockpit' ? 'soft' : 'hard', running ? 1.3 : .8); if (running && rand() < .3) SFX.breath(.8); }
    const bobY = Math.sin(P.bob * 2) * .028 * Math.min(1, sp), bobX = Math.cos(P.bob) * .018 * Math.min(1, sp);
    cam.position.set(P.x + bobX * Math.cos(P.yaw), P.eye + bobY, P.z - bobX * Math.sin(P.yaw));
    cam.rotation.set(P.pitch, P.yaw, bobX * .25 + Math.sin(P.yaw) * 0);
  } else if (P.mode === 'seated') { cam.position.set(P.x, P.y, P.z); cam.rotation.set(P.pitch, P.yaw, 0); }
  // vibração da aeronave + turbulência
  const t = GAME.t; const vib = .0009 + P.shake * .02; if (P.mode === 'walk' || P.mode === 'seated') cam.position.x += (Math.sin(t * 37) + Math.sin(t * 23.3)) * vib * .5; cam.position.y += (Math.sin(t * 31.7) + Math.sin(t * 13.1) * .5) * vib + Math.sin(t * 1.3) * P.shake * .03; if (P.mode === 'walk' || P.mode === 'seated') cam.rotation.z += Math.sin(t * 2.1) * P.shake * .03 + Math.sin(t * .37) * .002;
  P.shake = Math.max(0, P.shake - dt * .25);
  // foco de interação
  P.focus = null;
  if ((P.mode === 'walk' || P.mode === 'seated') && !GAME.overlay && !GAME.busy) {
    _ray.setFromCamera({ x: 0, y: 0 }, cam); const objs = []; const map = new Map();
    for (const it of WORLD.interact) if (it.enabled()) { objs.push(it.hit); map.set(it.hit, it); }
    const hits = _ray.intersectObjects(objs, false); if (hits.length) P.focus = map.get(hits[0].object);
  }
  UI.setPrompt(P.focus ? (typeof P.focus.label === 'function' ? P.focus.label() : P.focus.label) : '');
}
