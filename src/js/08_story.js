// ---------------------------------------------------------------------------
// ROTEIRO — VOO 0471
// ---------------------------------------------------------------------------
const CLUES = {
  corpo: { t: 'O corpo de Otávio Brandão', d: 'Perfuração única no pescoço, lado esquerdo, lâmina fina e curta. Corte defensivo na palma direita. Sangue ainda úmido: morte entre 03:40 e 03:55 UTC.' },
  porta: { t: 'Trava acionada por fora', key: true, d: 'O trinco do lavatório foi fechado pelo lado de fora, pela alavanca escondida atrás da placa "LAVATORY". Procedimento conhecido apenas pela tripulação.' },
  luva: { t: 'Fragmento de luva nitrílica AZUL', key: true, d: 'Ponta de dedo rasgada na lixeira do lavatório, com sangue. É o modelo azul do catering, usado nas galleys da Atlântica.' },
  celular: { t: 'Celular da vítima', key: true, d: 'Mensagem da Dra. Paula Viana (Polícia Federal), 03:12: "a escala de tripulação do 0471 foi alterada ontem à noite… não saia do seu assento".' },
  forro: { t: 'Bolso interno rasgado (23C)', d: 'O forro do paletó foi cortado à força. Algo pequeno foi retirado: segundo Lívia, um pen drive que ele conferia o tempo todo.' },
  pasta: { t: 'Pasta "Operação Maré Alta"', d: 'Relatório sigiloso da Receita Federal sobre lavagem de dinheiro no Porto de Suape. Principal investigado: Sérgio Mattar (4A). Anotação: "original no pen drive — entregar à PJ, Lisboa, 10h".' },
  livia: { t: 'Depoimento de Lívia (23A)', d: 'Otávio saiu para o lavatório às 03:41. Pouco depois, ela ouviu um trolley no corredor traseiro — mas o serviço tinha acabado às 03:00.' },
  luvasLivia: { t: 'As luvas de Lívia são roxas', d: 'Lívia é enfermeira e carrega luvas nitrílicas ROXAS de hospital. O fragmento na lixeira é azul.' },
  diego1: { t: 'Diego: "fiquei na galley o tempo todo"', d: 'Diego afirmou ao comandante que não saiu da galley traseira entre 03:30 e 04:20.' },
  ronda: { t: 'Diego admite uma "ronda de água"', key: true, d: 'Pressionado, Diego admitiu ter passado com o trolley A7 pelo corredor às 03:40 — contradizendo o que disse ao comandante.' },
  padre: { t: 'Depoimento do padre Tomás (18D)', key: true, d: 'Às 03:50, viu um tripulante jovem voltando do fundo, enxugando as mãos num guardanapo. Usava um anel grosso no dedo médio. Diego usa um anel assim.' },
  foto: { t: 'Foto de Davi — 03:44', key: true, d: 'Na câmera do jornalista: uma figura de uniforme da Atlântica junto à porta do lavatório traseiro esquerdo, às 03:44:17.' },
  davi: { t: 'Davi Rocha é jornalista', d: 'Repórter investigativo da Agência Farol. Seguia Otávio havia semanas para uma reportagem sobre a Operação Maré Alta.' },
  mattar: { t: 'Mattar sabia do pen drive', d: 'Sem que ninguém mencionasse, Sérgio Mattar disse: "espero que encontrem o que ele carregava". Segundo Camila, ele não passou da cortina da executiva a noite toda.' },
  escala: { t: 'Escala alterada na véspera', key: true, d: 'Às 21:58 de ontem, Priscila Nunes foi trocada por Diego Farias na posição L4 / galley traseira. Motivo declarado: "pessoal".' },
  faca: { t: 'Faca de cerâmica no trolley A7', key: true, d: 'Escondida atrás das gavetas do trolley A7, enrolada num guardanapo da Atlântica empapado de sangue. Cerâmica não aparece no detector de metais.' },
  burner: { t: 'Celular descartável na bolsa de Diego', key: true, d: 'Mensagem recebida em Recife, 22:47: "23C. Antes do Sal. Traga o pen drive. Metade agora, metade em Lisboa. — S.M."' },
};
const PEOPLE_INFO = [
  { n: 'Otávio Lacerda Brandão', s: '23C · vítima', d: 'Auditor-fiscal da Receita Federal, 52 anos. Testemunha-chave na Operação Maré Alta.' },
  { n: 'Lívia Coutinho', s: '23A', d: 'Enfermeira, 34 anos, a caminho de um contrato em Lisboa. Viu a vítima sair.', note: ['livia1', 'É a única testemunha do horário. Está assustada.'] },
  { n: 'Pe. Tomás Albuquerque', s: '18D', d: 'Padre, 71 anos. Foi quem avisou que o lavatório estava ocupado havia muito tempo.' },
  { n: 'Davi Rocha', s: '31F', d: 'Diz ser "consultor de TI". Reserva feita 48 h antes do voo, pela mesma agência da vítima.', note: ['davi2', 'Na verdade é jornalista e seguia a vítima.'] },
  { n: 'Sérgio Mattar', s: '4A · executiva', d: 'Empresário do setor portuário, principal investigado da Operação Maré Alta.', hide: 'pastaSeen' },
  { n: 'Diego Farias', s: 'Comissário · L4', d: 'Na Atlântica há 8 meses. Responsável pela galley traseira neste voo.' },
  { n: 'Marta Quintela', s: 'Chefe de cabine', d: '23 anos de voo. Encontrou o corpo às 04:31.' },
];
const DIEGO_KEYS = ['porta', 'luva', 'celular', 'ronda', 'padre', 'foto', 'escala', 'faca', 'burner'];
const HARD = ['luva', 'foto', 'faca', 'burner', 'padre', 'ronda'];

// ----------------------------------------------------------------- elenco
function buildCast() {
  const N = (o) => new NPC(o);
  N({ key: 'helena', name: 'Helena Duarte', pos: V3(.53, 0, -4.95), female: true, hair: 'bun', hairColor: 0x2b1d14, skin: SKIN[1], cloth: 0x1a1f2e, uniform: 'pilot', track: true, pitch: -.05 });
  N({ key: 'camila', name: 'Camila', pos: V3(.25, 0, -1.65), rotY: Math.PI * .85, standing: true, female: true, hair: 'bun', hairColor: 0x0b0908, skin: SKIN[2], cloth: 0x18233d, uniform: 'crewF', track: true });
  N({ key: 'marta', name: 'Marta Quintela', pos: V3(.55, 0, 28.75), rotY: 0, standing: true, female: true, hair: 'bun', hairColor: 0x3a2a1c, skin: SKIN[2], cloth: 0x18233d, uniform: 'crewF', track: true });
  N({ key: 'diego', name: 'Diego Farias', pos: V3(1.0, 0, 29.02), rotY: -.25, standing: true, hair: 'short', hairColor: 0x0b0908, skin: SKIN[2], cloth: 0x18233d, uniform: 'crewM', track: true });
  N({ key: 'livia', name: 'Lívia Coutinho', pos: seatPos('23A').add(V3(0, 0, .04)), female: true, hair: 'long', hairColor: 0x1a120d, skin: SKIN[3], cloth: 0x5b2128, blanket: 0x26324f, track: true, roll: .05 });
  N({ key: 'padre', name: 'Pe. Tomás', pos: seatPos('18D').add(V3(0, 0, .04)), hair: 'short', hairColor: 0x9d9890, skin: SKIN[0], cloth: 0x111111, track: true, pitch: -.1 });
  { const c = new THREE.Mesh(new THREE.BoxGeometry(.03, .025, .01), new THREE.MeshStandardMaterial({ color: 0xf4f4f4 })); c.position.set(0, 1.06, -.055); PEOPLE.npcs.padre.g.add(c); }
  N({ key: 'davi', name: 'Davi Rocha', pos: seatPos('31F').add(V3(0, 0, .04)), hair: 'hood', skin: SKIN[1], cloth: 0x2f3d2c, track: true, pitch: -.25 });
  N({ key: 'mattar', name: 'Sérgio Mattar', pos: seatPos('4A').add(V3(0, 0, .06)), skin: SKIN[0], cloth: 0x2a2a2c, mask: true, blanket: 0x3a3f4a, pitch: .1, roll: .12 });
  N({ key: 'watcher', name: '', pos: seatPos('16D').add(V3(0, 0, .04)), hair: 'short', hairColor: 0x2b1d14, skin: SKIN[1], cloth: 0x3b3f46, track: true });
  // vítima no lavatório
  const v = N({ key: 'vitima', name: 'Otávio', pos: V3(-1.13, -.05, (LAY.lavZ0 + LAY.lavZ1) / 2 + .08), rotY: -Math.PI / 2, skin: [.74, .76, .8], skinExtra: { roughness: .9 }, cloth: 0x8fa2b8, slump: true, pitch: -.75, roll: .5, yaw: .25 });
  v.g.rotation.set(.18, -Math.PI / 2, .1, 'YXZ'); v.hit.scale.set(1.2, 1, 1.2);
  const bd = (map, p, s, r = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 1.2), map); m.position.set(p[0], p[1], p[2]); m.rotation.set(0, Math.PI, r); v.g.add(m); };
  bd(MAT.bloodPool, [.06, .96, -.132], .26, .3); bd(MAT.bloodPool, [.02, .8, -.142], .2, 1.2); bd(MAT.bloodSpat, [-.06, .9, -.14], .22, .4); bd(MAT.bloodPool, [0, .6, -.2], .24, 2);
  // telas de laptop/celular iluminando rostos
  const glow = (npc, p, col, w = .26, h = .17, nolight) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(1.4) })); m.position.set(p[0], p[1], p[2]); m.rotation.x = -.35; npc.g.add(m); if (nolight) return; const l = new THREE.PointLight(col, .5, 1.1, 2); l.position.set(p[0], p[1] + .08, p[2] - .05); npc.g.add(l); return l; };
  glow(PEOPLE.npcs.davi, [0, .78, -.32], 0x9fc0ff); glow(PEOPLE.npcs.watcher, [0, .78, -.3], 0x7f9fff, .12, .2, true);
  const ph = new THREE.Group(); ph.position.set(-.72, .012, 27.55); ph.rotation.y = .7; R.scene.add(ph);
  new THREE.Mesh(); const phb = new THREE.Mesh(roundedBox(.075, .009, .155, .008), MAT.black); ph.add(phb);
  WORLD.phoneScr = new THREE.Mesh(new THREE.PlaneGeometry(.068, .145), new THREE.MeshBasicMaterial({ color: 0x000000 })); WORLD.phoneScr.rotation.x = -Math.PI / 2; WORLD.phoneScr.position.y = .0055; ph.add(WORLD.phoneScr);
  WORLD.phoneLight = new THREE.PointLight(0x9fc0ff, 0, .8, 2); WORLD.phoneLight.position.set(0, .06, 0); ph.add(WORLD.phoneLight); WORLD.phone = ph;
  // casaco no assento 23C
  const jk = new THREE.Mesh(roundedBox(.42, .05, .5, .02), clothMat(0x2b2f36)); jk.position.copy(seatPos('23C')).add(V3(0, .52, 0)); jk.rotation.set(.05, .1, .04); R.scene.add(jk);
  const jk2 = new THREE.Mesh(roundedBox(.4, .4, .04, .02), clothMat(0x2b2f36)); jk2.position.copy(seatPos('23C')).add(V3(0, .82, .2)); jk2.rotation.x = .2; R.scene.add(jk2);
}

