// ---------------------------------------------------------------------------
// Inicialização, menu, laço principal
// ---------------------------------------------------------------------------
GAME.anims = []; GAME.tweens = [];
const yieldUI = () => new Promise(r => setTimeout(r, 16));
function progress(p, txt) { $('ldbar').style.width = (p * 100) + '%'; if (txt) $('ldtxt').textContent = txt; }
function buildEnv() {
  // ambiente de reflexo: corredor escuro com faixas de luz fria/quente (PMREM)
  const es = new THREE.Scene(); const box = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 30), new THREE.MeshBasicMaterial({ color: 0x0b0d14, side: THREE.BackSide })); es.add(box);
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(.06, .04, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(.3, .45, 2.2) })); s.position.set(i % 2 ? 1.1 : -1.1, 1.15, -12 + i * 5); es.add(s); }
  for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(.3, .02, .3), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.4, 1.6) })); s.position.set(rr(-1, 1), 1.18, -10 + i * 6); es.add(s); }
  const pm = new THREE.PMREMGenerator(R.renderer); const rt = pm.fromScene(es, .03); pm.dispose(); return rt.texture;
}
async function boot() {
  const save = loadSave(); let Q = parseInt($('optQ').value); if (IS_MOBILE) { Q = 0; $('optQ').value = '0'; }
  try { const s = JSON.parse(localStorage.getItem('voo0471_opts') || '{}'); if (s.q !== undefined && !IS_MOBILE) { Q = s.q; $('optQ').value = String(Q); } if (s.sens) $('optSens').value = s.sens; if (s.vol !== undefined) $('optVol').value = s.vol; } catch (e) { }
  progress(.05, 'Inicializando renderizador'); await yieldUI();
  initRenderer(Q);
  progress(.12, 'Tecendo tecidos e carpetes'); await yieldUI(); buildTextures(Q);
  progress(.35, 'Carregando céu noturno e lua'); await yieldUI();
  const imgs = await Promise.all(['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(k => loadImg(window.__ASSETS['sky_' + k])));
  TEX.skyCube = new THREE.CubeTexture(imgs); TEX.skyCube.needsUpdate = true;
  TEX.moon = new THREE.Texture(await loadImg(window.__ASSETS.moon)); TEX.moon.needsUpdate = true;
  const dirt = new THREE.Texture(await loadImg(window.__ASSETS.lensdirt)); dirt.needsUpdate = true; R.matFinal.uniforms.tDirt.value = dirt;
  progress(.55, 'Montando a fuselagem do A321neo'); await yieldUI();
  buildMaterials(buildEnv()); buildWorld();
  WORLD.curtain.geometry.translate(0, -.93, 0); WORLD.curtain.position.y = 2.04;
  progress(.62, 'Embarcando 192 passageiros'); await yieldUI();
  await loadPeople(p => progress(.62 + .26 * p));
  buildCast(); buildCrowd(new Set(['4A', '16D', '18D', '18E', '23A', '23B', '23C', '31F', '31E', '20C']));
  registerInteractions();
  progress(.9, 'Aquecendo shaders'); await yieldUI();
  drawECAM(WORLD.displays.ecam); drawSD(WORLD.displays.sd); drawIFE(WORLD.ife); drawFAP(WORLD.fap, false); drawOcc(false);
  // pose da câmera do menu: corredor escuro, olhando para o fundo
  R.camera.position.set(0, 1.62, 6.2); R.camera.rotation.set(-.04, Math.PI, 0); P.mode = 'cine';
  R.renderer.compile(R.scene, R.camera); renderFrame(0);
  initInput();
  progress(1, ''); await yieldUI();
  $('loading').classList.add('hidden'); $('title').classList.remove('hidden'); GAME.fxT.fade = 0; GAME.fx.fade = 1;
  let cont = false; try { cont = sessionStorage.getItem('voo0471_continue') === '1'; sessionStorage.removeItem('voo0471_continue'); } catch (e) { }
  if (save) $('btnContinue').classList.remove('hidden');
  const saveOpts = () => { try { localStorage.setItem('voo0471_opts', JSON.stringify({ q: parseInt($('optQ').value), sens: $('optSens').value, vol: $('optVol').value })); } catch (e) { } };
  $('optSens').oninput = () => { P.sens = parseFloat($('optSens').value); saveOpts(); }; $('optVol').oninput = () => { audioSetVolume(parseFloat($('optVol').value)); saveOpts(); }; $('optQ').onchange = () => { saveOpts(); location.reload(); };
  P.sens = parseFloat($('optSens').value); AU.vol = parseFloat($('optVol').value);
  $('btnStart').onclick = () => begin(false); $('btnContinue').onclick = () => begin(true);
  $('btnCredits').onclick = () => showCredits(false);
  requestAnimationFrame(loop);
  if (cont && save) begin(true);
}
function begin(cont) {
  initAudio(); $('title').classList.add('hidden'); $('hud').classList.remove('hidden'); GAME.started = true;
  if (IS_TOUCH) $('touch').classList.remove('hidden'); else { try { const p = R.renderer.domElement.requestPointerLock(); if (p && p.catch) p.catch(() => { INPUT.lockFailed = true; }); } catch (e) { INPUT.lockFailed = true; } }
  if (cont) {
    const s = loadSave(); if (s) { (s.clues || []).forEach(c => GAME.clues.add(c)); Object.assign(GAME.flags, s.flags || {}); }
    for (const k of ['diegoGone', 'warn1', 'timeout', 'aftRinging']) delete GAME.flags[k]; GAME.flags.called = GAME.flags.ckOpened = true;
    TRIGGERS.forEach(t => t.done = true); FLT.divert = true; GAME.clockBase = 5 * 60 + 2; GAME.clockT0 = GAME.t; PEOPLE.npcs.camila.g.position.set(.35, 0, -4.25);
    if (GAME.flags.knifeFound) WORLD.trolleys[4].position.z -= .45;
    startMarta(true);
  } else { GAME.clockBase = 4 * 60 + 38; GAME.clockT0 = 0; startPrologue(); }
}
function showCredits(end) {
  const el = $('credits'); el.classList.remove('hidden'); if (INPUT.locked) document.exitPointerLock();
  $('crInner').innerHTML = `<h2>VOO 0471 — ALTITUDE DE CRUZEIRO</h2><p>Um suspense de investigação em primeira pessoa a bordo de um Airbus A321neoLR em cruzeiro noturno sobre o Atlântico.</p>
  <h2>ASSETS REAIS UTILIZADOS</h2>
  <p><b>Pessoas</b>: 23 avatares da <b>Microsoft Rocketbox Avatar Library</b> (licença MIT, © 2020 Microsoft), com esqueleto de 81 ossos, blendshapes faciais ARKit e visemas, e animações de captura de movimento (sentar, andar, correr, gesticular, bater na porta, falar ao telefone). github.com/microsoft/Microsoft-Rocketbox</p>
  <p><b>Trilha sonora</b>: notas reais do banco <b>FluidR3 GM</b> de Frank Wen (Creative Commons Attribution 3.0), via github.com/gleitz/midi-js-soundfonts: contrabaixo, cello, cordas, violino, coro, piano, tímpanos, taiko, prato reverso, orchestra hit e celesta.</p>
  <p><b>Céu estrelado, lua e sujeira de lente</b>: exemplos do three.js. <b>Motor gráfico</b>: three.js r160 (MIT), GLTFLoader e meshoptimizer (MIT).</p>
  <h2>RECRIADO A PARTIR DE DADOS REAIS</h2>
  <p>Seção de cabine da família A320 (largura 3,70 m, pitch de 31"/79 cm, configuração 3-3, corredor ~50 cm), telas PFD/ND/ECAM no padrão Airbus, procedimentos de cabine (regra dos dois no cockpit, destrave externo do lavatório, sinal de cintos, kit de contenção), alternado ETOPS no Sal (GVAC), Convenção de Tóquio (1963) sobre a autoridade do comandante.</p>
  <p>Todo o áudio — ruído de fuselagem, zumbido dos fans LEAP-1A, ar-condicionado, vento no para-brisa, chimes, passos, batimentos e trilha — é sintetizado em tempo real com Web Audio (convolução, HRTF 3D). Texturas de tecido, carpete, couro, metal escovado e sangue são geradas proceduralmente.</p>
  <h2>FICÇÃO</h2><p>Atlântica Linhas Aéreas, o voo AT0471, a Operação Maré Alta e todos os personagens são fictícios.</p>
  <p style="margin-top:28px"><button id="crBack" style="color:#e8b25a;letter-spacing:.2em;text-transform:uppercase">${end ? 'Jogar novamente' : 'Voltar'}</button></p>`;
  $('crBack').onclick = () => end ? location.reload() : el.classList.add('hidden');
}
const _clock = new THREE.Clock(); let _accD = 0, _accN = 0, _accI = 0, _accF = 0;
function angDiff(a, b) { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; }
function loop() {
  requestAnimationFrame(loop); const dt = Math.min(.05, _clock.getDelta()) * (GAME.speed || 1);
  if (!GAME.paused) {
    GAME.t += dt;
    for (let i = GAME.timers.length - 1; i >= 0; i--) if (GAME.timers[i].t <= GAME.t) { const r = GAME.timers[i].r; GAME.timers.splice(i, 1); r(); }
    for (let i = GAME.anims.length - 1; i >= 0; i--) if (GAME.anims[i](dt)) GAME.anims.splice(i, 1);
  }
  const fx = GAME.fx, act = new Set();
  for (let i = GAME.tweens.length - 1; i >= 0; i--) { const w = GAME.tweens[i]; const k = clamp((GAME.t - w.t0) / w.sec, 0, 1); fx[w.k] = lerp(w.from, w.v, smooth(k)); act.add(w.k); if (k >= 1) { GAME.tweens.splice(i, 1); w.res(); } }
  for (const k in GAME.fxT) if (!act.has(k)) fx[k] = damp(fx[k], GAME.fxT[k], 2.5, dt);
  fx.flash = Math.max(0, fx.flash - dt * 1.4);
  if (GAME.started && !GAME.paused) {
    updatePlayer(dt);
    if (P.mode === 'talk' && GAME.camTarget) { const c = R.camera.position, t = GAME.camTarget; const ty = Math.atan2(-(t.x - c.x), -(t.z - c.z)), tp = Math.atan2(t.y - c.y, Math.hypot(t.x - c.x, t.z - c.z)); P.yaw += angDiff(P.yaw, ty) * (1 - Math.exp(-4 * dt)); P.pitch = damp(P.pitch, tp, 4, dt); R.camera.rotation.set(P.pitch, P.yaw, 0); faceLightOn(t, c); R.camera.fov = damp(R.camera.fov, 48, 3, dt); R.camera.updateProjectionMatrix(); }
    else if (P.mode === 'walk' && Math.abs(R.camera.fov - 68) > .05) { R.camera.fov = damp(R.camera.fov, 68, 4, dt); R.camera.updateProjectionMatrix(); if (Math.abs(R.camera.fov - 68) < .3) faceLightOff(); }
  } else if (!GAME.started) { const t = GAME.t; R.camera.position.set(Math.sin(t * .1) * .03, 1.62 + Math.sin(t * .37) * .01, 6.2 + t * .03 % 20); R.camera.rotation.set(-.04 + Math.sin(t * .2) * .01, Math.PI + Math.sin(t * .13) * .05, Math.sin(t * .3) * .004); }
  updateDialog(dt); storyUpdate(dt); musicTick(); updateCine(dt);
  const cp = R.camera.position;
  updatePeople(dt * (GAME.slow || 1), GAME.t, cp);
  // cortina da executiva
  if (WORLD.curtain) { const d = Math.abs(cp.z - LAY.divZ), on = d < 1.1 && Math.abs(cp.x) < .5; const tgt = on ? Math.sign(cp.z - LAY.divZ || 1) * -.0 + (cp.z < LAY.divZ ? 1 : -1) * 1.1 * (1 - d / 1.1) : 0; WORLD.curtain.rotation.x = damp(WORLD.curtain.rotation.x, tgt + Math.sin(GAME.t * .7) * .02, 5, dt); }
  // luz do lavatório (reator fluorescente cansado)
  const L = WORLD.lights; if (L.lav) { let li = GAME.flags.lavOpened ? 2.8 : 1.6; if (flickLav > 0) { flickLav -= dt; li *= rand() < .5 ? .05 : 1.2; } else if (rand() < .006) li *= .2; L.lav.intensity = li; MAT.lavLight.color.setRGB(.85 * li * .8, .95 * li * .8, li * .8); }
  // estroboscópica de ponta de asa vista pelas janelas (duplo flash a cada 1 s)
  const sp = GAME.t % 1.0; MAT.sky.uniforms.uStrobe.value = (sp < .05 || (sp > .12 && sp < .17)) ? 1 : 0; MAT.sky.uniforms.uTime.value = GAME.t;
  // telas
  _accD += dt; _accN += dt; _accI += dt; _accF += dt;
  if (cp.z < -2 && _accD > .1) { _accD = 0; drawPFD(WORLD.displays.pfd1, GAME.t); drawPFD(WORLD.displays.pfd2, GAME.t); }
  if (cp.z < -2 && _accN > 1) { _accN = 0; drawND(WORLD.displays.nd1, GAME.t); drawND(WORLD.displays.nd2, GAME.t); drawECAM(WORLD.displays.ecam); }
  if (_accI > 3) { _accI = 0; const m = GAME.clockBase + Math.floor((GAME.t - (GAME.clockT0 || 0)) / 60); GAME.clockStr = `${fmt2(Math.floor(m / 60) % 24)}:${fmt2(m % 60)}`; $('clock').textContent = GAME.clockStr + ' UTC'; $('fl').textContent = FLT.divert ? 'FL370 · DESVIO GVAC' : 'FL370 · M.78 · ETOPS'; drawIFE(WORLD.ife); }
  if (_accF > 5) { _accF = 0; drawFAP(WORLD.fap, GAME.chapter === 'climax'); }
  if (WORLD.dust) WORLD.dust.rotation.y = Math.sin(GAME.t * .05) * .002;
  if (INPUT.locked) $('clickToPlay').classList.add('hidden');
  const z = zoneOf(cp.x, cp.z); audioUpdate(dt, R.camera, z);
  const U = R.matFinal.uniforms; U.uFade.value = fx.fade; U.uFocus.value = fx.focus; U.uDesat.value = fx.desat; U.uRed.value = fx.red; U.uFlash.value = fx.flash; U.uExposure.value = fx.exposure * (z === 'cockpit' ? 2.0 : 1.75);
  U.uGrain.value = R.Q >= 1 ? .055 : .04; U.uLB.value = 0;
  if (!GAME.norender) renderFrame(GAME.t);
}
boot().catch(e => { console.error(e); $('ldtxt').textContent = 'Erro ao iniciar: ' + e.message; });
if (/debug/.test(location.search)) { GAME.norender = /norender/.test(location.search); GAME.speed = parseFloat((location.search.match(/speed=([\d.]+)/) || [])[1] || 1); window.__DBG = { INSP, dialogAdvance, GAME, P, R, WORLD, PEOPLE, CHARS, MAT, TEX, FLT, LAY, UI, rowZ, seatPos, lightsDark, renderFrame, AU, STORY, Person, bakeAvatar, begin }; }
