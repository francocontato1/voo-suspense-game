// ---------------------------------------------------------------------------
// Texturas procedurais (PBR: cor + normal + rugosidade) e placas/sinalização
// ---------------------------------------------------------------------------
const TEX = {};
function buildTextures(Q) {
  const S = Q >= 1 ? 512 : 256;
  const N2 = makeNoise(77), N3 = makeNoise(991);
  // Tecido do assento: tweed azul-grafite com trama diagonal
  {
    const f = genMaps(S, (u, v) => {
      const k = S / 2; const tw = Math.sin((u * k + v * k) * TAU * .5) * .5 + .5; const tw2 = Math.sin((u * k - v * k) * TAU * .5) * .5 + .5;
      const fib = N2(u * S * .5, v * S * .5, S * .5); const hea = NOISE.fbm(u * 8, v * 8, 4, 8);
      const fleck = fib > .95 ? 1 : 0; const t = .85 + .15 * (tw * .6 + tw2 * .4);
      const base = [34, 41, 58];
      const m = (.75 + .5 * hea) * t;
      return { c: [base[0] * m + fleck * 40, base[1] * m + fleck * 42, base[2] * m + fleck * 50], h: t * .7 + fib * .3 };
    });
    TEX.fabric = texFromCanvas(f.color, true, [1, 1]); TEX.fabricN = texFromCanvas(normalFromHeight(f.height, S, 3), false, [1, 1]);
  }
  // Couro (executiva)
  {
    const f = genMaps(S, (u, v) => { const g = N3.fbm(u * 64, v * 64, 3, 64); const big = NOISE.fbm(u * 4, v * 4, 3, 4); const m = .8 + .35 * big; return { c: [36 * m, 30 * m, 28 * m], h: g }; });
    TEX.leather = texFromCanvas(f.color, true, [1, 1]); TEX.leatherN = texFromCanvas(normalFromHeight(f.height, S, 2.5), false, [1, 1]);
    TEX.leatherR = texFromCanvas(grayFromHeight(f.height, S, h => .38 + h * .3), false, [1, 1]);
  }
  // Carpete
  {
    const f = genMaps(S, (u, v) => {
      const loop = N2(u * S * .7, v * S * .7, Math.round(S * .7)); const big = NOISE.fbm(u * 6, v * 6, 4, 6);
      const gx = (u * 16) % 1, gy = (v * 16) % 1; const motif = (Math.abs(gx - .5) < .06 && Math.abs(gy - .5) < .06) ? 1 : 0;
      const m = .7 + .5 * loop * .7 + .25 * big; const stain = Math.max(0, NOISE.fbm(u * 3 + 10, v * 3, 3, 3) - .62) * 2.2;
      return { c: [(48 + motif * 26) * m * (1 - stain * .4), (54 + motif * 22) * m * (1 - stain * .45), (70 + motif * 18) * m * (1 - stain * .4)], h: loop };
    });
    TEX.carpet = texFromCanvas(f.color, true, [1, 1]); TEX.carpetN = texFromCanvas(normalFromHeight(f.height, S, 2), false, [1, 1]);
  }
  // Plástico dos painéis (texturizado fino)
  {
    const f = genMaps(S, (u, v) => { const s = N3(u * S * .5, v * S * .5, S / 2); const big = NOISE.fbm(u * 3, v * 3, 3, 3); const m = .93 + .07 * big; return { c: [214 * m, 210 * m, 201 * m], h: s }; });
    TEX.plastic = texFromCanvas(f.color, true, [1, 1]); TEX.plasticN = texFromCanvas(normalFromHeight(f.height, S, .9), false, [1, 1]);
  }
  // Metal escovado
  {
    const f = genMaps(S, (u, v) => { const st = N2(u * 2, v * S, 2) * .6 + N3(u * 6, v * S * .5, 6) * .4; const sc = N3.fbm(u * 10, v * 10, 3, 10); const m = .82 + .25 * st; return { c: [158 * m, 160 * m, 164 * m], h: st * .5 + sc * .5 }; });
    TEX.metal = texFromCanvas(f.color, true, [1, 1]); TEX.metalR = texFromCanvas(grayFromHeight(f.height, S, h => .28 + h * .3), false, [1, 1]);
  }
  // Capa do encosto (pano branco com marca)
  {
    const s2 = 256; const f = genMaps(s2, (u, v) => { const w = NOISE.fbm(u * 40, v * 40, 2, 40); const n = NOISE.fbm(u * 6, v * 6, 3, 6); const m = .8 + .03 * w + .06 * n; return { c: [200 * m, 199 * m, 194 * m], h: w }; });
    const ctx = f.color.getContext('2d'); ctx.fillStyle = 'rgba(20,48,92,.9)'; ctx.font = '600 22px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillText('ATLÂNTICA', s2 / 2, s2 * .62);
    ctx.strokeStyle = 'rgba(20,48,92,.9)'; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const x = s2 / 2 - 40 + i * 2; const y = s2 * .42 + Math.sin(i / 40 * TAU * 1.5) * 7; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    TEX.cover = texFromCanvas(f.color); TEX.coverN = texFromCanvas(normalFromHeight(f.height, s2, 1.2), false);
  }
  // Cortina (tecido azul pesado)
  {
    const f = genMaps(256, (u, v) => { const w = Math.sin(u * 256 * 1.7) * .5 + .5; const n = NOISE.fbm(u * 5, v * 5, 3, 5); const m = .75 + .2 * w + .2 * n; return { c: [26 * m, 34 * m, 60 * m], h: w }; });
    TEX.curtain = texFromCanvas(f.color, true, [4, 2]); TEX.curtainN = texFromCanvas(normalFromHeight(f.height, 256, 1.5), false, [4, 2]);
  }
  // Pele de cobertor de bordo
  {
    const f = genMaps(256, (u, v) => { const w = (Math.sin(u * 256 * .9) + Math.sin(v * 256 * .9)) * .25 + .5; const n = N3.fbm(u * 32, v * 32, 3, 32); const m = .7 + .3 * n; return { c: [200 * m, 200 * m, 200 * m], h: w * .5 + n * .5 }; });
    TEX.blanket = texFromCanvas(f.color, true, [3, 3]); TEX.blanketN = texFromCanvas(normalFromHeight(f.height, 256, 2.5), false, [3, 3]);
  }
  // Ruído genérico para pele/roupa
  {
    const f = genMaps(256, (u, v) => { const n = N2.fbm(u * 64, v * 64, 3, 64); return { c: [255 * (0.85 + .15 * n), 255 * (0.85 + .15 * n), 255 * (0.85 + .15 * n)], h: n }; });
    TEX.cloth = texFromCanvas(f.color, true, [6, 6]); TEX.clothN = texFromCanvas(normalFromHeight(f.height, 256, 2), false, [6, 6]);
  }
  // Decalques: sombra de contato, sangue
  TEX.ao = (() => { const c = canvas(128), x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(.55, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return texFromCanvas(c, false); })();
  TEX.bloodPool = bloodTex(512, 'pool', 11); TEX.bloodDrip = bloodTex(256, 'drip', 23); TEX.bloodSmear = bloodTex(256, 'smear', 5); TEX.bloodSpat = bloodTex(256, 'spat', 9);
  TEX.lightLeak = (() => { const c = canvas(64, 128), x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 128); return texFromCanvas(c); })();
  TEX.beam = (() => { const c = canvas(64, 256), x = c.getContext('2d'); for (let y = 0; y < 256; y++) { const a = Math.pow(1 - y / 256, 1.6) * .9; const g = x.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, y, 64, 1); } return texFromCanvas(c); })();
  TEX.dust = (() => { const c = canvas(32), x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return texFromCanvas(c); })();
  // Painel PSU (sob os bagageiros): uma fileira por "tile"
  TEX.psu = psuTex();
  TEX.binSeam = (() => { const c = canvas(512, 64), x = c.getContext('2d'); x.fillStyle = '#d8d4cb'; x.fillRect(0, 0, 512, 64); x.fillStyle = 'rgba(0,0,0,.8)'; x.fillRect(0, 0, 5, 64); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(5, 0, 2, 64); x.fillStyle = '#9a968e'; x.fillRect(220, 22, 70, 18); x.fillStyle = '#6d6a63'; x.fillRect(226, 27, 58, 8); return texFromCanvas(c); })();
  TEX.overhead = cockpitPanelTex('overhead'); TEX.pedestal = cockpitPanelTex('pedestal'); TEX.glareshield = cockpitPanelTex('fcu');
  TEX.trolley = trolleyTex(); TEX.galley = galleyTex();
  TEX.skin = texFromCanvas((() => { const c = canvas(64), x = c.getContext('2d'); x.fillStyle = '#c8a088'; x.fillRect(0, 0, 64, 64); return c; })());
}
function bloodTex(size, kind, seed) {
  const r = mulberry32(seed); const c = canvas(size), x = c.getContext('2d'); const n = makeNoise(seed);
  const img = x.createImageData(size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const u = i / size - .5, v = j / size - .5; let a = 0;
    if (kind === 'pool') { const ang = Math.atan2(v, u); const rad = .30 + .1 * n.fbm(Math.cos(ang) * 2 + 3, Math.sin(ang) * 2 + 3, 4, 64) + .06 * Math.sin(ang * 3); const d = Math.hypot(u * 1.15, v); a = smooth((rad - d) * 30); const sat = n.fbm(i / size * 30, j / size * 30, 3, 30); a *= .92 + .08 * sat; }
    else if (kind === 'drip') { const cols = [.0, -.18, .14, .3, -.32]; for (let k = 0; k < cols.length; k++) { const len = .15 + ((k * 37) % 7) / 14; const w = .025 + .01 * Math.sin(k * 3); const du = Math.abs(u - cols[k]); if (v < -.5 + len && du < w * (1 + .3 * Math.sin(v * 40))) a = Math.max(a, 1); const bead = Math.hypot(u - cols[k], v - (-.5 + len)) < w * 1.4; if (bead) a = 1; } if (v < -.38) a = Math.max(a, smooth((.0 - Math.abs(u) * 1.2 + .45 + n.fbm(i / 20, 0, 3, 64) * .1) * 10)); }
    else if (kind === 'smear') { const ang = -.4; const ru = u * Math.cos(ang) - v * Math.sin(ang), rv = u * Math.sin(ang) + v * Math.cos(ang); const streak = n(ru * 40 + 5, 0, 256); a = smooth((.12 - Math.abs(rv)) * 25) * smooth((.42 - Math.abs(ru)) * 12) * (.4 + .6 * streak) * (.6 + .4 * smooth((ru + .4) * 3)); for (let f = 0; f < 4; f++) { const fx = -.35 + f * .05, fy = -.1 + f * .045; if (Math.hypot((u - fx) * 1.6, v - fy) < .07) a = Math.max(a, .85); } }
    else { for (let k = 0; k < 40; k++) { const cx = (Math.sin(k * 12.9898 + seed) * 43758.5453 % 1) * .8, cy = (Math.sin(k * 78.233 + seed) * 12345.678 % 1) * .8; const rr2 = .005 + Math.abs(Math.sin(k * 3.1)) * .03; if (Math.hypot(u - cx * .5, v - cy * .5) < rr2) a = 1; } }
    const o = (j * size + i) * 4; const dark = .55 + .45 * n.fbm(i / size * 8, j / size * 8, 3, 8);
    img.data[o] = 70 * dark; img.data[o + 1] = 4 * dark; img.data[o + 2] = 6 * dark; img.data[o + 3] = clamp(a, 0, 1) * 255;
  }
  x.putImageData(img, 0, 0); return texFromCanvas(c);
}
function psuTex() {
  const c = canvas(512, 256), x = c.getContext('2d');
  x.fillStyle = '#cfcbc2'; x.fillRect(0, 0, 512, 256);
  x.fillStyle = '#bdb9b0'; x.fillRect(0, 0, 512, 6); x.fillRect(0, 250, 512, 6);
  for (let i = 0; i < 3; i++) { const cx = 90 + i * 90; x.fillStyle = '#7a7770'; x.beginPath(); x.arc(cx, 70, 22, 0, TAU); x.fill(); x.fillStyle = '#e8e6df'; x.beginPath(); x.arc(cx, 70, 15, 0, TAU); x.fill(); x.fillStyle = '#8c8982'; x.beginPath(); x.arc(cx, 150, 17, 0, TAU); x.fill(); x.fillStyle = '#4a4843'; x.beginPath(); x.arc(cx, 150, 7, 0, TAU); x.fill(); }
  x.fillStyle = '#2a2a2a'; x.fillRect(370, 50, 110, 46); x.fillStyle = '#555'; x.fillRect(374, 54, 50, 38); x.fillRect(428, 54, 48, 38);
  x.strokeStyle = '#aaa'; x.lineWidth = 3; x.beginPath(); x.arc(399, 73, 11, 0, TAU); x.moveTo(391, 81); x.lineTo(407, 65); x.stroke();
  x.beginPath(); x.moveTo(442, 66); x.lineTo(462, 66); x.moveTo(442, 80); x.lineTo(462, 80); x.stroke();
  x.fillStyle = '#e0ddd6'; x.fillRect(370, 120, 110, 60); x.strokeStyle = '#a19d94'; x.strokeRect(370, 120, 110, 60);
  return texFromCanvas(c);
}
function rowLabelTex(row, letters) {
  const c = canvas(256, 64), x = c.getContext('2d'); x.fillStyle = '#d6d2c9'; x.fillRect(0, 0, 256, 64); x.fillStyle = '#2b2b2b'; x.font = '600 40px Inter, Arial'; x.textAlign = 'center'; x.fillText(String(row), 80, 46); x.font = '400 26px Inter, Arial'; x.fillText(letters, 180, 44);
  return texFromCanvas(c);
}
function signTex(text, sub, bg, fg, w = 512, h = 160) {
  const c = canvas(w, h), x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.textAlign = 'center';
  x.font = `600 ${h * .42}px Inter, Arial`; x.fillText(text, w / 2, sub ? h * .52 : h * .66); if (sub) { x.font = `500 ${h * .24}px Inter, Arial`; x.fillText(sub, w / 2, h * .86); }
  return texFromCanvas(c);
}
function cockpitPanelTex(kind) {
  const W = 1024, H = kind === 'fcu' ? 256 : 1024; const c = canvas(W, H), x = c.getContext('2d'); const e = canvas(W, H), ex = e.getContext('2d');
  x.fillStyle = '#3d434b'; x.fillRect(0, 0, W, H); ex.fillStyle = '#000'; ex.fillRect(0, 0, W, H);
  const r = mulberry32(kind.length * 31);
  const panel = (px, py, pw, ph) => { x.fillStyle = '#434a53'; x.fillRect(px, py, pw, ph); x.strokeStyle = '#2a2f35'; x.lineWidth = 3; x.strokeRect(px, py, pw, ph); x.fillStyle = '#1f2328'; for (const [sx, sy] of [[px + 8, py + 8], [px + pw - 8, py + 8], [px + 8, py + ph - 8], [px + pw - 8, py + ph - 8]]) { x.beginPath(); x.arc(sx, sy, 3, 0, TAU); x.fill(); } };
  const pb = (bx, by, label, lit, col) => { x.fillStyle = '#1b1d20'; x.fillRect(bx, by, 46, 40); x.fillStyle = '#2c3036'; x.fillRect(bx + 3, by + 3, 40, 34); x.fillStyle = '#ddd'; x.font = '9px Arial'; x.textAlign = 'center'; x.fillText(label, bx + 23, by - 4); if (lit) { ex.fillStyle = col; ex.font = 'bold 10px Arial'; ex.textAlign = 'center'; ex.fillText(lit, bx + 23, by + (col === '#fff' ? 16 : 30)); x.fillStyle = col; x.globalAlpha = .5; x.font = 'bold 10px Arial'; x.fillText(lit, bx + 23, by + (col === '#fff' ? 16 : 30)); x.globalAlpha = 1; } };
  const knob = (kx, ky, rad) => { x.fillStyle = '#16181b'; x.beginPath(); x.arc(kx, ky, rad, 0, TAU); x.fill(); x.fillStyle = '#2e3237'; x.beginPath(); x.arc(kx, ky, rad * .7, 0, TAU); x.fill(); x.strokeStyle = '#ddd'; x.lineWidth = 2; x.beginPath(); x.moveTo(kx, ky); x.lineTo(kx + rad * .6, ky - rad * .6); x.stroke(); };
  if (kind === 'overhead') {
    const labels = ['APU', 'ELEC', 'HYD', 'FUEL', 'AIR', 'ANTI ICE', 'EXT LT', 'SIGNS', 'CALLS', 'OXY', 'CARGO SMOKE', 'ENG'];
    let i = 0; for (let py = 20; py < H - 120; py += 165) for (let px = 20; px < W - 150; px += 250) {
      panel(px, py, 230, 150); x.fillStyle = '#eee'; x.font = 'bold 12px Arial'; x.textAlign = 'left'; x.fillText(labels[i++ % labels.length], px + 12, py + 22);
      for (let b = 0; b < 4; b++) { const lit = r() < .18 ? (r() < .5 ? 'FAULT' : 'OFF') : (r() < .25 ? 'ON' : null); pb(px + 14 + b * 52, py + 72, ['PUMP', 'BAT', 'GEN', 'BLEED', 'PACK', 'XFR'][Math.floor(r() * 6)], lit === 'FAULT' ? null : lit, lit === 'ON' ? '#4cf' : '#fff'); }
      if (r() < .5) knob(px + 190, py + 115, 13);
    }
    ex.fillStyle = '#4f4'; ex.font = 'bold 13px Arial'; ex.fillText('SEAT BELTS · ON', 520, 1004); x.fillStyle = '#eee'; x.font = 'bold 13px Arial'; x.fillText('SEAT BELTS · ON', 520, 1004);
  } else if (kind === 'pedestal') {
    panel(20, 20, W - 40, 300); x.fillStyle = '#0d1a10'; x.fillRect(60, 50, 380, 250); x.fillRect(W - 440, 50, 380, 250);
    ex.fillStyle = '#3f6'; ex.font = '18px "IBM Plex Mono", monospace'; const mcdu = ['  ACT RTE 1     1/3', 'REC  2312  FL370', 'TASIL 0402  .78/370', 'ETP   0449  .78/370', 'GVAC-LPPT  -56', 'IPERA 0536  .78/370', 'LPPT  0731'];
    mcdu.forEach((l, k) => { ex.fillText(l, 76, 80 + k * 30); ex.fillText(l, W - 424, 80 + k * 30); });
    panel(20, 340, W - 40, 660); for (let k = 0; k < 2; k++) { x.fillStyle = '#26292e'; x.fillRect(340 + k * 220, 380, 130, 380); x.fillStyle = '#111'; x.fillRect(395 + k * 220, 400, 20, 340); }
    x.fillStyle = '#eee'; x.font = 'bold 16px Arial'; x.fillText('ENG 1', 380, 800); x.fillText('ENG 2', 600, 800); x.fillText('MASTER', 470, 840);
    for (let k = 0; k < 6; k++) knob(160 + k * 140, 900, 18);
  } else {
    panel(4, 4, W - 8, H - 8);
    const win = (wx, txt) => { x.fillStyle = '#0a0a0a'; x.fillRect(wx, 60, 110, 46); ex.fillStyle = '#ffb030'; ex.font = '32px "IBM Plex Mono", monospace'; ex.textAlign = 'center'; ex.fillText(txt, wx + 55, 96); };
    win(120, '0.78'); win(330, '047'); win(560, 'FL370'); win(780, '-0000'); [175, 385, 615, 835].forEach(kx => knob(kx, 170, 28));
    x.fillStyle = '#ddd'; x.font = 'bold 14px Arial'; x.textAlign = 'center'; x.fillText('SPD   MACH', 175, 40); x.fillText('HDG   TRK', 385, 40); x.fillText('ALT', 615, 40); x.fillText('V/S   FPA', 835, 40);
    pb(940, 140, 'AP1', '▬', '#4f4'); pb(70, 200, 'LOC', null, '#4f4');
  }
  const t = texFromCanvas(c); t.userData = { emissive: texFromCanvas(e) }; return t;
}
function trolleyTex() {
  const c = canvas(256, 512), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, '#9fa3a8'); g.addColorStop(.5, '#c4c7cb'); g.addColorStop(1, '#9a9ea3'); x.fillStyle = g; x.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * .06})`; x.fillRect(Math.random() * 256, Math.random() * 512, 1 + Math.random() * 40, 1); }
  x.strokeStyle = '#6c7075'; x.lineWidth = 6; x.strokeRect(8, 8, 240, 496); x.fillStyle = '#4b4f54'; x.fillRect(40, 30, 176, 26); x.fillStyle = '#b3241c'; x.fillRect(110, 70, 36, 50);
  x.fillStyle = '#183a6d'; x.fillRect(40, 200, 176, 70); x.fillStyle = '#fff'; x.font = '600 26px Inter, Arial'; x.textAlign = 'center'; x.fillText('ATLÂNTICA', 128, 245);
  x.fillStyle = '#222'; x.font = '500 22px "IBM Plex Mono", monospace'; x.fillText('MEAL · ECO', 128, 330);
  return texFromCanvas(c);
}
function galleyTex() {
  const c = canvas(1024, 512), x = c.getContext('2d'); x.fillStyle = '#b8bbbf'; x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 2000; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * .05})`; x.fillRect(Math.random() * 1024, Math.random() * 512, 1 + Math.random() * 60, 1); }
  for (let i = 0; i < 4; i++) { x.strokeStyle = '#70747a'; x.lineWidth = 4; x.strokeRect(20 + i * 250, 20, 230, 200); x.fillStyle = '#2c2f33'; x.fillRect(50 + i * 250, 60, 170, 110); x.fillStyle = '#b3241c'; x.fillRect(195 + i * 250, 190, 22, 16); x.fillStyle = '#222'; x.font = '18px "IBM Plex Mono", monospace'; x.fillText(i < 2 ? 'OVEN ' + (i + 1) : (i === 2 ? 'BEV MAKER' : 'STOWAGE'), 40 + i * 250, 48); }
  for (let i = 0; i < 8; i++) { x.strokeStyle = '#80848a'; x.strokeRect(20 + i * 124, 260, 116, 90); x.fillStyle = '#b3241c'; x.fillRect(60 + i * 124, 330, 36, 10); x.fillStyle = '#333'; x.font = '15px "IBM Plex Mono", monospace'; x.fillText('B' + (i + 1), 30 + i * 124, 282); }
  x.fillStyle = '#d23'; x.font = '600 16px Inter, Arial'; x.fillText('CIRCUIT BREAKERS', 40, 400); x.fillStyle = '#222'; for (let i = 0; i < 24; i++) { x.beginPath(); x.arc(50 + i * 38, 430, 9, 0, TAU); x.fill(); }
  return texFromCanvas(c);
}
