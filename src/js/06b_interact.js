// ---------------------------------------------------------------------------
// Interações variadas: inspeção 3D de objetos (girar, aproximar, achar detalhes),
// teclado de PIN do celular, ampliação de foto, QTE (reação rápida), câmeras de cena.
// ---------------------------------------------------------------------------
const INSP = { active: false };
function inspect(def) {
  return new Promise(res => {
    GAME.overlay = true; GAME.busy = true; INSP.active = true; if (INPUT.locked) document.exitPointerLock();
    const cam = R.camera; const g = new THREE.Group(); const obj = def.build(); g.add(obj); const holder = new THREE.Group(); holder.add(g); holder.position.set(0, 0, -def.dist || -.42); cam.add(holder);
    const key = new THREE.PointLight(0xfff0dd, 1.6, 2, 2); key.position.set(.25, .25, .1); holder.add(key); const rim = new THREE.PointLight(0x8fb0ff, .8, 2, 2); rim.position.set(-.3, .1, -.25); holder.add(rim);
    const dim = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: .72, depthWrite: false, fog: false })); dim.position.z = -.5; dim.renderOrder = -1; holder.add(dim);
    const spots = (def.hotspots || []).map(h => { const m = new THREE.Mesh(new THREE.SphereGeometry(h.r || .02, 10, 8), MAT.hit); m.position.set(...h.pos); m.userData.h = h; obj.add(m); return m; });
    const box = $('inspect'); box.classList.remove('hidden'); $('inspTitle').textContent = def.title; $('inspHint').textContent = def.hint || 'Arraste para girar · role para aproximar · clique nos detalhes'; $('inspFound').innerHTML = '';
    let rx = def.rx || 0, ry = def.ry || 0, z = def.dist || .42, drag = null, moved = 0; const el = R.renderer.domElement; let found = 0;
    const apply = () => { g.rotation.set(rx, ry, 0); holder.position.z = -z; }; apply();
    const down = e => { const p = e.touches ? e.touches[0] : e; drag = { x: p.clientX, y: p.clientY }; moved = 0; if (e.touches && e.touches.length === 2) drag.pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); };
    const move = e => { if (!drag) return; const p = e.touches ? e.touches[0] : e; if (e.touches && e.touches.length === 2 && drag.pinch) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); z = clamp(z * drag.pinch / d, .18, .8); drag.pinch = d; apply(); return; }
      const dx = p.clientX - drag.x, dy = p.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy); ry += dx * .008; rx = clamp(rx + dy * .008, -1.4, 1.4); drag.x = p.clientX; drag.y = p.clientY; apply(); };
    const up = e => { if (drag && moved < 6) { const p = e.changedTouches ? e.changedTouches[0] : e; const r = el.getBoundingClientRect(); const ray = new THREE.Raycaster(); ray.setFromCamera({ x: (p.clientX - r.left) / r.width * 2 - 1, y: -(p.clientY - r.top) / r.height * 2 + 1 }, cam); holder.updateMatrixWorld(true);
      const hit = ray.intersectObjects(spots, false)[0]; if (hit && !hit.object.userData.done) { const h = hit.object.userData.h; hit.object.userData.done = true; found++; SFX.click(); STING.piano(); const d = document.createElement('div'); d.className = 'found'; d.textContent = h.text; $('inspFound').appendChild(d); h.onFind && h.onFind(); } } drag = null; };
    const wheel = e => { z = clamp(z + e.deltaY * .0006, .18, .8); apply(); e.preventDefault(); };
    const key2 = e => { if (e.code === 'Escape' || e.code === 'KeyE' || e.code === 'Tab') { e.preventDefault(); close(); } };
    el.addEventListener('mousedown', down); addEventListener('mousemove', move); addEventListener('mouseup', up); el.addEventListener('touchstart', down, { passive: true }); addEventListener('touchmove', move, { passive: true }); addEventListener('touchend', up); el.addEventListener('wheel', wheel, { passive: false }); addEventListener('keydown', key2, true);
    $('inspClose').onclick = () => close();
    INSP.findAll = () => { for (const m of spots) if (!m.userData.done) { m.userData.done = true; found++; m.userData.h.onFind && m.userData.h.onFind(); } };
    function close() { el.removeEventListener('mousedown', down); removeEventListener('mousemove', move); removeEventListener('mouseup', up); el.removeEventListener('touchstart', down); removeEventListener('touchmove', move); removeEventListener('touchend', up); el.removeEventListener('wheel', wheel); removeEventListener('keydown', key2, true);
      cam.remove(holder); box.classList.add('hidden'); INSP.active = false; GAME.overlay = false; GAME.busy = false; relock(); res(found); }
  });
}
// ---- teclado de PIN (celular da vítima)
function pinPad(correct, wallpaperHint) {
  return new Promise(res => {
    GAME.overlay = true; GAME.busy = true; if (INPUT.locked) document.exitPointerLock(); const box = $('pin'); box.classList.remove('hidden'); let code = '';
    const dots = $('pinDots'); const draw = () => dots.textContent = '●'.repeat(code.length) + '○'.repeat(4 - code.length); draw(); $('pinHint').textContent = wallpaperHint || '';
    const done = ok => { box.classList.add('hidden'); GAME.overlay = false; GAME.busy = false; removeEventListener('keydown', kd, true); relock(); res(ok); };
    const press = d => { if (d === 'x') return done(false); if (d === '<') { code = code.slice(0, -1); draw(); return; } if (code.length >= 4) return; code += d; SFX.click(); draw();
      if (code.length === 4) { if (code === correct) { setTimeout(() => done(true), 350); } else { box.classList.add('shake'); SFX.vibrate(); setTimeout(() => { box.classList.remove('shake'); code = ''; draw(); }, 500); } } };
    $('pinKeys').onclick = e => { const b = e.target.closest('button'); if (b) press(b.dataset.k); };
    const kd = e => { if (/^\d$/.test(e.key)) press(e.key); else if (e.code === 'Backspace') press('<'); else if (e.code === 'Escape') press('x'); e.stopPropagation(); e.preventDefault(); }; addEventListener('keydown', kd, true);
  });
}
// ---- ampliação de foto: clique para dar zoom; achar o detalhe dentro de um retângulo (0..1)
function photoZoom(src, caption, rect, onFind) {
  return new Promise(res => {
    GAME.overlay = true; GAME.busy = true; if (INPUT.locked) document.exitPointerLock(); const box = $('photo'); box.classList.remove('hidden'); const img = $('photoImg'); img.src = src; $('photoCap').textContent = caption; $('photoNote').textContent = 'Clique em uma área para ampliar e realçar. Clique de novo para voltar.';
    let zoomed = false, found = false; img.style.transform = ''; img.style.filter = '';
    img.onclick = e => { const r = img.getBoundingClientRect(); const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
      if (!zoomed) { img.style.transformOrigin = `${u * 100}% ${v * 100}%`; img.style.transform = 'scale(3.4)'; img.style.filter = 'brightness(2.6) contrast(1.45) saturate(.6)'; zoomed = true; SFX.click();
        if (!found && u > rect[0] && u < rect[2] && v > rect[1] && v < rect[3]) { found = true; setTimeout(() => { $('photoNote').textContent = 'DETALHE: ' + onFind(); STING.hit(); }, 500); } }
      else { img.style.transform = ''; img.style.filter = ''; zoomed = false; } };
    const close = () => { box.classList.add('hidden'); GAME.overlay = false; GAME.busy = false; removeEventListener('keydown', kd, true); relock(); res(found); };
    INSP.photoFind = () => { if (!found) { found = true; onFind(); } close(); };
    const kd = e => { if (e.code === 'Escape' || e.code === 'KeyE') { e.preventDefault(); e.stopPropagation(); close(); } }; addEventListener('keydown', kd, true); $('photoClose').onclick = close;
  });
}
// ---- QTE: apertar E (ou tocar) várias vezes antes do tempo acabar
function qte(label, presses = 6, sec = 2.6) {
  return new Promise(res => {
    const box = $('qte'); box.classList.remove('hidden'); $('qteLabel').textContent = label; let n = 0, t0 = performance.now(); const bar = $('qteBar');
    const hit = () => { n++; SFX.click(); box.classList.add('pulse'); setTimeout(() => box.classList.remove('pulse'), 80); if (n >= presses) end(true); };
    const kd = e => { if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); hit(); } }; const md = e => { e.preventDefault(); hit(); };
    addEventListener('keydown', kd, true); box.addEventListener('pointerdown', md); R.renderer.domElement.addEventListener('pointerdown', md);
    const iv = setInterval(() => { const k = (performance.now() - t0) / 1000 / sec; bar.style.width = Math.max(0, 100 - k * 100) + '%'; $('qteCount').textContent = `${Math.min(n, presses)}/${presses}`; if (k >= 1) end(false); }, 30);
    let ended = false; function end(ok) { if (ended) return; ended = true; clearInterval(iv); removeEventListener('keydown', kd, true); box.removeEventListener('pointerdown', md); R.renderer.domElement.removeEventListener('pointerdown', md); box.classList.add('hidden'); res(ok); }
  });
}
// ---- câmera cinematográfica
const CAMR = { active: null };
function shot(pos, look, sec = 0, o = {}) {
  P.mode = 'cine'; GAME.camTarget = null; const cam = R.camera; const p0 = cam.position.clone(); const q0 = cam.quaternion.clone();
  const tmp = new THREE.PerspectiveCamera(); tmp.position.copy(pos); tmp.lookAt(look); const q1 = tmp.quaternion.clone(); faceLightOn(look, pos); const fov0 = cam.fov, fov1 = o.fov || 60;
  if (!sec) { cam.position.copy(pos); cam.quaternion.copy(q1); cam.fov = fov1; cam.updateProjectionMatrix(); CAMR.active = o.drift ? { drift: o.drift, t0: GAME.t } : null; CAMR.base = pos.clone(); CAMR.look = look.clone(); return Promise.resolve(); }
  const t0 = GAME.t; return new Promise(res => { GAME.anims.push(() => { const k = easeInOut((GAME.t - t0) / sec); cam.position.lerpVectors(p0, pos, k); cam.quaternion.slerpQuaternions(q0, q1, k); cam.fov = lerp(fov0, fov1, k); cam.updateProjectionMatrix(); if (k >= 1) { res(); return true; } }); });
}
function endShot() { faceLightOff(); const cam = R.camera; cam.fov = 68; cam.updateProjectionMatrix(); CAMR.active = null; const e = new THREE.Euler().setFromQuaternion(cam.quaternion, 'YXZ'); P.yaw = e.y; P.pitch = e.x; }
function updateCine(dt) { if (P.mode !== 'cine' || !CAMR.active) return; const c = CAMR.active; const t = GAME.t - c.t0; R.camera.position.copy(CAMR.base).addScaledVector(c.drift, t); R.camera.position.y += Math.sin(t * 1.3) * .004; }

// luz de rosto (key light cinematográfica) para conversas e planos fechados
function faceLightOn(target, from) {
  if (!R.faceLight) { R.faceLight = new THREE.SpotLight(0xffe6cc, 0, 5, .32, .85, 2); R.scene.add(R.faceLight, R.faceLight.target); }
  const L = R.faceLight; const d = V3().subVectors(from, target); const side = V3(-d.z, 0, d.x).normalize().multiplyScalar(.35);
  L.position.copy(target).add(d.multiplyScalar(.7)).add(side).add(V3(0, .3, 0)); L.target.position.copy(target); L.intensity = 2.6;
}
function faceLightOff() { if (R.faceLight) R.faceLight.intensity = 0; }
