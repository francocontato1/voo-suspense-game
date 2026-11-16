// ---------------------------------------------------------------------------
// Interface: legendas, diálogos com escolhas, documentos, caderno, cartelas
// ---------------------------------------------------------------------------
const $ = id => document.getElementById(id);
const UI = { dlg: { active: false }, docOpen: false, nbOpen: false };
const GAME = { clockBase: 278, clockStr: '04:38', t: 0, started: false, playing: false, paused: false, overlay: false, busy: false, flags: {}, clues: new Set(), timers: [], fx: { fade: 1, lb: 0, focus: 0, desat: 0, red: 0, flash: 0, exposure: 1, blur: 0 }, fxT: {} };
UI.setPrompt = (txt) => { const p = $('prompt'); if (p._t !== txt) { p._t = txt; p.innerHTML = txt ? `<b>${IS_TOUCH ? 'E' : 'E'}</b>${txt}` : ''; $('xhair').classList.toggle('on', !!txt); } };
function setObjective(txt) { const o = $('objective'); o.style.opacity = 0; setTimeout(() => { o.textContent = txt; o.style.opacity = 1; }, 400); }
function setChar(txt) { $('charname').textContent = txt; }
let hintTO; function hint(txt, sec = 4) { const h = $('hint'); h.textContent = txt; clearTimeout(hintTO); hintTO = setTimeout(() => h.textContent = '', sec * 1000); }
function cine(on) { document.body.classList.toggle('cine', on); GAME.fxT.lb = on ? 1 : 0; }
function wait(s) { return new Promise(r => GAME.timers.push({ t: GAME.t + s, r })); }
function fxTo(k, v, sec) { const from = GAME.fx[k]; const t0 = GAME.t; return new Promise(res => { GAME.tweens = GAME.tweens || []; GAME.tweens.push({ k, from, v, t0, sec: Math.max(.001, sec), res }); }); }
// ---- legendas
let subTO; function sub(speaker, text, sec) { const s = $('subs'); s.innerHTML = text ? `<div class="ln">${speaker ? `<span class="sp">${speaker}</span>` : ''}${text}</div>` : ''; clearTimeout(subTO); if (text && sec) subTO = setTimeout(() => s.innerHTML = '', sec * 1000); }
async function say(speaker, text, sec, pos) { const d = sec || clamp(1.6 + text.length * .055, 2.4, 9); if (speaker && pos !== false) SFX.murmur(pos || null, Math.min(d * .7, 3)); UI.onLine && UI.onLine(speaker, text, d); sub(speaker, text, d); await wait(d + .25); }
// ---- diálogo
function dialogShow(name, text) {
  const D = UI.dlg; D.active = true; $('dialog').classList.remove('hidden'); $('dlgName').textContent = name || ''; $('dlgChoices').innerHTML = ''; D.full = text; D.shown = 0; D.typing = true; D.choices = null; $('dlgText').textContent = '';
}
function line(name, text, opts = {}) {
  return new Promise(res => {
    dialogShow(name, text); UI.dlg.resolve = res; UI.dlg.needConfirm = true; UI.onLine && UI.onLine(name, text, clamp(text.length * .05, 1, 6)); if (name && opts.voice !== false) SFX.murmur(opts.pos || null, Math.min(2.6, text.length * .04));
    UI.dlg.auto = opts.auto;
  });
}
function choose(list, prompt) {
  return new Promise(res => {
    const D = UI.dlg; D.active = true; $('dialog').classList.remove('hidden'); if (prompt !== undefined) { $('dlgName').textContent = ''; $('dlgText').textContent = prompt; }
    D.typing = false; D.choices = list; D.sel = 0; const box = $('dlgChoices'); box.innerHTML = '';
    list.forEach((c, i) => { const b = document.createElement('button'); b.innerHTML = `<i>${i + 1}</i>${c.t}`; if (c.seen) b.classList.add('seen'); b.onclick = () => pickChoice(i); b.onmouseenter = () => { D.sel = i; markSel(); }; box.appendChild(b); });
    markSel(); D.resolve = res; D.needConfirm = false;
    INPUT.selAcc = 0;
  });
}
function markSel() { [...$('dlgChoices').children].forEach((b, i) => b.classList.toggle('sel', i === UI.dlg.sel)); }
function pickChoice(i) { const D = UI.dlg; if (!D.choices) return; const c = D.choices[i]; D.choices = null; $('dlgChoices').innerHTML = ''; dialogEnd(); GAME.overlay = false; relock(); D.resolve(c.id !== undefined ? c.id : i); }
function relock() { if (!IS_TOUCH && !INPUT.lockFailed && GAME.playing && !INPUT.locked) { try { const p = R.renderer.domElement.requestPointerLock(); if (p && p.catch) p.catch(() => { $('clickToPlay').classList.remove('hidden'); }); } catch (e) { } } }
function dialogEnd() { UI.dlg.active = false; $('dialog').classList.add('hidden'); }
function dialogAdvance() {
  const D = UI.dlg; if (D.choices) { pickChoice(D.sel); return; }
  if (D.typing) { D.shown = D.full.length; D.typing = false; $('dlgText').textContent = D.full; return; }
  if (D.needConfirm) { dialogEnd(); const r = D.resolve; D.resolve = null; r && r(); }
}
function dialogKey(e) {
  const D = UI.dlg; if (D.choices) { const n = parseInt(e.key); if (n >= 1 && n <= D.choices.length) { pickChoice(n - 1); return; } if (e.code === 'ArrowDown' || e.code === 'KeyS') { D.sel = (D.sel + 1) % D.choices.length; markSel(); } if (e.code === 'ArrowUp' || e.code === 'KeyW') { D.sel = (D.sel - 1 + D.choices.length) % D.choices.length; markSel(); } if (e.code === 'Enter' || e.code === 'KeyE' || e.code === 'Space') pickChoice(D.sel); return; }
  if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') dialogAdvance();
}
document.addEventListener('click', e => { if (UI.dlg.active && !UI.dlg.choices && e.target.closest && !e.target.closest('#dlgChoices')) dialogAdvance(); });
function updateDialog(dt) {
  const D = UI.dlg; if (!D.active || !D.typing) return; D.shown += dt * 52; const n = Math.floor(D.shown); $('dlgText').textContent = D.full.slice(0, n);
  if (n >= D.full.length) { D.typing = false; if (D.auto) { const r = D.resolve; setTimeout(() => { if (UI.dlg.resolve === r) { dialogEnd(); D.resolve = null; r(); } }, D.auto * 1000); } }
}
// sequência de falas
async function talk(lines) { for (const l of lines) { if (typeof l === 'function') { await l(); continue; } await line(l[0], l[1], l[2] || {}); } }
// ---- documentos
function showDoc(html) { return new Promise(res => { UI.docOpen = true; GAME.overlay = true; $('docInner').innerHTML = html; $('doc').classList.remove('hidden'); UI.docRes = res; if (INPUT.locked) document.exitPointerLock(); }); }
function closeDoc() { UI.docOpen = false; $('doc').classList.add('hidden'); GAME.overlay = UI.dlg.active && UI.dlg.choices ? true : false; relock(); const r = UI.docRes; UI.docRes = null; r && r(); }
$('doc').addEventListener('click', e => { if (e.target.id === 'doc' || e.target.classList.contains('doc-close')) closeDoc(); });
// ---- caderno
function toggleNotebook() {
  if (!GAME.playing || UI.docOpen) return; if (UI.dlg.active && !UI.nbOpen) return;
  UI.nbOpen = !UI.nbOpen; $('notebook').classList.toggle('hidden', !UI.nbOpen); GAME.overlay = UI.nbOpen;
  if (UI.nbOpen) { renderNotebook(); if (INPUT.locked) document.exitPointerLock(); } else relock();
}
$('nbClose').onclick = () => toggleNotebook();
function renderNotebook() {
  const cl = [...GAME.clues].map(id => CLUES[id]).filter(Boolean);
  $('nbClues').innerHTML = `<h4>PISTAS (${cl.length})</h4>` + (cl.length ? cl.map(c => `<div class="clue ${c.key ? 'key' : ''}"><b>${c.t}</b><br>${c.d}</div>`).join('') : '<div class="clue">Nenhuma pista registrada.</div>');
  $('nbPeople').innerHTML = '<h4>PESSOAS DE INTERESSE</h4>' + PEOPLE_INFO.filter(p => !p.hide || GAME.flags[p.hide]).map(p => `<div class="person"><b>${p.n}</b> — ${p.s}<br>${p.d}${p.note && GAME.flags[p.note[0]] ? '<br><i>' + p.note[1] + '</i>' : ''}</div>`).join('') + `<h4 style="margin-top:16px">CRONOLOGIA (UTC)</h4><div class="person" style="font-size:11px;line-height:1.7">02:05 Decolagem de Recife (SBRF)<br>03:00 Fim do serviço de bordo, luzes reduzidas<br>${GAME.flags.livia1 ? '03:41 Otávio vai ao lavatório traseiro esquerdo (Lívia)<br>' : ''}${GAME.flags.photo ? '03:44 Foto de Davi: figura de uniforme na porta do lavatório<br>' : ''}${GAME.flags.padre1 ? '03:50 Padre vê um tripulante saindo da área traseira<br>' : ''}04:20 Lavatório ocupado há muito tempo (padre avisa)<br>04:31 Marta destrava a porta e encontra o corpo<br>04:38 Comandante é chamado</div>`;
}
function addClue(id, quiet) { if (GAME.clues.has(id)) return false; GAME.clues.add(id); if (!quiet) { hint('Pista registrada no caderno: ' + CLUES[id].t, 5); SFX.click(); } saveGame(); return true; }
// ---- cartela de título
async function card(c1, c2, c3, sec = 5) { const el = $('card'); el.className = ''; el.innerHTML = `<div class="c1">${c1 || ''}</div>${c2 ? `<div class="c2">${c2}</div>` : ''}${c3 ? `<div class="c3">${c3}</div>` : ''}`; await wait(sec); el.classList.add('out'); await wait(1.3); el.className = 'hidden'; }
function showPause(on) { GAME.paused = on; $('pause').classList.toggle('hidden', !on); if (AU.ctx) on ? AU.ctx.suspend() : AU.ctx.resume(); if (!on) relock(); }
$('btnResume').onclick = () => showPause(false);
$('btnQuit').onclick = () => location.reload();
function setTimer(sec) { const el = $('timer'); if (sec === null) { el.classList.add('hidden'); return; } el.classList.remove('hidden'); el.textContent = `00:${fmt2(Math.max(0, Math.ceil(sec)))}`; }
function saveGame() { try { if (GAME.chapter === 'marta' || GAME.chapter === 'accuse') localStorage.setItem('voo0471', JSON.stringify({ ch: 'marta', clues: [...GAME.clues], flags: GAME.flags })); } catch (e) { } }
function loadSave() { try { return JSON.parse(localStorage.getItem('voo0471')); } catch (e) { return null; } }
