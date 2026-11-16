// ---------------------------------------------------------------------------
// ROTEIRO — VOO 0471 (versão 2: reviravolta, interações variadas, clímax em cena)
// Verdade: o "padre" do 18D é um matador contratado por Sérgio Mattar (4A). A bengala
// esconde uma lâmina de cerâmica. Diego é pista falsa: leva dinheiro ilegal no trolley.
// ---------------------------------------------------------------------------
const STORY = {};
const CLUES = {
  corpo: { t: 'O corpo de Otávio Brandão', d: 'Um único furo no pescoço, lâmina fina e curta. Corte na palma direita: ele segurou a lâmina. Morte entre 03:40 e 03:55 UTC.' },
  fibras: { t: 'Fibras de lã preta sob as unhas', key: true, d: 'Otávio arranhou quem o atacou. Lã preta e grossa, não o poliéster azul-marinho dos uniformes da tripulação.' },
  placa: { t: 'Placa "LAVATORY" arranhada', key: true, d: 'O trinco foi fechado por fora forçando a placa com uma lâmina fina. A tripulação levanta a placa com o dedo; quem fez isso não sabia o jeito certo.' },
  luva: { t: 'Ponta de luva nitrílica azul', d: 'Rasgada, com sangue, na lixeira do lavatório. É o modelo azul das galleys. Alguém pegou luvas na galley traseira.' },
  carteira: { t: 'Foto na carteira: "Bia — 12/03"', d: 'Atrás da foto de uma menina, na carteira de Otávio: "Bia — 12/03". O papel de parede do celular é a mesma menina.' },
  celular: { t: 'Mensagens no celular da vítima', key: true, d: 'Dra. Paula Viana (PF), 22:40: "O Mattar usa gente que não parece perigosa. Desconfie de quem se aproximar como amigo." 03:12: "A escala da tripulação mudou."' },
  forro: { t: 'Bolso interno cortado (23C)', d: 'O forro do paletó foi cortado com uma lâmina. O pen drive que Otávio conferia o tempo todo sumiu.' },
  pasta: { t: 'Pasta "Operação Maré Alta"', d: 'Relatório sigiloso da Receita sobre lavagem no Porto de Suape. Principal investigado: Sérgio Mattar (4A). "Original no pen drive — PJ, Lisboa, 10h."' },
  livia: { t: 'Lívia: 03:41 e o "tic… tic…"', key: true, d: 'Otávio foi ao lavatório às 03:41. Pouco depois, Lívia ouviu um "tic… tic…" no corredor, como ponteira de bengala no carpete, indo e voltando.' },
  padreFala: { t: 'O padre acusa "um rapaz da tripulação"', d: 'Segundo o padre do 18D, às 03:50 um comissário jovem vinha do fundo enxugando as mãos. Foi também ele quem avisou do banheiro ocupado.' },
  escala: { t: 'Escala alterada na véspera', d: 'Diego Farias trocou de voo às 21:58 de ontem para ficar na galley traseira. Motivo: "pessoal".' },
  dinheiro: { t: '€ 380 mil no fundo falso do trolley A7', d: 'O trolley que Diego guardou na galley tinha fundo falso cheio de notas de 500 euros. Etiqueta: "MLP — Funchal".' },
  confissao: { t: 'Diego confessa: era "só" o dinheiro', d: 'Diego leva dinheiro do Mattar para a Madeira. Jura que não matou ninguém: "Me disseram que no avião ia ter outra pessoa cuidando das coisas."' },
  escuta: { t: 'Mattar ao telefone: "fileira dezoito"', key: true, d: 'Escondida atrás da cortina, Marta ouviu Mattar: "Ele está na fileira dezoito. Ninguém revista um velho. O garoto só carrega o dinheiro."' },
  davi: { t: 'Davi Rocha é jornalista', d: 'Repórter investigativo. Seguia Otávio havia semanas por causa da Maré Alta.' },
  foto: { t: 'Foto de Davi — 03:44', d: 'Uma figura escura junto à porta do lavatório esquerdo, às 03:44:17. Escura demais para identificar.' },
  fotoZoom: { t: 'Foto ampliada: colarinho clerical e bengala', key: true, d: 'Realçada, a foto mostra um colarinho branco de padre e a curva de uma bengala na mão da figura.' },
  sonho: { t: 'A passageira do 20C', d: '"Ele rezava em cima dele… de preto…" Ela diz ter sonhado. Senta de frente para o corredor, a duas fileiras do padre.' },
  bengala: { t: 'A bengala esconde uma lâmina', key: true, d: 'A empunhadura da bengala do padre gira e solta uma lâmina de cerâmica de 9 cm, com sangue seco no encaixe.' },
};
const PEOPLE_INFO = [
  { n: 'Otávio Lacerda Brandão', s: '23C · vítima', d: 'Auditor-fiscal da Receita, 52 anos. Testemunha-chave da Operação Maré Alta.' },
  { n: 'Lívia Coutinho', s: '23A', d: 'Enfermeira, 34. Viu a vítima sair para o lavatório.' },
  { n: '"Pe. Tomás Albuquerque"', s: '18D', d: 'Padre, ~70 anos, anda de bengala. Pediu assistência no embarque.' },
  { n: 'Davi Rocha', s: '31F', d: 'Diz ser consultor de TI.', note: ['davi2', 'É jornalista e seguia a vítima.'] },
  { n: 'Sérgio Mattar', s: '4A · executiva', d: 'Empresário portuário investigado na Maré Alta.' },
  { n: 'Diego Farias', s: 'Comissário · L4', d: 'Oito meses de casa. Responsável pela galley traseira.' },
  { n: 'Renato Souza', s: '16D', d: 'Insone. Observa tudo.' },
  { n: 'Marta Quintela', s: 'Chefe de cabine', d: '23 anos de voo. Encontrou o corpo às 04:31.' },
];
const SPK = { 'Helena': 'helena', 'Camila': 'camila', 'Marta': 'marta', 'Diego': 'diego', 'Lívia': 'livia', 'Padre': 'padre', 'Davi': 'davi', 'Mattar': 'mattar', 'Renato (16D)': 'watcher', 'Passageira (20C)': 'sonha', '31F': 'davi' };
UI.onLine = (name, text, d) => { const k = SPK[name]; const n = k && PEOPLE.npcs[k]; if (n && n.g.visible) n.speak(d); };
const PADRE_KEYS = ['fibras', 'placa', 'livia', 'escuta', 'fotoZoom', 'bengala', 'celular'];
const PADRE_HARD = ['fibras', 'fotoZoom', 'bengala', 'escuta'];

// ----------------------------------------------------------------- objetos de cena
function caneMesh() {
  const g = new THREE.Group(); const wood = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: .45, metalness: .05 }); wood.envMap = MAT.plastic.envMap; wood.envMapIntensity = .6;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.011, .013, .82, 14), wood); shaft.position.y = -.41; g.add(shaft);
  const crook = new THREE.Mesh(new THREE.TorusGeometry(.045, .012, 10, 24, Math.PI), wood); crook.position.set(.045, 0, 0); g.add(crook);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(.0135, .0135, .012, 16), MAT.chrome); ring.position.y = -.035; g.add(ring);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(.013, .012, .03, 12), MAT.black); tip.position.y = -.83; g.add(tip);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
function bladeMesh() { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(.008, .0); s.lineTo(.006, .085); s.lineTo(0, .095); s.lineTo(-.004, .08); s.lineTo(-.004, 0); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .002, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: .15 })); return m; }
function euroTex() { const c = canvas(256, 128), x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, '#b77bb2'); g.addColorStop(.5, '#d3a6c9'); g.addColorStop(1, '#9e6aa3'); x.fillStyle = g; x.fillRect(0, 0, 256, 128); x.fillStyle = 'rgba(60,20,70,.7)'; x.font = '700 54px Inter, Arial'; x.fillText('500', 14, 70); x.font = '600 18px Inter, Arial'; x.fillText('EURO  ΕΥΡΩ', 120, 112); for (let i = 0; i < 6; i++) { x.strokeStyle = 'rgba(80,30,90,.35)'; x.beginPath(); x.arc(180, 50, 12 + i * 7, 0, TAU); x.stroke(); } return texFromCanvas(c); }
function wallet() {
  const g = new THREE.Group(); const lm = new THREE.MeshStandardMaterial({ color: 0x3a2418, roughness: .55, normalMap: TEX.leatherN }); const a = new THREE.Mesh(roundedBox(.11, .09, .012, .006), lm); a.position.x = -.058; a.rotation.y = .25; const b = new THREE.Mesh(roundedBox(.11, .09, .012, .006), lm); b.position.x = .058; b.rotation.y = -.25; g.add(a, b);
  const pf = canvas(256, 192), px = pf.getContext('2d'); const gr = px.createLinearGradient(0, 0, 0, 192); gr.addColorStop(0, '#9cc6e2'); gr.addColorStop(.55, '#e8d7b0'); gr.addColorStop(1, '#c9a873'); px.fillStyle = gr; px.fillRect(0, 0, 256, 192); px.fillStyle = '#5b3a24'; px.beginPath(); px.arc(128, 78, 30, 0, TAU); px.fill(); px.fillStyle = '#e2b48f'; px.beginPath(); px.arc(128, 86, 24, 0, TAU); px.fill(); px.fillStyle = '#d2453b'; px.fillRect(96, 110, 64, 70); px.fillStyle = '#222'; px.beginPath(); px.arc(119, 84, 2.5, 0, TAU); px.arc(137, 84, 2.5, 0, TAU); px.fill(); px.strokeStyle = '#7a3b2c'; px.beginPath(); px.arc(128, 94, 8, .2, Math.PI - .2); px.stroke();
  const pb = canvas(256, 192), bx = pb.getContext('2d'); bx.fillStyle = '#efe9dc'; bx.fillRect(0, 0, 256, 192); bx.fillStyle = '#1b2f7a'; bx.font = 'italic 34px "Segoe Script","Bradley Hand",cursive'; bx.fillText('Bia', 70, 80); bx.font = 'italic 30px "Segoe Script","Bradley Hand",cursive'; bx.fillText('12/03  ♥', 64, 130);
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(.075, .056), new THREE.MeshStandardMaterial({ map: texFromCanvas(pf), roughness: .5 })); photo.position.set(.062, .0, .0075); photo.rotation.y = -.25; g.add(photo);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(.075, .056), new THREE.MeshStandardMaterial({ map: texFromCanvas(pb), roughness: .8 })); back.position.set(.0605, 0, .0055); back.rotation.y = -.25 + Math.PI; g.add(back);
  return g;
}
function placard() { const c = canvas(512, 160), x = c.getContext('2d'); x.fillStyle = '#d9d6cf'; x.fillRect(0, 0, 512, 160); x.fillStyle = '#222'; x.font = '600 56px Inter, Arial'; x.textAlign = 'center'; x.fillText('LAVATORY', 256, 100); x.strokeStyle = 'rgba(40,30,25,.85)'; x.lineWidth = 2;
  for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(40 + i * 6, 120 + rr(-4, 4)); x.lineTo(150 + i * 5, 150 + rr(-3, 3)); x.stroke(); } x.fillStyle = 'rgba(90,10,10,.6)'; x.beginPath(); x.arc(70, 138, 5, 0, TAU); x.fill();
  const m = new THREE.Mesh(roundedBox(.2, .065, .006, .003), [MAT.plasticGrey, MAT.plasticGrey, MAT.plasticGrey, MAT.plasticGrey, new THREE.MeshStandardMaterial({ map: texFromCanvas(c), roughness: .5 }), MAT.plasticGrey]); return m; }

