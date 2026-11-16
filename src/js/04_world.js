// ---------------------------------------------------------------------------
// Mundo: Airbus A321neoLR (dimensões reais de seção A320-family: cabine 3,70 m,
// pitch 31"/79 cm na econômica, corredor ~50 cm). z+ = cauda, x- = lado esquerdo.
// ---------------------------------------------------------------------------
const MAT = {}; const WORLD = { interact: [], lights: {}, colliders: [], dyn: [], windows: [] };
const LAY = { ckFront: -6.35, ckDoor: -3.6, fwdEnd: -0.3, divZ: 4.2, lavZ0: 26.85, lavZ1: 27.95, aftDoorZ: 28.7, galleyZ: 29.5, endZ: 30.75 };
function rowZ(r) { if (r <= 4) return .62 + (r - 1) * .97; let z = 4.85 + (r - 7) * .79; if (r >= 21) z += .2; return z; }
const ECO_X = { A: -1.47, B: -1.0, C: -.53, D: .53, E: 1.0, F: 1.47 }, BIZ_X = { A: -1.18, C: -.58, D: .58, F: 1.18 };
function seatPos(id) { const r = parseInt(id); const l = id.replace(/\d+/g, ''); return V3(r <= 4 ? BIZ_X[l] : ECO_X[l], 0, rowZ(r)); }
// perfil interno da fuselagem (metade direita, do piso ao teto)
const PROF = [[1.70, 0], [1.78, .18], [1.83, .45], [1.86, .80], [1.86, 1.12], [1.83, 1.38], [1.77, 1.58], [1.62, 1.80], [1.38, 1.97], [1.0, 2.08], [.55, 2.14], [0, 2.16]];
function fullProfile(sx = 1, sy = 1) { const L = PROF.slice().reverse().map(p => [-p[0] * sx, p[1] * sy]); const Rr = PROF.slice(1).map(p => [p[0] * sx, p[1] * sy]); return L.concat(Rr); }
function wallX(y) { for (let i = 0; i < PROF.length - 1; i++) { const a = PROF[i], b = PROF[i + 1]; if (y >= a[1] && y <= b[1]) return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1])); } return 0; }

function addMesh(geo, mat, p, r, s, parent, opts = {}) {
  const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2], 'YXZ'); if (s) m.scale.set(s[0], s[1], s[2]);
  m.castShadow = opts.cast !== undefined ? opts.cast : true; m.receiveShadow = opts.recv !== undefined ? opts.recv : true; (parent || R.scene).add(m); return m;
}
function hitbox(w, h, d, p, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MAT.hit); m.position.set(p[0], p[1], p[2]); (parent || R.scene).add(m); return m; }
function addInteract(o) { o.enabled = o.enabled || (() => true); WORLD.interact.push(o); return o; }

