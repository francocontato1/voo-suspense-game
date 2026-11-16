const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 480, height: 270 } }); pg.setDefaultTimeout(300000);
  await pg.addInitScript((m) => { try { localStorage.setItem('voo0471_opts', JSON.stringify({ q: 0 })); if (m) localStorage.setItem('voo0471', JSON.stringify({ ch: 'marta', clues: ['corpo','fibras','placa','livia','celular','carteira','forro'], flags: { lavOpened: true, bHands: true } })); } catch (e) {} }, !!process.env.MARTA);
  const errs = []; pg.on('console', m => { if (m.type() === 'error' || /warn/.test(m.type())) errs.push(m.type() + ': ' + m.text().slice(0, 200)); }); pg.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await pg.goto('file://' + process.cwd() + '/dist/voo0471_offline.html?debug&norender&speed=' + (process.env.SPEED || 5));
  await pg.waitForFunction(() => !document.getElementById('title').classList.contains('hidden'));
  await pg.evaluate(() => {
    const D = window.__DBG; window._picks = []; const vis = id => !document.getElementById(id).classList.contains('hidden'); const key = (code, k) => window.dispatchEvent(new KeyboardEvent('keydown', { code, key: k || code, bubbles: true }));
    setInterval(() => {
      if (D.GAME.paused) { document.getElementById('btnResume').click(); return; }
      if (vis('qte')) { key('KeyE', 'e'); return; }
      if (vis('pin')) { for (const d of '1203') window.dispatchEvent(new KeyboardEvent('keydown', { key: d, code: 'Digit' + d })); return; }
      if (vis('photo')) { D.INSP.photoFind(); return; }
      if (vis('inspect')) { D.INSP.findAll(); key('KeyE', 'e'); return; }
      if (D.UI.docOpen) { key('KeyE', 'e'); return; }
      if (!D.UI.dlg.active) return;
      const btns = [...document.querySelectorAll('#dlgChoices button')];
      if (btns.length) { let idx = -1; if (window._picks.length) { idx = btns.findIndex(b => b.textContent.includes(window._picks[0])); if (idx >= 0) window._picks.shift(); }
        if (idx < 0) idx = btns.findIndex(b => !b.classList.contains('seen') && !/Encerrar|desligar|suficiente|Afastar|devolver/.test(b.textContent));
        if (idx < 0) idx = btns.findIndex(b => /Encerrar|Afastar/.test(b.textContent)); if (idx < 0) idx = 0; window._log = (window._log || []).concat('pick:' + btns[idx].textContent.slice(1, 40)); btns[idx].click(); }
      else D.dialogAdvance();
    }, 50);
  });
  const st = () => pg.evaluate(() => ({ ch: window.__DBG.GAME.chapter, clues: [...window.__DBG.GAME.clues].join(','), obj: document.getElementById('objective').textContent.slice(0, 80) }));
  const until = async (fn, label, arg) => { const t0 = Date.now(); await pg.waitForFunction(fn, arg, { timeout: 240000, polling: 200 }); console.log('ok', label, ((Date.now() - t0) / 1000).toFixed(1) + 's', JSON.stringify(await st())); };
  const act = (re) => pg.evaluate((re) => { const D = window.__DBG; const it = D.WORLD.interact.find(i => { const l = typeof i.label === 'function' ? i.label() : i.label; return new RegExp(re).test(l) && i.enabled(); }); if (!it) return 'NOTFOUND ' + re; it.action(it); return 'ok'; }, re);
  const idle = () => until(() => { const D = window.__DBG; return !D.GAME.busy && !D.UI.dlg.active && !D.UI.docOpen && D.P.mode === 'walk' && !D.GAME.overlay; }, 'idle');
  const tp = (x, z) => pg.evaluate(([x, z]) => { const P = window.__DBG.P; P.x = x; P.z = z; }, [x, z]);
  if (process.env.MARTA) { await pg.click('#btnContinue'); await until(() => window.__DBG.GAME.chapter === 'marta' && window.__DBG.P.mode === 'walk', 'marta-cont'); console.log('corpo', await act('Examinar o corpo')); await pg.waitForTimeout(500); await idle(); await until(() => !window.__DBG.GAME.flags.padreAway && window.__DBG.GAME.flags.doorway, 'doorway'); } else {
  await pg.click('#btnStart');
  await until(() => window.__DBG.GAME.flags.callRinging, 'ringing');
  console.log(await act('Atender o interfone')); await until(() => window.__DBG.GAME.flags.called && !window.__DBG.GAME.busy, 'called');
  console.log(await act('lanterna')); console.log(await act('porta do cockpit')); await until(() => window.__DBG.GAME.chapter === 'walk' && !window.__DBG.GAME.busy, 'walk');
  for (const z of [-2, 3, 9, 13, 15.4, 16.2, 20, 26]) { await tp(0, z); await pg.waitForTimeout(2200); await idle(); }
  await until(() => window.__DBG.GAME.chapter === 'investigate', 'aft'); await idle();
  for (const re of ['Abrir o lavatório', 'Examinar o corpo', 'Abrir a lixeira', 'placa', 'Examinar o paletó', 'celular', 'bagageiro', 'Lívia', 'Diego', 'padre', 'Marta', 'FAP traseiro']) { console.log(re, await act(re)); await pg.waitForTimeout(400); await idle(); }
  await until(() => window.__DBG.GAME.flags.aftRinging, 'aftRinging');
  console.log(await act('Atender o interfone')); await until(() => window.__DBG.GAME.chapter === 'marta' && window.__DBG.P.mode === 'walk', 'marta');
  }
  console.log('escala', await act('Escala')); await idle();
  await tp(0, 24); await until(() => window.__DBG.GAME.flags.trolleyFell && window.__DBG.STORY && true, 'trolley'); await pg.waitForTimeout(4000); await idle();
  console.log('notas', await act('notas')); await idle(); console.log('diego', await act('Diego')); await idle();
  console.log('davi', await act('31F')); await idle(); console.log('davi2', await act('31F')); await idle();
  await tp(0, 4.6); await until(() => window.__DBG.GAME.clues.has('escuta'), 'escuta'); await idle();
  await until(() => window.__DBG.GAME.approachT != null, 'approach'); await tp(0, 17.7); await pg.waitForTimeout(1500); await idle();
  await until(() => window.__DBG.GAME.flags.caneDropped, 'cane'); console.log('bengala', await act('bengala')); await idle();
  console.log('mattar', await act('4A')); await idle();
  await pg.evaluate(() => { window._picks = ['padre', 'bengala esconde', 'Fibras', 'Foto ampliada']; });
  console.log('accuse', await act('ligar para o cockpit')); await until(() => window.__DBG.GAME.chapter === 'climax', 'climax');
  await until(() => !document.getElementById('credits').classList.contains('hidden'), 'credits');
  console.log((await pg.evaluate(() => (window._log || []).join(' | '))).slice(0, 1500));
  console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 25).join('\n'));
  await b.close(); process.exit(0);
})().catch(async e => { console.error('FAIL', e.message.slice(0, 300)); process.exit(1); });