// ----------------------------------------------------------------- elenco
const sitP = (id, dz = 0) => seatPos(id).add(V3(0, SEAT_DY, SEAT_DZ + dz));
function buildCast() {
  const N = (k, o) => new Person(k, o);
  N('helena', { name: 'Helena', pos: V3(.53, .05, -4.92), sit: true, anim: 'sit_chair_idle_neutral_01', hideHat: true, track: true, trackRange: 3 });
  N('camila', { name: 'Camila', pos: V3(.6, 0, -1.9), rotY: -Math.PI / 2, anim: 'idle_neutral_01', track: true });
  N('marta', { name: 'Marta', pos: V3(.6, 0, 28.75), anim: 'idle_nervous_01', expr: 'worried', track: true });
  N('diego', { name: 'Diego', pos: V3(1.05, 0, 29.05), rotY: -.3, anim: 'idle_nervous_01', expr: 'nervous', track: true });
  N('livia', { name: 'Lívia', pos: sitP('23A'), sit: true, anim: 'sit_chair_idle_nervous_01', expr: 'worried', track: true });
  N('padre', { name: 'Padre', pos: sitP('18D'), sit: true, anim: 'sit_chair_gestic_thoughtful', expr: 'calm', track: true, trackRange: 4 });
  N('davi', { name: 'Davi', pos: sitP('31F'), sit: true, anim: 'sit_chair_idle_look_around', expr: 'nervous', track: true });
  N('mattar', { name: 'Mattar', pos: sitP('4A'), sit: true, anim: 'sit_chair_breathe_01', expr: 'sleep' });
  N('watcher', { name: 'Renato', pos: sitP('16D'), sit: true, anim: 'sit_chair_idle_nervous_01', expr: 'stern', track: true, trackRange: 6 });
  N('sonha', { model: 'f09', name: 'Passageira', pos: sitP('20C'), sit: true, anim: 'sit_chair_breathe_01', expr: 'sleep' });
  const v = N('otavio', { name: 'Otávio', pos: V3(-1.12, -.03, (LAY.lavZ0 + LAY.lavZ1) / 2 + .1), rotY: -Math.PI / 2, sit: true, anim: 'sit_chair_breathe_01', expr: 'dead', tint: [.8, .82, .87] });
  v.always = true; v.mixer.timeScale = 0; v.extraRot = { spinePitch: .28, spineRoll: .12, neckPitch: .35, neckRoll: .25, headPitch: .45, headRoll: .45, headYaw: .3 }; v.blinkT = 1e9;
  // bengala apoiada ao lado do padre, colarinho clerical, sangue na camisa da vítima
  STORY.caneSeat = caneMesh(); STORY.caneSeat.position.copy(seatPos('18D')).add(V3(-.26, .86, -.2)); STORY.caneSeat.rotation.set(.12, 0, -.1); R.scene.add(STORY.caneSeat);
  STORY.caneHand = caneMesh(); STORY.caneHand.visible = false; R.scene.add(STORY.caneHand);
  STORY.blade = bladeMesh(); STORY.blade.visible = false; R.scene.add(STORY.blade);
  const collar = new THREE.Mesh(new THREE.BoxGeometry(.028, .02, .006), new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: .4 })); STORY.collar = collar; R.scene.add(collar);
  STORY.vblood = []; for (const [y, s, r, map] of [[.98, .3, .3, MAT.bloodPool], [.86, .22, 1.2, MAT.bloodSpat], [.72, .26, 2, MAT.bloodPool]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 1.2), map); m.rotation.z = r; R.scene.add(m); STORY.vblood.push([m, y]); }
  // celular da vítima no chão
  const ph = new THREE.Group(); ph.position.set(-.72, .012, 27.55); ph.rotation.y = .7; R.scene.add(ph); ph.add(new THREE.Mesh(roundedBox(.075, .009, .155, .008), MAT.black));
  WORLD.phoneScr = new THREE.Mesh(new THREE.PlaneGeometry(.068, .145), new THREE.MeshBasicMaterial({ color: 0 })); WORLD.phoneScr.rotation.x = -Math.PI / 2; WORLD.phoneScr.position.y = .0055; ph.add(WORLD.phoneScr);
  WORLD.phoneLight = new THREE.PointLight(0x9fc0ff, 0, .8, 2); WORLD.phoneLight.position.set(0, .06, 0); ph.add(WORLD.phoneLight); WORLD.phone = ph;
  const jk = new THREE.Mesh(roundedBox(.42, .05, .5, .02), clothMat(0x2b2f36)); jk.position.copy(seatPos('23C')).add(V3(0, .52, 0)); jk.rotation.set(.05, .1, .04); R.scene.add(jk);
  // extintor de Halon na galley traseira
  const ext = new THREE.Group(); ext.position.set(-1.38, .62, LAY.lavZ1 + .14); R.scene.add(ext); const red = new THREE.MeshStandardMaterial({ color: 0xb01a12, roughness: .35, metalness: .3 }); ext.add(new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .36, 18), red)); const nz = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .08, 8), MAT.black); nz.position.y = .22; ext.add(nz); STORY.ext = ext;
  // notas de euro (aparecem quando o trolley tomba)
  const et = euroTex(); const em = new THREE.MeshStandardMaterial({ map: et, roughness: .8 }); STORY.cash = new THREE.Group(); for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.16, .025, .08), em); b.position.set(rr(-.35, .35), .013 + (i % 3) * .026, rr(-.25, .25)); b.rotation.y = rr(-1, 1); b.castShadow = true; STORY.cash.add(b); } STORY.cash.visible = false; R.scene.add(STORY.cash);
}
function attachProps() {
  const pd = PEOPLE.npcs.padre; pd.update(0, 0, null);
  // colarinho preso ao pescoço (posição calculada no mundo e convertida para o osso)
  const nk = pd.bones.Bip01_Neck; const fwd = V3(0, 0, -1).applyQuaternion(pd.g.getWorldQuaternion(new THREE.Quaternion())); const wp = pd.bonePos('Neck').add(fwd.clone().multiplyScalar(.062)).add(V3(0, .005, 0));
  nk.add(STORY.collar); STORY.collar.position.copy(nk.worldToLocal(wp)); const q = new THREE.Quaternion(); STORY.collar.quaternion.copy(nk.getWorldQuaternion(q).invert().multiply(pd.g.getWorldQuaternion(new THREE.Quaternion())));
}
function holdInHand(npc, obj, side = 'R', off = [0, -.02, .04], rot = [0, 0, 0]) {
  const h = npc.bones[`Bip01_${side}_Hand`]; obj.visible = true; h.add(obj); obj.position.set(...off); obj.rotation.set(...rot);
}
function placeBlood() { const v = PEOPLE.npcs.otavio; if (!v) return; const nk = v.bonePos('Spine2'); const fwd = V3(1, 0, 0); for (const [m, y] of STORY.vblood) { m.position.set(nk.x + .12, y - .02, nk.z); m.rotation.y = Math.PI / 2; } }

// ----------------------------------------------------------------- utilidades
function camLookAt(target) { GAME.camTarget = target; }
async function converse(npc, fn, o = {}) {
  GAME.busy = true; const prev = P.mode; const isP = npc instanceof Person; cine(true); GAME.fxT.focus = .55;
  if (isP) { // plano fechado: teleobjetiva a partir do corredor, na altura do rosto, com luz de rosto
    const head = npc.headWorld(); const ry = npc.g.rotation.y; const fw = V3(-Math.sin(ry), 0, -Math.cos(ry)); const seated = !!npc.o.sit; const cp = seated ? V3(clamp(head.x + fw.x * .8, -.22, .22), head.y + .2, head.z + fw.z * .8) : V3(clamp(head.x + fw.x * 1.1, -1.4, 1.4), head.y + .03, head.z + fw.z * 1.1); if (!seated && !inWalk(cp.x, cp.z)) { cp.x = clamp(cp.x, -.2, .2); }
    const dist = cp.distanceTo(head); const fov = clamp(2 * Math.atan(.42 / dist) * 180 / Math.PI, 24, 60); npc.lookTarget = cp.clone(); if (o.talk) npc.play(o.talk);
    await shot(cp, head, .55, { fov });
  } else { P.mode = 'talk'; camLookAt(npc); }
  await wait(.3); try { await fn(); } finally { dialogEnd(); cine(false); GAME.fxT.focus = 0; GAME.camTarget = null; if (isP) endShot(); P.mode = prev === 'talk' || prev === 'cine' ? 'walk' : prev; GAME.busy = false; if (isP) { npc.lookTarget = null; if (o.after) npc.play(o.after); if (o.exprAfter) npc.setExpr(o.exprAfter); } }
}
const npcPos = k => PEOPLE.npcs[k].headWorld();
function setTension(v) { AU.tension = v; }
async function interview(npc, topics) {
  const seen = new Set();
  while (true) { const avail = topics.filter(t => !t.cond || t.cond()); const opts = avail.map((t, i) => ({ t: t.q, id: i, seen: seen.has(t.q) })); opts.push({ t: 'Encerrar conversa', id: -1 });
    const c = await choose(opts, ''); if (c === -1) break; const tp = avail[c]; seen.add(tp.q); await tp.a(); if (tp.once) topics.splice(topics.indexOf(tp), 1); }
}
const ex = (k, e, sec) => () => { PEOPLE.npcs[k].setExpr(e); if (sec) setTimeout(() => PEOPLE.npcs[k] && PEOPLE.npcs[k].setExpr('neutral'), sec * 1000); };
const an = (k, a, o) => () => { PEOPLE.npcs[k].play(a, o); };
function lightsDark(on) {
  const L = WORLD.lights; const k = on ? 0 : 1; L.cabin.forEach(l => l.visible = !on); L.fwd.intensity = on ? 0 : 2.4; L.aft.intensity = on ? .25 : 3.4; L.galleyWork.intensity = on ? 0 : 7; Object.values(L.read).forEach(l => l.visible = !on); L.hemi.intensity = on ? .12 : .75;
  MAT.mood.color.setRGB(.2 * 1.1 * k, .24 * 1.1 * k, .6 * 1.1 * k); MAT.warmStrip.color.setRGB(1.6 * k, 1.15 * k, .72 * k); MAT.readOn.color.setRGB(14 * k, 12.6 * k, 10 * k); MAT.ife.color.setScalar(on ? .15 : .9); MAT.pathLight.color.setRGB(on ? 1.6 : .27, on ? 2.2 : .37, on ? 1.5 : .25);
}
function lightsFull() { const L = WORLD.lights; L.cabin.forEach(l => { l.visible = true; l.color.set(0xffe9d2); l.intensity = 2.6; }); L.hemi.intensity = .85; L.hemi.color.set(0x9a958c); MAT.mood.color.setRGB(1.2, 1.1, .95); L.aft.intensity = 7; L.galleyWork.intensity = 10; }
async function flicker(n = 6) { for (let i = 0; i < n; i++) { lightsDark(true); await wait(.05 + rand() * .12); lightsDark(false); await wait(.05 + rand() * .25); } }
let flickLav = 0;
function tweenRot(obj, to, sec) { const from = obj.rotation.y; const t0 = GAME.t; return new Promise(res => { GAME.anims.push(() => { const k = easeInOut((GAME.t - t0) / sec); obj.rotation.y = lerp(from, to, k); if (k >= 1) { res(); return true; } }); }); }
function tweenObj(obj, to, sec, rot) { const from = obj.position.clone(); const r0 = obj.rotation.clone(); const t0 = GAME.t; return new Promise(res => { GAME.anims.push(() => { const k = easeInOut((GAME.t - t0) / sec); obj.position.lerpVectors(from, to, k); if (rot) { obj.rotation.x = lerp(r0.x, rot[0], k); obj.rotation.y = lerp(r0.y, rot[1], k); obj.rotation.z = lerp(r0.z, rot[2], k); } if (k >= 1) { res(); return true; } }); }); }