function buildMaterials(env) {
  const std = (o) => { const m = new THREE.MeshStandardMaterial(o); m.envMap = env; m.envMapIntensity = o.envI !== undefined ? o.envI : .35; return m; };
  MAT.hit = new THREE.MeshBasicMaterial({ visible: false });
  MAT.plastic = std({ map: TEX.plastic, normalMap: TEX.plasticN, normalScale: new THREE.Vector2(.25, .25), roughness: .62, color: 0xffffff, side: THREE.DoubleSide });
  MAT.plasticDark = std({ color: 0x5d5f63, roughness: .55, normalMap: TEX.plasticN, normalScale: new THREE.Vector2(.3, .3) });
  MAT.plasticGrey = std({ side: THREE.DoubleSide, color: 0xa9a7a1, roughness: .55, normalMap: TEX.plasticN, normalScale: new THREE.Vector2(.3, .3) });
  MAT.fabric = std({ map: TEX.fabric, normalMap: TEX.fabricN, normalScale: new THREE.Vector2(.7, .7), roughness: .93, envI: .1 });
  MAT.leather = std({ map: TEX.leather, normalMap: TEX.leatherN, roughnessMap: TEX.leatherR, roughness: 1, envI: .5 });
  MAT.cover = std({ map: TEX.cover, normalMap: TEX.coverN, roughness: .95, envI: .1 });
  MAT.carpet = std({ map: TEX.carpet, normalMap: TEX.carpetN, roughness: .98, envI: .05 });
  MAT.vinyl = std({ color: 0x3e4045, roughness: .45, normalMap: TEX.plasticN, normalScale: new THREE.Vector2(.5, .5), envI: .5 });
  MAT.metal = std({ map: TEX.metal, roughnessMap: TEX.metalR, metalness: 1, roughness: 1, envI: 1 });
  MAT.chrome = std({ color: 0xdddddd, metalness: 1, roughness: .12, envI: 1.2 });
  MAT.black = std({ color: 0x141517, roughness: .6, side: THREE.DoubleSide });
  MAT.ckGrey = std({ side: THREE.DoubleSide, color: 0x484e57, roughness: .7, normalMap: TEX.plasticN, normalScale: new THREE.Vector2(.4, .4) });
  MAT.curtain = std({ map: TEX.curtain, normalMap: TEX.curtainN, roughness: .95, side: THREE.DoubleSide, envI: .05 });
  MAT.trolley = std({ map: TEX.trolley, metalness: .85, roughness: .38, envI: 1 });
  MAT.galley = std({ map: TEX.galley, metalness: .8, roughness: .35, envI: 1 });
  MAT.mirror = std({ color: 0x9aa0a6, metalness: 1, roughness: .04, envI: 1.6 });
  MAT.porcelain = std({ color: 0xc9ccd0, metalness: .9, roughness: .22, envI: 1.2 });
  MAT.screenOff = std({ color: 0x050607, roughness: .15, metalness: .2, envI: .8 });
  const decal = (map, rough = .15) => std({ map, transparent: true, roughness: rough, metalness: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, envI: .9 });
  MAT.bloodPool = decal(TEX.bloodPool, .08); MAT.bloodDrip = decal(TEX.bloodDrip, .2); MAT.bloodSmear = decal(TEX.bloodSmear, .35); MAT.bloodSpat = decal(TEX.bloodSpat, .2);
  MAT.ao = new THREE.MeshBasicMaterial({ map: TEX.ao, transparent: true, depthWrite: false, opacity: .9, polygonOffset: true, polygonOffsetFactor: -2 });
  MAT.mood = new THREE.MeshBasicMaterial({ color: new THREE.Color(.2, .24, .6).multiplyScalar(1.1) });
  MAT.warmStrip = new THREE.MeshBasicMaterial({ color: new THREE.Color(1., .72, .45).multiplyScalar(1.6) });
  MAT.readOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .9, .72).multiplyScalar(14) });
  MAT.pathLight = new THREE.MeshBasicMaterial({ color: new THREE.Color(.55, .75, .5).multiplyScalar(.5) });
  MAT.lavLight = new THREE.MeshBasicMaterial({ color: new THREE.Color(.85, .95, 1).multiplyScalar(4) });
  MAT.sky = makeSkyMaterial(TEX.skyCube, TEX.moon);
  MAT.skyInst = MAT.sky.clone(); MAT.skyInst.uniforms = MAT.sky.uniforms;
  MAT.skyInst.vertexShader = `varying vec3 vW; void main(){ vec4 w = modelMatrix * instanceMatrix * vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
  MAT.beam = new THREE.MeshBasicMaterial({ map: TEX.beam, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(.045, .055, .08), side: THREE.DoubleSide, fog: false });
  MAT.readBeam = new THREE.MeshBasicMaterial({ map: TEX.beam, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(.03, .025, .017), side: THREE.DoubleSide, fog: false });
}

function buildWorld() {
  const S = R.scene; const Q = R.Q;
  // ---------------- casco da fuselagem
  const full = fullProfile();
  const shell = profileStrip(full, LAY.ckDoor, LAY.endZ, 1, 1.2, 1.2); addMesh(shell, MAT.plastic, null, null, null, S, { cast: false });
  // nariz/cockpit afunilando
  {
    const segs = 6; const pos = [], uv = [], idx = []; const n = full.length;
    for (let j = 0; j <= segs; j++) { const t = j / segs; const z = lerp(LAY.ckDoor, LAY.ckFront, t); const sx = lerp(1, .66, Math.pow(t, 1.4)), sy = lerp(1, .93, t); const pr = fullProfile(sx, sy); for (let i = 0; i < n; i++) { pos.push(pr[i][0], pr[i][1], z); uv.push(i / n * 4, z); } }
    for (let j = 0; j < segs; j++) for (let i = 0; i < n - 1; i++) { const a = j * n + i, b = a + 1, c = a + n, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    addMesh(g, MAT.ckGrey, null, null, null, S, { cast: false });
  }
  // pisos
  const floor = (x0, x1, z0, z1, mat, rep = 1) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); planeUV(g, (x1 - x0) * rep, (z1 - z0) * rep); return addMesh(g, mat, [(x0 + x1) / 2, 0, (z0 + z1) / 2], [-Math.PI / 2, 0, 0], null, S, { cast: false }); };
  floor(-1.72, 1.72, -.3, LAY.lavZ0, MAT.carpet, 1.4); floor(-1.72, 1.72, LAY.ckDoor, -.3, MAT.vinyl, 1.5); floor(-1.72, 1.72, LAY.lavZ0, LAY.endZ, MAT.vinyl, 1.5); floor(-1.2, 1.2, LAY.ckFront, LAY.ckDoor, MAT.carpet, 1.2);
  // faixa de iluminação de emergência no piso (fotoluminescente)
  { const g = new THREE.PlaneGeometry(.025, LAY.lavZ0 - .2); addMesh(g, MAT.pathLight, [-.26, .004, (LAY.lavZ0 + .2) / 2], [-Math.PI / 2, 0, 0], null, S, { cast: false, recv: false }); }
  // anteparo traseiro
  { const sh = new THREE.Shape(); full.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])); const g = new THREE.ShapeGeometry(sh); addMesh(g, MAT.plasticGrey, [0, 0, LAY.endZ - .01], [0, Math.PI, 0], null, S, { cast: false }); }
  // anteparo do cockpit: dois painéis laterais + verga, com vão de porta de 0,84 x 1,98 m
  {
    const DW = .42, DH = 1.98; const side = (sgn) => { const pts0 = full.filter(p => p[0] * sgn >= DW); const pts = sgn > 0 ? pts0.reverse() : pts0; const sh = new THREE.Shape();
      const top = (() => { for (let i = 0; i < full.length - 1; i++) { const a = full[i], b = full[i + 1]; if ((a[0] - sgn * DW) * (b[0] - sgn * DW) <= 0 && a[1] > 1) return lerp(a[1], b[1], (sgn * DW - a[0]) / (b[0] - a[0])); } return 2.14; })();
      sh.moveTo(sgn * DW, 0); pts.forEach(p => sh.lineTo(p[0], p[1])); sh.lineTo(sgn * DW, top); sh.lineTo(sgn * DW, 0);
      addMesh(new THREE.ExtrudeGeometry(sh, { depth: .08, bevelEnabled: false }), MAT.plasticGrey, [0, 0, LAY.ckDoor - .04], null, null, S); };
    side(-1); side(1);
    addMesh(new THREE.BoxGeometry(DW * 2, 2.17 - DH, .08), MAT.plasticGrey, [0, DH + (2.17 - DH) / 2, LAY.ckDoor], null, null, S);
    // batente metálico
    for (const x of [-DW - .015, DW + .015]) addMesh(new THREE.BoxGeometry(.03, DH, .1), MAT.metal, [x, DH / 2, LAY.ckDoor], null, null, S);
    addMesh(new THREE.BoxGeometry(DW * 2 + .06, .03, .1), MAT.metal, [0, DH + .015, LAY.ckDoor], null, null, S);
    // porta blindada (abre para dentro do cockpit), olho mágico, maçaneta, teclado de acesso
    const dg = roundedBox(DW * 2 - .02, DH - .02, .06, .012, 2); dg.translate(DW - .01, (DH - .02) / 2, 0); const door = addMesh(dg, MAT.plasticDark, [-DW + .01, .005, LAY.ckDoor], null, null, S);
    addMesh(roundedBox(.035, .16, .05, .012, 1), MAT.metal, [DW * 2 - .12, 1.02, .045], null, null, door); addMesh(roundedBox(.035, .16, .05, .012, 1), MAT.metal, [DW * 2 - .12, 1.02, -.045], null, null, door);
    addMesh(new THREE.CylinderGeometry(.014, .014, .07, 16), MAT.chrome, [DW, 1.56, 0], [Math.PI / 2, 0, 0], null, door);
    const pl = new THREE.MeshStandardMaterial({ map: signTex('FLIGHT DECK', 'ACESSO RESTRITO', '#1c1d20', '#d8d4cb', 512, 160), roughness: .6 }); addMesh(new THREE.PlaneGeometry(.26, .08), pl, [DW, 1.38, .032], null, null, door, { cast: false });
    const kp = signTex('1 2 3', '4 5 6 · 7 8 9', '#141517', '#9cb6c8', 256, 256); addMesh(new THREE.PlaneGeometry(.09, .12), new THREE.MeshStandardMaterial({ map: kp, emissive: 0x223344, emissiveIntensity: .6, roughness: .4 }), [DW + .1, 1.3, LAY.ckDoor + .045], null, null, S, { cast: false });
    WORLD.ckDoor = door;
  }
  buildCockpit();
  buildForward();
  buildBins();
  buildWindows();
  buildSeats();
  buildDividers();
  buildAft();
  buildSigns();
  buildLighting();
}

// ---------------- cockpit
function buildCockpit() {
  const S = R.scene; const z0 = LAY.ckFront;
  // painel principal (levemente inclinado)
  const panel = new THREE.Group(); panel.position.set(0, 0, -5.92); S.add(panel);
  addMesh(roundedBox(2.0, .55, .25, .03), MAT.ckGrey, [0, .93, 0], [-.22, 0, 0], null, panel);
  addMesh(roundedBox(2.1, .09, .42, .03), MAT.ckGrey, [0, 1.24, .12], null, null, panel); // glareshield
  const fcu = new THREE.PlaneGeometry(1.5, .09); const fcuMat = new THREE.MeshStandardMaterial({ map: TEX.glareshield, emissiveMap: TEX.glareshield.userData.emissive, emissive: 0xffffff, emissiveIntensity: 1.5, roughness: .6 });
  addMesh(fcu, fcuMat, [0, 1.235, .335], [-.15, 0, 0], null, panel, { cast: false });
  // telas (PFD/ND/ECAM) — canvas dinâmicos
  WORLD.displays = {};
  const disp = (name, x, y, z, rx = -.22, w = .2) => { const c = canvas(512); const t = texFromCanvas(c); const m = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.1, roughness: .2, metalness: .1 }); const mesh = addMesh(new THREE.PlaneGeometry(w, w), m, [x, y, z], [rx, 0, 0], null, panel, { cast: false }); WORLD.displays[name] = { c, ctx: c.getContext('2d'), t, mesh }; addMesh(new THREE.PlaneGeometry(w + .04, w + .04), MAT.black, [x, y, z - .004], [rx, 0, 0], null, panel, { cast: false }); };
  disp('pfd1', -.74, .96, .13); disp('nd1', -.49, .96, .13); disp('ecam', 0, .99, .13); disp('nd2', .49, .96, .13); disp('pfd2', .74, .96, .13);
  // pedestal
  const ped = new THREE.Group(); ped.position.set(0, 0, -5.35); S.add(ped);
  addMesh(roundedBox(.5, .72, 1.05, .03), MAT.ckGrey, [0, .36, 0], null, null, ped);
  const pedTop = new THREE.MeshStandardMaterial({ map: TEX.pedestal, emissiveMap: TEX.pedestal.userData.emissive, emissive: 0xffffff, emissiveIntensity: 1.2, roughness: .65 });
  addMesh(new THREE.PlaneGeometry(.5, 1.0), pedTop, [0, .725, 0], [-Math.PI / 2, 0, 0], null, ped, { cast: false });
  addMesh(roundedBox(.46, .3, .1, .02), MAT.ckGrey, [0, .82, -.5], [-.6, 0, 0], null, ped);
  { const ec2 = canvas(512); const t = texFromCanvas(ec2); const m = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.1, roughness: .2 }); addMesh(new THREE.PlaneGeometry(.18, .18), m, [0, .84, -.44], [-.6, 0, 0], null, ped, { cast: false }); WORLD.displays.sd = { c: ec2, ctx: ec2.getContext('2d'), t }; }
  for (let i = 0; i < 2; i++) { const lv = addMesh(roundedBox(.05, .16, .04, .015), MAT.black, [-.07 + i * .14, .8, -.1], [.3, 0, 0], null, ped); addMesh(roundedBox(.11, .035, .05, .015), MAT.plasticDark, [-.07 + i * .14, .88, -.075], null, null, ped); }
  // consoles laterais + sidesticks
  for (const sx of [-1, 1]) {
    addMesh(roundedBox(.32, .72, 1.2, .03), MAT.ckGrey, [sx * .98, .36, -5.25], null, null, S);
    const st = addMesh(new THREE.CylinderGeometry(.018, .022, .16, 12), MAT.black, [sx * .9, .8, -5.42], [-.15, 0, sx * .1], null, S);
    addMesh(roundedBox(.05, .1, .055, .02), MAT.black, [0, .1, 0], null, null, st);
    // assentos dos pilotos
    const seat = new THREE.Group(); seat.position.set(sx * .53, 0, -4.95); S.add(seat);
    addMesh(roundedBox(.5, .14, .5, .05), MAT.leather, [0, .48, 0], null, null, seat);
    addMesh(roundedBox(.5, .8, .14, .06), MAT.leather, [0, .95, .3], [.1, 0, 0], null, seat);
    addMesh(roundedBox(.3, .18, .12, .05), MAT.leather, [0, 1.42, .36], [.1, 0, 0], null, seat);
    addMesh(new THREE.CylinderGeometry(.05, .07, .4, 12), MAT.metal, [0, .2, .05], null, null, seat);
    for (const ax of [-1, 1]) addMesh(roundedBox(.06, .05, .32, .02), MAT.black, [ax * .28, .7, .05], null, null, seat);
  }
  // painel overhead
  const ohMat = new THREE.MeshStandardMaterial({ map: TEX.overhead, emissiveMap: TEX.overhead.userData.emissive, emissive: 0xffffff, emissiveIntensity: 1.4, roughness: .7 });
  addMesh(new THREE.PlaneGeometry(.9, 1.15), ohMat, [0, 1.93, -5.35], [Math.PI / 2 - .25, 0, 0], null, S, { cast: false });
  addMesh(roundedBox(1.0, .12, 1.25, .03), MAT.ckGrey, [0, 2.0, -5.35], [-.25, 0, 0], null, S, { cast: false });
  // para-brisas e janelas laterais (céu)
  const ws = (x, w, ry) => { const g = new THREE.PlaneGeometry(w, .5); addMesh(g, MAT.sky, [x, 1.53, -6.08], [-.95 + 0, ry, 0], null, S, { cast: false, recv: false }); const fr = roundRectShape(w + .1, .58, .04); fr.holes.push(roundRectPath(w - .03, .47, .05)); const fg = new THREE.ExtrudeGeometry(fr, { depth: .03, bevelEnabled: false }); const f = addMesh(fg, MAT.ckGrey, [x, 1.53, -6.08], [-.95, ry, 0], null, S, { cast: false }); f.translateZ(.005); };
  ws(-.36, .66, .18); ws(.36, .66, -.18);
  addMesh(new THREE.BoxGeometry(.05, .62, .05), MAT.black, [0, 1.52, -6.05], [-.95, 0, 0], null, S);
  for (const sx of [-1, 1]) { const g = new THREE.PlaneGeometry(.55, .42); addMesh(g, MAT.sky, [sx * .92, 1.45, -5.55], [0, -sx * 1.25, sx * .1], null, S, { cast: false, recv: false }); { const fr = roundRectShape(.75, .62, .04); fr.holes.push(roundRectPath(.52, .39, .05)); const f = addMesh(new THREE.ExtrudeGeometry(fr, { depth: .04, bevelEnabled: false }), MAT.ckGrey, [sx * .92, 1.45, -5.55], [0, -sx * 1.25, sx * .1], null, S, { cast: false }); f.translateZ(.004); } const g2 = new THREE.PlaneGeometry(.4, .36); addMesh(g2, MAT.sky, [sx * 1.04, 1.38, -4.98], [0, -sx * 1.45, sx * .12], null, S, { cast: false, recv: false }); }
  // parede de disjuntores atrás do comandante + lanterna
  const cb = new THREE.MeshStandardMaterial({ map: TEX.galley, roughness: .6, color: 0x707780 }); addMesh(new THREE.PlaneGeometry(.7, .5), cb, [-1.05, 1.25, -4.2], [0, Math.PI / 2 - .2, 0], null, S, { cast: false });
  const torch = new THREE.Group(); torch.position.set(-.85, .92, -3.82); S.add(torch);
  addMesh(new THREE.CylinderGeometry(.022, .026, .24, 16), MAT.black, [0, 0, 0], [0, 0, Math.PI / 2], null, torch); addMesh(new THREE.CylinderGeometry(.03, .026, .05, 16), MAT.metal, [.14, 0, 0], [0, 0, Math.PI / 2], null, torch);
  WORLD.torchMesh = torch;
  // assento jumpseat dobrado
  addMesh(roundedBox(.4, .5, .08, .03), MAT.leather, [.6, 1.1, -3.75], null, null, S);
  // interfone (handset) no pedestal lateral do comandante
  const hs = addMesh(roundedBox(.05, .04, .2, .02), MAT.black, [-.98, .76, -4.9], [0, .2, 0], null, S); WORLD.handsetCk = hs;
}

// ---------------- área dianteira (L1/R1, galley, lavatório dianteiro, FAP)
function buildForward() {
  const S = R.scene;
  // lavatório dianteiro (esquerda)
  addMesh(roundedBox(1.25, 2.1, 1.15, .02), MAT.plastic, [-1.15, 1.05, -2.95], null, null, S);
  addMesh(new THREE.PlaneGeometry(.6, 1.85), MAT.plasticGrey, [-.52, .95, -2.95], [0, Math.PI / 2, 0], null, S, { cast: false });
  // galley dianteira (direita)
  const gal = new THREE.Group(); gal.position.set(1.15, 0, -2.55); S.add(gal);
  addMesh(roundedBox(1.15, 2.1, 1.7, .02), MAT.plasticGrey, [0, 1.05, 0], null, null, gal);
  addMesh(new THREE.PlaneGeometry(1.7, 1.0), MAT.galley, [-.58, 1.45, 0], [0, -Math.PI / 2, 0], null, gal, { cast: false });
  for (let i = 0; i < 4; i++) addMesh(new THREE.PlaneGeometry(.3, .98), MAT.trolley, [-.585, .5, -.6 + i * .4], [0, -Math.PI / 2, 0], null, gal, { cast: false });
  addMesh(roundedBox(.2, .03, 1.7, .01), MAT.metal, [-.62, 1.0, 0], null, null, gal);
  // portas L1 / R1 e L4 / R4
  for (const [x, z] of [[-1, -1.25], [1, -.9], [-1, LAY.aftDoorZ], [1, LAY.aftDoorZ]]) buildDoor(x, z);
  // FAP (Flight Attendant Panel) na parede do lavatório
  const fc = canvas(512, 320); const ft = texFromCanvas(fc); WORLD.fap = { c: fc, ctx: fc.getContext('2d'), t: ft };
  const fm = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffffff, emissiveMap: ft, emissiveIntensity: .9, roughness: .2 });
  addMesh(new THREE.PlaneGeometry(.32, .2), fm, [-.95, 1.35, -2.37], null, null, S, { cast: false });
  // escala da tripulação presa ao lado do FAP
  const rp = addMesh(new THREE.PlaneGeometry(.15, .21), new THREE.MeshStandardMaterial({ color: 0xe8e4d8, roughness: .9 }), [-1.24, 1.3, -2.365], [0, 0, .05], null, S, { cast: false });
  WORLD.rosterMesh = rp;
}
function buildDoor(side, z) {
  const S = R.scene; const pts = []; for (let y = .04; y <= 1.88; y += .12) pts.push([side * (wallX(y) - .035), y]);
  if (side < 0) pts.reverse();
  const g = profileStrip(pts, z - .45, z + .45, 1, 1, 1); addMesh(g, MAT.plasticGrey, null, null, null, S, { cast: false });
  const gap = profileStrip(pts.map(p => [p[0] * 1.001, p[1]]), z - .47, z - .45, 1); addMesh(gap, MAT.black, null, null, null, S, { cast: false });
  const gap2 = profileStrip(pts.map(p => [p[0] * 1.001, p[1]]), z + .45, z + .47, 1); addMesh(gap2, MAT.black, null, null, null, S, { cast: false });
  addMesh(roundedBox(.05, .06, .4, .02), MAT.metal, [side * (wallX(1.1) - .08), 1.1, z], null, null, S);
  const wg = new THREE.CircleGeometry(.1, 24); addMesh(wg, MAT.sky, [side * (wallX(1.45) - .045), 1.45, z], [0, -side * Math.PI / 2, 0], null, S, { cast: false, recv: false });
  addMesh(new THREE.RingGeometry(.1, .13, 24), MAT.plasticDark, [side * (wallX(1.45) - .05), 1.45, z], [0, -side * Math.PI / 2, 0], null, S, { cast: false });
  const pl = new THREE.MeshStandardMaterial({ map: signTex('ARMED', 'DESARMAR ANTES DE ABRIR', '#b3241c', '#fff', 512, 160), roughness: .6 });
  addMesh(new THREE.PlaneGeometry(.2, .065), pl, [side * (wallX(1.25) - .05), 1.25, z + .2], [0, -side * Math.PI / 2, 0], null, S, { cast: false });
}

// ---------------- bagageiros + PSU + faixas de luz ambiente
function buildBins() {
  const S = R.scene;
  const bin = [[1.77, 1.58], [1.0, 1.58], [.93, 1.66], [.90, 1.79], [.92, 1.91], [1.0, 1.99], [1.24, 2.025]];
  for (const side of [-1, 1]) {
    const pts = bin.map(p => [p[0] * side, p[1]]); const g = profileStrip(side < 0 ? pts.slice().reverse() : pts, -.25, LAY.lavZ0 - .05, 1, 1, 1 / 1.58);
    const m = new THREE.MeshStandardMaterial({ map: TEX.binSeam, roughness: .55, normalMap: TEX.plasticN, normalScale: new THREE.Vector2(.2, .2), side: THREE.DoubleSide }); m.envMap = MAT.plastic.envMap; m.envMapIntensity = .3;
    // uv: u = comprimento de arco (0..~1), v = z/1.58 -> costuras a cada 2 fileiras
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i), uv.getX(i) * .8);
    addMesh(g, m, null, null, null, S, { cast: false });
    { const sh = new THREE.Shape(); pts.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])); sh.lineTo(side * 1.77, 2.03); const cg = new THREE.ShapeGeometry(sh); addMesh(cg, MAT.plasticGrey, [0, 0, -.25], null, null, S, { cast: false }); addMesh(cg, MAT.plasticGrey, [0, 0, LAY.lavZ0 - .05], null, null, S, { cast: false }); }
    // PSU (sob o bagageiro), um tile por fileira
    const len = LAY.lavZ0 - 4.45; const pg = new THREE.PlaneGeometry(.72, len); planeUV(pg, 1, len / .79);
    const pm = new THREE.MeshStandardMaterial({ map: TEX.psu.clone(), roughness: .6 }); pm.map.wrapS = pm.map.wrapT = THREE.RepeatWrapping; pm.map.needsUpdate = true;
    pm.map.offset.y = -(4.85 - 4.45 - .2) / .79;
    addMesh(pg, pm, [side * 1.38, 1.575, 4.45 + len / 2], [Math.PI / 2, 0, side > 0 ? Math.PI / 2 * 0 : 0], null, S, { cast: false });
    // faixa de luz ambiente (mood lighting) sobre o bagageiro
    addMesh(new THREE.BoxGeometry(.03, .012, LAY.lavZ0 - .4), MAT.mood, [side * 1.06, 2.003, (LAY.lavZ0 - .25) / 2], null, null, S, { cast: false, recv: false });
    // faixa quente sob o bagageiro (sidewall wash)
    addMesh(new THREE.BoxGeometry(.012, .02, LAY.lavZ0 - .4), MAT.warmStrip, [side * 1.73, 1.56, (LAY.lavZ0 - .25) / 2], null, null, S, { cast: false, recv: false });
  }
}

// ---------------- janelas (molduras instanciadas, vidro com céu, persianas)
function buildWindows() {
  const S = R.scene; const zs = [];
  for (let z = .35; z < LAY.lavZ0 - .3; z += .533) { if (Math.abs(z - LAY.divZ) < .3) continue; if (Math.abs(z - (rowZ(20) + .42)) < .5) continue; zs.push(z); }
  const outer = roundRectShape(.30, .42, .1); outer.holes.push(roundRectPath(.215, .325, .085));
  const bez = new THREE.ExtrudeGeometry(outer, { depth: .06, bevelEnabled: true, bevelThickness: .01, bevelSize: .008, bevelSegments: 2, curveSegments: 8 });
  const glass = new THREE.PlaneGeometry(.22, .33); const shadeG = new THREE.PlaneGeometry(.215, .325); shadeG.translate(0, -.1625, 0);
  const n = zs.length * 2; const yC = 1.06;
  const iB = new THREE.InstancedMesh(bez, MAT.plastic, n), iG = new THREE.InstancedMesh(glass, MAT.skyInst, n), iS = new THREE.InstancedMesh(shadeG, MAT.plasticGrey, n);
  iB.receiveShadow = true; iS.receiveShadow = true;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); let k = 0; const openSet = new Set();
  // algumas persianas abertas (luar entrando)
  [3, 9, 17, 22, 30, 41, 44].forEach(i => openSet.add(i)); [6, 14, 27, 35, 38].forEach(i => openSet.add(1000 + i));
  for (const side of [-1, 1]) for (let i = 0; i < zs.length; i++) {
    const z = zs[i]; const wx = 1.862 * side; e.set(0, -side * Math.PI / 2, 0); q.setFromEuler(e);
    m.compose(V3(wx - side * 0.0, yC, z), q, V3(1, 1, 1)); iB.setMatrixAt(k, m);
    m.compose(V3(wx - side * .012, yC, z), q, V3(1, 1, 1)); iG.setMatrixAt(k, m);
    const open = openSet.has(i + (side > 0 ? 1000 : 0)); const s = open ? .04 : (rand() < .1 ? .55 : 1);
    m.compose(V3(wx - side * .03, yC + .1625, z), q, V3(1, s, 1)); iS.setMatrixAt(k, m);
    WORLD.windows.push({ z, side, open: s < 1 });
    k++;
  }
  S.add(iB, iG, iS); WORLD.winGlass = iG;
  // feixes de luar nas persianas abertas
  for (const w of WORLD.windows) if (w.open && rand() < .7) {
    const g = new THREE.PlaneGeometry(.35, 1.6); g.translate(0, -.8, 0); const b = new THREE.Mesh(g, MAT.beam); b.position.set(w.side * 1.84, 1.1, w.z); b.rotation.set(0, 0, w.side * -1.0); b.rotation.order = 'ZYX'; b.rotation.y = w.side * .15; R.scene.add(b);
    const b2 = b.clone(); b2.rotation.y += Math.PI / 2; R.scene.add(b2);
  }
}

// ---------------- assentos (instanciados)
function seatGeos(biz) {
  const w = biz ? .52 : .44;
  return {
    pan: roundedBox(w, .11, biz ? .54 : .47, .045), back: (() => { const g = roundedBox(w, biz ? .82 : .72, .1, .045); g.translate(0, (biz ? .82 : .72) / 2, 0); return g; })(),
    head: (() => { const g = roundedBox(w * .86, .2, .03, .012); g.translate(0, (biz ? .82 : .72) - .12, -.06); return g; })(),
    shell: (() => { const g = roundedBox(w + .01, biz ? .5 : .46, .035, .015); g.translate(0, (biz ? .5 : .43), .07); return g; })(),
    scr: (() => { const g = new THREE.PlaneGeometry(biz ? .26 : .2, biz ? .16 : .125); g.translate(0, biz ? .66 : .56, .089); return g; })(),
  };
}
function buildSeats() {
  const S = R.scene; WORLD.seatList = [];
  const rows = []; for (let r = 1; r <= 4; r++) rows.push(r); for (let r = 7; r <= 34; r++) rows.push(r);
  for (const r of rows) for (const l of (r <= 4 ? ['A', 'C', 'D', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'])) WORLD.seatList.push(r + l);
  // IFE: mapa móvel em canvas compartilhado
  const ife = canvas(512, 320); WORLD.ife = { c: ife, ctx: ife.getContext('2d'), t: texFromCanvas(ife) };
  MAT.ife = new THREE.MeshBasicMaterial({ map: WORLD.ife.t, color: new THREE.Color(1, 1, 1).multiplyScalar(.9) });
  const groups = [{ biz: true, list: WORLD.seatList.filter(s => parseInt(s) <= 4) }, { biz: false, list: WORLD.seatList.filter(s => parseInt(s) > 4) }];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  WORLD.recline = {};
  for (const G of groups) {
    const g = seatGeos(G.biz); const n = G.list.length;
    const pan = new THREE.InstancedMesh(g.pan, G.biz ? MAT.leather : MAT.fabric, n), back = new THREE.InstancedMesh(g.back, G.biz ? MAT.leather : MAT.fabric, n), head = new THREE.InstancedMesh(g.head, MAT.cover, n), shell = new THREE.InstancedMesh(g.shell, MAT.plasticDark, n), scr = new THREE.InstancedMesh(g.scr, MAT.ife, n);
    [pan, back, head, shell].forEach(o => { o.castShadow = true; o.receiveShadow = true; });
    G.list.forEach((id, i) => {
      const p = seatPos(id); const rec = rand() < .55 ? rr(.18, .32) : rr(.08, .14); WORLD.recline[id] = rec;
      m.compose(V3(p.x, G.biz ? .44 : .43, p.z), q.identity(), V3(1, 1, 1)); pan.setMatrixAt(i, m);
      e.set(rec, 0, 0); q.setFromEuler(e); m.compose(V3(p.x, .48, p.z + (G.biz ? .3 : .25)), q, V3(1, 1, 1)); back.setMatrixAt(i, m); head.setMatrixAt(i, m); shell.setMatrixAt(i, m); scr.setMatrixAt(i, m);
    });
    S.add(pan, back, head, shell, scr);
    // estrutura metálica, apoios de braço e sombra de contato por bloco
    const blocks = []; const rowsG = [...new Set(G.list.map(s => parseInt(s)))];
    for (const r of rowsG) for (const side of [-1, 1]) blocks.push({ r, side });
    const nb = blocks.length; const arms = new THREE.InstancedMesh(roundedBox(.05, .06, G.biz ? .5 : .42, .02), MAT.plasticDark, nb * (G.biz ? 3 : 4));
    const legs = new THREE.InstancedMesh(roundedBox(.04, .4, .45, .015), MAT.metal, nb * 2); const beam = new THREE.InstancedMesh(new THREE.CylinderGeometry(.02, .02, G.biz ? 1.2 : 1.42, 8), MAT.metal, nb);
    const ao = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), MAT.ao, nb);
    let ai = 0;
    blocks.forEach((b, i) => {
      const z = rowZ(b.r); const xs = G.biz ? [b.side * .29, b.side * .88, b.side * 1.47] : [b.side * .29, b.side * .765, b.side * 1.235, b.side * 1.705];
      for (const x of xs) { m.compose(V3(x, .62, z + .02), q.identity(), V3(1, 1, 1)); arms.setMatrixAt(ai++, m); }
      const cx = G.biz ? b.side * .88 : b.side * 1.0;
      m.compose(V3(cx - .45, .2, z), q.identity(), V3(1, 1, 1)); legs.setMatrixAt(i * 2, m); m.compose(V3(cx + .45, .2, z), q.identity(), V3(1, 1, 1)); legs.setMatrixAt(i * 2 + 1, m);
      e.set(0, 0, Math.PI / 2); q.setFromEuler(e); m.compose(V3(cx, .33, z - .05), q, V3(1, 1, 1)); beam.setMatrixAt(i, m);
      e.set(-Math.PI / 2, 0, 0); q.setFromEuler(e); m.compose(V3(cx, .006, z), q, V3(G.biz ? 1.5 : 1.75, .95, 1)); ao.setMatrixAt(i, m);
    });
    arms.castShadow = legs.castShadow = true; arms.receiveShadow = true; S.add(arms, legs, beam, ao);
  }
  // etiquetas de fileira (atlas único)
  const ac = canvas(2048, 512), ax = ac.getContext('2d'); const geos = []; let k = 0;
  for (const r of [1, 2, 3, 4, ...Array.from({ length: 28 }, (_, i) => i + 7)]) for (const side of [-1, 1]) {
    const col = k % 8, row = Math.floor(k / 8); ax.fillStyle = '#d6d2c9'; ax.fillRect(col * 256, row * 64, 256, 64); ax.fillStyle = '#26262a'; ax.font = '600 38px Inter, Arial'; ax.textAlign = 'center';
    ax.fillText(String(r), col * 256 + 78, row * 64 + 46); ax.font = '400 26px Inter, Arial'; ax.fillText(side < 0 ? (r <= 4 ? 'A C' : 'A B C') : (r <= 4 ? 'D F' : 'D E F'), col * 256 + 178, row * 64 + 44);
    const g = new THREE.PlaneGeometry(.12, .03); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (col + uv.getX(i)) / 8, 1 - (row + 1 - uv.getY(i)) / 8);
    xf(g, [side * .935, 1.62, rowZ(r) - .05], [0, -side * Math.PI / 2, side * .35]); geos.push(g); k++;
  }
  const lt = texFromCanvas(ac); addMesh(mergeGeos(geos), new THREE.MeshStandardMaterial({ map: lt, roughness: .6, emissive: 0xffffff, emissiveMap: lt, emissiveIntensity: .04 }), null, null, null, S, { cast: false });
}

// ---------------- divisória executiva/econômica + cortina
function buildDividers() {
  const S = R.scene;
  for (const side of [-1, 1]) { addMesh(roundedBox(1.3, 1.5, .06, .02), MAT.plasticGrey, [side * 1.05, .75, LAY.divZ], null, null, S); }
  const cg = new THREE.PlaneGeometry(.62, 1.86, 30, 4); const p = cg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin(x * 48) * .025 + Math.sin(x * 17) * .01); } cg.computeVertexNormals();
  const cur = addMesh(cg, MAT.curtain, [0, 1.11, LAY.divZ], null, null, S); WORLD.curtain = cur; WORLD.curtainBase = p.array.slice();
  addMesh(new THREE.BoxGeometry(.7, .02, .03), MAT.metal, [0, 2.06, LAY.divZ], null, null, S);
}

// ---------------- traseira: lavatórios, área das portas L4/R4, galley com trolleys
function buildAft() {
  const S = R.scene; const z0 = LAY.lavZ0, z1 = LAY.lavZ1;
  // lavatório direito (fechado)
  addMesh(roundedBox(1.42, 2.1, z1 - z0, .02), MAT.plastic, [1.06, 1.05, (z0 + z1) / 2], null, null, S);
  addMesh(new THREE.PlaneGeometry(.6, 1.85), MAT.plasticGrey, [.345, .95, (z0 + z1) / 2], [0, -Math.PI / 2, 0], null, S, { cast: false });
  // lavatório esquerdo (cena do crime) — paredes finas, interior visível
  const lav = new THREE.Group(); S.add(lav); WORLD.lav = lav;
  const wall = (w, h, d, p) => addMesh(new THREE.BoxGeometry(w, h, d), MAT.plastic, p, null, null, lav);
  wall(1.45, 2.1, .04, [-1.07, 1.05, z0]); wall(1.45, 2.1, .04, [-1.07, 1.05, z1]);
  wall(.04, 2.1, .3, [-.35, 1.05, z0 + .15]); wall(.04, 2.1, .2, [-.35, 1.05, z1 - .1]); wall(.04, .12, .62, [-.35, 2.04, (z0 + .3 + z1 - .2) / 2]);
  addMesh(new THREE.BoxGeometry(1.45, .04, z1 - z0), MAT.plastic, [-1.07, 2.06, (z0 + z1) / 2], null, null, lav);
  addMesh(new THREE.PlaneGeometry(1.4, z1 - z0), MAT.vinyl, [-1.07, .003, (z0 + z1) / 2], [-Math.PI / 2, 0, 0], null, lav, { cast: false });
  // porta sanfonada (abre para dentro)
  const doorW = z1 - .2 - (z0 + .3); const dz = z0 + .3;
  const dg = roundedBox(.035, 1.92, doorW, .01, 2); dg.translate(0, .96, -doorW / 2); const door = addMesh(dg, MAT.plasticGrey, [-.35, 0, dz + doorW], null, null, S); WORLD.lavDoor = door; door.userData.closedRot = 0;
  addMesh(roundedBox(.03, .05, .14, .01), MAT.metal, [.03, 1.0, -doorW + .1], null, null, door);
  const occ = canvas(256, 64), oc = occ.getContext('2d'); WORLD.occ = { c: occ, ctx: oc, t: texFromCanvas(occ) };
  addMesh(new THREE.PlaneGeometry(.12, .03), new THREE.MeshBasicMaterial({ map: WORLD.occ.t }), [.02, 1.2, -doorW + .12], [0, Math.PI / 2, 0], null, door, { cast: false });
  // impressão de mão ensanguentada do lado de dentro da porta
  addMesh(new THREE.PlaneGeometry(.22, .22), MAT.bloodSmear, [-.02, 1.05, -doorW * .55], [0, -Math.PI / 2, 0], null, door, { cast: false });
  // pia + espelho + armário
  addMesh(roundedBox(.62, .82, .42, .02), MAT.plastic, [-.95, .41, z0 + .23], null, null, lav);
  const basin = new THREE.Mesh(new THREE.SphereGeometry(.15, 24, 12, 0, TAU, Math.PI / 2, Math.PI / 2), MAT.porcelain); basin.scale.set(1.2, .6, 1); basin.position.set(-.95, .83, z0 + .23); lav.add(basin);
  addMesh(new THREE.BoxGeometry(.62, .02, .42), MAT.plasticGrey, [-.95, .825, z0 + .23], null, null, lav, { cast: false });
  addMesh(new THREE.CylinderGeometry(.012, .012, .12, 8), MAT.chrome, [-.95, .9, z0 + .06], [.9, 0, 0], null, lav);
  const mir = addMesh(new THREE.PlaneGeometry(.6, .62), MAT.mirror, [-.95, 1.38, z0 + .025], null, null, lav, { cast: false }); WORLD.mirror = mir;
  addMesh(new THREE.PlaneGeometry(.5, .5), MAT.bloodSmear, [-.88, 1.25, z0 + .03], [0, 0, .3], null, lav, { cast: false });
  addMesh(new THREE.PlaneGeometry(.35, .35), MAT.bloodSpat, [-.7, 1.5, z0 + .028], null, null, lav, { cast: false });
  addMesh(new THREE.PlaneGeometry(.5, .5), MAT.bloodDrip, [-.95, .7, z0 + .445], [0, 0, 0], null, lav, { cast: false });
  addMesh(new THREE.BoxGeometry(.6, .04, .04), MAT.lavLight, [-.95, 1.74, z0 + .05], null, null, lav, { cast: false, recv: false });
  // vaso sanitário de aço inox
  const toilet = new THREE.Group(); toilet.position.set(-1.12, 0, (z0 + z1) / 2 + .08); lav.add(toilet);
  const lathe = new THREE.LatheGeometry([[.0, 0], [.13, 0], [.15, .1], [.17, .3], [.2, .4], [.19, .42], [0, .42]].map(p => new THREE.Vector2(p[0], p[1])), 28);
  addMesh(lathe, MAT.porcelain, [0, 0, 0], null, [1.05, 1, 1.25], toilet);
  addMesh(roundedBox(.4, .03, .46, .012), MAT.plasticGrey, [0, .43, 0], null, null, toilet);
  addMesh(roundedBox(.38, .5, .08, .02), MAT.plasticGrey, [-.36, .7, 0], [0, Math.PI / 2, -.05], null, toilet);
  // detector de fumaça, cinzeiro, lixeira com tampa basculante
  addMesh(new THREE.CylinderGeometry(.06, .06, .02, 18), MAT.plasticGrey, [-1.0, 2.035, (z0 + z1) / 2], null, null, lav);
  const trash = addMesh(roundedBox(.2, .1, .02, .01), MAT.chrome, [-.95, .7, z0 + .441], null, null, lav); WORLD.trashFlap = trash;
  // sangue no piso e no assento
  addMesh(new THREE.PlaneGeometry(.95, .8), MAT.bloodPool, [-.93, .006, (z0 + z1) / 2 + .1], [-Math.PI / 2, 0, .4], null, lav, { cast: false });
  addMesh(new THREE.PlaneGeometry(.4, .4), MAT.bloodSpat, [-.72, .007, z0 + .55], [-Math.PI / 2, 0, 1], null, lav, { cast: false });
  addMesh(new THREE.PlaneGeometry(.3, .3), MAT.bloodDrip, [-.97, .23, (z0 + z1) / 2 + .08], [0, Math.PI / 2, 0], null, lav, { cast: false });
  // jumpseats dobráveis nas paredes traseiras dos lavatórios
  for (const sx of [-1, 1]) addMesh(roundedBox(.45, .55, .07, .03), MAT.leather, [sx * 1.0, 1.15, z1 + .06], null, null, S);
  // galley traseira
  const g = new THREE.Group(); g.position.set(0, 0, LAY.galleyZ); S.add(g); WORLD.aftGalley = g;
  addMesh(roundedBox(3.2, 2.08, 1.2, .02), MAT.plasticGrey, [0, 1.04, .62], null, null, g);
  addMesh(new THREE.PlaneGeometry(3.0, 1.0), MAT.galley, [0, 1.52, .012], [0, Math.PI, 0], null, g, { cast: false });
  addMesh(roundedBox(3.1, .04, .5, .01), MAT.metal, [0, 1.02, .05], null, null, g);
  WORLD.trolleys = [];
  for (let i = 0; i < 8; i++) { const x = -1.3 + i * .37; const tg = new THREE.Group(); tg.position.set(x, 0, .02); g.add(tg); addMesh(roundedBox(.3, .98, .81, .01), MAT.metal, [0, .49, .405], null, null, tg); addMesh(new THREE.PlaneGeometry(.3, .98), MAT.trolley, [0, .49, -.006], [0, Math.PI, 0], null, tg, { cast: false }); WORLD.trolleys.push(tg); }
  // luz de trabalho da galley (faixa quente)
  addMesh(new THREE.BoxGeometry(2.8, .02, .02), MAT.warmStrip, [0, 1.96, -.02], null, null, g, { cast: false, recv: false });
  // compartimento de bagagem da tripulação (porta)
  addMesh(roundedBox(.6, .5, .03, .01), MAT.plasticGrey, [1.1, 2.18 - .35, -.02], null, null, g); WORLD.crewBin = V3(1.1, 1.83, LAY.galleyZ - .02);
  // interfone traseiro
  addMesh(roundedBox(.06, .2, .05, .02), MAT.black, [-1.38, 1.3, LAY.lavZ1 + .07], null, null, S); WORLD.handsetAft = V3(-1.38, 1.3, LAY.lavZ1 + .07);
  // FAP traseiro
  const fm = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffffff, emissiveMap: WORLD.fap.t, emissiveIntensity: .7 }); addMesh(new THREE.PlaneGeometry(.26, .16), fm, [-1.0, 1.45, LAY.lavZ1 + .025], null, null, S, { cast: false });
}

// ---------------- sinalização
function buildSigns() {
  const S = R.scene; const exitT = signTex('SAÍDA', 'EXIT', '#0c3b1f', '#7dff9c'); const exitM = new THREE.MeshBasicMaterial({ map: exitT, color: new THREE.Color(1, 1, 1).multiplyScalar(1.6) });
  const sign = (p, ry) => { addMesh(roundedBox(.34, .11, .05, .01), MAT.plasticDark, p, [0, ry, 0], null, S, { cast: false }); addMesh(new THREE.PlaneGeometry(.3, .09), exitM, [p[0] + Math.sin(ry) * .026, p[1], p[2] + Math.cos(ry) * .026], [0, ry, 0], null, S, { cast: false, recv: false }); };
  sign([0, 2.08, -.4], Math.PI); sign([0, 2.08, LAY.aftDoorZ - .7], 0); sign([0, 2.1, rowZ(20) + .2], Math.PI); sign([0, 2.1, rowZ(21) - .2], 0);
  const lavT = signTex('OCUPADO', 'OCCUPIED', '#1b1b1d', '#ffb347', 512, 160); const lm = new THREE.MeshBasicMaterial({ map: lavT, color: new THREE.Color(1, 1, 1).multiplyScalar(1.4) });
  addMesh(new THREE.PlaneGeometry(.2, .06), lm, [-.34, 2.0, (LAY.lavZ0 + LAY.lavZ1) / 2 + .05], [0, Math.PI / 2, 0], null, S, { cast: false, recv: false });
  // placas das saídas sobre as asas
  const ow = new THREE.MeshStandardMaterial({ map: signTex('SAÍDA DE EMERGÊNCIA', 'PUXE A ALÇA', '#b3241c', '#fff', 512, 120), roughness: .6 });
  for (const side of [-1, 1]) {
    const z = rowZ(20) + .42; const pts = []; for (let y = .35; y <= 1.35; y += .1) pts.push([side * (wallX(y) - .03), y]); if (side < 0) pts.reverse();
    addMesh(profileStrip(pts, z - .26, z + .26, 1), MAT.plasticGrey, null, null, null, S, { cast: false });
    addMesh(new THREE.PlaneGeometry(.38, .09), ow, [side * (wallX(1.3) - .045), 1.3, z], [0, -side * Math.PI / 2, 0], null, S, { cast: false });
    addMesh(roundedBox(.04, .05, .2, .015), MAT.black, [side * (wallX(1.18) - .06), 1.18, z], null, null, S);
    const wg = new THREE.PlaneGeometry(.2, .28); addMesh(wg, MAT.sky, [side * (wallX(.95) - .04), .95, z], [0, -side * Math.PI / 2, 0], null, S, { cast: false, recv: false });
  }
}

// ---------------- iluminação (noite de cruzeiro: azul ambiente, luzes de leitura âmbar)
function buildLighting() {
  const S = R.scene; const L = WORLD.lights;
  L.hemi = new THREE.HemisphereLight(0x2f3650, 0x0e0e12, .75); S.add(L.hemi);
  L.cabin = [];
  for (let z = .5; z < LAY.lavZ0; z += (R.Q >= 1 ? 3.1 : 4.4)) { const l = new THREE.PointLight(0x7a84d0, 1.9, 5.6, 2); l.position.set(0, 1.62, z); S.add(l); L.cabin.push(l); }
  L.fwd = new THREE.PointLight(0xffd8a8, 2.4, 5, 2); L.fwd.position.set(0, 2.0, -2.2); S.add(L.fwd);
  L.aft = new THREE.PointLight(0xffc890, 3.4, 5.5, 2); L.aft.position.set(0, 1.98, 28.9); S.add(L.aft);
  L.galleyWork = new THREE.SpotLight(0xffd7a8, 7, 4, .9, .8, 2); L.galleyWork.position.set(0, 1.95, LAY.galleyZ - .2); L.galleyWork.target.position.set(0, .8, LAY.galleyZ + .2); S.add(L.galleyWork, L.galleyWork.target);
  L.ck = new THREE.PointLight(0xffb070, 2.4, 3.4, 2); L.ck.position.set(-.2, 1.85, -4.7); S.add(L.ck);
  L.ckDisp = new THREE.PointLight(0x9fc4ff, .6, 1.8, 2); L.ckDisp.position.set(0, 1.3, -5.2); S.add(L.ckDisp);
  // luz do lavatório: holofote com sombra (dramático sobre o corpo)
  L.lav = new THREE.SpotLight(0xdde8ff, 2.8, 4, 1.0, .7, 2); L.lav.position.set(-.95, 1.95, LAY.lavZ0 + .2); L.lav.target.position.set(-1.1, .4, LAY.lavZ0 + .75); L.lav.castShadow = R.Q > 0; L.lav.shadow.mapSize.set(1024, 1024); L.lav.shadow.bias = -.0008; L.lav.shadow.camera.near = .05; S.add(L.lav, L.lav.target);
  // luzes de leitura acesas (assentos-chave + alguns aleatórios)
  L.read = {};
  for (const id of (R.Q >= 1 ? ['23A', '31F', '12C', '27D', '9F'] : ['23A', '31F', '12C'])) {
    const p = seatPos(id); const sp = new THREE.SpotLight(0xffe2b8, 2.6, 2.4, .42, .6, 2); sp.position.set(p.x * .9 + Math.sign(p.x) * .05, 1.57, p.z - .1); sp.target.position.set(p.x, .6, p.z - .25); S.add(sp, sp.target); L.read[id] = sp;
    addMesh(new THREE.CircleGeometry(.014, 12), MAT.readOn, [sp.position.x, 1.572, sp.position.z], [Math.PI / 2, 0, 0], null, S, { cast: false, recv: false });
  }
  // lanterna do jogador
  L.torch = new THREE.SpotLight(0xfff1dc, 0, 9, .42, .45, 2); L.torch.castShadow = R.Q > 0; L.torch.shadow.mapSize.set(R.Q >= 2 ? 1024 : 512, R.Q >= 2 ? 1024 : 512); L.torch.shadow.bias = -.001; L.torch.shadow.camera.near = .1;
  R.camera.add(L.torch); L.torch.position.set(.18, -.18, .05); L.torch.target.position.set(.05, -.05, -3); R.camera.add(L.torch.target);
  // poeira suspensa
  const n = R.Q >= 1 ? 900 : 400; const pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-1.6, 1.6); pos[i * 3 + 1] = rr(.3, 2.1); pos[i * 3 + 2] = rr(-5.5, 30); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  WORLD.dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: .012, map: TEX.dust, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(.5, .5, .55), sizeAttenuation: true })); S.add(WORLD.dust);
}
