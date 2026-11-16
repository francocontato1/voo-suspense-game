// ---------------------------------------------------------------------------
// Trilha sonora com instrumentos reais (amostras FluidR3 GM, CC BY 3.0):
// contrabaixo, cello, cordas em tremolo, violino, coro, piano, tímpanos, taiko,
// prato reverso, orchestra hit e celesta — tocados por um "diretor musical"
// com estados (calma, tensão, pavor, perseguição, final) e stingers de susto.
// ---------------------------------------------------------------------------
const MUS = { buf: {}, rev: {}, ready: false, state: 'silence', next: 0, beat: 0, vol: 1 };
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteMidi(n) { const m = /^([A-G])(b|#)?(-?\d)$/.exec(n); return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0); }
function impulseRoom(ctx, sec, decay, bright) {
  const sr = ctx.sampleRate, n = Math.floor(sr * sec), b = ctx.createBuffer(2, n, sr);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let lp = 0;
    for (let i = 0; i < n; i++) { const t = i / n; const a = Math.pow(1 - t, decay); const k = bright * (1 - t * .85); lp += (Math.random() * 2 - 1 - lp) * k; d[i] = lp * a; }
    for (let e = 0; e < 14; e++) { const i = Math.floor(sr * (.008 + Math.random() * .07)); if (i < n) d[i] += (Math.random() - .5) * .9 * (1 - e / 14); } }
  return b;
}
async function loadMusic() {
  try {
    const raw = JSON.parse(new TextDecoder().decode(await assetBuf('music.json'))); const ctx = AU.ctx; const jobs = [];
    for (const inst in raw) { MUS.buf[inst] = []; for (const n in raw[inst]) jobs.push(ctx.decodeAudioData(b64ToBuf(raw[inst][n])).then(buf => MUS.buf[inst].push({ m: noteMidi(n), buf })).catch(() => { })); }
    await Promise.all(jobs);
    MUS.bus = ctx.createGain(); MUS.bus.gain.value = .9; MUS.bus.connect(AU.master);
    MUS.rev = ctx.createConvolver(); MUS.rev.buffer = impulseRoom(ctx, 5.5, 2.4, .35); MUS.revG = ctx.createGain(); MUS.revG.gain.value = .55; MUS.rev.connect(MUS.revG); MUS.revG.connect(AU.master);
    MUS.send = ctx.createGain(); MUS.send.gain.value = .8; MUS.bus.connect(MUS.send); MUS.send.connect(MUS.rev);
    MUS.ready = true;
  } catch (e) { console.warn('música indisponível', e); }
}
function reversed(buf) { if (buf._rev) return buf._rev; const r = AU.ctx.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate); for (let c = 0; c < buf.numberOfChannels; c++) { const s = buf.getChannelData(c), d = r.getChannelData(c); for (let i = 0; i < s.length; i++) d[i] = s[s.length - 1 - i]; } buf._rev = r; return r; }
// toca uma nota real: inst, nota midi (ou nome), início, duração, intensidade, opções
function playS(inst, note, t, dur, vel = .8, o = {}) {
  if (!MUS.ready || !MUS.buf[inst] || !MUS.buf[inst].length) return null; const ctx = AU.ctx; const midi = typeof note === 'string' ? noteMidi(note) : note;
  let best = MUS.buf[inst][0]; for (const s of MUS.buf[inst]) if (Math.abs(s.m - midi) < Math.abs(best.m - midi)) best = s;
  const src = ctx.createBufferSource(); src.buffer = o.reverse ? reversed(best.buf) : best.buf; const rate = Math.pow(2, (midi - best.m) / 12) * (o.rate || 1); src.playbackRate.setValueAtTime(rate, t);
  if (o.glide) src.playbackRate.linearRampToValueAtTime(rate * o.glide, t + dur);
  if (o.loop) { src.loop = true; src.loopStart = .35; src.loopEnd = Math.max(.6, best.buf.duration * .75); }
  const g = ctx.createGain(); const att = o.att || .008, rel = o.rel || .5; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + att); g.gain.setValueAtTime(vel, t + Math.max(att, dur)); g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(att, dur) + rel);
  let node = src; if (o.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; node.connect(f); node = f; }
  if (o.bp) { const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.bp; f.Q.value = 1.2; node.connect(f); node = f; }
  node.connect(g); if (o.pan) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p); p.connect(o.dest || MUS.bus); } else g.connect(o.dest || MUS.bus);
  src.start(t, o.offset || 0); src.stop(t + Math.max(att, dur) + rel + .1); return src;
}
function setMusic(state) { if (MUS.state === state) return; MUS.state = state; MUS.next = AU.ctx ? AU.ctx.currentTime + .3 : 0; MUS.beat = 0; if (MUS.bus) { const t = AU.ctx.currentTime; MUS.bus.gain.cancelScheduledValues(t); MUS.bus.gain.setValueAtTime(MUS.bus.gain.value, t); MUS.bus.gain.linearRampToValueAtTime(state === 'silence' ? 0 : .9, t + 1.5); } }
const DM = ['D2', 'F2', 'A2', 'D3', 'F3', 'A3'];
function musicTick() {
  if (!MUS.ready || !AU.ctx) return; const ctx = AU.ctx, now = ctx.currentTime; if (now + .25 < MUS.next) return; const t = Math.max(now + .05, MUS.next); const S = MUS.state;
  if (S === 'calm') {
    playS('string_ensemble_1', pick(['D2', 'A1']), t, 9, .16, { att: 3.5, rel: 4, lp: 900 }); playS('string_ensemble_1', pick(['A2', 'F2']), t + .3, 9, .12, { att: 4, rel: 4, lp: 1200 });
    if (rand() < .55) { const mel = [pick(['D5', 'F5']), pick(['A5', 'E5']), pick(['C6', 'D5']), 'A5']; mel.forEach((n, i) => playS('celesta', n, t + 2 + i * 1.1, 1.6, .11, { lp: 3500, pan: -.2 })); }
    if (rand() < .4) playS('acoustic_grand_piano', pick(['A1', 'D2', 'A0']), t + rr(1, 5), 4, .2, { lp: 1400 });
    MUS.next = t + rr(8, 11);
  } else if (S === 'tension') {
    playS('contrabass', 'D1', t, 7, .32, { att: 1.5, rel: 3, loop: true }); playS('cello', 'D3', t + .4, 6, .13, { att: 2.5, rel: 3, loop: true }); playS('cello', 'Eb3', t + 1.4, 5, .1, { att: 2.5, rel: 3, loop: true });
    for (let b = 0; b < 3; b++) { playS('pizzicato_strings', 'D2', t + b * 2.2, .6, .42); playS('pizzicato_strings', 'D2', t + b * 2.2 + .32, .6, .3); }
    if (rand() < .35) playS('tremolo_strings', pick(['A5', 'Bb5']), t + 2, 4, .07, { att: 3, rel: 2, bp: 2400 });
    if (rand() < .3) playS('acoustic_grand_piano', pick(['D4', 'Bb4', 'A3']), t + rr(1, 5), 3, .16);
    MUS.next = t + 6.6;
  } else if (S === 'dread') {
    playS('tremolo_strings', 'D5', t, 6, .1, { att: 4, rel: 2.5, bp: 2000, loop: true }); playS('tremolo_strings', 'Eb5', t + .5, 5.5, .08, { att: 4, rel: 2.5, bp: 2200, loop: true }); playS('tremolo_strings', 'A5', t + 1, 5, .06, { att: 4, rel: 2.5, loop: true });
    playS('contrabass', 'D1', t, 7, .4, { att: 1, rel: 3, loop: true }); playS('choir_aahs', 'D3', t + .5, 6, .12, { att: 3, rel: 3, lp: 1500 }); playS('choir_aahs', 'Eb3', t + 1.5, 5, .09, { att: 3, rel: 3, lp: 1500 });
    for (let i = 0; i < 26; i++) playS('timpani', 'D2', t + 3 + i * .1, .3, .03 + i * .009, { lp: 900 });
    if (rand() < .4) { playS('acoustic_grand_piano', 'A0', t + 5.5, 3, .5); playS('acoustic_grand_piano', 'Bb0', t + 5.5, 3, .4); }
    MUS.next = t + 6.5;
  } else if (S === 'chase') {
    const B = 60 / 136; const ost = ['D3', 'F3', 'A3', 'Bb3', 'D3', 'F3', 'Bb3', 'A3'];
    for (let bar = 0; bar < 2; bar++) { const t0 = t + bar * B * 4;
      playS('taiko_drum', 'C3', t0, .8, .9); playS('taiko_drum', 'G2', t0 + B * 2, .8, .75); playS('taiko_drum', 'G2', t0 + B * 3.5, .5, .45); playS('timpani', 'D2', t0, 1.5, .7);
      ost.forEach((n, i) => playS('pizzicato_strings', n, t0 + i * B / 2, .3, .5));
      playS('string_ensemble_1', 'D3', t0, .25, .45, { rel: .15 }); playS('string_ensemble_1', 'A3', t0, .25, .35, { rel: .15 }); playS('string_ensemble_1', 'D3', t0 + B * 1.5, .25, .4, { rel: .15 });
      if ((MUS.beat + bar) % 4 === 0) playS('orchestra_hit', 'D3', t0, 1, .55); }
    playS('tremolo_strings', 'A5', t, B * 8, .08, { att: .5, rel: .4, loop: true }); MUS.beat += 2; MUS.next = t + B * 8;
  } else if (S === 'ending') {
    playS('string_ensemble_1', 'D3', t, 10, .2, { att: 3, rel: 5 }); playS('string_ensemble_1', 'F#3', t + .4, 10, .16, { att: 3, rel: 5 }); playS('string_ensemble_1', 'A3', t + .8, 10, .15, { att: 3, rel: 5 });
    playS('choir_aahs', 'A3', t + 2, 8, .1, { att: 3, rel: 4 }); playS('choir_aahs', 'D4', t + 2.5, 8, .08, { att: 3, rel: 4 }); ['A5', 'F#5', 'D5', 'E5', 'A4'].forEach((n, i) => playS('celesta', n, t + 4 + i * 1.3, 1.6, .1));
    MUS.next = t + 11;
  } else MUS.next = t + .5;
}
// stingers cinematográficos (impacto real de orquestra + percussão)
const STING = {
  big() { if (!MUS.ready) return SFX.stinger(1); const t = AU.ctx.currentTime + .01;
    playS('orchestra_hit', 'D3', t, 1.5, 1); playS('orchestra_hit', 'A3', t, 1.5, .7); playS('acoustic_grand_piano', 'A0', t, 4, 1); playS('acoustic_grand_piano', 'Bb0', t, 4, .9); playS('acoustic_grand_piano', 'D1', t, 4, .8);
    playS('taiko_drum', 'G2', t, 2, 1); playS('timpani', 'D2', t, 3, 1); playS('violin', 'E6', t + .05, 2.2, .45, { glide: 1.12, att: .02 }); playS('violin', 'F6', t + .05, 2.2, .35, { glide: 1.1, att: .02 }); playS('tremolo_strings', 'D5', t, 3, .3, { att: .05, rel: 2 });
    SFX.stinger(.45); },
  hit() { if (!MUS.ready) return SFX.stinger(.6); const t = AU.ctx.currentTime + .01; playS('acoustic_grand_piano', 'A0', t, 3, .9); playS('acoustic_grand_piano', 'Bb0', t, 3, .8); playS('taiko_drum', 'C3', t, 1.5, .8); playS('timpani', 'D2', t, 2.5, .7); playS('tremolo_strings', 'Eb5', t, 2, .2, { att: .02, rel: 1.5 }); },
  riser(sec = 3.5, then) { if (!MUS.ready) { SFX.riser(sec); return; } const t = AU.ctx.currentTime + .01; playS('reverse_cymbal', 'C4', t, sec, .7, { rate: 3.6 / sec, att: .01, rel: .05 });
    playS('tremolo_strings', 'D4', t, sec, .2, { att: sec * .9, rel: .1, glide: 1.5, loop: true }); playS('tremolo_strings', 'A4', t, sec, .15, { att: sec * .9, rel: .1, glide: 1.5, loop: true }); if (then) setTimeout(() => STING[then](), sec * 1000); },
  whisper() { if (!MUS.ready) return; const t = AU.ctx.currentTime; playS('choir_aahs', 'D4', t, 2.5, .12, { reverse: true, att: 1.5, rel: .5, lp: 2500 }); playS('choir_aahs', 'Eb4', t + .3, 2.5, .1, { reverse: true, att: 1.5, rel: .5, lp: 2500 }); },
  piano() { if (!MUS.ready) return; const t = AU.ctx.currentTime; playS('acoustic_grand_piano', pick(['D4', 'Bb4', 'A3']), t, 3, .3); },
};