// ----------------------------------------------------------------- documentos
const DOCS = {
  phone: () => `<div class="phone"><div class="pt">04:${fmt2(40 + Math.floor(GAME.t / 60) % 19)}</div><div class="pd">sábado, 15 de novembro · desbloqueado</div>
   <div class="nt"><b>Dra. Paula Viana · PF — 22:40</b>O Mattar não usa capanga com cara de capanga. Usa gente que não parece perigosa. Desconfie de quem se aproximar como amigo.</div>
   <div class="nt"><b>Dra. Paula Viana · PF — 03:12</b>A escala da tripulação do 0471 mudou ontem. Pode não ser nada. Não saia do assento até Lisboa.</div>
   <div class="nt"><b>Você — 03:39</b>Tudo calmo. Um padre puxou conversa no portão, perguntou pra onde eu ia. Gente boa.</div>
   <div class="nt"><b>Bia ❤️ — 21:15</b>papai traz chocolate de lisboa??</div></div>`,
  boarding: () => `<div class="paper" style="max-width:560px"><h3>Cartão de embarque · Boarding pass</h3><table><tr><td><small>PASSAGEIRO</small><br><b>BRANDAO/OTAVIO L MR</b></td><td><small>VOO</small><br><b>AT 0471</b></td><td><small>ASSENTO</small><br><b class="hl">23C</b></td></tr><tr><td><small>DE</small><br><b>RECIFE REC</b></td><td><small>PARA</small><br><b>LISBOA LIS</b></td><td><small>EMBARQUE</small><br>22:25</td></tr></table><p style="margin-top:14px">Verso: <span class="hand">"PJ — Insp. Ramos — 10h — Terminal 1"</span></p></div>`,
  pasta: () => `<div class="paper"><div class="stamp">SIGILOSO</div><h3>Receita Federal do Brasil</h3><small>RELATÓRIO DE AUDITORIA FISCAL Nº 0412/2026 · OPERAÇÃO MARÉ ALTA</small><p style="margin:14px 0">Auditor: <b>Otávio Lacerda Brandão</b></p>
   <table><tr><th>Empresa</th><th>Movimentação</th><th>Destino</th></tr><tr><td class="hl">Mattar Logística Portuária S.A.</td><td>R$ 412,7 mi</td><td>Lisboa / Funchal</td></tr><tr><td>Atlas Terminais Suape Ltda.</td><td>R$ 96,1 mi</td><td>Panamá</td></tr><tr><td class="hl">MLP Participações</td><td>R$ 58,0 mi</td><td>Madeira (ZFM)</td></tr></table>
   <p style="margin-top:14px">Beneficiário final: <b class="hl">SÉRGIO AUGUSTO MATTAR</b>. Transporte de espécie por "mulas" em voos comerciais (pág. 22).</p><p class="hand" style="margin-top:10px">Original no pen drive — PJ, Lisboa, 10h. Não despachar!</p></div>`,
  pil: () => `<div class="paper"><h3>PIL · Passenger Information List — AT0471 REC-LIS</h3><table><tr><th>Assento</th><th>Nome</th><th>Obs.</th></tr><tr><td>4A</td><td>MATTAR/SERGIO A MR</td><td>J · conexão LIS-FNC</td></tr><tr><td>16D</td><td>SOUZA/RENATO MR</td><td>—</td></tr>
   <tr><td class="hl">18D</td><td class="hl">ALBUQUERQUE/TOMAS REV</td><td class="hl">WCHS (cadeira de rodas até a porta) · bengala · reserva paga por MLP PARTICIPACOES</td></tr><tr><td>20C</td><td>MENDES/IRACEMA MRS</td><td>—</td></tr><tr><td>23A</td><td>COUTINHO/LIVIA MS</td><td>—</td></tr><tr><td>23C</td><td>BRANDAO/OTAVIO L MR</td><td>servidor público</td></tr><tr><td>31F</td><td>ROCHA/DAVI MR</td><td>emissão 12NOV</td></tr></table></div>`,
  escala: () => `<div class="paper"><div class="stamp">ALTERADA</div><h3>Escala de tripulação — AT0471 · 14/11</h3><table><tr><td>CMT</td><td>Ricardo VALENÇA</td></tr><tr><td>CO</td><td>Helena DUARTE</td></tr><tr><td>CC · L1</td><td>Marta QUINTELA</td></tr><tr><td>R1</td><td>Camila ARAÚJO</td></tr><tr><td class="hl">L4 · galley tras.</td><td class="hl"><s>Priscila NUNES</s> → Diego FARIAS (GRU)</td></tr></table><p style="margin-top:12px">Alteração: <span class="hl">13/11 · 21:58 · solicitada por FARIAS D. · "pessoal"</span></p></div>`,
};
async function photoDoc() {
  const pd = PEOPLE.npcs.padre; const sv = { p: pd.g.position.clone(), r: pd.g.rotation.y, a: pd.cur && pd.cur.getClip().name }; const door = WORLD.lavDoor; const dr = door.rotation.y;
  pd.g.position.set(-.12, 0, 27.0); pd.g.rotation.y = Math.PI / 2 + .25; pd.play('knock_door', { fade: 0 }); pd.mixer.update(1.2); pd.update(0, 0, null); door.rotation.y = 0;
  holdInHand(pd, STORY.caneHand, 'L', [0, -.03, .02], [0, 0, Math.PI]); pd.root.updateMatrixWorld(true); STORY.caneSeat.visible = false;
  const torch = WORLD.lights.torch.intensity; WORLD.lights.torch.intensity = 0;
  const cam = new THREE.PerspectiveCamera(46, 1.5, .05, 60); cam.position.set(.08, 1.58, rowZ(32) + .25); cam.lookAt(-.2, 1.25, 27.2); cam.updateMatrixWorld();
  const W = 720, H = 480; const rt = new THREE.WebGLRenderTarget(W, H); R.renderer.setRenderTarget(rt); R.renderer.render(R.scene, cam); const px = new Uint8Array(W * H * 4); R.renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); R.renderer.setRenderTarget(null); rt.dispose();
  const np = pd.bonePos('Neck').project(cam); const u = np.x * .5 + .5, v = 1 - (np.y * .5 + .5); STORY.photoRect = [u - .09, v - .1, u + .09, v + .12];
  pd.g.position.copy(sv.p); pd.g.rotation.y = sv.r; pd.play(sv.a ? sv.a.slice(2) : 'sit_chair_gestic_thoughtful', { fade: 0 }); door.rotation.y = dr; WORLD.lights.torch.intensity = torch; STORY.caneHand.visible = false; STORY.caneHand.removeFromParent(); R.scene.add(STORY.caneHand); STORY.caneSeat.visible = true;
  const c = canvas(W, H), x = c.getContext('2d'); const img = x.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) { const s = ((H - 1 - y) * W + i) * 4, o = (y * W + i) * 4; const n = (Math.random() - .5) * 30; for (let k = 0; k < 3; k++) { let val = px[s + k] / 255; val = Math.pow(Math.min(1, val * 2.2), 1 / 2.2) * 255 * .55; img.data[o + k] = clamp(val + n + (k === 2 ? 6 : 0), 0, 255); } img.data[o + 3] = 255; }
  x.putImageData(img, 0, 0); x.filter = 'blur(.7px)'; x.drawImage(c, 0, 0); x.filter = 'none'; x.fillStyle = 'rgba(255,170,40,.92)'; x.font = '20px "IBM Plex Mono", monospace'; x.fillText('15/11/2026  03:44:17', W - 270, H - 22); x.fillText('ISO 25600  1/8  f1.8', 18, H - 22);
  return c.toDataURL('image/jpeg', .9);
}

// ----------------------------------------------------------------- interações
function registerInteractions() {
  const I = addInteract; const F = GAME.flags; const ch = (...c) => () => c.includes(GAME.chapter); const me = () => GAME.chapter === 'marta' ? 'Marta' : 'Comandante';
  // cockpit
  I({ hit: hitbox(.3, .25, .35, [-.98, .78, -4.9]), label: 'Atender o interfone', enabled: () => GAME.chapter === 'cockpit' && F.callRinging, action: () => callMarta() });
  I({ hit: hitbox(.35, .2, .2, [-.85, .92, -3.82]), label: 'Pegar a lanterna', enabled: () => !P.hasTorch && GAME.chapter === 'cockpit' && F.called, action: () => { P.hasTorch = true; WORLD.torchMesh.visible = false; SFX.click(); hint('Lanterna: tecla F (ou botão "Luz")', 6); } });
  I({ hit: hitbox(.9, 2, .3, [0, 1, LAY.ckDoor]), label: 'Abrir a porta do cockpit', enabled: () => GAME.chapter === 'cockpit' && F.called && !F.ckOpened, action: () => openCockpitDoor() });
  I({ hit: hitbox(.9, 2, .3, [0, 1, LAY.ckDoor]), label: 'Porta do cockpit — trancada', enabled: () => GAME.chapter === 'marta', action: () => hint('A porta só abre por dentro. Fale com o comandante pelo interfone.') });
  I({ hit: PEOPLE.npcs.helena.hit, label: 'Falar com Helena (copiloto)', enabled: () => GAME.chapter === 'cockpit' && F.called, action: () => converse(PEOPLE.npcs.helena, () => talk([['Helena', 'Eu fico com o avião, comandante. Se for preciso, levo a gente até o Sal.'], ['Helena', 'Leve a lanterna. E… olhe bem para todo mundo lá atrás.']])) });
  // pessoas
  I({ hit: PEOPLE.npcs.marta.hit, label: 'Falar com Marta', enabled: () => GAME.chapter === 'investigate', action: () => talkMarta() });
  I({ hit: PEOPLE.npcs.diego.hit, label: 'Falar com Diego', enabled: () => ['investigate', 'marta'].includes(GAME.chapter) && PEOPLE.npcs.diego.g.visible, action: () => talkDiego() });
  I({ hit: PEOPLE.npcs.livia.hit, label: 'Falar com Lívia (23A)', enabled: ch('investigate', 'marta'), action: () => talkLivia() });
  I({ hit: PEOPLE.npcs.padre.hit, label: 'Falar com o padre (18D)', enabled: () => ['walk', 'investigate', 'marta'].includes(GAME.chapter) && !F.padreAway, action: () => talkPadre() });
  I({ hit: PEOPLE.npcs.davi.hit, label: 'Falar com o passageiro do 31F', enabled: ch('investigate', 'marta'), action: () => talkDavi() });
  I({ hit: PEOPLE.npcs.mattar.hit, label: () => GAME.chapter === 'marta' ? 'Falar com o passageiro do 4A' : 'Passageiro do 4A — dormindo', enabled: () => ['walk', 'investigate', 'marta'].includes(GAME.chapter), action: () => talkMattar() });
  I({ hit: PEOPLE.npcs.watcher.hit, label: 'Passageiro do 16D', enabled: () => ['walk', 'investigate', 'marta'].includes(GAME.chapter), action: () => talkWatcher() });
  I({ hit: PEOPLE.npcs.sonha.hit, label: 'Passageira do 20C', enabled: () => F.grabbed && ['walk', 'investigate', 'marta'].includes(GAME.chapter), action: () => talkSonha() });
  // lavatório e vítima
  I({ hit: hitbox(.25, 1.9, .65, [-.33, .95, (LAY.lavZ0 + LAY.lavZ1) / 2 + .05]), label: () => F.lavOpened ? 'Examinar a placa e o trinco da porta' : 'Abrir o lavatório', enabled: ch('investigate', 'marta'), action: () => F.lavOpened ? examinePlacard() : openLav() });
  I({ hit: PEOPLE.npcs.otavio.hit, label: 'Examinar o corpo', enabled: () => F.lavOpened, action: () => examineBody() });
  I({ hit: hitbox(.25, .2, .2, [-.95, .7, LAY.lavZ0 + .44]), label: 'Abrir a lixeira', enabled: () => F.lavOpened && !GAME.clues.has('luva'), action: () => examineTrash() });
  I({ hit: hitbox(.25, .15, .3, [-.72, .05, 27.55]), label: 'Pegar o celular no chão', enabled: () => F.lavOpened, action: () => examinePhone() });
  I({ hit: hitbox(.45, .7, .5, seatPos('23C').add(V3(0, .6, 0)).toArray()), label: 'Examinar o paletó no 23C', enabled: ch('investigate', 'marta'), action: () => examineSeat() });
  I({ hit: hitbox(.7, .4, .7, [-1.35, 1.75, rowZ(23)]), label: 'Abrir o bagageiro do 23C', enabled: ch('investigate', 'marta'), action: async () => { GAME.busy = true; SFX.latch(V3(-1.3, 1.8, rowZ(23))); await showDoc(DOCS.pasta()); addClue('pasta'); GAME.busy = false; } });
  // interfones / documentos / trolley / bengala
  I({ hit: hitbox(.3, .4, .3, WORLD.handsetAft.toArray()), label: () => GAME.chapter === 'investigate' ? (F.aftRinging ? 'Atender o interfone' : 'Interfone') : 'Interfone — ligar para o cockpit', enabled: ch('investigate', 'marta'), action: () => GAME.chapter === 'investigate' ? (F.aftRinging ? answerHelena() : hint('Nada a dizer ao cockpit ainda.')) : accuse() });
  I({ hit: hitbox(.5, .4, .3, [-1.0, 1.35, -2.35]), label: 'Escala da tripulação (presa ao FAP)', enabled: ch('investigate', 'marta'), action: async () => { GAME.busy = true; await showDoc(DOCS.escala()); addClue('escala'); GAME.busy = false; } });
  I({ hit: hitbox(.3, .25, .2, [-1.0, 1.45, LAY.lavZ1 + .05]), label: 'FAP traseiro — manifesto (PIL)', enabled: ch('investigate', 'marta'), action: async () => { GAME.busy = true; await showDoc(DOCS.pil()); GAME.busy = false; F.pil = true; } });
  I({ hit: hitbox(.6, .3, .6, [0, .1, 26.2]), label: 'Examinar as notas espalhadas', enabled: () => F.trolleyFell && !GAME.clues.has('dinheiro'), action: () => examineCash() });
  I({ hit: hitbox(.25, .9, .25, [0, .2, rowZ(18) - .3]), label: 'Pegar a bengala caída no corredor', enabled: () => F.caneDropped && !F.caneTaken, action: () => examineCane() });
}