// ----------------------------------------------------------------- utilidades de cena
function camLookAt(target) { GAME.camTarget = target; }
async function converse(npc, fn, opts = {}) {
  GAME.busy = true; const prev = P.mode; P.mode = 'talk'; camLookAt(npc.headWorld ? npc.headWorld() : npc); cine(true); GAME.fxT.focus = .75;
  await wait(.5); try { await fn(); } finally { dialogEnd(); cine(false); GAME.fxT.focus = 0; GAME.camTarget = null; P.mode = prev === 'talk' ? 'walk' : prev; GAME.busy = false; }
}
function npcPos(k) { return PEOPLE.npcs[k].headWorld(); }
function setTension(v) { AU.tension = v; }
async function interview(npc, topics) {
  const seen = new Set();
  while (true) {
    const avail = topics.filter(t => !t.cond || t.cond()); const opts = avail.map((t, i) => ({ t: t.q, id: i, seen: seen.has(t.q) }));
    opts.push({ t: 'Encerrar conversa', id: -1 });
    const c = await choose(opts, ''); if (c === -1) break; const tp = avail[c]; seen.add(tp.q); await tp.a(); if (tp.once) topics.splice(topics.indexOf(tp), 1);
  }
}
function lightsDark(on) {
  const L = WORLD.lights; const k = on ? 0 : 1; L.cabin.forEach(l => l.visible = !on); L.fwd.intensity = on ? 0 : 2.4; L.aft.intensity = on ? .25 : 3.4; L.galleyWork.intensity = on ? 0 : 7; Object.values(L.read).forEach(l => l.visible = !on); L.hemi.intensity = on ? .12 : .55;
  MAT.mood.color.setRGB(.10 * 2.2 * k, .18 * 2.2 * k, .75 * 2.2 * k); MAT.warmStrip.color.setRGB(1.6 * k, 1.15 * k, .72 * k); MAT.readOn.color.setRGB(14 * k, 12.6 * k, 10 * k); MAT.ife.color.setScalar(on ? .15 : .9);
  MAT.pathLight.color.setRGB(.55 * (on ? 6 : .5) / .5 * .5, .75 * (on ? 6 : .5) / .5 * .5, .5 * (on ? 6 : .5) / .5 * .5);
}
async function flicker(n = 6) { for (let i = 0; i < n; i++) { lightsDark(true); await wait(.05 + rand() * .12); lightsDark(false); await wait(.05 + rand() * .25); } }

