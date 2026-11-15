// ---------------------------------------------------------------------------
// Telas: PFD / ND / ECAM (A320-family), mapa móvel do IFE, FAP da tripulação
// ---------------------------------------------------------------------------
const FLT = { lat: 9.52, lon: -27.8, hdg: 34, gs: 487, mach: .78, ias: 262, alt: 37000, sat: -56, fob: 17.4, elapsed: 2 * 3600 + 33 * 60, divert: false };
function drawPFD(D, t) {
  const x = D.ctx, W = 512; x.fillStyle = '#000'; x.fillRect(0, 0, W, W);
  const pitch = 2.2 + Math.sin(t * .3) * .15, roll = Math.sin(t * .17) * .6 + (P.shake ? Math.sin(t * 9) * P.shake * 20 : 0);
  x.save(); x.beginPath(); x.rect(120, 90, 260, 300); x.clip(); x.translate(250, 240); x.rotate(-roll * Math.PI / 180); x.translate(0, pitch * 8);
  x.fillStyle = '#1e9fe8'; x.fillRect(-400, -600, 800, 600); x.fillStyle = '#a0612c'; x.fillRect(-400, 0, 800, 600); x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.moveTo(-400, 0); x.lineTo(400, 0); x.stroke();
  x.font = '16px Arial'; x.fillStyle = '#fff'; for (let p = -20; p <= 20; p += 2.5) { if (!p) continue; const w = p % 10 === 0 ? 70 : (p % 5 === 0 ? 40 : 20); x.beginPath(); x.moveTo(-w / 2, -p * 8); x.lineTo(w / 2, -p * 8); x.stroke(); if (p % 10 === 0) { x.fillText(Math.abs(p), w / 2 + 6, -p * 8 + 6); } }
  x.restore();
  x.strokeStyle = '#ff0'; x.lineWidth = 6; x.beginPath(); x.moveTo(170, 240); x.lineTo(220, 240); x.lineTo(220, 255); x.moveTo(330, 240); x.lineTo(280, 240); x.lineTo(280, 255); x.stroke(); x.fillStyle = '#ff0'; x.fillRect(244, 234, 12, 12);
  // fitas de velocidade e altitude
  x.fillStyle = '#5a5f66'; x.fillRect(20, 90, 80, 300); x.fillRect(400, 90, 80, 300); x.fillStyle = '#fff'; x.font = '20px Arial';
  for (let v = -40; v <= 40; v += 10) { const s = Math.round(FLT.ias / 10) * 10 + v; const y = 240 - (s - FLT.ias) * 3; if (y > 95 && y < 385) { x.fillText(s, 35, y + 7); x.fillRect(88, y, 12, 2); } }
  for (let a = -400; a <= 400; a += 100) { const s = Math.round(FLT.alt / 100) * 100 + a; const y = 240 - (s - FLT.alt) * .3; if (y > 95 && y < 385 && s % 500 === 0) { x.fillText(String(s / 100).padStart(3, '0'), 425, y + 7); } x.fillRect(400, y, 10, 2); }
  x.fillStyle = '#000'; x.fillRect(400, 222, 80, 36); x.strokeStyle = '#ff0'; x.lineWidth = 2; x.strokeRect(400, 222, 80, 36); x.fillStyle = '#0f0'; x.font = 'bold 22px Arial'; x.fillText('37000'.slice(0, 3), 410, 248); x.font = 'bold 16px Arial'; x.fillText('00', 452, 247);
  x.fillStyle = '#ff0'; x.fillRect(20, 238, 80, 4);
  x.fillStyle = '#0f0'; x.font = 'bold 20px Arial'; x.fillText('.' + Math.round(FLT.mach * 100), 30, 420); x.fillText(FLT.divert ? 'MACH  ALT CRZ  NAV' : 'MACH  ALT CRZ  NAV', 110, 40); x.fillStyle = '#fff'; x.font = '17px Arial'; x.fillText('AP1   1FD2   A/THR', 330, 70);
  x.fillStyle = '#0ff'; x.font = '18px Arial'; x.fillText('FL370', 410, 80); x.fillText('STD', 420, 420);
  // heading
  x.fillStyle = '#5a5f66'; x.fillRect(120, 450, 260, 50); x.fillStyle = '#fff'; x.font = '18px Arial'; for (let h = -20; h <= 20; h += 5) { const hh = (Math.round(FLT.hdg / 5) * 5 + h + 360) % 360; const xx = 250 + (hh - FLT.hdg) * 6; if (xx > 125 && xx < 375) { x.fillRect(xx, 450, 2, 10); if (hh % 10 === 0) x.fillText(String(hh / 10).padStart(2, '0'), xx - 10, 482); } } x.fillStyle = '#ff0'; x.fillRect(248, 446, 4, 24);
  D.t.needsUpdate = true;
}
function drawND(D, t) {
  const x = D.ctx, W = 512; x.fillStyle = '#000'; x.fillRect(0, 0, W, W); const cx = 256, cy = 420;
  x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, 330, Math.PI * 1.22, Math.PI * 1.78); x.stroke(); x.setLineDash([6, 8]); x.beginPath(); x.arc(cx, cy, 165, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); x.setLineDash([]);
  x.fillStyle = '#fff'; x.font = '18px Arial'; for (let h = -40; h <= 40; h += 10) { const a = (h - 90) * Math.PI / 180; const hh = (Math.round(FLT.hdg / 10) * 10 + h + 360) % 360; x.save(); x.translate(cx + Math.cos(a) * 345, cy + Math.sin(a) * 345); x.fillText(String(hh / 10).padStart(2, '0'), -10, 6); x.restore(); }
  // rota
  x.strokeStyle = FLT.divert ? '#0ff' : '#f0f'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + (FLT.divert ? 120 : 30), 70); x.stroke();
  x.fillStyle = FLT.divert ? '#0ff' : '#f0f'; x.font = '18px Arial'; x.fillText(FLT.divert ? 'GVAC' : 'ETP', cx + (FLT.divert ? 130 : 40), 90); x.fillStyle = '#0f0'; x.fillText('IPERA', cx + 70, 160);
  x.fillStyle = '#fff'; x.fillText('GS' + FLT.gs + ' TAS' + (FLT.gs - 9), 14, 26); x.fillStyle = '#0f0'; x.fillText(FLT.divert ? 'GVAC' : 'TASIL', 400, 26); x.fillStyle = '#fff'; x.fillText(FLT.divert ? '412NM' : '96NM', 400, 50); x.fillText(FLT.divert ? '05:38' : '04:52', 400, 74);
  x.fillStyle = '#0ff'; x.fillText('277/42', 14, 50); x.fillStyle = '#0f0'; x.font = '16px Arial'; x.fillText('TERR', 20, 495);
  x.strokeStyle = '#ff0'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx - 30, cy + 10); x.lineTo(cx + 30, cy + 10); x.moveTo(cx, cy - 20); x.lineTo(cx, cy + 40); x.moveTo(cx - 12, cy + 34); x.lineTo(cx + 12, cy + 34); x.stroke();
  // weather radar (células)
  for (let i = 0; i < 40; i++) { const a = (-.5 + Math.sin(i * 7.1) * .4) - Math.PI / 2, r = 200 + Math.sin(i * 3.3) * 80; x.fillStyle = i % 5 ? 'rgba(0,200,0,.45)' : 'rgba(220,200,0,.5)'; x.beginPath(); x.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 6 + i % 7, 0, TAU); x.fill(); }
  D.t.needsUpdate = true;
}
function drawECAM(D) {
  const x = D.ctx; x.fillStyle = '#000'; x.fillRect(0, 0, 512, 512); x.lineWidth = 4;
  for (let e = 0; e < 2; e++) { const cx = 140 + e * 230; x.strokeStyle = '#fff'; x.beginPath(); x.arc(cx, 110, 70, Math.PI * .8, Math.PI * 2.1); x.stroke(); x.strokeStyle = '#0f0'; x.beginPath(); x.moveTo(cx, 110); const a = Math.PI * (.8 + 1.3 * .836); x.lineTo(cx + Math.cos(a) * 66, 110 + Math.sin(a) * 66); x.stroke(); x.fillStyle = '#0f0'; x.font = 'bold 28px Arial'; x.fillText('83.6', cx - 20, 150);
    x.strokeStyle = '#fff'; x.beginPath(); x.arc(cx, 250, 55, Math.PI, Math.PI * 1.9); x.stroke(); x.fillText('548', cx - 20, 280); }
  x.fillStyle = '#0ff'; x.font = '20px Arial'; x.fillText('N1  %', 220, 190); x.fillText('EGT °C', 215, 250); x.fillStyle = '#0f0'; x.font = '24px Arial'; x.fillText('FOB : ' + FLT.fob.toFixed(1).replace('.', ',') + ' T', 150, 330);
  x.fillStyle = '#0f0'; x.font = '20px Arial'; x.fillText('SEAT BELTS', 30, 420); x.fillText('NO PORTABLE DEVICES', 30, 450); x.fillStyle = FLT.divert ? '#fa0' : '#0f0'; x.fillText(FLT.divert ? 'DIVERSION GVAC — LAND ASAP' : 'ETOPS 180  ALTN GVAC', 30, 490);
  D.t.needsUpdate = true;
}
function drawSD(D) { const x = D.ctx; x.fillStyle = '#000'; x.fillRect(0, 0, 512, 512); x.fillStyle = '#fff'; x.font = 'bold 30px Arial'; x.fillText('CAB PRESS', 160, 50); x.font = '24px Arial'; x.fillStyle = '#0f0'; x.fillText('ΔP  7.9 PSI', 60, 150); x.fillText('CAB V/S  0', 60, 220); x.fillText('CAB ALT  6400 FT', 60, 290); x.fillStyle = '#0ff'; x.fillText('TAT -27 °C   SAT -56 °C', 60, 420); x.fillText('GW 84,2 T', 60, 470); D.t.needsUpdate = true; }
// mapa costeiro aproximado (lat, lon)
const COAST = [
  [[-8.1, -34.9], [-5.8, -35.2], [-3.7, -38.5], [-2.5, -44.3], [-1.2, -48.5], [1, -50]],
  [[4.5, -7.7], [5.3, -4], [6.3, -10.8], [8.5, -13.2], [10.6, -15], [12.6, -16.8], [14.7, -17.4], [16, -16.5], [20.9, -17], [24, -16], [27.9, -12.9], [31, -9.8], [33.6, -7.6], [35.8, -5.8]],
  [[36.1, -5.3], [36.5, -6.3], [37.2, -7.4], [37, -8.9], [38.7, -9.4], [39.4, -9.3], [41.1, -8.6], [42.9, -9.3], [43.4, -8.2], [43.5, -3]],
];
const ISLANDS = [[16.7, -22.9], [16.1, -22.8], [15.1, -23.6], [14.9, -24.4], [16.8, -25], [17, -25.3], [28.3, -16.5], [28.1, -15.4], [32.7, -17], [37.8, -25.5], [38.6, -28]];
function drawIFE(D) {
  const x = D.ctx, W = 512, H = 320; const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a1f3d'); g.addColorStop(1, '#06142a'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const pr = (la, lo) => [W * .5 + (lo + 20) * 9.5, H * .62 - (la - 18) * 8.5];
  x.strokeStyle = 'rgba(120,150,190,.12)'; x.lineWidth = 1; for (let lo = -50; lo <= 0; lo += 10) { const [a] = pr(0, lo); x.beginPath(); x.moveTo(a, 0); x.lineTo(a, H); x.stroke(); } for (let la = -10; la <= 50; la += 10) { const [, b] = pr(la, 0); x.beginPath(); x.moveTo(0, b); x.lineTo(W, b); x.stroke(); }
  x.fillStyle = '#2c3a2a'; x.strokeStyle = '#7d8f6a'; x.lineWidth = 1.5; for (const c of COAST) { x.beginPath(); c.forEach(([la, lo], i) => { const [px, py] = pr(la, lo); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); }
  x.fillStyle = '#7d8f6a'; for (const [la, lo] of ISLANDS) { const [px, py] = pr(la, lo); x.beginPath(); x.arc(px, py, 2, 0, TAU); x.fill(); }
  const city = (n, la, lo) => { const [px, py] = pr(la, lo); x.fillStyle = '#ffd36b'; x.beginPath(); x.arc(px, py, 3, 0, TAU); x.fill(); x.fillStyle = '#d8dde6'; x.font = '12px Inter, Arial'; x.fillText(n, px + 5, py - 4); };
  city('Recife', -8.05, -34.9); city('Lisboa', 38.72, -9.14); city('Sal', 16.74, -22.94); city('Dakar', 14.7, -17.4); city('Canárias', 28.3, -16.5);
  const a = pr(-8.05, -34.9), b = pr(38.72, -9.14), c = pr(FLT.lat, FLT.lon);
  x.setLineDash([4, 4]); x.strokeStyle = '#9fb3d1'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(c[0], c[1]); FLT.divert ? x.lineTo(...pr(16.74, -22.94)) : x.quadraticCurveTo(c[0] + 30, c[1] - 120, b[0], b[1]); x.stroke(); x.setLineDash([]);
  x.strokeStyle = '#e8b25a'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo((a[0] + c[0]) / 2 + 10, (a[1] + c[1]) / 2 + 10, c[0], c[1]); x.stroke();
  x.save(); x.translate(c[0], c[1]); x.rotate(FLT.hdg * Math.PI / 180); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, -9); x.lineTo(3, 2); x.lineTo(10, 5); x.lineTo(3, 5); x.lineTo(2, 10); x.lineTo(-2, 10); x.lineTo(-3, 5); x.lineTo(-10, 5); x.lineTo(-3, 2); x.closePath(); x.fill(); x.restore();
  x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, H - 54, W, 54); x.fillStyle = '#cfd6e2'; x.font = '12px Inter, Arial';
  const rem = FLT.divert ? '1:04' : '4:52'; x.fillText('Altitude 11.278 m', 14, H - 32); x.fillText('Velocidade 902 km/h', 150, H - 32); x.fillText('Temp. externa −56 °C', 300, H - 32); x.fillText((FLT.divert ? 'Tempo até Sal ' : 'Tempo até o destino ') + rem, 14, H - 12); x.fillText('Hora local destino ' + GAME.clockStr, 300, H - 12);
  x.fillStyle = '#e8b25a'; x.font = '600 13px Inter, Arial'; x.fillText('ATLÂNTICA  ·  AT0471', 14, 20);
  D.t.needsUpdate = true;
}
function drawFAP(D, alert) {
  const x = D.ctx; x.fillStyle = '#0c1118'; x.fillRect(0, 0, 512, 320); x.fillStyle = '#1d2a3a'; x.fillRect(0, 0, 512, 34); x.fillStyle = '#cfe3ff'; x.font = '600 18px Inter, Arial'; x.fillText('CABIN STATUS', 14, 24); x.fillText(GAME.clockStr || '04:38', 420, 24);
  const items = [['LIGHTS', alert ? 'OFF (FWD FAP)' : 'NIGHT 20%'], ['LAV AFT L', 'UNLOCKED · SMOKE DET OK'], ['LAV AFT R', 'VACANT'], ['DOORS', 'ARMED'], ['CALLS', alert ? 'CAPT' : '—'], ['TEMP CAB', '22,5 °C']];
  items.forEach(([a, b], i) => { x.fillStyle = '#7f95b0'; x.font = '15px Inter, Arial'; x.fillText(a, 18, 72 + i * 40); x.fillStyle = b.includes('OFF') || b.includes('UNLOCKED') ? '#ffb347' : '#8dfc9c'; x.fillText(b, 190, 72 + i * 40); });
  D.t.needsUpdate = true;
}
function drawOcc(free) { const x = WORLD.occ.ctx; x.fillStyle = '#111'; x.fillRect(0, 0, 256, 64); x.fillStyle = free ? '#3c3' : '#d33'; x.font = '600 28px Inter, Arial'; x.textAlign = 'center'; x.fillText(free ? 'VAGO' : 'OCUPADO', 128, 42); x.textAlign = 'left'; WORLD.occ.t.needsUpdate = true; }