// ----------------------------------------------------------------- PRÓLOGO / ATO I
async function startPrologue() {
  GAME.chapter = 'prologue'; setChar('Comandante Ricardo Valença'); P.mode = 'seated'; P.x = -.53; P.y = 1.2; P.z = -4.98; P.yaw = 0; P.pitch = -.06; P.ckOpen = true;
  GAME.fx.fade = 1; cine(true); setTension(.05); setMusic('calm'); attachProps(); placeBlood();
  await wait(1.2);
  await card('Atlântico Sul · Espaço aéreo oceânico do Sal', 'Voo AT0471', 'Recife → Lisboa · Airbus A321neo · 192 passageiros, 8 tripulantes<br>04:38 UTC · nível de voo 370 · 2 h 33 min de voo', 6.5);
  fxTo('fade', 0, 4); await wait(2.5); GAME.chapter = 'cockpit';
  const H = PEOPLE.npcs.helena; H.lookTarget = R.camera.position.clone();
  await say('Helena', 'Ponto de igual tempo em dezoito minutos. O Sal segue de alternado. Vento calmo lá, dez quilômetros de visibilidade.', 6.5, H.headWorld());
  H.setExpr('smile', .5); await say('Helena', 'Lá atrás tá todo mundo apagado. Melhor parte do voo.', 4, H.headWorld()); H.setExpr('neutral'); H.lookTarget = null;
  await wait(1.5); SFX.buzzer(); await wait(.4); setTension(.2); H.lookTarget = R.camera.position.clone(); H.setExpr('worried');
  await say('Helena', 'Chamada da cabine, comandante. Prioritária… do fundo.', 4, H.headWorld());
  SFX.buzzer(); cine(false); GAME.flags.callRinging = true; setObjective('Atenda o interfone (à sua esquerda). Olhe com o mouse e pressione E.');
  GAME.ringT = setInterval(() => { if (GAME.flags.callRinging) SFX.buzzer(); }, 4500); GAME.playing = true;
}
async function callMarta() {
  GAME.flags.callRinging = false; clearInterval(GAME.ringT); GAME.busy = true; SFX.click(); cine(true); setTension(.35); setMusic('tension');
  await talk([['Marta (interfone)', 'Comandante, é a Marta, no fundo. Preciso que o senhor me escute com calma.'], ['Marta (interfone)', 'O passageiro do 23C. Otávio Brandão. Ele está no lavatório traseiro esquerdo.'], ['Marta (interfone)', '…Ele está morto, comandante.']]);
  const c = await choose([{ t: '"Tem certeza? Pode ter sido um mal súbito."', id: 0 }, { t: '"Quem mais sabe? Alguém tocou em alguma coisa?"', id: 1 }]);
  if (c === 0) await talk([['Marta (interfone)', 'Tem sangue no chão, no espelho… Alguém fez isso com ele, comandante.']]); else await talk([['Marta (interfone)', 'Só eu e o Diego. Fechei a porta de novo. O padre do 18D foi quem avisou que o banheiro estava ocupado fazia tempo.']]);
  STING.hit(); PEOPLE.npcs.helena.setExpr('fear', .7);
  await talk([['Comandante', 'Ninguém se aproxima daquela porta. Estou indo.'], ['Helena', 'Comandante… eu fico com a aeronave. Chamo a Camila pra cá. Regra dos dois.'], ['Helena', 'Liguei o aviso de cintos. Menos gente andando.']]);
  SFX.chime('single'); cine(false); GAME.flags.called = true; GAME.busy = false; PEOPLE.npcs.helena.lookTarget = null; PEOPLE.npcs.helena.setExpr('worried');
  P.mode = 'walk'; P.x = -.35; P.z = -4.45; P.eye = 1.72; P.yaw = Math.PI * .9; P.pitch = -.1; setObjective('Pegue a lanterna presa atrás do seu assento e saia do cockpit.');
}
async function openCockpitDoor() {
  GAME.flags.ckOpened = true; GAME.busy = true; SFX.latch(V3(0, 1, LAY.ckDoor)); await tweenRot(WORLD.ckDoor, -1.6, 1.4);
  const C = PEOPLE.npcs.camila; C.g.position.set(.25, 0, -2.4); C.g.rotation.y = 0; C.setExpr('worried');
  await converse(C, () => talk([['Camila', 'Comandante… a Marta me contou. Eu fico aqui com a Helena.'], ['Camila', 'Não deixe ninguém ver no seu rosto. Os passageiros leem a gente.']]));
  GAME.chapter = 'walk'; setObjective('Vá até o fundo da aeronave, na galley traseira. Ande sem alarmar os passageiros.'); GAME.busy = false;
  C.walkTo([V3(.15, 0, -3.3), V3(.3, 0, -4.2)], .9, 'walk_slow_01', 'idle_neutral_01').then(() => { C.g.rotation.y = Math.PI; });
}
const TRIGGERS = [
  { z: -2.2, ch: 'walk', fn: async () => { await wait(.6); if (P.z > -3.2) { SFX.latch(V3(0, 1, LAY.ckDoor)); await tweenRot(WORLD.ckDoor, 0, 1.2); P.ckOpen = false; } } },
  { z: 2.6, ch: 'walk', fn: () => say('', 'Executiva. O homem do 4A dorme de boca entreaberta, um relógio de ouro no pulso.', 3.8, false) },
  { z: 8.5, ch: 'walk', fn: async () => { SFX.chime('single'); await wait(.8); P.shake = .6; SFX.turbulence(3.5, .8); SFX.creak(V3(1.8, 1.2, P.z + 2)); setTension(.4); } },
  { z: 12.6, ch: 'walk', fn: async () => { const W = PEOPLE.npcs.watcher; W.setExpr('stern'); await wait(1.2); await say('Renato (16D)', 'Comandante. Também ouviu? Tic… tic… Faz uma hora que alguém anda com uma bengala no escuro.', 5.5, W.headWorld()); } },
  { z: 15.9, ch: 'walk', fn: async () => { const T = PEOPLE.npcs.padre; T.setExpr('sad'); await say('Padre', 'Comandante… fui eu que avisei a moça. O banheiro da esquerda. Que Deus tenha piedade dele.', 5, T.headWorld()); T.setExpr('calm'); } },
  { z: rowZ(20) + .15, ch: 'walk', fn: () => handGrab() },
  { z: 25.6, ch: 'walk', fn: () => arriveAft() },
];
async function handGrab() {
  if (GAME.flags.grabbed) return; GAME.flags.grabbed = true; const S = PEOPLE.npcs.sonha; GAME.busy = true; P.mode = 'cine';
  S.setExpr('terror'); S.ik = { side: 'R', target: R.camera.position.clone().add(V3(.05, -.35, .1)), w: 1 }; STING.big(); P.shake = .9; GAME.fx.flash = .15;
  const q0 = R.camera.quaternion.clone(); const tmp = new THREE.PerspectiveCamera(); tmp.position.copy(R.camera.position); tmp.lookAt(S.headWorld()); const t0 = GAME.t; GAME.anims.push(() => { const k = easeInOut((GAME.t - t0) / .25); R.camera.quaternion.slerpQuaternions(q0, tmp.quaternion, k); return k >= 1; });
  await wait(.4); cine(true);
  await talk([['Passageira (20C)', 'Ele estava rezando… rezando em cima dele…'], ['Passageira (20C)', 'De preto… ajoelhado… eu vi…'], () => { S.ik = null; S.setExpr('sleep'); }, ['', 'Os olhos dela se fecham. A respiração volta ao ritmo do sono. A mão escorrega do seu braço.']]);
  cine(false); endShot(); P.mode = 'walk'; GAME.busy = false; addClue('sonho', true);
}
async function arriveAft() {
  GAME.chapter = 'investigate'; GAME.busy = true; setTension(.5); setMusic('tension');
  const M = PEOPLE.npcs.marta, D = PEOPLE.npcs.diego; P.mode = 'talk'; camLookAt(M.headWorld()); cine(true); M.lookTarget = R.camera.position.clone(); M.play('gestic_talk_femalestressed_01');
  await talk([['Marta', 'Comandante.'], ['Marta', 'O padre do 18D reclamou que o banheiro estava ocupado havia quase quarenta minutos. Bati, chamei… nada. Destravei por fora.'], ['Marta', 'Otávio Lacerda Brandão, 52 anos, 23C. Viajava sozinho.']]);
  M.play('idle_nervous_01'); camLookAt(D.headWorld()); D.lookTarget = R.camera.position.clone(); D.play('gestic_talk_nervous_01'); D.setExpr('nervous');
  await talk([['Diego', 'Comandante, eu estava aqui na galley o tempo todo. Não vi ninguém entrar. Juro.'], ['Diego', 'Quer… quer que eu traga um café?']]);
  D.play('idle_nervous_01'); const c = await choose([{ t: '"Diego, fique na galley. Ninguém passa."', id: 0 }, { t: '"Você está suando, Diego. Tudo bem?"', id: 1 }]);
  if (c === 1) { D.setExpr('fear', .6); await talk([['Diego', 'É o calor da galley. Os fornos. Só isso.'], () => { D.setExpr('nervous'); }]); }
  camLookAt(M.headWorld()); await talk([['Marta', 'A porta está destravada. É só empurrar. Eu… não consigo olhar de novo.']]);
  M.lookTarget = null; D.lookTarget = null; cine(false); GAME.camTarget = null; P.mode = 'walk'; GAME.busy = false;
  setObjective('Investigue o lavatório, o corpo, o paletó no 23C e a passageira do 23A.');
}
async function openLav() {
  GAME.busy = true; GAME.flags.lavOpened = true; SFX.latch(V3(-.35, 1, 27.4)); await wait(.3); P.lavOpen = true; SFX.door(V3(-.35, 1, 27.4)); tweenRot(WORLD.lavDoor, 1.45, 1.6); drawOcc(true);
  await wait(.9); STING.big(); P.shake = .3; setTension(.75); GAME.fx.flash = .2; GAME.fxT.red = .3; flickLav = 2.2; await wait(1.6); GAME.fxT.red = 0;
  await say(GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'Meu Deus…', 2.2, false); GAME.busy = false; setTension(.55);
}
async function examinePlacard() {
  GAME.busy = true; await converse(V3(-.34, 1.95, 27.45), () => talk([[GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'O trinco foi fechado por fora. Vou olhar a placa de perto.']]));
  await inspect({ title: 'Placa "LAVATORY"', build: placard, dist: .3, hotspots: [{ pos: [-.055, -.022, .006], r: .03, text: 'Riscos finos e paralelos sob a placa e uma gota de sangue: forçaram o trinco com uma lâmina. A tripulação só levanta a placa com o dedo.', onFind: () => addClue('placa') }] });
}
async function examineBody() {
  const V = PEOPLE.npcs.otavio; const me = GAME.chapter === 'marta' ? 'Marta' : 'Comandante';
  await converse(V, async () => {
    SFX.heartbeat(.8); GAME.fxT.desat = .35;
    while (true) { const c = await choose([{ t: 'Examinar o pescoço', id: 'n', seen: GAME.flags.bNeck }, { t: 'Examinar as mãos', id: 'h', seen: GAME.flags.bHands }, { t: 'Examinar o rosto', id: 'f', seen: GAME.flags.bFace }, { t: 'Afastar-se', id: 'x' }], '');
      if (c === 'x') break;
      if (c === 'n') { GAME.flags.bNeck = true; await talk([[me, 'Um furo só, no lado esquerdo do pescoço. Lâmina fina, curta. Não é faca de serviço: as nossas são de plástico.'], [me, 'Quem fez isso sabia exatamente onde enfiar.']]); addClue('corpo'); }
      if (c === 'h') { GAME.flags.bHands = true; await talk([[me, 'Corte fundo na palma direita: ele agarrou a lâmina.'], [me, 'E embaixo das unhas da mão esquerda… fibras. Lã preta, grossa.'], [me, 'Nosso uniforme é poliéster azul-marinho. Isto não veio de nenhum de nós.']]); addClue('fibras'); }
      if (c === 'f') { GAME.flags.bFace = true; await talk([[me, 'Os olhos entreabertos. A boca ainda tenta dizer alguma coisa.'], [me, 'Ele não lutou muito. Abriu a porta para alguém que não parecia perigoso.']]); }
    }
    GAME.fxT.desat = 0;
  });
  checkCaptainDone();
  if (GAME.chapter === 'marta' && !GAME.flags.doorway) padreDoorway();
}
async function examineTrash() { SFX.latch(V3(-.95, .7, LAY.lavZ0 + .44)); await converse(V3(-.95, .7, LAY.lavZ0 + .44), () => talk([[GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'Papel ensanguentado… e a ponta de um dedo de luva nitrílica azul, rasgada.'], [GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'Luva azul. É a das nossas galleys.']])); addClue('luva'); }
async function examineSeat() {
  GAME.busy = true; await converse(seatPos('23C').add(V3(0, .6, 0)), () => talk([[GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'O paletó dele. O forro do bolso interno foi cortado, com pressa. Alguém levou o que ele guardava ali.'], [GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'Cartão de embarque. E a carteira.']])); addClue('forro');
  GAME.busy = true; await showDoc(DOCS.boarding());
  await inspect({ title: 'Carteira de Otávio', build: wallet, dist: .26, ry: .2, hint: 'Arraste para girar: olhe atrás da foto', hotspots: [{ pos: [.062, 0, -.002], r: .03, text: 'No verso da foto, à mão: "Bia — 12/03". A filha dele.', onFind: () => addClue('carteira') }] });
  checkCaptainDone();
}
async function examinePhone() {
  GAME.busy = true; SFX.click();
  if (!GAME.clues.has('celular')) { const ok = await pinPad('1203', GAME.clues.has('carteira') ? 'Papel de parede: a mesma menina da foto da carteira.' : 'Papel de parede: uma menina sorrindo na praia. Bloqueado com PIN de 4 dígitos.'); if (!ok) { GAME.busy = false; if (!GAME.clues.has('carteira')) hint('Talvez algo nos pertences dele ajude com o código.', 5); return; } }
  GAME.busy = true; await showDoc(DOCS.phone()); addClue('celular'); GAME.busy = false; checkCaptainDone();
}
async function talkMarta() {
  await converse(PEOPLE.npcs.marta, () => interview(PEOPLE.npcs.marta, [
    { q: 'Quem sabe destravar o lavatório por fora?', a: () => talk([['Marta', 'Toda a tripulação. A gente levanta a placa com a unha e gira o trinco. Dois segundos.'], ['Marta', 'Um passageiro teria que forçar.']]) },
    { q: 'O que você sabe do Diego?', a: () => talk([['Marta', 'Pouco. Oito meses de casa, base Guarulhos. Entrou nessa escala ontem à noite.'], ['Marta', 'Está nervoso desde Recife. Bem antes disso tudo.']]) },
    { q: 'E o padre que avisou do banheiro?', a: () => talk([['Marta', 'Seu Tomás. Embarcou de cadeira de rodas e de bengala. Um doce. Me abençoou no embarque.']]) },
  ]), { talk: 'gestic_talk_femalestressed_01', after: 'idle_nervous_01' });
}
async function talkDiego() {
  const D = PEOPLE.npcs.diego; const me = GAME.chapter === 'marta' ? 'Marta' : 'Comandante';
  await converse(D, () => interview(D, [
    { q: 'Onde você estava entre 03:30 e 04:20?', a: () => talk([['Diego', 'Aqui. Na galley. Arrumando os trolleys do café da manhã.'], ['Diego', 'O padre veio pedir água umas três e meia. Ficou um tempão do lado da caixa de luvas, falando de Fátima.']]) },
    { q: 'Por que você trocou de escala ontem?', cond: () => GAME.clues.has('escala'), once: true, a: async () => { D.setExpr('fear'); await talk([['Diego', 'Problema pessoal.'], [me, 'No sistema, quem pediu a troca foi você. Às 21:58.'], ['Diego', '…Eu preciso desse voo. Só isso. Por favor.']]); D.setExpr('nervous'); } },
    { q: '"Trezentos e oitenta mil euros, Diego."', cond: () => GAME.clues.has('dinheiro'), once: true, a: async () => { D.play('gestic_talk_nervous_01'); D.setExpr('cry'); setTension(.6);
      await talk([['Diego', '…'], ['Diego', 'Eu devo dinheiro pra gente ruim, Marta. Me ofereceram vinte mil pra levar um trolley até o Funchal. Só levar.'], ['Diego', 'Quem me pagou foi o homem da executiva. O Mattar.'], ['Diego', 'Eu não matei ninguém! Ele disse que no avião "ia ter outra pessoa cuidando das coisas". Eu achei que fosse segurança dele!']]);
      addClue('confissao'); D.play('idle_nervous_01'); } },
  ]), { talk: 'gestic_talk_nervous_01', after: 'idle_nervous_01', exprAfter: 'nervous' });
}
async function talkLivia() {
  const L = PEOPLE.npcs.livia;
  await converse(L, async () => {
    if (!GAME.flags.livia0) { GAME.flags.livia0 = true; L.setExpr('fear', .7); await talk([['Lívia', (GAME.chapter === 'marta' ? 'Moça' : 'Comandante') + '? Aconteceu alguma coisa com o senhor do meu lado, não foi? Ele não voltou.']]); L.setExpr('worried'); }
    await interview(L, [
      { q: 'A que horas ele se levantou?', a: async () => { await talk([['Lívia', 'Às 03:41. Vi no relógio da tela. Ele levou o paletó? Não… deixou no banco. Foi pro fundo.'], ['Lívia', 'Depois eu ouvi um barulho. Tic… tic… tic… Devagar. Indo pro fundo e voltando.'], ['Lívia', 'Achei que fosse o carrinho. Mas carrinho não faz tic.']]); addClue('livia'); checkCaptainDone(); } },
      { q: 'Ele parecia preocupado?', a: () => talk([['Lívia', 'Mexia num pen drive preto o tempo todo. Guardava no bolso de dentro, tirava de novo.'], ['Lívia', 'Me perguntou se o avião tinha câmera. Eu ri. Ele não.']]) },
      { q: 'Alguém conversou com ele durante o voo?', a: async () => { L.setExpr('worried'); await talk([['Lívia', 'Só o padre. No embarque e depois do jantar. Ele parou aqui, segurou a mão do Otávio e disse "vai dar tudo certo, meu filho".'], ['Lívia', 'Foi bonito, na hora.']]); } },
    ]);
  }, { talk: 'sit_chair_gestic_shrug_01', after: 'sit_chair_idle_nervous_01' });
}
async function talkPadre() {
  const T = PEOPLE.npcs.padre; const me = GAME.chapter === 'marta' ? 'Marta' : 'Comandante';
  await converse(T, async () => {
    T.setExpr('sad', .6);
    await interview(T, [
      { q: 'O senhor viu alguém perto do lavatório?', a: async () => { await talk([['Padre', 'Às dez para as quatro, levantei para ir ao banheiro. Um rapaz da tripulação vinha do fundo, enxugando as mãos num guardanapo.'], ['Padre', 'Moreno, magro. Me deu boa-noite. Educado.'], ['Padre', 'O banheiro da esquerda estava ocupado. Às quatro e vinte, ainda. Foi aí que chamei a moça.']]); addClue('padreFala'); } },
      { q: 'O senhor conhecia o passageiro do 23C?', a: () => talk([['Padre', 'Conversamos no portão. Um homem atormentado. Disse que levava "a verdade" para Lisboa.'], ['Padre', 'A verdade é um fardo pesado para se carregar sozinho, filha.']]) },
      { q: 'Posso ver a sua bengala?', cond: () => GAME.chapter === 'marta', once: true, a: async () => { T.setExpr('stern'); await talk([['Padre', '(segura a bengala com as duas mãos) É só uma bengala velha, minha filha. Quarenta anos comigo.'], ['Padre', 'Sem ela eu caio.']]); T.setExpr('calm'); } },
      { q: 'Em que paróquia o senhor serve?', cond: () => GAME.chapter === 'marta', once: true, a: async () => { await talk([['Padre', 'Nossa Senhora do Carmo, no Recife Antigo. Há trinta anos.'], [me, '(Marta pensa) A igreja do Carmo é dos frades carmelitas. Eles não usam colarinho de padre diocesano…'], ['Padre', 'Algo errado, filha?']]); T.setExpr('sinister', .6); setTimeout(() => T.setExpr('calm'), 2500); } },
    ]);
  }, { talk: 'sit_chair_gestic_thoughtful', after: 'sit_chair_gestic_thoughtful', exprAfter: 'calm' });
}
async function talkDavi() {
  const D = PEOPLE.npcs.davi; const me = GAME.chapter === 'marta' ? 'Marta' : 'Comandante';
  await converse(D, () => interview(D, [
    { q: 'O senhor está acordado há muito tempo?', a: () => talk([['31F', 'Não durmo em voo. Trabalho. Consultoria de TI.'], ['31F', 'Algum problema? Vi a movimentação lá atrás.']]) },
    { q: 'Sua passagem foi comprada dois dias antes, como a do 23C.', cond: () => GAME.chapter === 'marta', once: true, a: async () => { D.setExpr('fear', .6); await talk([['31F', '…'], ['Davi', 'Tá bom. Davi Rocha, jornalista. Estou atrás do Otávio há três semanas. A Maré Alta é a maior história da minha vida.'], ['Davi', 'Ele está morto, não está? Eu sabia que não iam deixar ele descer em Lisboa.']]); addClue('davi'); GAME.flags.davi2 = true; D.setExpr('sad'); } },
    { q: 'Você fotografou alguma coisa esta noite?', cond: () => GAME.flags.davi2, once: true, a: async () => {
      await talk([['Davi', 'Às 03:44 fui ao banheiro do fundo. Tinha alguém na porta do lavatório da esquerda. Fotografei por reflexo, sem flash.'], ['Davi', 'Ficou escuro. Mas olha… dá pra ampliar.']]);
      const src = await photoDoc(); addClue('foto');
      const ok = await photoZoom(src, 'Câmera de Davi Rocha · IMG_4471.JPG · 03:44:17', STORY.photoRect || [.3, .2, .6, .6], () => { addClue('fotoZoom'); return 'um colarinho branco de padre no pescoço da figura e, na mão, a curva de uma bengala.'; });
      if (!ok) hint('Davi: "Tenta ampliar perto do pescoço da figura."', 6);
      GAME.flags.daviAlly = true; await talk([['Davi', ok ? 'Um padre. Meu Deus. Eu passei por ele no corredor.' : 'Se você achar alguma coisa nessa foto, me diz. Eu ajudo no que precisar.']]); } },
    { q: 'Mostre a foto de novo.', cond: () => GAME.clues.has('foto') && !GAME.clues.has('fotoZoom'), a: async () => { const src = await photoDoc(); await photoZoom(src, 'IMG_4471.JPG · 03:44:17', STORY.photoRect || [.3, .2, .6, .6], () => { addClue('fotoZoom'); return 'um colarinho branco de padre e a curva de uma bengala.'; }); } },
  ]), { talk: 'sit_chair_gestic_shrug_01', after: 'sit_chair_idle_look_around' });
}
async function talkMattar() {
  const M = PEOPLE.npcs.mattar;
  if (GAME.chapter !== 'marta') { await converse(M, () => talk([['', 'Sérgio Mattar dorme com a cabeça no travesseiro da executiva. Respira devagar. Devagar demais para alguém dormindo.']])); return; }
  await converse(M, async () => {
    if (!GAME.flags.mattarAwake) { GAME.flags.mattarAwake = true; M.setExpr('neutral'); M.play('sit_chair_idle_neutral_01'); await talk([['Mattar', 'Hum? Já é o café?'], ['Marta', 'Desculpe, senhor Mattar. Houve uma ocorrência a bordo.']]); }
    await interview(M, [
      { q: 'O senhor conhecia Otávio Brandão, do 23C?', a: async () => { M.setExpr('smirk', .5); await talk([['Mattar', 'Brandão? O fiscal? De nome. Um homem obstinado.'], ['Marta', 'Ele faleceu.'], ['Mattar', 'Que tragédia. Espero que encontrem o que ele carregava antes que caia em mãos erradas.']]); M.setExpr('neutral'); } },
      { q: 'O senhor saiu do seu assento esta noite?', a: () => talk([['Mattar', 'Pergunte à Camila. Dormi desde Recife. Comprimido, máscara, tampões.']]) },
      { q: '"Trezentos e oitenta mil euros num trolley, senhor Mattar."', cond: () => GAME.clues.has('confissao'), once: true, a: async () => { M.setExpr('anger', .7); await talk([['Mattar', '(longa pausa) Eu não sei do que a senhora está falando.'], ['Mattar', 'E se eu fosse a senhora, tomaria cuidado com acusações num avião tão cheio. A senhora não sabe quem está sentado ao seu lado.']]); M.setExpr('sinister'); } },
    ]);
  });
}
async function talkWatcher() {
  const W = PEOPLE.npcs.watcher; await converse(W, () => interview(W, [
    { q: 'O que o senhor ouviu esta noite?', a: () => talk([['Renato (16D)', 'Tic… tic… Uma bengala. Passou por mim indo pro fundo, umas três e quarenta. Devagar.'], ['Renato (16D)', 'E voltou sem fazer barulho nenhum. Como se a pessoa carregasse a bengala no braço. Quem precisa de bengala não faz isso.']]) },
    { q: 'O senhor viu quem era?', a: () => talk([['Renato (16D)', 'Escuro demais. Vulto preto, curvado. Cheiro de incenso, ou de igreja velha.'], ['Renato (16D)', 'Eu não durmo em avião desde 2009. Eu vejo tudo.']]) },
  ]), { talk: 'sit_chair_gestic_shrug_01', after: 'sit_chair_idle_nervous_01' });
}
async function talkSonha() { const S = PEOPLE.npcs.sonha; await converse(S, () => talk([['', 'A passageira do 20C dorme. Os dedos ainda se mexem, como se rezassem um terço invisível.']])); }
function checkCaptainDone() {
  if (GAME.chapter !== 'investigate' || GAME.flags.aftRinging) return; const c = GAME.clues;
  if (c.has('corpo') && c.has('livia') && (c.has('forro') || c.has('celular'))) {
    GAME.flags.aftRinging = true; setTimeout(() => { SFX.chime('hilo', WORLD.handsetAft); SFX.buzzer(); setObjective('O interfone traseiro está tocando. É o cockpit.'); }, 2500);
    GAME.ringT = setInterval(() => { if (GAME.flags.aftRinging && GAME.chapter === 'investigate') SFX.chime('hilo', WORLD.handsetAft); }, 6000);
  }
}
async function answerHelena() {
  clearInterval(GAME.ringT); GAME.flags.aftRinging = false; GAME.busy = true; cine(true); SFX.click();
  await talk([['Helena (interfone)', 'Comandante, o Centro Sal aprovou o desvio. Proa do Sal, pouso em uma hora e quatro.'], ['Helena (interfone)', 'Mas tem uma linha de instabilidade bem na frente. Turbulência moderada nos próximos minutos. Preciso do senhor aqui.']]);
  FLT.divert = true; P.shake = .7; SFX.turbulence(3, 1);
  const M = PEOPLE.npcs.marta; GAME.camTarget = M.headWorld(); P.mode = 'talk'; M.lookTarget = R.camera.position.clone();
  await talk([['Comandante', 'Marta. Você assume aqui atrás.'], ['Comandante', 'Pela Convenção de Tóquio, a autoridade a bordo é minha, e eu estou delegando a você. Pergunte o que precisar. Abra o que precisar abrir.'], ['Comandante', 'Quando tiver certeza, me chame pelo interfone. Com provas. Ninguém mais morre neste voo.'], () => { M.setExpr('stern'); }, ['Marta', 'Sim, comandante.']]);
  GAME.busy = false; await startMarta(false);
}