// ----------------------------------------------------------------- documentos
const DOCS = {
  phone: () => `<div class="phone"><div class="pt">04:${fmt2(39 + Math.floor(GAME.t / 60) % 20)}</div><div class="pd">sábado, 15 de novembro</div>
   <div class="nt"><b>Dra. Paula Viana · PF — 03:12</b>Otávio, a escala de tripulação do 0471 foi alterada ontem à noite. Pode não ser nada. Não saia do seu assento até Lisboa.</div>
   <div class="nt"><b>Dra. Paula Viana · PF — 03:31</b>Confirma que está com o material? A PJ te espera no desembarque.</div>
   <div class="nt"><b>Mãe — 23:02</b>Me avisa quando chegar. Deus te acompanhe ❤️</div>
   <div class="nt" style="opacity:.6"><b>Modo avião</b>Wi-Fi de bordo conectado · Atlântica Sky</div></div>`,
  boarding: () => `<div class="paper" style="max-width:560px"><h3>Cartão de embarque · Boarding pass</h3><table><tr><td><small>PASSAGEIRO</small><br><b>BRANDAO/OTAVIO L MR</b></td><td><small>VOO</small><br><b>AT 0471</b></td><td><small>DATA</small><br><b>14NOV</b></td></tr>
   <tr><td><small>DE</small><br><b>RECIFE REC</b></td><td><small>PARA</small><br><b>LISBOA LIS</b></td><td><small>ASSENTO</small><br><b class="hl">23C</b></td></tr><tr><td><small>EMBARQUE</small><br>22:25</td><td><small>PORTÃO</small><br>12</td><td><small>GRUPO</small><br>3</td></tr></table>
   <p style="margin-top:14px">Atrás, a caneta: <span class="hand">"PJ — Insp. Ramos — 10h — Terminal 1"</span></p></div>`,
  pasta: () => `<div class="paper"><div class="stamp">SIGILOSO</div><h3>Ministério da Fazenda · Receita Federal do Brasil</h3><small>RELATÓRIO DE AUDITORIA FISCAL Nº 0412/2026 · OPERAÇÃO MARÉ ALTA · CÓPIA 2/3</small>
   <p style="margin:14px 0">Auditor responsável: <b>Otávio Lacerda Brandão</b>, mat. 1.284.551</p>
   <table><tr><th>Empresa</th><th>Movimentação atípica</th><th>Destino</th></tr><tr><td class="hl">Mattar Logística Portuária S.A.</td><td>R$ 412,7 mi</td><td>Lisboa / Funchal</td></tr><tr><td>Atlas Terminais Suape Ltda.</td><td>R$ 96,1 mi</td><td>Panamá</td></tr><tr><td>MLP Participações</td><td>R$ 58,0 mi</td><td>Madeira (ZFM)</td></tr></table>
   <p style="margin-top:14px">Beneficiário final identificado: <b class="hl">SÉRGIO AUGUSTO MATTAR</b>. As planilhas originais, extratos e áudios constam do anexo digital.</p>
   <p style="margin-top:10px" class="hand">Original no pen drive — entregar à PJ, Lisboa, 10h. Não despachar!</p><p style="margin-top:8px"><small>Páginas 14 a 31 ausentes.</small></p></div>`,
  pil: () => `<div class="paper"><h3>PIL · Passenger Information List — AT0471 REC-LIS 14NOV</h3><small>Extrato · 192 PAX + 2 INF · 8 TRIP</small>
   <table style="margin-top:10px"><tr><th>Assento</th><th>Nome</th><th>Obs.</th></tr><tr><td>4A</td><td>MATTAR/SERGIO A MR</td><td>J · VIP · conexão LIS-FNC</td></tr><tr><td>16D</td><td>SOUZA/RENATO MR</td><td>—</td></tr><tr><td>18D</td><td>ALBUQUERQUE/TOMAS REV</td><td>assist. 71a</td></tr>
   <tr><td>23A</td><td>COUTINHO/LIVIA MS</td><td>—</td></tr><tr><td class="hl">23C</td><td class="hl">BRANDAO/OTAVIO L MR</td><td class="hl">servidor público · bagagem de mão: 1</td></tr><tr><td>31F</td><td>ROCHA/DAVI MR</td><td class="hl">emissão 12NOV · mesma agência que 23C</td></tr></table>
   <p style="margin-top:12px"><small>Tripulação: VALENÇA R. (CMT) · DUARTE H. (CO) · QUINTELA M. (CC) · ARAÚJO C. · FARIAS D. · LIMA B. · PRADO J. · SOARES T.</small></p></div>`,
  escala: () => `<div class="paper"><div class="stamp">ALTERADA</div><h3>Escala de tripulação — AT0471 · 14/11</h3><table><tr><th>Posição</th><th>Tripulante</th><th>Base</th></tr><tr><td>CMT</td><td>Ricardo VALENÇA</td><td>REC</td></tr><tr><td>CO</td><td>Helena DUARTE</td><td>REC</td></tr><tr><td>CC · L1</td><td>Marta QUINTELA</td><td>REC</td></tr><tr><td>R1 · executiva</td><td>Camila ARAÚJO</td><td>REC</td></tr><tr><td>L2/R2</td><td>Bruno LIMA · Juliana PRADO</td><td>REC</td></tr><tr><td class="hl">L4 · galley tras.</td><td class="hl"><s>Priscila NUNES</s> → Diego FARIAS</td><td>GRU</td></tr><tr><td>R4</td><td>Tiago SOARES</td><td>REC</td></tr></table>
   <p style="margin-top:12px">Registro de alteração: <span class="hl">13/11 · 21:58 · troca solicitada por FARIAS D. · motivo: "pessoal" · aprov. automática CCO</span></p><p class="hand" style="margin-top:10px">Diego nem é de Recife. Veio de São Paulo só pra esse voo? — M.</p></div>`,
  burner: () => `<div class="phone" style="background:#141414"><div class="pd" style="margin:8px 0 14px">Nokia · sem chip registrado</div>
   <div class="nt"><b>+351 9•• ••• 418 — 13/11 22:47</b>23C. Antes do Sal. Traga o pen drive. Metade agora, metade em Lisboa. — S.M.</div>
   <div class="nt"><b>Enviada — 03:52</b>feito. tenho o pd.</div><div class="nt"><b>+351 9•• ••• 418 — 03:58</b>Ótimo. Ninguém mais precisa se machucar. A moça do 23 viu alguma coisa?</div><div class="nt"><b>Rascunho não enviado</b>talvez. vou resolver</div></div>`,
};
async function photoDoc() {
  // reconstrói a foto de Davi renderizando a cena real a partir do ponto de vista dele
  const d = PEOPLE.npcs.diego; const sv = { p: d.g.position.clone(), r: d.g.rotation.y, tr: d.tracking }; d.g.position.set(-.18, 0, 27.15); d.g.rotation.y = Math.PI / 2 + .3; d.tracking = false; d.look.yaw = d.look.ty = -.6; d.update(0, 0, V3()); d.headPivot.rotation.y = -.6;
  const door = WORLD.lavDoor; const dr = door.rotation.y; door.rotation.y = 0; const torch = WORLD.lights.torch.intensity; WORLD.lights.torch.intensity = 0;
  const cam = new THREE.PerspectiveCamera(48, 1.5, .05, 60); cam.position.set(.05, 1.58, rowZ(32) + .1); cam.lookAt(-.3, 1.15, 27.4);
  const W = 720, H = 480; const rt = new THREE.WebGLRenderTarget(W, H); R.renderer.setRenderTarget(rt); R.renderer.render(R.scene, cam); const px = new Uint8Array(W * H * 4); R.renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); R.renderer.setRenderTarget(null); rt.dispose();
  d.g.position.copy(sv.p); d.g.rotation.y = sv.r; d.tracking = sv.tr; door.rotation.y = dr; WORLD.lights.torch.intensity = torch;
  const c = canvas(W, H), x = c.getContext('2d'); const img = x.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) { const s = ((H - 1 - y) * W + i) * 4, o = (y * W + i) * 4; const n = (Math.random() - .5) * 26; for (let k = 0; k < 3; k++) { let v = px[s + k] / 255; v = Math.pow(Math.min(1, v * 3.2), 1 / 2.2) * 255; img.data[o + k] = clamp(v + n + (k === 2 ? 4 : 0), 0, 255); } img.data[o + 3] = 255; }
  x.putImageData(img, 0, 0); x.filter = 'blur(.6px)'; x.drawImage(c, 0, 0); x.filter = 'none';
  x.fillStyle = 'rgba(255,170,40,.92)'; x.font = '20px "IBM Plex Mono", monospace'; x.fillText('15/11/2026  03:44:17', W - 270, H - 22); x.fillText('ISO 12800  1/15  f2.0', 18, H - 22);
  return `<img class="photo" src="${c.toDataURL('image/jpeg', .9)}"><div class="photo-cap">Câmera de Davi Rocha · arquivo IMG_4471.JPG · ampliado</div>`;
}

