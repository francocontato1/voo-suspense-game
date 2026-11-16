// ---------------------------------------------------------------------------
// Áudio procedural (Web Audio): ruído de cabine, motores LEAP-1A, ar-condicionado,
// vento no para-brisa, chimes Airbus, passos, trilha de tensão com reverb.
// ---------------------------------------------------------------------------
const AU = { ctx: null, ready: false, tension: 0, vol: .85 };
function noiseBuffer(ctx, sec, type) {
  const n = Math.floor(ctx.sampleRate * sec); const b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'pink') { b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926; }
      else if (type === 'brown') { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      else d[i] = w;
    }
    // crossfade para loop sem emenda
    const f = Math.floor(ctx.sampleRate * .05); for (let i = 0; i < f; i++) { const t = i / f; d[i] = d[i] * t + d[n - f + i] * (1 - t); }
  }
  return b;
}
function impulse(ctx, sec, decay) {
  const n = Math.floor(ctx.sampleRate * sec); const b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
  return b;
}
function initAudio() {
  if (AU.ctx) { AU.ctx.resume(); return; }
  const ctx = new (window.AudioContext || window.webkitAudioContext)(); AU.ctx = ctx;
  const master = ctx.createGain(); master.gain.value = AU.vol; const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3.5; comp.attack.value = .01; comp.release.value = .3;
  master.connect(comp); comp.connect(ctx.destination); AU.master = master;
  AU.bufPink = noiseBuffer(ctx, 6, 'pink'); AU.bufBrown = noiseBuffer(ctx, 6, 'brown'); AU.bufWhite = noiseBuffer(ctx, 3, 'white');
  // reverb curto (cabine absorvente) e longo (trilha)
  AU.rvS = ctx.createConvolver(); AU.rvS.buffer = impulse(ctx, .55, 4); const rvSg = ctx.createGain(); rvSg.gain.value = .35; AU.rvS.connect(rvSg); rvSg.connect(master);
  AU.rvL = ctx.createConvolver(); AU.rvL.buffer = impulse(ctx, 4.5, 2.2); const rvLg = ctx.createGain(); rvLg.gain.value = .6; AU.rvL.connect(rvLg); rvLg.connect(master);
  AU.sfx = ctx.createGain(); AU.sfx.gain.value = 1; AU.sfx.connect(master); AU.sfx.connect(AU.rvS);
  const loop = (buf, rate = 1) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate; s.start(); return s; };
  // ---- leito de ruído de cabine (fluxo de ar na fuselagem + motores)
  const bed = loop(AU.bufBrown); const bedLP = ctx.createBiquadFilter(); bedLP.type = 'lowpass'; bedLP.frequency.value = 650; const bedPk = ctx.createBiquadFilter(); bedPk.type = 'peaking'; bedPk.frequency.value = 115; bedPk.gain.value = 7; bedPk.Q.value = .9;
  AU.bedG = ctx.createGain(); AU.bedG.gain.value = .0; bed.connect(bedLP); bedLP.connect(bedPk); bedPk.connect(AU.bedG); AU.bedG.connect(master);
  const pink = loop(AU.bufPink); const pinkBP = ctx.createBiquadFilter(); pinkBP.type = 'bandpass'; pinkBP.frequency.value = 420; pinkBP.Q.value = .5; AU.flowG = ctx.createGain(); AU.flowG.gain.value = 0; pink.connect(pinkBP); pinkBP.connect(AU.flowG); AU.flowG.connect(master);
  // ar-condicionado / gaspers
  const wh = loop(AU.bufWhite, .97); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2600; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8000; AU.airG = ctx.createGain(); AU.airG.gain.value = 0; wh.connect(hp); hp.connect(lp); lp.connect(AU.airG); AU.airG.connect(master);
  // vento no para-brisa (cockpit)
  const wn = loop(AU.bufPink, 1.03); const wbp = ctx.createBiquadFilter(); wbp.type = 'bandpass'; wbp.frequency.value = 1400; wbp.Q.value = .35; AU.windG = ctx.createGain(); AU.windG.gain.value = 0; wn.connect(wbp); wbp.connect(AU.windG); AU.windG.connect(master);
  const wl = ctx.createOscillator(); wl.frequency.value = .09; const wlg = ctx.createGain(); wlg.gain.value = 220; wl.connect(wlg); wlg.connect(wbp.frequency); wl.start();
  // motores: zumbido do fan (passagem de pás) + roncos graves
  AU.engG = ctx.createGain(); AU.engG.gain.value = 0; AU.engG.connect(master);
  const fanBP = ctx.createBiquadFilter(); fanBP.type = 'bandpass'; fanBP.frequency.value = 995; fanBP.Q.value = 6; fanBP.connect(AU.engG);
  [[993, 'triangle', .05], [1001.5, 'triangle', .04], [497, 'sine', .05]].forEach(([f, t, g]) => { const o = ctx.createOscillator(); o.type = t; o.frequency.value = f; const gg = ctx.createGain(); gg.gain.value = g; o.connect(gg); gg.connect(fanBP); o.start(); });
  [[57, .32], [61.3, .22], [114, .08], [29, .25]].forEach(([f, g]) => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; const gg = ctx.createGain(); gg.gain.value = g; o.connect(gg); gg.connect(AU.engG); o.start(); });
  // ---- trilha: drones de tensão
  AU.mus = ctx.createGain(); AU.mus.gain.value = 0; const musLP = ctx.createBiquadFilter(); musLP.type = 'lowpass'; musLP.frequency.value = 520; musLP.Q.value = 2; AU.musLP = musLP; musLP.connect(AU.mus); AU.mus.connect(master); AU.mus.connect(AU.rvL);
  [55, 55.4, 82.4, 116.5, 116.9, 164.8].forEach((f, i) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = .045; const l = ctx.createOscillator(); l.frequency.value = .05 + i * .021; const lg = ctx.createGain(); lg.gain.value = .03; l.connect(lg); lg.connect(g.gain); l.start(); o.connect(g); g.connect(musLP); o.start(); });
  const ml = ctx.createOscillator(); ml.frequency.value = .031; const mlg = ctx.createGain(); mlg.gain.value = 260; ml.connect(mlg); mlg.connect(musLP.frequency); ml.start();
  AU.glass = ctx.createGain(); AU.glass.gain.value = 0; AU.glass.connect(master); AU.glass.connect(AU.rvL);
  [1760, 1864.7, 2349].forEach(f => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = .012; o.connect(g); g.connect(AU.glass); o.start(); });
  AU.pulse = ctx.createGain(); AU.pulse.gain.value = 0; AU.pulse.connect(master);
  { const o = ctx.createOscillator(); o.frequency.value = 41; const g = ctx.createGain(); g.gain.value = 0; const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 1.15; const lg = ctx.createGain(); lg.gain.value = .5; lfo.connect(lg); lg.connect(g.gain); g.gain.value = .5; o.connect(g); g.connect(AU.pulse); o.start(); lfo.start(); }
  AU.ready = true; loadMusic();
}
function audioSetVolume(v) { AU.vol = v; if (AU.master) AU.master.gain.setTargetAtTime(v, AU.ctx.currentTime, .1); }
// mixagem por zona: z do jogador e se está no cockpit
function audioUpdate(dt, cam, zone, muffle) {
  if (!AU.ready) return; const t = AU.ctx.currentTime;
  const z = cam.position.z; const ck = zone === 'cockpit' ? 1 : 0; const lav = zone === 'lav' ? 1 : 0;
  const engNear = clamp(1 - Math.abs(z - 16) / 14, 0, 1); const aft = clamp((z - 10) / 18, 0, 1);
  const k = muffle === undefined ? 1 : muffle;
  AU.bedG.gain.setTargetAtTime((.24 + .12 * aft + .08 * engNear - .06 * ck) * k, t, .3);
  AU.flowG.gain.setTargetAtTime((.10 + .05 * aft + .12 * ck) * k, t, .3);
  AU.airG.gain.setTargetAtTime((.010 + .012 * ck) * k * (1 - .5 * lav), t, .3);
  AU.windG.gain.setTargetAtTime((.02 + .11 * ck) * k, t, .3);
  AU.engG.gain.setTargetAtTime((.05 + .14 * engNear + .05 * aft - .04 * ck) * k, t, .3);
  const T = AU.tension; AU.mus.gain.setTargetAtTime((.10 + T * .55) * (MUS.ready ? .25 : 1), t, 1.5); AU.musLP.frequency.setTargetAtTime(380 + T * 900, t, 2);
  AU.glass.gain.setTargetAtTime(T > .45 ? (T - .45) * .9 : 0, t, 2); AU.pulse.gain.setTargetAtTime(T > .6 ? (T - .6) * .9 : 0, t, 1);
  // ouvinte HRTF
  const L = AU.ctx.listener; const f = V3(0, 0, -1).applyQuaternion(cam.quaternion), u = V3(0, 1, 0).applyQuaternion(cam.quaternion);
  if (L.positionX) { L.positionX.value = cam.position.x; L.positionY.value = cam.position.y; L.positionZ.value = cam.position.z; L.forwardX.value = f.x; L.forwardY.value = f.y; L.forwardZ.value = f.z; L.upX.value = u.x; L.upY.value = u.y; L.upZ.value = u.z; }
  else { L.setPosition(cam.position.x, cam.position.y, cam.position.z); L.setOrientation(f.x, f.y, f.z, u.x, u.y, u.z); }
}
function outAt(pos) {
  if (!pos) return AU.sfx; const p = AU.ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 1; p.rolloffFactor = 1.2;
  if (p.positionX) { p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z; } else p.setPosition(pos.x, pos.y, pos.z);
  p.connect(AU.sfx); return p;
}
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
function noiseShot(dest, t, dur, ftype, freq, q, peak, rate = 1) {
  const s = AU.ctx.createBufferSource(); s.buffer = AU.bufWhite; s.playbackRate.value = rate; const f = AU.ctx.createBiquadFilter(); f.type = ftype; f.frequency.value = freq; f.Q.value = q || .7; const g = AU.ctx.createGain(); env(g, t, .004, peak, dur);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 2); s.stop(t + dur + .1); return f;
}
function tone(dest, t, freq, type, dur, peak, a = .005) { const o = AU.ctx.createOscillator(); o.type = type; o.frequency.value = freq; const g = AU.ctx.createGain(); env(g, t, a, peak, dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + a + dur + .05); return o; }
const SFX = {
  chime(kind = 'single', pos) { if (!AU.ready) return; const t = AU.ctx.currentTime, d = outAt(pos || V3(0, 2, 6)); const bell = (t0, f) => { tone(d, t0, f, 'sine', 1.6, .22); tone(d, t0, f * 2.01, 'sine', .7, .06); tone(d, t0, f * 3.02, 'sine', .35, .025); };
    if (kind === 'single') bell(t, 1175); else if (kind === 'hilo') { bell(t, 1175); bell(t + .55, 932); } else { bell(t, 1175); bell(t + .55, 932); bell(t + 1.6, 1175); bell(t + 2.15, 932); } },
  buzzer() { if (!AU.ready) return; const t = AU.ctx.currentTime; for (let i = 0; i < 3; i++) { const o = tone(AU.sfx, t + i * .42, 380, 'square', .26, .07, .01); } },
  step(surface, intensity = 1) { if (!AU.ready) return; const t = AU.ctx.currentTime; if (surface === 'hard') { noiseShot(AU.sfx, t, .06, 'bandpass', 1500 + Math.random() * 400, 1.2, .09 * intensity); noiseShot(AU.sfx, t, .1, 'lowpass', 220, .7, .25 * intensity); } else { noiseShot(AU.sfx, t, .11, 'lowpass', 260 + Math.random() * 80, .7, .3 * intensity); noiseShot(AU.sfx, t + .02, .07, 'bandpass', 2400, 1, .012 * intensity); } },
  click(pos) { if (!AU.ready) return; const t = AU.ctx.currentTime; noiseShot(outAt(pos), t, .025, 'highpass', 3000, .7, .35); },
  latch(pos) { if (!AU.ready) return; const t = AU.ctx.currentTime, d = outAt(pos); noiseShot(d, t, .04, 'bandpass', 2200, 2, .5); noiseShot(d, t + .09, .12, 'lowpass', 500, 1, .5); tone(d, t + .09, 140, 'sine', .15, .2); },
  door(pos) { if (!AU.ready) return; const t = AU.ctx.currentTime, d = outAt(pos); noiseShot(d, t, .05, 'bandpass', 1800, 2, .4); const f = noiseShot(d, t + .05, .7, 'bandpass', 600, 4, .12); f.frequency.linearRampToValueAtTime(300, t + .7); noiseShot(d, t + .75, .18, 'lowpass', 300, .7, .6); },
  heartbeat(k = 1) { if (!AU.ready) return; const t = AU.ctx.currentTime; [0, .28].forEach((o, i) => { const os = AU.ctx.createOscillator(); os.frequency.setValueAtTime(70, t + o); os.frequency.exponentialRampToValueAtTime(38, t + o + .12); const g = AU.ctx.createGain(); env(g, t + o, .01, (i ? .5 : .7) * k, .18); os.connect(g); g.connect(AU.master); os.start(t + o); os.stop(t + o + .3); }); },
  stinger(k = 1) { if (!AU.ready) return; const t = AU.ctx.currentTime; const lp = AU.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(5000, t); lp.frequency.exponentialRampToValueAtTime(300, t + 3); const g = AU.ctx.createGain(); env(g, t, .01, .22 * k, 3.5); lp.connect(g); g.connect(AU.master); g.connect(AU.rvL);
    [73.4, 77.8, 110, 155.6, 233.1, 311.1, 466.2].forEach(f => { const o = AU.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * (1 + (Math.random() - .5) * .01); o.connect(lp); o.start(t); o.stop(t + 4); });
    noiseShot(AU.rvL, t, 1.2, 'highpass', 4000, .5, .25 * k); const sub = tone(AU.master, t, 48, 'sine', 2.2, .6 * k); sub.frequency.exponentialRampToValueAtTime(28, t + 2); },
  riser(sec = 4) { if (!AU.ready) return; const t = AU.ctx.currentTime; const s = AU.ctx.createBufferSource(); s.buffer = AU.bufWhite; const f = AU.ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(6000, t + sec); const g = AU.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.25, t + sec); g.gain.linearRampToValueAtTime(0, t + sec + .05); s.connect(f); f.connect(g); g.connect(AU.master); g.connect(AU.rvL); s.start(t); s.stop(t + sec + .1);
    const o = AU.ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(900, t + sec); const og = AU.ctx.createGain(); og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(.08, t + sec); og.gain.linearRampToValueAtTime(0, t + sec + .05); o.connect(og); og.connect(AU.rvL); o.start(t); o.stop(t + sec + .1); },
  turbulence(sec = 3, k = 1) { if (!AU.ready) return; const t = AU.ctx.currentTime; for (let i = 0; i < sec * 6; i++) { const tt = t + Math.random() * sec; noiseShot(AU.sfx, tt, .25, 'lowpass', 120, .7, .5 * k); }
    for (let i = 0; i < sec * 3; i++) { const tt = t + Math.random() * sec; tone(outAt(V3(rr(-1.5, 1.5), 1, rr(-2, 30))), tt, 2200 + Math.random() * 2600, 'sine', .25, .05 * k); }
    for (let i = 0; i < sec * 2; i++) { const tt = t + Math.random() * sec; noiseShot(outAt(V3(rr(-1.7, 1.7), 1.7, rr(0, 28))), tt, .09, 'bandpass', 700, 3, .25 * k); } },
  creak(pos) { if (!AU.ready) return; const t = AU.ctx.currentTime, d = outAt(pos); const o = AU.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(60, t); o.frequency.linearRampToValueAtTime(42, t + 1.2); const f = AU.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 9; const g = AU.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.18, t + .3); g.gain.linearRampToValueAtTime(0, t + 1.3); const am = AU.ctx.createOscillator(); am.frequency.value = 23; const amg = AU.ctx.createGain(); amg.gain.value = .1; am.connect(amg); amg.connect(g.gain); o.connect(f); f.connect(g); g.connect(d); o.start(t); am.start(t); o.stop(t + 1.4); am.stop(t + 1.4); },
  vibrate(pos) { if (!AU.ready) return; const t = AU.ctx.currentTime, d = outAt(pos); for (let i = 0; i < 2; i++) { const o = tone(d, t + i * .55, 170, 'sawtooth', .35, .05, .02); } },
  flashlight() { SFX.click(); },
  breath(k = 1) { if (!AU.ready) return; const t = AU.ctx.currentTime; const f = noiseShot(AU.master, t, .5, 'bandpass', 900, 1.2, .07 * k); const f2 = noiseShot(AU.master, t + .55, .6, 'bandpass', 650, 1.2, .05 * k); },
  thud(pos, k = 1) { if (!AU.ready) return; const t = AU.ctx.currentTime, d = outAt(pos); noiseShot(d, t, .25, 'lowpass', 160, .7, .9 * k); tone(d, t, 55, 'sine', .3, .5 * k); },
  scream(pos) { if (!AU.ready) return; const t = AU.ctx.currentTime, d = outAt(pos); const o = AU.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(760, t + .25); o.frequency.linearRampToValueAtTime(610, t + 1.1); const vib = AU.ctx.createOscillator(); vib.frequency.value = 6; const vg = AU.ctx.createGain(); vg.gain.value = 18; vib.connect(vg); vg.connect(o.frequency);
    const fs = [800, 1150, 2900].map(fr => { const f = AU.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fr; f.Q.value = 6; return f; }); const g = AU.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + .08); g.gain.linearRampToValueAtTime(.35, t + .8); g.gain.linearRampToValueAtTime(0, t + 1.25);
    const lp = AU.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; fs.forEach(f => { o.connect(f); f.connect(g); }); g.connect(lp); lp.connect(d); o.start(t); vib.start(t); o.stop(t + 1.3); vib.stop(t + 1.3); noiseShot(d, t, 1.1, 'bandpass', 2500, 1, .05); },
  murmur(pos, sec = 1.6) { if (!AU.ready) return; const t = AU.ctx.currentTime, d = outAt(pos); const n = Math.floor(sec * 5); for (let i = 0; i < n; i++) { const tt = t + i * (sec / n) + Math.random() * .05; const o = AU.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110 + Math.random() * 60, tt); o.frequency.linearRampToValueAtTime(100 + Math.random() * 50, tt + .18); const f = AU.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500 + Math.random() * 700; f.Q.value = 3; const g = AU.ctx.createGain(); env(g, tt, .03, .05, .16); const lp = AU.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; o.connect(f); f.connect(g); g.connect(lp); lp.connect(d); o.start(tt); o.stop(tt + .25); } },
};