// ----------------------------------------------------------------- ATO II — Marta
async function startMarta(fromSave) {
  GAME.fxT.fade = 1; await wait(fromSave ? .1 : 1.6); cine(true); GAME.chapter = 'marta'; setChar('Marta Quintela · Chefe de cabine'); P.mode = 'cine';
  const M = PEOPLE.npcs.marta; M.setVisible(false); M.hit.position.y = -50; const C = PEOPLE.npcs.camila; C.g.position.set(.3, 0, -4.25); C.g.rotation.y = Math.PI;
  P.x = .2; P.z = 28.55; P.eye = 1.6; P.yaw = 0; P.pitch = -.05; P.hasTorch = true; P.torch = false; WORLD.lights.torch.intensity = 0; P.lavOpen = GAME.flags.lavOpened; P.ckOpen = false;
  if (GAME.flags.lavOpened) { WORLD.lavDoor.rotation.y = 1.45; drawOcc(true); } setTension(.45); setMusic('tension'); GAME.martaT = 0;
  await card('Marta Quintela', 'Chefe de cabine', '05:02 UTC · desvio para o Sal · pouso em 1 h 04 min<br>O comandante voltou ao cockpit. O assassino continua a bordo.', 6);
  GAME.fxT.fade = 0; cine(false); P.mode = 'walk'; GAME.playing = true; saveGame();
  setObjective('Descubra quem matou Otávio Brandão. Reúna provas e ligue para o cockpit pelo interfone.'); hint('Tab: caderno de pistas · F: lanterna', 7);
}
// ---- eventos do Ato II
async function trolleyRoll() {
  if (GAME.flags.trolleyFell) return; GAME.flags.trolleyFell = true; const tr = WORLD.trolleys[4]; const start = tr.getWorldPosition(V3()); tr.removeFromParent(); R.scene.add(tr); tr.position.copy(start); tr.rotation.y = Math.PI;
  SFX.chime('single'); P.shake = 1.1; SFX.turbulence(4, 1.2); setMusic('dread'); await wait(.6); SFX.creak(V3(0, 1, 29)); setObjective('Turbulência forte! Um trolley se soltou da galley.');
  const t0 = GAME.t; const rattle = setInterval(() => SFX.thud(tr.position, .25), 140);
  await tweenObj(tr, V3(.0, 0, 26.6), 1.3); clearInterval(rattle); SFX.thud(tr.position, 1.2); STING.hit(); P.shake = .8;
  await tweenObj(tr, V3(.05, .2, 26.3), .25, [0, Math.PI + .3, 1.45]); SFX.thud(tr.position, 1.4); STORY.cash.position.set(0, 0, 26.0); STORY.cash.visible = true; P.extraWalk.push([-.3, .3, 25.9, 26.8]);
  await wait(.8); setMusic('tension'); setObjective('O trolley A7 tombou no corredor. Algo se espalhou pelo chão.');
  const D = PEOPLE.npcs.diego; D.setExpr('terror'); D.play('idle_nervous_01');
}
async function examineCash() {
  await converse(V3(0, .1, 26.0), async () => { await talk([['Marta', 'Notas de quinhentos euros. Maços e maços. O fundo do trolley A7 era falso.'], ['Marta', 'Uma etiqueta: "MLP — Funchal". Isso deve dar uns trezentos e oitenta mil.']]); });
  addClue('dinheiro'); STORY.cash.visible = false; const D = PEOPLE.npcs.diego; D.setExpr('cry'); D.lookTarget = R.camera.position.clone(); setTimeout(() => D.lookTarget = null, 4000);
}
async function padreDoorway() {
  GAME.flags.doorway = true; await wait(1.2); const T = PEOPLE.npcs.padre; GAME.busy = true;
  SFX.creak(V3(-.3, 1, 27.5)); flickLav = 1.5; lightsDark(true); WORLD.lights.lav.visible = false; STING.whisper(); await wait(2.2);
  T.g.position.set(0, 0, 27.35); T.g.rotation.y = Math.PI / 2 + .2; T.play('idle_neutral_01', { fade: 0 }); T.setExpr('sinister'); T.tracking = true; T.lookTarget = R.camera.position.clone(); holdInHand(T, STORY.caneHand, 'L', [0, -.03, .02], [0, 0, Math.PI]); STORY.caneSeat.visible = false; GAME.flags.padreAway = true;
  lightsDark(false); WORLD.lights.lav.visible = true; STING.big(); P.shake = .5;
  P.mode = 'talk'; GAME.camTarget = T.headWorld(); cine(true);
  await talk([['Padre', 'Não se assuste, minha filha.'], ['Padre', 'Posso encomendar a alma dele? Ninguém deveria partir sem uma oração.'], ['Marta', 'Volte para o seu lugar, padre. Agora, por favor.'], () => { T.setExpr('calm'); }, ['Padre', 'Claro. Claro.']]);
  cine(false); P.mode = 'walk'; GAME.camTarget = null; GAME.busy = false; T.lookTarget = null; T.tracking = false;
  const tap = setInterval(() => SFX.click(T.g.position.clone().add(V3(0, .05, 0))), 620);
  await T.walkTo([V3(0, 0, 25), V3(0, 0, rowZ(18) + .4), V3(.05, 0, rowZ(18) - .1)], .55, 'walk_slow_01', null); clearInterval(tap);
  T.g.position.copy(sitP('18D')); T.g.rotation.y = 0; T.play('sit_chair_gestic_thoughtful', { fade: .2 }); STORY.caneHand.visible = false; STORY.caneSeat.visible = true; GAME.flags.padreAway = false; T.tracking = true;
}
async function eavesdropMattar() {
  if (GAME.flags.eavesdrop) return; GAME.flags.eavesdrop = true; const M = PEOPLE.npcs.mattar; M.setExpr('stern'); M.play('cell_phone_talk_01'); GAME.busy = true; setMusic('dread');
  hint('Fique parada atrás da cortina… escute.', 4); GAME.fxT.focus = .5;
  await say('Mattar', '(sussurrando ao telefone) …não, não houve problema. O assunto foi resolvido antes do Sal.', 4.5, M.headWorld());
  if (Math.abs(P.vel.x) + Math.abs(P.vel.z) > .5) { M.play('sit_chair_idle_neutral_01'); GAME.fxT.focus = 0; GAME.busy = false; GAME.flags.eavesdrop = false; await say('Mattar', '…espera. Tem alguém aí?', 2.5, M.headWorld()); return; }
  await say('Mattar', 'Ele está na fileira dezoito. Ninguém revista um velho de bengala.', 4.5, M.headWorld());
  await say('Mattar', 'O garoto? O garoto só carrega o dinheiro. Não sabe de nada. Se apertarem, é ele que cai.', 5.5, M.headWorld());
  addClue('escuta'); M.play('sit_chair_breathe_01'); GAME.fxT.focus = 0; GAME.busy = false; setMusic('tension'); STING.hit();
}
async function padreApproach() {
  if (GAME.flags.approach || GAME.chapter !== 'marta') return; GAME.flags.approach = true; const T = PEOPLE.npcs.padre, L = PEOPLE.npcs.livia;
  setObjective('O padre se levantou… e foi até a fileira 23, ao lado de Lívia. VÁ ATÉ LÁ.'); STING.riser(2.5); setMusic('dread'); GAME.flags.padreAway = true;
  holdInHand(T, STORY.caneHand, 'L', [0, -.03, .02], [0, 0, Math.PI]); STORY.caneSeat.visible = false; T.play('walk_slow_01');
  await T.walkTo([V3(.02, 0, rowZ(18) + .3), V3(0, 0, rowZ(23) - .35)], .6, 'walk_slow_01', null);
  T.g.position.copy(sitP('23C')).add(V3(.1, 0, 0)); T.g.rotation.y = 0; T.play('sit_chair_gestic_thoughtful', { fade: .3 }); T.lookTarget = L.headWorld(); L.setExpr('fear'); L.lookTarget = T.headWorld(); GAME.approachT = 22;
}
async function approachResolve(late) {
  const T = PEOPLE.npcs.padre, L = PEOPLE.npcs.livia; GAME.approachT = null; GAME.busy = true; P.mode = 'talk'; GAME.camTarget = T.headWorld(); cine(true);
  if (late) { L.setExpr('cry'); await talk([['', 'Quando Marta chega, o padre já se levanta. Lívia está pálida, o pulso marcado de dedos.'], ['Lívia', 'Ele apertou meu braço… e perguntou o que eu tinha visto. Disse que eu tenho cara de quem esquece as coisas.']]); }
  else { T.setExpr('sinister'); await talk([['Padre', 'Estava só confortando a moça, minha filha. Ela está tão assustada.'], ['Marta', 'Ela precisa descansar, padre. Eu acompanho o senhor.'], () => { L.setExpr('fear'); GAME.camTarget = L.headWorld(); }, ['Lívia', '(sussurrando) Ele perguntou o que eu vi. Duas vezes.']]); }
  cine(false); P.mode = 'walk'; GAME.camTarget = null; GAME.busy = false; L.lookTarget = null; setMusic('tension');
  setObjective('O padre voltou ao 18D. Reúna as provas e ligue para o cockpit pelo interfone.');
  T.lookTarget = null; T.g.position.set(.05, 0, rowZ(23) - .35); T.play('walk_slow_01'); T.g.rotation.y = 0;
  await T.walkTo([V3(.02, 0, rowZ(19)), V3(.02, 0, rowZ(18) - .3)], .55, 'walk_slow_01', null);
  T.g.position.copy(sitP('18D')); T.play('sit_chair_gestic_thoughtful', { fade: .2 }); STORY.caneHand.visible = false; GAME.flags.padreAway = false;
  // na turbulência seguinte a bengala cai no corredor
  setTimeout(async () => { P.shake = .8; SFX.turbulence(2.5, .9); SFX.chime('single'); await wait(1); STORY.caneSeat.visible = true; await tweenObj(STORY.caneSeat, V3(seatPos('18D').x - .4, .03, rowZ(18) - .3), .5, [Math.PI / 2, .4, 0]); SFX.click(STORY.caneSeat.position); GAME.flags.caneDropped = true; hint('Algo caiu no corredor, perto da fileira 18.', 5); }, 9000);
}
async function examineCane() {
  GAME.flags.caneTaken = true; STORY.caneSeat.visible = false; GAME.busy = true;
  const n = await inspect({ title: 'Bengala do padre', build: () => { const c = caneMesh(); c.position.y = .3; return c; }, dist: .7, rx: .2, hint: 'Gire e aproxime da empunhadura. Clique nos detalhes.', hotspots: [
    { pos: [0, -.035, 0], r: .025, text: 'O anel metálico tem marcas de giro. A empunhadura destrava… dentro, uma lâmina de cerâmica branca de 9 cm, com sangue seco no encaixe.', onFind: () => addClue('bengala') },
    { pos: [0, -.83, 0], r: .02, text: 'A ponteira de borracha está úmida. Lavada há pouco.' }] });
  const T = PEOPLE.npcs.padre; T.setExpr('stern'); T.lookTarget = R.camera.position.clone(); P.mode = 'talk'; GAME.camTarget = T.headWorld(); cine(true); GAME.busy = true;
  await talk([['Padre', 'Minha bengala, filha. Obrigado.']]); const c = await choose([{ t: '(devolver a bengala, com calma)', id: 0 }, { t: '"Vou guardá-la na galley até o pouso, padre."', id: 1 }]);
  if (c === 0) { await talk([['Padre', 'Deus lhe pague.']]); STORY.caneSeat.visible = true; STORY.caneSeat.position.copy(seatPos('18D')).add(V3(-.26, .86, -.2)); STORY.caneSeat.rotation.set(.12, 0, -.1); }
  else { T.setExpr('sinister'); await talk([['Padre', '(sorri devagar) Como quiser.'], ['', 'Ele não tira os olhos de você até você virar as costas.']]); GAME.flags.keptCane = true; STING.whisper(); }
  T.lookTarget = null; T.setExpr('calm'); cine(false); P.mode = 'walk'; GAME.camTarget = null; GAME.busy = false; setTension(.75);
}
async function accuse() {
  if (GAME.clues.size < 4) { await converse(WORLD.handsetAft, () => talk([['Marta', 'Ainda não. Se eu ligar agora, só tenho medo para dizer a ele.']])); return; }
  GAME.busy = true; SFX.click(); cine(true); P.mode = 'talk'; GAME.camTarget = WORLD.handsetAft.clone();
  await talk([['Comandante (interfone)', 'Marta. Fale.']]);
  const sus = await choose([{ t: 'Foi o "padre" do 18D.', id: 'padre' }, { t: 'Foi Diego Farias, o comissário.', id: 'diego' }, { t: 'Foi Sérgio Mattar, do 4A.', id: 'mattar' }, { t: 'Foi o jornalista do 31F.', id: 'davi' }, { t: 'Foi Lívia, do 23A.', id: 'livia' }, { t: '(desligar: ainda não tenho certeza)', id: 'none' }]);
  if (sus === 'none') { await talk([['Marta', 'Nada, comandante. Ainda não.']]); return endCall(); }
  const avail = [...GAME.clues].filter(k => CLUES[k]); const chosen = [];
  for (let i = 0; i < 3 && avail.length; i++) { const c = await choose(avail.filter(a => !chosen.includes(a)).map(a => ({ t: CLUES[a].t, id: a })).concat(i > 0 ? [{ t: '(é o suficiente)', id: '_' }] : []), `Prova ${i + 1} de 3. O que você apresenta ao comandante?`); if (c === '_') break; chosen.push(c); }
  const strong = chosen.filter(c => PADRE_KEYS.includes(c)).length, hard = chosen.some(c => PADRE_HARD.includes(c));
  if (sus === 'padre' && strong >= 2 && hard) { await talk([['Comandante (interfone)', '…Um padre. Meu Deus.'], ['Comandante (interfone)', 'Entendido, Marta. Mando a Camila com o kit de contenção. Não o confronte sozinha. Onde ele está agora?']]); endCall(); return climax(); }
  if (sus === 'padre') { await talk([['Comandante (interfone)', 'Um senhor de setenta anos, de bengala, que pediu cadeira de rodas? Marta, eu não posso algemar um padre por intuição.'], ['Comandante (interfone)', 'Me traga algo que ligue ele àquele lavatório.']]); return endCall(); }
  if (sus === 'mattar') { await talk([['Comandante (interfone)', 'O Mattar não passou da cortina a noite toda, a Camila jura. Se ele mandou, alguém executou. Quem, Marta?']]); return endCall(); }
  if (sus === 'diego' && GAME.clues.has('dinheiro')) await talk([['Comandante (interfone)', 'Dinheiro escondido no trolley… e a luva da galley. Está bem. Vou mandar contê-lo.']]);
  else await talk([['Comandante (interfone)', 'Entendido. Vou mandar contê-lo. Tomara que você esteja certa.']]);
  endCall(); return badEnding(sus);
}
function endCall() { cine(false); GAME.camTarget = null; P.mode = 'walk'; GAME.busy = false; }