// ----------------------------------------------------------------- interações
function registerInteractions() {
  const I = addInteract; const ch = (...c) => () => c.includes(GAME.chapter); const F = GAME.flags;
  // cockpit
  I({ hit: hitbox(.3, .25, .35, [-.98, .78, -4.9]), label: 'Atender o interfone', enabled: () => GAME.chapter === 'cockpit' && F.callRinging, action: () => callMarta() });
  I({ hit: hitbox(.35, .2, .2, [-.85, .92, -3.82]), label: 'Pegar a lanterna', enabled: () => !P.hasTorch && GAME.chapter === 'cockpit' && F.called, action: () => { P.hasTorch = true; WORLD.torchMesh.visible = false; SFX.click(); hint('Lanterna: tecla F (ou botão "Luz")', 6); } });
  I({ hit: hitbox(.9, 2, .3, [0, 1, LAY.ckDoor]), label: 'Abrir a porta do cockpit', enabled: () => GAME.chapter === 'cockpit' && F.called && !F.ckOpened, action: () => openCockpitDoor() });
  I({ hit: hitbox(.9, 2, .3, [0, 1, LAY.ckDoor]), label: 'Porta do cockpit — trancada', enabled: () => GAME.chapter === 'marta', action: () => hint('Só abre por dentro. Use o interfone para falar com o comandante.') });
  I({ hit: PEOPLE.npcs.helena.hit, label: 'Falar com Helena (copiloto)', enabled: () => GAME.chapter === 'cockpit' && F.called, action: () => converse(PEOPLE.npcs.helena, () => talk([['Helena', 'Eu fico com o avião, comandante. Levo a gente até o Sal se for preciso.'], ['Helena', 'Leve a lanterna. E… cuidado lá atrás.']])) });
  // cabine — personagens
  I({ hit: PEOPLE.npcs.camila.hit, label: 'Falar com Camila', enabled: () => GAME.chapter === 'walk' || GAME.chapter === 'investigate', action: () => converse(PEOPLE.npcs.camila, () => talk([['Camila', 'Fiquei a noite inteira na executiva, comandante. Ninguém passou pela cortina — nem o senhor do 4A, que dorme desde a decolagem.']])) });
  I({ hit: PEOPLE.npcs.marta.hit, label: 'Falar com Marta', enabled: () => GAME.chapter === 'investigate', action: () => talkMarta() });
  I({ hit: PEOPLE.npcs.diego.hit, label: 'Falar com Diego', enabled: () => (GAME.chapter === 'investigate' || GAME.chapter === 'marta') && PEOPLE.npcs.diego.g.visible, action: () => talkDiego() });
  I({ hit: PEOPLE.npcs.livia.hit, label: 'Falar com Lívia (23A)', enabled: () => ['investigate', 'marta'].includes(GAME.chapter), action: () => talkLivia() });
  I({ hit: PEOPLE.npcs.padre.hit, label: 'Falar com o padre (18D)', enabled: () => ['walk', 'investigate', 'marta'].includes(GAME.chapter), action: () => talkPadre() });
  I({ hit: PEOPLE.npcs.davi.hit, label: 'Falar com o passageiro do 31F', enabled: () => ['investigate', 'marta'].includes(GAME.chapter), action: () => talkDavi() });
  I({ hit: PEOPLE.npcs.mattar.hit, label: () => GAME.chapter === 'marta' ? 'Acordar o passageiro do 4A' : 'Passageiro do 4A — dormindo', enabled: () => ['walk', 'investigate', 'marta'].includes(GAME.chapter), action: () => talkMattar() });
  I({ hit: PEOPLE.npcs.watcher.hit, label: 'Passageiro do 16D', enabled: () => ['walk', 'investigate', 'marta'].includes(GAME.chapter), action: () => converse(PEOPLE.npcs.watcher, () => talk([['16D', 'Eu não durmo em avião.'], ['16D', '…Alguém passou correndo lá pra trás antes. Com um carrinho. Faz uma hora, talvez.'], ['16D', 'Vocês não deviam deixar a luz tão baixa.']])) });
  // lavatório
  I({ hit: hitbox(.25, 1.9, .65, [-.33, .95, (LAY.lavZ0 + LAY.lavZ1) / 2 + .05]), label: () => F.lavOpened ? 'Examinar a trava da porta' : 'Abrir o lavatório', enabled: ch('investigate', 'marta'), action: () => F.lavOpened ? examineLock() : openLav() });
  I({ hit: PEOPLE.npcs.vitima.hit, label: 'Examinar o corpo', enabled: () => F.lavOpened, action: () => examineBody() });
  I({ hit: hitbox(.25, .2, .2, [-.95, .7, LAY.lavZ0 + .44]), label: 'Abrir a lixeira', enabled: () => F.lavOpened, action: () => examineTrash() });
  I({ hit: hitbox(.25, .15, .3, [-.72, .05, 27.55]), label: 'Pegar o celular no chão', enabled: () => F.lavOpened, action: async () => { GAME.busy = true; await showDoc(DOCS.phone()); addClue('celular'); GAME.busy = false; } });
  I({ hit: hitbox(.5, .5, .1, [-.95, 1.38, LAY.lavZ0 + .08]), label: 'Olhar o espelho', enabled: () => F.lavOpened, action: () => converse(V3(-.95, 1.38, LAY.lavZ0), () => talk([[GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'Marcas de dedos no sangue do espelho. Alguém tentou limpar com papel… e desistiu.'], [GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'Quem fez isso não tinha pressa. Sabia que ninguém ia abrir essa porta.']])) });
  // assento e bagageiro da vítima
  I({ hit: hitbox(.45, .7, .5, seatPos('23C').add(V3(0, .6, 0)).toArray()), label: 'Examinar o assento 23C', enabled: ch('investigate', 'marta'), action: () => examineSeat() });
  I({ hit: hitbox(.7, .4, .7, [-1.35, 1.75, rowZ(23)]), label: 'Abrir o bagageiro do 23C', enabled: ch('investigate', 'marta'), action: async () => { GAME.busy = true; SFX.latch(V3(-1.3, 1.8, rowZ(23))); await showDoc(DOCS.pasta()); F.pastaSeen = true; addClue('pasta'); GAME.busy = false; } });
  // interfone traseiro / FAP / escala / trolley / bolsa
  I({ hit: hitbox(.3, .4, .3, WORLD.handsetAft.toArray()), label: () => GAME.chapter === 'investigate' ? (F.aftRinging ? 'Atender o interfone' : 'Interfone') : 'Interfone — ligar para o cockpit', enabled: ch('investigate', 'marta'), action: () => GAME.chapter === 'investigate' ? (F.aftRinging ? answerHelena() : hint('Nada a dizer ao cockpit ainda.')) : accuse() });
  I({ hit: hitbox(.5, .4, .3, [-1.0, 1.35, -2.35]), label: 'Escala da tripulação (presa ao FAP)', enabled: ch('investigate', 'marta'), action: async () => { GAME.busy = true; await showDoc(DOCS.escala()); addClue('escala'); F.suspectDiego = true; GAME.busy = false; } });
  I({ hit: hitbox(.38, 1, .3, [-1.3 + 4 * .37 + 0, .5, LAY.galleyZ]), label: () => F.knifeFound ? 'Trolley A7 (vazio)' : 'Examinar o trolley A7', enabled: () => GAME.chapter === 'marta' || (GAME.chapter === 'investigate' && F.ronda), action: () => examineTrolley() });
  I({ hit: hitbox(.7, .5, .3, WORLD.crewBin.toArray()), label: 'Compartimento da tripulação (bolsas)', enabled: () => GAME.chapter === 'marta', action: () => examineCrewBag() });
  I({ hit: hitbox(.3, .25, .2, [-1.0, 1.45, LAY.lavZ1 + .05]), label: 'PIL — manifesto de passageiros', enabled: () => GAME.chapter === 'marta' && !GAME.clues.has('pilSeen'), action: async () => { GAME.busy = true; await showDoc(DOCS.pil()); GAME.busy = false; } });
}

// ----------------------------------------------------------------- CAPÍTULO 0/1 — Cockpit
async function startPrologue() {
  GAME.chapter = 'prologue'; setChar('Comandante Ricardo Valença'); P.mode = 'seated'; P.x = -.53; P.y = 1.2; P.z = -4.98; P.yaw = 0; P.pitch = -.08; P.ckOpen = true;
  GAME.fx.fade = 1; cine(true); setTension(.05);
  await wait(1.2);
  await card('Atlântico Sul · Espaço aéreo oceânico do Sal', 'Voo AT0471', 'Recife → Lisboa · Airbus A321neo · 192 passageiros, 8 tripulantes<br>04:38 UTC · nível de voo 370 · 2 h 33 min de voo', 6.5);
  fxTo('fade', 0, 4); await wait(2.5);
  GAME.chapter = 'cockpit';
  await say('Helena', 'Ponto de igual tempo em dezoito minutos. O Sal segue como alternado ETOPS. Tempo bom lá: vento calmo, dez quilômetros.', 6.5, PEOPLE.npcs.helena.headWorld());
  await say('Helena', 'Lá atrás tá todo mundo apagado. Melhor parte do voo.', 4, PEOPLE.npcs.helena.headWorld());
  await wait(1.5); SFX.buzzer(); await wait(.4); setTension(.2);
  await say('Helena', 'Cabine chamando, comandante. Chamada prioritária… do fundo.', 4, PEOPLE.npcs.helena.headWorld());
  SFX.buzzer(); cine(false); GAME.flags.callRinging = true; setObjective('Atenda o interfone (à sua esquerda). Olhe com o mouse e pressione E.');
  GAME.ringT = setInterval(() => { if (GAME.flags.callRinging) SFX.buzzer(); }, 4500);
  GAME.playing = true;
}
async function callMarta() {
  GAME.flags.callRinging = false; clearInterval(GAME.ringT); GAME.busy = true; SFX.click(); cine(true); setTension(.35);
  await talk([
    ['Marta (interfone)', 'Comandante, é a Marta, no fundo. Preciso que o senhor me escute com calma.'],
    ['Marta (interfone)', 'O passageiro do 23C. Otávio Brandão. Ele está no lavatório traseiro esquerdo.'],
    ['Marta (interfone)', '…Ele está morto, comandante.'],
  ]);
  const c = await choose([{ t: '"Tem certeza? Pode ter sido um mal súbito."', id: 0 }, { t: '"Alguém mais sabe? Alguém tocou em alguma coisa?"', id: 1 }]);
  if (c === 0) await talk([['Marta (interfone)', 'Não foi mal súbito. Tem sangue. No chão, no espelho… Alguém fez isso com ele.']]);
  else await talk([['Marta (interfone)', 'Só eu e o Diego. Fechei a porta de novo pelo trinco de fora. Os passageiros estão dormindo — por enquanto.']]);
  SFX.heartbeat(.7);
  await talk([['Comandante', 'Mantenha todos sentados e ninguém perto daquela porta. Estou indo.'], ['Helena', 'Comandante… eu fico com a aeronave. Vou chamar a Camila pra ficar aqui comigo. Regra dos dois.'], ['Helena', 'Liguei o aviso de cintos. Se alguém levantar, vai ter um motivo a menos.']]);
  SFX.chime('single'); cine(false); GAME.flags.called = true; GAME.busy = false; setTension(.3);
  P.mode = 'walk'; P.x = -.35; P.z = -4.5; P.eye = 1.72; P.yaw = Math.PI * .9; P.pitch = -.1;
  setObjective('Pegue a lanterna presa atrás do seu assento e saia do cockpit.');
}
async function openCockpitDoor() {
  GAME.flags.ckOpened = true; GAME.busy = true; SFX.latch(V3(0, 1, LAY.ckDoor)); await tweenRot(WORLD.ckDoor, -1.6, 1.4);
  const cam = PEOPLE.npcs.camila; cam.g.position.set(.1, 0, -3.1); cam.g.rotation.y = 0;
  converse(cam, () => talk([['Camila', 'Comandante… a Marta me contou. Eu fico aqui dentro com a Helena.'], ['Camila', 'Não deixe ninguém ver o seu rosto assim. Eles leem a gente.']])).then(async () => {
    GAME.chapter = 'walk'; setObjective('Vá até o fundo da aeronave — galley traseira. Sem alarmar os passageiros.');
    cam.g.position.set(.35, 0, -4.25); cam.g.rotation.y = Math.PI; GAME.busy = false;
  });
}
function tweenRot(obj, to, sec) { const from = obj.rotation.y; const t0 = GAME.t; return new Promise(res => { GAME.anims.push(dt => { const k = easeInOut((GAME.t - t0) / sec); obj.rotation.y = lerp(from, to, k); if (k >= 1) { res(); return true; } }); }); }
function tweenPos(obj, to, sec) { const from = obj.position.clone(); const t0 = GAME.t; return new Promise(res => { GAME.anims.push(dt => { const k = easeInOut((GAME.t - t0) / sec); obj.position.lerpVectors(from, to, k); if (k >= 1) { res(); return true; } }); }); }

// ----------------------------------------------------------------- caminhada (gatilhos)
const TRIGGERS = [
  { z: -2.4, ch: 'walk', fn: async () => { await wait(.3); if (P.z > -3.3 && GAME.flags.ckOpened) { SFX.latch(V3(0, 1, LAY.ckDoor)); await tweenRot(WORLD.ckDoor, 0, 1.2); P.ckOpen = false; } } },
  { z: 2.8, ch: 'walk', fn: async () => { await say('', 'O 4A dorme com máscara de olhos. O resto da executiva também.', 3.5, false); } },
  { z: 8.5, ch: 'walk', fn: async () => { SFX.chime('single'); await wait(.8); P.shake = .55; SFX.turbulence(3.5, .8); SFX.creak(V3(1.8, 1.2, P.z + 2)); setTension(.4); await wait(3); await say('', 'Turbulência leve. As cortinas balançam. Alguém tosse na escuridão.', 4, false); } },
  { z: 14.2, ch: 'walk', fn: async () => { SFX.heartbeat(.6); setTension(.48); await wait(.6); SFX.heartbeat(.7); } },
  { z: 17.0, ch: 'walk', fn: async () => { await say('Padre (18D)', 'Comandante… fui eu que avisei. O banheiro da esquerda. Que Deus tenha piedade.', 5, npcPos('padre')); } },
  { z: 25.6, ch: 'walk', fn: () => arriveAft() },
];
async function arriveAft() {
  GAME.chapter = 'investigate'; GAME.busy = true; P.mode = 'talk'; setTension(.5);
  const M = PEOPLE.npcs.marta, D = PEOPLE.npcs.diego; camLookAt(M.headWorld()); cine(true);
  await talk([
    ['Marta', 'Comandante.', { pos: M.headWorld() }],
    ['Marta', 'O padre do 18D reclamou que o banheiro estava ocupado havia quase quarenta minutos. Bati, chamei… nada. Destravei por fora.'],
    ['Marta', 'Otávio Lacerda Brandão, 52 anos, assento 23C. Viajava sozinho. Só pediu água no serviço.'],
    () => { camLookAt(D.headWorld()); },
    ['Diego', 'Comandante, eu estava aqui na galley o tempo todo. Não vi ninguém entrar lá. Juro.', { pos: D.headWorld() }],
    ['Diego', 'Quer um café? O senhor vai precisar.'],
  ]);
  addClue('diego1', true);
  const c = await choose([{ t: '"Diego, fique na galley. Ninguém passa por aqui."', id: 0 }, { t: '"Agora não. Marta, me mostre."', id: 1 }]);
  camLookAt(M.headWorld());
  await talk([['Marta', c === 0 ? 'O Diego segura aqui atrás. Comandante… a porta ainda está destravada. É só empurrar.' : 'A porta está destravada. É só empurrar. Eu… eu não consigo olhar de novo.']]);
  cine(false); GAME.camTarget = null; P.mode = 'walk'; GAME.busy = false; GAME.flags.lightDim = true;
  setObjective('Investigue: o lavatório, o corpo, o assento 23C e a passageira do 23A.');
}
async function openLav() {
  GAME.busy = true; GAME.flags.lavOpened = true; SFX.latch(V3(-.35, 1, 27.4)); await wait(.3);
  P.lavOpen = true; SFX.door(V3(-.35, 1, 27.4)); tweenRot(WORLD.lavDoor, 1.45, 1.6); drawOcc(true);
  await wait(.9); SFX.stinger(1); P.shake = .25; setTension(.72); GAME.fx.flash = .25; GAME.fxT.red = .35; flickLav = 2.2;
  await wait(1.5); GAME.fxT.red = 0;
  await say(GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'Meu Deus…', 2.2, false);
  GAME.busy = false; setTension(.55);
}
let flickLav = 0;
async function examineLock() { await converse(V3(-.35, 1.2, 27.4), () => talk([[GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'O trinco foi fechado pelo lado de fora — pela alavanca escondida atrás da placa "LAVATORY".'], [GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'Passageiro nenhum sabe que isso existe. Quem trancou ele lá dentro conhece este avião.']])); addClue('porta'); GAME.flags.suspectDiego = true; }
async function examineBody() {
  await converse(PEOPLE.npcs.vitima, async () => {
    SFX.heartbeat(.8); GAME.fxT.desat = .35;
    const me = GAME.chapter === 'marta' ? 'Marta' : 'Comandante';
    await talk([[me, 'Otávio Brandão. A pele já está fria nas mãos, mas o sangue no chão ainda brilha.'], [me, 'Um furo só, no lado esquerdo do pescoço. Lâmina fina, curta. Não é faca de serviço — as nossas são de plástico.'], [me, 'Corte na palma direita. Ele tentou segurar a lâmina.'], [me, 'Sem cinto arrebentado, sem roupa rasgada. Ele abriu a porta para quem fez isso. Ou não precisou abrir.']]);
    GAME.fxT.desat = 0;
  });
  addClue('corpo'); checkCaptainDone();
}
async function examineTrash() {
  SFX.latch(V3(-.95, .7, LAY.lavZ0 + .44));
  await converse(V3(-.95, .7, LAY.lavZ0 + .44), () => talk([[GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'Toalhas de papel ensanguentadas… e isto: a ponta de um dedo de luva nitrílica, azul, rasgada.'], [GAME.chapter === 'marta' ? 'Marta' : 'Comandante', GAME.chapter === 'marta' ? 'Azul. É a luva do catering. Tem uma caixa dela em cada galley deste avião.' : 'Luva azul. Já vi caixas dessas em algum lugar deste avião.']]));
  addClue('luva');
}
async function examineSeat() {
  GAME.busy = true;
  await converse(seatPos('23C').add(V3(0, .6, 0)), () => talk([[GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'O paletó dele ficou no assento. O bolso interno foi cortado — o forro aberto à força, com pressa.'], [GAME.chapter === 'marta' ? 'Marta' : 'Comandante', 'No bolso de fora, o cartão de embarque.']]));
  GAME.busy = true; await showDoc(DOCS.boarding()); addClue('forro'); GAME.busy = false; checkCaptainDone();
}
async function talkMarta() {
  await converse(PEOPLE.npcs.marta, () => interview(PEOPLE.npcs.marta, [
    { q: 'Quem sabe destravar o lavatório por fora?', a: () => talk([['Marta', 'Qualquer tripulante. É a primeira coisa que a gente aprende no treinamento de cabine.'], ['Marta', '…Passageiro? Nunca vi um saber.']]) },
    { q: 'Me mostre o manifesto (PIL).', a: async () => { await showDoc(DOCS.pil()); } },
    { q: 'O que você sabe do Diego?', a: () => talk([['Marta', 'Pouco. Oito meses de casa, base Guarulhos. Ele entrou nessa escala ontem à noite — trocou com a Priscila.'], ['Marta', 'A escala impressa está presa ao lado do FAP, lá na frente.']]) },
    { q: 'Como você está?', a: () => talk([['Marta', 'Vinte e três anos voando, comandante. Já vi parto, infarto, briga, turbulência que arrancou carrinho do trilho.'], ['Marta', 'Nunca vi isso.']]) },
  ]));
}
async function talkDiego() {
  const D = PEOPLE.npcs.diego; const isM = GAME.chapter === 'marta';
  await converse(D, () => interview(D, [
    { q: 'Onde você estava entre 03:30 e 04:20?', a: () => talk([['Diego', 'Aqui. Na galley. Arrumando os trolleys do café da manhã. Não saí.']]) },
    { q: 'Uma passageira ouviu um trolley no corredor às 03:40.', cond: () => GAME.clues.has('livia'), once: true, a: async () => { await talk([['Diego', '…'], ['Diego', 'Ah. Sim. Eu fiz uma ronda de água, rapidinho. Com o A7. Esqueci, foi coisa de dois minutos.'], ['Diego', 'Isso não quer dizer nada.']]); addClue('ronda'); GAME.flags.ronda = true; GAME.flags.suspectDiego = true; SFX.heartbeat(.5); } },
    { q: 'Por que você trocou de escala ontem?', cond: () => GAME.clues.has('escala'), once: true, a: () => talk([['Diego', 'Problema pessoal da Priscila. Ela me pediu.'], [isM ? 'Marta' : 'Comandante', 'No sistema, quem pediu a troca foi você.'], ['Diego', '…Então o sistema errou.']]) },
    { q: 'Me mostre as suas mãos.', cond: () => GAME.clues.has('luva') || GAME.clues.has('padre'), once: true, a: () => talk([['Diego', 'Minhas mãos? Pra quê?'], ['', 'Ele estende as mãos. Limpas, recém-lavadas. Um anel grosso de prata no dedo médio direito. A pele dos nós dos dedos está vermelha de tanto esfregar.'], ['Diego', 'Satisfeita?']]) },
  ]));
}
async function talkLivia() {
  const L = PEOPLE.npcs.livia; const me = GAME.chapter === 'marta' ? 'Marta' : 'Comandante';
  await converse(L, async () => {
    if (!GAME.flags.livia0) { GAME.flags.livia0 = true; await talk([['Lívia', (GAME.chapter === 'marta' ? 'Moça' : 'Comandante') + '? Aconteceu alguma coisa com o senhor do meu lado, não foi? Ele não voltou.']]); }
    await interview(L, [
      { q: 'A que horas ele se levantou?', a: async () => { await talk([['Lívia', 'Às 03:41. Eu vi no relógio da tela. Ele passou por cima das minhas pernas… não, ele estava no corredor. Levantou e foi pro fundo.'], ['Lívia', 'Pouco depois ouvi um carrinho. Aquele barulho de rodinha no trilho. Achei estranho — o serviço já tinha acabado fazia tempo.']]); addClue('livia'); GAME.flags.livia1 = true; checkCaptainDone(); } },
      { q: 'Ele parecia preocupado?', a: () => talk([['Lívia', 'O tempo todo. Ele mexia num pen drive preto, guardava no bolso de dentro, tirava de novo. Umas dez vezes.'], ['Lívia', 'Perguntou se eu sabia se o avião tinha câmera. Eu ri. Ele não.']]) },
      { q: 'Você carrega luvas? (vi uma caixa na sua bolsa)', a: async () => { await talk([['Lívia', 'Sou enfermeira. Ando com um par sempre. São estas, roxas, do hospital.'], ['Lívia', 'Por quê? Vocês acham que eu…?']]); addClue('luvasLivia'); } },
      { q: 'Você viu alguém ir para o fundo depois dele?', cond: () => GAME.flags.livia1, a: () => talk([['Lívia', 'Eu estava meio dormindo. Uma pessoa de roupa escura, de costas. Podia ser qualquer um.'], ['Lívia', '…Podia ser da tripulação. Vocês usam escuro.'], ['Lívia', 'Eu estou com medo, sabia? Eu era a única acordada.']]) },
    ]);
  });
}
async function talkPadre() {
  const T = PEOPLE.npcs.padre;
  await converse(T, () => interview(T, [
    { q: 'O senhor viu alguém perto do lavatório?', a: async () => { await talk([['Padre', 'Às dez para as quatro, mais ou menos, levantei para ir ao banheiro. Um rapaz da tripulação vinha do fundo, enxugando as mãos num guardanapo.'], ['Padre', 'Jovem. Usava um anel grosso, prateado, no dedo do meio. Me deu boa-noite. Educado.'], ['Padre', 'O banheiro da esquerda estava ocupado. Esperei, desisti. Às quatro e vinte voltei — ainda ocupado. Foi aí que chamei a moça.']]); addClue('padre'); GAME.flags.padre1 = true; GAME.flags.suspectDiego = true; } },
    { q: 'Conhecia o passageiro do 23C?', a: () => talk([['Padre', 'Conversamos no portão. Ele disse que estava levando "a verdade" para Lisboa. Pensei que fosse uma metáfora.'], ['Padre', 'Rezei por ele agora há pouco. Rezo por quem fez isso também. É o meu trabalho.']]) },
  ]));
}
async function talkDavi() {
  const D = PEOPLE.npcs.davi; const me = GAME.chapter === 'marta' ? 'Marta' : 'Comandante';
  await converse(D, () => interview(D, [
    { q: 'O senhor está acordado há muito tempo?', a: () => talk([['31F', 'Não durmo em voo. Trabalho. Sou consultor de TI.'], ['31F', 'Algum problema? Vi a movimentação lá atrás.']]) },
    { q: 'Sua passagem foi emitida pela mesma agência que a do 23C.', cond: () => GAME.chapter === 'marta' || GAME.clues.has('pasta'), once: true, a: async () => { await talk([['31F', '…'], ['Davi', 'Tá bom. Davi Rocha, Agência Farol. Sou jornalista. Estou atrás do Otávio há três semanas — a Maré Alta é a maior história da minha vida.'], ['Davi', 'Ele está morto, não está? Eu sabia. Eu sabia que eles não iam deixar ele descer em Lisboa.']]); addClue('davi'); GAME.flags.davi2 = true; } },
    { q: 'Você fotografou alguma coisa esta noite?', cond: () => GAME.flags.davi2, once: true, a: async () => { await talk([['Davi', 'Às 03:44 fui ao banheiro do fundo. Tinha alguém na porta do lavatório da esquerda — de uniforme. Achei estranho e fotografei por reflexo. Velho hábito.'], ['Davi', 'Está escuro, mas… olha.']]); const html = await photoDoc(); await showDoc(html); addClue('foto'); GAME.flags.photo = true; await talk([[me, 'Uniforme da Atlântica. A alça do avental, a postura… é alguém da tripulação.'], ['Davi', 'Eu vou com você até o fim nisso. Se precisar de ajuda, eu estou aqui.']]); GAME.flags.daviAlly = true; } },
  ]));
}
async function talkMattar() {
  const M = PEOPLE.npcs.mattar;
  if (GAME.chapter !== 'marta') { await converse(M, () => talk([['', 'Sérgio Mattar dorme com a máscara de olhos e um cobertor até o peito. A respiração é lenta, regular. Talvez regular demais.']])); return; }
  await converse(M, async () => {
    if (!GAME.flags.mattarAwake) { GAME.flags.mattarAwake = true; M.base.pitch = 0; await talk([['Mattar', '(tirando a máscara) Hum? Já é o café?'], ['Marta', 'Desculpe acordá-lo, senhor Mattar. Houve uma ocorrência a bordo.']]); }
    await interview(M, [
      { q: 'O senhor conhecia Otávio Brandão, do 23C?', a: async () => { await talk([['Mattar', 'Brandão? O fiscal? Está neste voo?'], ['Mattar', '(pausa) Conheço de nome. Um homem obstinado. Ocorrência… que tipo de ocorrência?'], ['Marta', 'Ele faleceu.'], ['Mattar', 'Que tragédia. Espero que encontrem o que ele carregava antes que caia em mãos erradas.']]); addClue('mattar'); SFX.heartbeat(.4); } },
      { q: 'O senhor saiu do seu assento esta noite?', a: () => talk([['Mattar', 'Pergunte à sua colega, a Camila. Dormi desde Recife. Comprimido, máscara, tampões. Tenho sessenta e quatro anos, minha senhora.']]) },
      { q: 'O que ele carregava, senhor Mattar?', cond: () => GAME.clues.has('mattar'), once: true, a: () => talk([['Mattar', '(sorri) Força de expressão. Papéis, imagino. Fiscais vivem de papéis.'], ['Mattar', 'Agora, se me der licença. Tenho uma conexão para o Funchal e pretendo chegar descansado.']]) },
    ]);
  });
}
function checkCaptainDone() {
  if (GAME.chapter !== 'investigate' || GAME.flags.aftRinging) return;
  const c = GAME.clues; if (c.has('corpo') && c.has('livia') && (c.has('forro') || c.has('celular'))) {
    GAME.flags.aftRinging = true; setTimeout(() => { SFX.chime('hilo', WORLD.handsetAft); SFX.buzzer(); setObjective('O interfone traseiro está tocando — é o cockpit.'); }, 2500);
    GAME.ringT = setInterval(() => { if (GAME.flags.aftRinging && GAME.chapter === 'investigate') SFX.chime('hilo', WORLD.handsetAft); }, 6000);
  }
}
async function answerHelena() {
  clearInterval(GAME.ringT); GAME.flags.aftRinging = false; GAME.busy = true; cine(true); SFX.click();
  await talk([['Helena (interfone)', 'Comandante, o Centro Sal aprovou o desvio. Proa do Sal, pouso estimado em uma hora e quatro.'], ['Helena (interfone)', 'Mas tem uma linha de instabilidade bem na nossa frente. Turbulência moderada nos próximos vinte minutos. Preciso do senhor aqui.']]);
  FLT.divert = true; P.shake = .7; SFX.turbulence(3, 1);
  const M = PEOPLE.npcs.marta; GAME.camTarget = M.headWorld(); P.mode = 'talk';
  await talk([['Comandante', 'Marta. Você assume aqui atrás.'], ['Comandante', 'Pela Convenção de Tóquio, a autoridade a bordo é minha — e eu estou delegando a você. Faça as perguntas que precisar. Abra o que precisar abrir.'], ['Comandante', 'Quando tiver certeza de quem foi, me chame pelo interfone. Com provas. Ninguém mais morre neste voo.'], ['Marta', 'Sim, comandante.']]);
  GAME.busy = false; await startMarta(false);
}