// ----------------------------------------------------------------- CLÍMAX (cena com câmeras)
async function climax() {
  GAME.chapter = 'climax'; GAME.busy = true; const T = PEOPLE.npcs.padre, L = PEOPLE.npcs.livia, D = PEOPLE.npcs.davi, G = PEOPLE.npcs.diego;
  await wait(1); SFX.scream(V3(.8, 1.2, 28.5)); STING.big(); setMusic('chase'); setTension(1); P.shake = .4;
  await flicker(3); lightsFull(); GAME.fx.flash = .25;
  // posiciona a cena: padre segura Lívia de costas para a porta R4
  for (const k of ['padre', 'livia', 'davi', 'diego']) PEOPLE.npcs[k].always = true;
  STORY.caneSeat.visible = false; G.setVisible(false);
  L.g.position.set(.95, 0, 28.45); L.g.rotation.y = .25; L.play('idle_nervous_01', { fade: 0 }); L.setExpr('terror'); L.tracking = false;
  T.g.position.set(1.12, 0, 28.78); T.g.rotation.y = .25; T.play('idle_nervous_01', { fade: 0 }); T.setExpr('rage'); T.tracking = false; holdInHand(T, STORY.blade, 'R', [.02, -.01, .05], [0, 0, Math.PI / 2]);
  T.ik = { side: 'R', target: L.bonePos('Neck').add(V3(-.05, .0, -.09)), w: 1 };
  D.g.position.set(0, 0, 26.2); D.g.rotation.y = Math.PI; D.play('idle_neutral_01', { fade: 0 }); D.setExpr('fear'); D.tracking = false;
  P.x = 0; P.z = 26.3; cine(true);
  await shot(V3(-1.15, 1.62, 28.25), V3(1.0, 1.4, 28.65), 0, { fov: 54, drift: V3(.02, 0, .006) });
  await talk([['Padre', 'Ninguém se mexe! Ninguém!'], () => shot(V3(.05, 1.64, 28.3), T.headWorld(), 0, { fov: 30, drift: V3(.006, 0, 0) }), ['Padre', 'Eu abro essa porta e todos nós vamos pro mar. Ouviu, minha filha? Todos.']]);
  await shot(V3(.2, 1.5, 28.1), L.headWorld(), 0, { fov: 30, drift: V3(.004, 0, .004) }); await talk([['Lívia', '(chorando) Por favor… eu não vi nada… eu juro que não vi nada…']]);
  await shot(V3(-1.2, 1.6, 28.3), V3(1.0, 1.4, 28.6), 0, { fov: 50 });
  const c = await choose([{ t: '"Essa porta não abre em voo. São oito toneladas de pressão segurando ela."', id: 0 }, { t: '"Solta ela. O pen drive é seu. Só solta ela."', id: 1 }, { t: '(dar um passo à frente, devagar)', id: 2 }]);
  if (c === 0) { T.setExpr('anger'); await talk([['Padre', '…'], ['Marta', 'Você não sai deste avião, Tomás. Ou seja lá qual for o seu nome. Pousamos no Sal em vinte minutos, com polícia na pista.'], ['Padre', '(a mão treme) Então ela desce comigo.']]); }
  else if (c === 1) { T.setExpr('sinister'); await talk([['Padre', '(ri) Eu não quero o pen drive. O pen drive já está onde devia.'], ['Padre', 'Eu quero ver o que você vai fazer agora, chefe de cabine.']]); }
  else { T.setExpr('rage'); L.setExpr('pain'); SFX.scream(L.headWorld()); GAME.fxT.red = .3; await talk([['Padre', 'MAIS UM PASSO!'], ['', 'A lâmina corta a pele do pescoço de Lívia. Um fio de sangue escorre.']]); GAME.fxT.red = 0; }
  // Davi se aproxima por trás, em silêncio, enquanto Marta olha o extintor
  D.walkTo([V3(0, 0, 27.6)], 1.0, 'walk_slow_01', 'idle_nervous_01');
  await shot(V3(-1.0, 1.25, 27.9), STORY.ext.position.clone(), 0, { fov: 40 }); await say('', 'O extintor de Halon, preso ao lado do jumpseat. A meio metro da sua mão.', 3, false);
  await shot(V3(-1.25, 1.5, 28.35), V3(.95, 1.4, 28.6), 0, { fov: 44 });
  GAME.slow = .35; let ok = await qte('Pegue o extintor e dispare!', 7, 3.4);
  if (!ok) { GAME.slow = 1; GAME.fx.flash = .4; GAME.fxT.red = .4; SFX.thud(V3(.9, 1, 28.5), .8); await say('Padre', 'Para trás!', 1.5, T.headWorld()); GAME.fxT.red = 0; GAME.slow = .35; ok = await qte('De novo! Agora!', 6, 3.0); }
  GAME.slow = 1;
  if (!ok) return badEnding('hostage');
  // jato de Halon
  halonSpray(V3(-1.0, 1.3, 28.3), T.headWorld()); T.setExpr('pain'); T.ik = null; SFX.thud(T.g.position, .5); await wait(.6);
  await shot(V3(-1.0, 1.35, 28.15), V3(1.0, 1.2, 28.7), 0, { fov: 52, drift: V3(.04, 0, 0) });
  L.walkTo([V3(.1, 0, 28.4), V3(-.7, 0, 28.3)], 2.6, 'run_neutral_01', 'idle_nervous_01'); L.setExpr('cry');
  D.walkTo([V3(.9, 0, 28.5)], 3.2, 'run_neutral_01', null); await wait(.55);
  SFX.thud(T.g.position, 1.5); P.shake = 1; STING.big();
  tweenObj(T.g, V3(1.25, .12, 29.2), .45, [-1.45, .25, 0]); await tweenObj(D.g, V3(1.0, .25, 28.9), .45, [-1.2, D.g.rotation.y, 0]); STORY.blade.visible = false;
  G.setVisible(true); G.g.position.set(.6, 0, 29.0); G.play('crouch_idle', { fade: .2 }); G.setExpr('anger'); D.play('crouch_idle'); D.g.rotation.set(0, 0, 0); D.g.position.set(.9, 0, 28.55);
  await shot(V3(-1.1, 1.75, 28.3), V3(1.0, .4, 28.9), 0, { fov: 50 });
  await talk([['Marta', 'Abraçadeiras! Kit de contenção, L4! Segurem os braços dele!'], ['Davi', 'Peguei! Peguei ele!'], ['Diego', '(chorando, segurando as pernas do padre) Eu não sabia… eu juro que não sabia…']]);
  await shot(V3(.6, 1.55, 27.95 + .1), L.headWorld(), 0, { fov: 34 }); await talk([['Lívia', 'Ele ia… ele ia…'], ['Marta', 'Acabou. Olha pra mim. Acabou.']]);
  await talk([['', 'No bolso interno da batina, Marta encontra um breviário oco. Dentro, um pen drive preto.']]);
  return goodEnding();
}
function halonSpray(from, to) {
  const n = 220; const pos = new Float32Array(n * 3), vel = []; for (let i = 0; i < n; i++) { pos.set([from.x, from.y, from.z], i * 3); const d = V3().subVectors(to, from).normalize(); d.x += rr(-.15, .15); d.y += rr(-.12, .12); d.z += rr(-.15, .15); vel.push(d.multiplyScalar(rr(3, 6))); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ size: .09, map: TEX.dust, transparent: true, opacity: .8, depthWrite: false, color: 0xf4f6f8 })); R.scene.add(m);
  noiseShot(AU.sfx, AU.ctx.currentTime, 1.6, 'highpass', 1200, .5, .5);
  const t0 = GAME.t; GAME.anims.push(dt => { const t = GAME.t - t0; for (let i = 0; i < n; i++) { if (t < i / n * .8) continue; pos[i * 3] += vel[i].x * dt; pos[i * 3 + 1] += vel[i].y * dt; pos[i * 3 + 2] += vel[i].z * dt; vel[i].multiplyScalar(.93); } g.attributes.position.needsUpdate = true; m.material.opacity = Math.max(0, .8 - t * .25); if (t > 3.5) { R.scene.remove(m); return true; } });
}
async function goodEnding() {
  GAME.ending = true; setMusic('ending'); setTension(.2); await fxTo('fade', 1, 2.5); try { localStorage.removeItem('voo0471'); } catch (e) { }
  SFX.chime('single');
  await say('Comandante (PA)', 'Senhoras e senhores, aqui fala o comandante. Tivemos uma ocorrência grave a bordo. Ela está sob controle da tripulação.', 7, false);
  await say('Comandante (PA)', 'Estamos desviando para o Aeroporto Amílcar Cabral, na Ilha do Sal, Cabo Verde. Pouso em vinte minutos. Permaneçam sentados, com os cintos afivelados.', 8, false);
  MAT.sky.uniforms.uDawn.value = 1; MAT.sky.uniforms.uLight.value = 2.2; WORLD.lights.hemi.color.set(0x8a6f5a); WORLD.lights.hemi.intensity = 1.2;
  P.mode = 'cine'; GAME.camTarget = null; CAMR.active = null; R.camera.position.set(1.3, 1.08, rowZ(12) - .05); R.camera.rotation.set(-.08, -1.35, 0); R.camera.fov = 60; R.camera.updateProjectionMatrix();
  fxTo('fade', 0, 4); await wait(7);
  await card('Sal, Cabo Verde · 06:11 UTC', 'Pouso', 'O homem que se apresentava como padre Tomás Albuquerque foi identificado como Anselmo Rego, ex-sargento do Exército, procurado por dois homicídios em Pernambuco.', 8);
  await card('', '', 'Sérgio Mattar foi detido no desembarque. Diego Farias confessou o transporte do dinheiro e virou a principal testemunha contra ele.', 7);
  await card('', '', 'O pen drive de Otávio Brandão chegou à Polícia Judiciária, em Lisboa, três dias depois. Davi Rocha publicou a reportagem um mês mais tarde. A filha de Otávio ganhou o chocolate.', 8);
  await card('Final', 'Ninguém mais morreu neste voo', '', 6); showCredits(true);
}
async function badEnding(who) {
  GAME.ending = true; GAME.chapter = 'bad'; GAME.busy = true; P.mode = 'cine'; setMusic('dread'); await wait(1.5); SFX.creak(V3(0, 2, 15)); await flicker(5); lightsDark(true); setTension(1);
  await wait(2.5); SFX.scream(V3(-1.3, 1.1, rowZ(23))); await wait(1.2); STING.big(); await fxTo('fade', 1, .6); await wait(2); lightsDark(false); setMusic('silence');
  const txt = { diego: 'Enquanto Camila e Bruno algemavam Diego na galley, as luzes da cabine se apagaram. Quando voltaram, Lívia Coutinho estava morta no 23A. No 18D, o padre rezava.', davi: 'Davi foi contido aos gritos. No escuro, ninguém olhava para a fileira 18. Quando as luzes voltaram, Lívia Coutinho estava morta no 23A.', livia: 'Lívia foi algemada ao assento, chorando. Meia hora depois, no escuro, alguém sentou ao lado dela. Ela não chegou ao Sal.', mattar: 'Mattar sorriu enquanto era contido. No escuro, alguém de bengala passou pela fileira 23.', hostage: 'Marta não chegou ao extintor a tempo. A lâmina foi mais rápida. Lívia Coutinho não chegou ao Sal.', timeout: 'Você demorou demais. Quando as luzes voltaram, Lívia Coutinho, a única testemunha, estava morta. O pen drive nunca foi encontrado.' }[who] || '';
  await card('05:31 UTC', who === 'hostage' ? 'Tarde demais' : 'O homem errado', txt, 9); showRetry();
}
function showRetry() { const el = $('card'); el.className = ''; el.style.pointerEvents = 'auto'; el.innerHTML = `<div class="c2" style="animation-delay:0s">Final ruim</div><div class="c3" style="animation-delay:.3s;pointer-events:auto"><button id="btnRetry" style="font-size:18px;letter-spacing:.2em;text-transform:uppercase;color:#ddd;margin-top:18px">Tentar novamente — Ato II</button><br><button id="btnMenu" style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#888;margin-top:12px">Menu</button></div>`; $('btnRetry').onclick = () => { try { sessionStorage.setItem('voo0471_continue', '1'); } catch (e) { } location.reload(); }; $('btnMenu').onclick = () => location.reload(); if (INPUT.locked) document.exitPointerLock(); }