// ----------------------------------------------------------------- CAPÍTULO 2 — Marta
async function startMarta(fromSave) {
  GAME.fxT.fade = 1; await wait(fromSave ? .1 : 1.6); cine(true);
  GAME.chapter = 'marta'; setChar('Marta Quintela · Chefe de cabine'); P.mode = 'cine';
  const M = PEOPLE.npcs.marta; M.setVisible(false); PEOPLE.npcs.camila.g.position.set(.35, 0, -4.25);
  P.x = .2; P.z = 28.55; P.eye = 1.6; P.yaw = 0; P.pitch = -.05; P.hasTorch = true; P.torch = false; WORLD.lights.torch.intensity = 0; P.lavOpen = GAME.flags.lavOpened; P.ckOpen = false;
  if (GAME.flags.lavOpened) { WORLD.lavDoor.rotation.y = 1.45; drawOcc(true); }
  setTension(.45); GAME.martaT = 0;
  await card('Marta Quintela', 'Chefe de cabine', '05:02 UTC · desvio para o Sal · pouso em 1 h 04 min<br>O comandante voltou ao cockpit. O assassino continua a bordo.', 6);
  GAME.fxT.fade = 0; cine(false); P.mode = 'walk'; GAME.playing = true; saveGame();
  setObjective('Descubra quem matou Otávio Brandão. Reúna provas e ligue para o cockpit pelo interfone traseiro.');
  hint('Tab: caderno de pistas · F: lanterna', 7);
}
async function examineTrolley() {
  if (GAME.flags.knifeFound) return; GAME.busy = true; const tr = WORLD.trolleys[4];
  SFX.latch(tr.getWorldPosition(V3()).add(V3(0, .5, 0))); await tweenPos(tr, tr.position.clone().add(V3(0, 0, -.45)), 1.2);
  await converse(tr.getWorldPosition(V3()).add(V3(0, .6, -.3)), async () => {
    await talk([['Marta', 'O A7. O lacre de segurança foi cortado — e esse trolley deveria estar lacrado até o café da manhã.'], ['Marta', 'Atrás das gavetas… um guardanapo da Atlântica. Pesado. Molhado.']]);
    SFX.stinger(.8); P.shake = .2; setTension(.75);
    await talk([['Marta', 'Uma faca de cerâmica. Branca. Lâmina fina, do comprimento de um dedo. Não apita no raio-X.'], ['Marta', 'Quem empurrou este trolley às 03:40 trouxe isto de volta para a galley.']]);
  });
  addClue('faca'); GAME.flags.knifeFound = true; GAME.flags.suspectDiego = true; GAME.busy = false;
  diegoLeaves();
}
async function examineCrewBag() {
  if (!GAME.flags.suspectDiego) { await converse(WORLD.crewBin, () => talk([['Marta', 'As bolsas da tripulação. Revistar um colega sem motivo… não. Preciso de alguma coisa concreta antes.']])); return; }
  if (GAME.clues.has('burner')) { hint('Você já revistou a bolsa de Diego.'); return; }
  GAME.busy = true; SFX.latch(WORLD.crewBin);
  await converse(WORLD.crewBin, () => talk([['Marta', 'A mala de bordo do Diego. Nécessaire, uniforme reserva, um livro de concurso…'], ['Marta', 'No bolso lateral, um celular velho. Sem capa, sem senha. Não é o iPhone que ele usa.']]));
  GAME.busy = true; SFX.vibrate(WORLD.crewBin); await showDoc(DOCS.burner()); addClue('burner'); GAME.busy = false; setTension(.8);
  diegoLeaves();
}
function diegoLeaves() {
  if (GAME.flags.diegoGone) return; GAME.flags.diegoGone = true; const D = PEOPLE.npcs.diego;
  setTimeout(async () => { D.setVisible(false); setObjective('Diego não está mais na galley. Ligue para o cockpit pelo interfone traseiro — agora.'); SFX.creak(V3(0, 1.5, 20)); await flicker(5); SFX.heartbeat(1); }, 3500);
}
async function accuse() {
  if (GAME.clues.size < 3) { await converse(WORLD.handsetAft, () => talk([['Marta', 'Ainda não. Se eu ligar agora, não tenho nada para dizer a ele além de medo.']])); return; }
  GAME.busy = true; SFX.click(); cine(true); P.mode = 'talk'; GAME.camTarget = WORLD.handsetAft.clone();
  await talk([['Comandante (interfone)', 'Marta. Fale.']]);
  const sus = await choose([{ t: 'Foi Diego Farias, o comissário da galley traseira.', id: 'diego' }, { t: 'Foi Lívia Coutinho, a passageira do 23A.', id: 'livia' }, { t: 'Foi o passageiro do 31F (Davi Rocha).', id: 'davi' }, { t: 'Foi Sérgio Mattar, do 4A.', id: 'mattar' }, { t: '(desligar — ainda não tenho certeza)', id: 'none' }]);
  if (sus === 'none') { await talk([['Marta', 'Nada, comandante. Ainda não.']]); return endCall(); }
  const avail = [...GAME.clues].filter(k => CLUES[k] && k !== 'diego1'); const chosen = [];
  for (let i = 0; i < 3 && avail.length; i++) { const c = await choose(avail.filter(a => !chosen.includes(a)).map(a => ({ t: CLUES[a].t, id: a })).concat(i > 0 ? [{ t: '(é o suficiente)', id: '_' }] : []), `Prova ${i + 1} de 3 — o que você apresenta ao comandante?`); if (c === '_') break; chosen.push(c); }
  const strong = chosen.filter(c => DIEGO_KEYS.includes(c)).length, hard = chosen.some(c => HARD.includes(c));
  if (sus === 'diego' && strong >= 2 && hard) { await talk([['Comandante (interfone)', '…Entendido. Diego Farias. Fique onde está, Marta — não o confronte sozinha. Vou mandar o Tiago e o Bruno com o kit de contenção.'], ['Comandante (interfone)', 'E Marta… onde ele está agora?']]); endCall(); return climax(); }
  if (sus === 'diego') { await talk([['Comandante (interfone)', 'Um tripulante? Marta, isso não basta. Não posso mandar algemar um colega por intuição.'], ['Comandante (interfone)', 'Traga algo concreto. Algo que ligue o Diego àquele lavatório.']]); return endCall(); }
  if (sus === 'mattar') { await talk([['Comandante (interfone)', 'O Mattar tem motivo, mas a Camila jura que ele não passou da cortina. Quem estava no fundo às 03:44, Marta?'], ...(GAME.clues.has('burner') ? [['Comandante (interfone)', 'Se ele mandou, alguém executou. Encontre quem.']] : [])]); return endCall(); }
  await talk([['Comandante (interfone)', sus === 'livia' ? 'A enfermeira. Certo. Vou mandar contê-la. Tomara que você esteja certa.' : 'O jornalista. Certo. Vou mandar contê-lo. Tomara que você esteja certa.']]); endCall(); return badEnding(sus);
}
function endCall() { cine(false); GAME.camTarget = null; P.mode = 'walk'; GAME.busy = false; }
async function climax() {
  GAME.chapter = 'climax'; GAME.busy = true; await wait(1.5); SFX.creak(V3(0, 2, 15)); await flicker(4); lightsDark(true); drawFAP(WORLD.fap, true); SFX.thud(V3(0, 1, 20)); setTension(1);
  await wait(.8); SFX.scream(V3(-1.3, 1.1, rowZ(23))); GAME.fxT.red = .25; P.canRun = true;
  const D = PEOPLE.npcs.diego; D.setVisible(true); D.g.position.set(-.05, 0, rowZ(23) - .45); D.g.rotation.y = Math.PI / 2 + .6; D.tracking = false; D.base.pitch = -.3;
  hint('Corra! Shift (ou botão Correr)', 6); setObjective('As luzes da cabine foram cortadas pelo FAP dianteiro. Grito na fila 23. CORRA.');
  GAME.busy = false; GAME.climaxT = 22; if (!P.torch) toggleTorch();
}
async function reachLivia() {
  GAME.chapter = 'confront'; setTimer(null); GAME.busy = true; P.mode = 'talk'; P.canRun = false; const D = PEOPLE.npcs.diego; camLookAt(D.headWorld()); cine(true); D.tracking = true; D.base.pitch = 0;
  SFX.stinger(.7);
  await talk([['', 'A lanterna encontra Diego agachado sobre a fileira 23. Uma mão sobre a boca de Lívia. Na outra, um caco branco de cerâmica.'], ['Diego', 'Para aí, Marta. Para aí.'], ['Diego', 'Ela viu. Eu só preciso de cinco minutos, depois tudo isso acaba no Sal. Ninguém mais—']]);
  const opts = [{ t: '"Acabou, Diego. O comandante já sabe de tudo."', id: 0 }]; if (GAME.clues.has('burner')) opts.unshift({ t: '"\'Metade agora, metade em Lisboa.\' O Mattar não vai te pagar a outra metade."', id: 1 }); opts.push({ t: '(apontar a lanterna direto nos olhos dele)', id: 2 });
  const c = await choose(opts);
  if (c === 1) await talk([['Diego', '…Como você—'], ['', 'Por um segundo, ele olha para a frente da cabine. Para o 4A.']]); else if (c === 2) { GAME.fx.flash = .5; await talk([['', 'Diego vira o rosto, cego pela luz.']]); } else await talk([['Diego', 'Já sabe? Então eu não tenho mais nada a perder, tenho?']]);
  SFX.thud(V3(0, 1, rowZ(23))); P.shake = 1; GAME.fx.flash = .35;
  await talk([['', GAME.flags.daviAlly ? 'Davi Rocha se joga do corredor sobre Diego. O passageiro do 16D vem logo atrás. O caco de cerâmica rola pelo carpete.' : 'O passageiro do 16D se joga sobre Diego por trás. Outros dois homens seguram seus braços. O caco de cerâmica rola pelo carpete.'], ['Marta', 'Abraçadeiras! Kit de contenção, L2! AGORA!'], ['Lívia', '(tossindo, chorando) Eu tô bem… eu tô bem…'], ['', 'No bolso da camisa de Diego, Marta encontra um pen drive preto.']]);
  lightsDark(false); drawFAP(WORLD.fap, false); setTension(.3); GAME.fxT.red = 0; return goodEnding();
}
async function goodEnding() {
  GAME.ending = true; cine(true); await fxTo('fade', 1, 2.5); try { localStorage.removeItem('voo0471'); } catch (e) { }
  SFX.chime('single');
  await say('Comandante (PA)', 'Senhoras e senhores, aqui fala o comandante. Tivemos uma ocorrência grave a bordo, que já está sob controle da tripulação.', 7, false);
  await say('Comandante (PA)', 'Estamos desviando para o Aeroporto Internacional Amílcar Cabral, na Ilha do Sal, Cabo Verde. Pouso em vinte e cinco minutos. Permaneçam sentados, com os cintos afivelados.', 8, false);
  // amanhecer na aproximação
  MAT.sky.uniforms.uDawn.value = 1; MAT.sky.uniforms.uLight.value = 2.2; WORLD.lights.hemi.color.set(0x8a6f5a); WORLD.lights.hemi.intensity = 1.2;
  P.mode = 'cine'; R.camera.position.set(1.3, 1.08, rowZ(12) - .05); R.camera.rotation.set(-.08, -1.35, 0); GAME.camTarget = null;
  fxTo('fade', 0, 4); await wait(7);
  await card('Sal, Cabo Verde · 06:11 UTC', 'Pouso', 'Diego Farias foi entregue à Polícia Judiciária cabo-verdiana na porta L1, algemado com abraçadeiras de contenção.', 7);
  await card('', '', 'Sérgio Mattar foi detido no desembarque. As mensagens do celular descartável — "metade agora, metade em Lisboa" — viraram a peça central da denúncia.', 7);
  await card('', '', 'O pen drive de Otávio Lacerda Brandão chegou às mãos da Polícia Judiciária, em Lisboa, três dias depois. A Operação Maré Alta foi a julgamento em 2027.', 7);
  await card('Final', 'Ninguém mais morreu neste voo', '', 6);
  showCredits(true);
}
async function badEnding(who) {
  GAME.ending = true; GAME.chapter = 'bad'; GAME.busy = true; P.mode = 'cine'; await wait(2); SFX.creak(V3(0, 2, 15)); await flicker(5); lightsDark(true); setTension(1);
  await wait(2.5); SFX.scream(V3(-1.3, 1.1, rowZ(23))); await wait(1.2); SFX.stinger(1); await fxTo('fade', 1, .6);
  await wait(2); lightsDark(false);
  await card('05:31 UTC', 'Silêncio no 23A', who === 'timeout' ? 'Você demorou demais. Quando as luzes voltaram, Lívia Coutinho — a única testemunha — estava morta. O pen drive nunca foi encontrado.' : `Enquanto todos olhavam para ${who === 'livia' ? 'Lívia' : 'Davi'}, as luzes da cabine se apagaram. Quando voltaram, Lívia Coutinho estava morta no 23A. O assassino continuava a bordo.`, 9);
  showRetry();
}
function showRetry() { const el = $('card'); el.className = ''; el.style.pointerEvents = 'auto'; el.innerHTML = `<div class="c2" style="animation-delay:0s">Final ruim</div><div class="c3" style="animation-delay:.3s;pointer-events:auto"><button id="btnRetry" style="font-size:18px;letter-spacing:.2em;text-transform:uppercase;color:#ddd;margin-top:18px">Tentar novamente — Ato II</button><br><button id="btnMenu" style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#888;margin-top:12px">Menu</button></div>`; $('btnRetry').onclick = () => { try { sessionStorage.setItem('voo0471_continue', '1'); } catch (e) { } location.reload(); }; $('btnMenu').onclick = () => location.reload(); if (INPUT.locked) document.exitPointerLock(); }

// ----------------------------------------------------------------- atualização do roteiro
function storyUpdate(dt) {
  if (!GAME.playing || GAME.paused) return;
  for (const t of TRIGGERS) if (!t.done && GAME.chapter === t.ch && P.z > t.z) { t.done = true; t.fn(); }
  if (GAME.chapter === 'marta' && !GAME.overlay && !GAME.busy) {
    GAME.martaT += dt;
    if (GAME.martaT > 13 * 60 && !GAME.flags.warn1) { GAME.flags.warn1 = true; flicker(3); hint('A cabine está quieta demais…', 6); setTension(.7); }
    if (GAME.martaT > 18 * 60 && !GAME.flags.timeout) { GAME.flags.timeout = true; badEnding('timeout'); }
  }
  if (GAME.chapter === 'climax' && !GAME.busy) { GAME.climaxT -= dt; setTimer(GAME.climaxT); if (Math.random() < dt * .7) SFX.heartbeat(1); if (P.z < rowZ(23) + 1.0 && P.z > rowZ(23) - 1.2) reachLivia(); else if (GAME.climaxT <= 0) { setTimer(null); badEnding('timeout'); } }
  // celular da vítima acende de tempos em tempos
  if (WORLD.phone) { const k = (GAME.t % 18) < 4 ? 1 : 0; WORLD.phoneScr.material.color.setRGB(.25 * k, .35 * k, .55 * k); WORLD.phoneLight.intensity = .35 * k; if (k && !GAME._vib && GAME.flags.lavOpened !== undefined) { GAME._vib = true; if (Math.abs(P.z - 27.5) < 6) SFX.vibrate(WORLD.phone.position); } if (!k) GAME._vib = false; }
}