// ----------------------------------------------------------------- atualização
function storyUpdate(dt) {
  if (!GAME.playing || GAME.paused) return;
  for (const t of TRIGGERS) if (!t.done && GAME.chapter === t.ch && P.z > t.z) { t.done = true; t.fn(); }
  if (GAME.chapter === 'marta' && !GAME.overlay && !GAME.busy) {
    GAME.martaT += dt; const C = GAME.clues;
    if (!GAME.flags.trolleyFell && (C.has('escala') || GAME.martaT > 150) && P.z > 20) trolleyRoll();
    if (!GAME.flags.eavesdrop && P.z > 4.25 && P.z < 5.0 && Math.abs(P.x) < .3 && GAME.martaT > 20) { GAME.listenT = (GAME.listenT || 0) + dt; if (GAME.listenT > 1.5) eavesdropMattar(); } else GAME.listenT = 0;
    if (!GAME.flags.approachSched && (C.has('fotoZoom') || C.has('escuta'))) { GAME.flags.approachSched = true; setTimeout(() => padreApproach(), 22000); }
    if (GAME.approachT != null) { GAME.approachT -= dt; setTimer(GAME.approachT); if (Math.abs(P.z - rowZ(23)) < 1.4) { setTimer(null); approachResolve(false); } else if (GAME.approachT <= 0) { setTimer(null); approachResolve(true); } }
    if (GAME.martaT > 16 * 60 && !GAME.flags.warn1) { GAME.flags.warn1 = true; flicker(3); hint('A cabine está quieta demais…', 6); setTension(.8); }
    if (GAME.martaT > 22 * 60 && !GAME.flags.timeout) { GAME.flags.timeout = true; badEnding('timeout'); }
  }
  if (WORLD.phone) { const k = (GAME.t % 18) < 4 ? 1 : 0; WORLD.phoneScr.material.color.setRGB(.25 * k, .35 * k, .55 * k); WORLD.phoneLight.intensity = .35 * k; if (k && !GAME._vib) { GAME._vib = true; if (Math.abs(P.z - 27.5) < 6) SFX.vibrate(WORLD.phone.position); } if (!k) GAME._vib = false; }
  if (GAME.chapter !== 'climax' && STORY.vblood) placeBlood();
}
Object.assign(STORY, { callMarta, openCockpitDoor, arriveAft, openLav, examineBody, examineSeat, examinePhone, examinePlacard, talkLivia, talkDiego, talkPadre, talkDavi, talkMattar, answerHelena, startMarta, trolleyRoll, eavesdropMattar, padreApproach, padreDoorway, examineCane, examineCash, accuse, climax, goodEnding, badEnding, photoDoc });
