const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await b.newPage({ viewport: { width: 480, height: 270 } }); pg.setDefaultTimeout(300000);
  await pg.addInitScript((m) => { try { localStorage.setItem('voo0471_opts', JSON.stringify({ q: 0 })); if (m) localStorage.setItem('voo0471', JSON.stringify({ ch: 'marta', clues: ['luva','porta','corpo','livia','ronda','padre','celular'], flags: { lavOpened: true, suspectDiego: true, ronda: true } })); } catch (e) {} }, !!process.env.MARTA);
  const errs = []; pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); }); pg.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
  await pg.goto('file://' + process.cwd() + '/index.html?debug&norender&speed=6');
  await pg.waitForFunction(() => !document.getElementById('title').classList.contains('hidden'));
  await pg.evaluate(() => {
    const D = window.__DBG; window._picks = [];
    setInterval(() => {
      if (D.GAME.paused) { document.getElementById('btnResume').click(); window._log = (window._log||[]).concat('UNPAUSE'); return; }
      if (D.UI.docOpen) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', key: 'e' })); return; }
      if (!D.UI.dlg.active) return;
      const btns = [...document.querySelectorAll('#dlgChoices button')];
      if (btns.length) {
        let idx = -1; if (window._picks.length) { const want = window._picks[0]; idx = btns.findIndex(b => b.textContent.includes(want)); if (idx >= 0) window._picks.shift(); }
        if (idx < 0) idx = btns.findIndex(b => !b.classList.contains('seen') && !b.textContent.includes('Encerrar') && !b.textContent.includes('desligar') && !b.textContent.includes('suficiente'));
        if (idx < 0) idx = btns.length - 1; window._log = (window._log || []).concat('pick:' + btns[idx].textContent.slice(1, 50)); btns[idx].click();
      } else D.dialogAdvance();
    }, 60);
  });
  const st = () => pg.evaluate(() => ({ ch: window.__DBG.GAME.chapter, clues: [...window.__DBG.GAME.clues], obj: document.getElementById('objective').textContent }));
  const until = async (fn, label) => { const t0 = Date.now(); await pg.waitForFunction(fn, null, { timeout: 240000, polling: 200 }); console.log('ok', label, ((Date.now() - t0) / 1000).toFixed(1) + 's', JSON.stringify(await st()).slice(0, 220)); };
  const act = (re) => pg.evaluate((re) => { const D = window.__DBG; const it = D.WORLD.interact.find(i => { const l = typeof i.label === 'function' ? i.label() : i.label; return new RegExp(re).test(l) && i.enabled(); }); if (!it) return 'NOTFOUND ' + re; it.action(it); return 'ok'; }, re);
  const idle = () => until(() => !window.__DBG.GAME.busy && !window.__DBG.UI.dlg.active && !window.__DBG.UI.docOpen && window.__DBG.P.mode !== 'talk', 'idle');
  if (process.env.MARTA) { await pg.click('#btnContinue'); await until(() => window.__DBG.GAME.chapter === 'marta' && window.__DBG.P.mode === 'walk', 'marta-cont'); } else {
  await pg.click('#btnStart');
  await until(() => window.__DBG.GAME.flags.callRinging, 'ringing');
  console.log(await act('interfone')); await until(() => window.__DBG.GAME.flags.called && !window.__DBG.GAME.busy, 'called');
  console.log(await act('lanterna'));
  console.log(await act('porta do cockpit')); await until(() => window.__DBG.GAME.chapter === 'walk' && !window.__DBG.GAME.busy, 'walk');
  for (const z of [-2, 3, 9, 15, 18, 26]) { await pg.evaluate(z => { const P = window.__DBG.P; P.x = 0; P.z = z; }, z); await pg.waitForTimeout(z === 26 ? 500 : 2500); }
  await until(() => window.__DBG.GAME.chapter === 'investigate', 'aft'); await idle();
  for (const re of ['Abrir o lavatório', 'Examinar o corpo', 'Abrir a lixeira', 'celular', 'trava', 'Examinar o assento', 'bagageiro', 'Lívia', 'Diego', 'padre', 'Marta']) { console.log(re, await act(re)); await pg.waitForTimeout(300); await idle(); }
  await until(() => window.__DBG.GAME.flags.aftRinging, 'aftRinging');
  console.log(await act('Atender o interfone')); await until(() => window.__DBG.GAME.chapter === 'marta' && window.__DBG.P.mode === 'walk', 'marta');
  }
  setInterval(async () => { try { const s = await pg.evaluate(() => { const D = window.__DBG; return { busy: D.GAME.busy, dlg: D.UI.dlg.active, mode: D.P.mode, doc: D.UI.docOpen, txt: document.getElementById('dlgText').textContent.slice(0, 50), ch: [...document.querySelectorAll('#dlgChoices button')].length, mt: D.GAME.martaT|0, paused: D.GAME.paused, locked: document.pointerLockElement ? 1 : 0, pause: !document.getElementById('pause').classList.contains('hidden') }; }); console.log('STATE', JSON.stringify(s)); } catch (e) {} }, 15000);
  for (const re of ['31F', 'Acordar', 'trolley A7', 'Compartimento', 'Escala', 'Diego']) { console.log(re, await act(re)); await pg.waitForTimeout(300); await idle(); }
  await pg.evaluate(() => { window._picks = ['Diego Farias', 'Faca de cerâmica', 'Celular descartável', 'Fragmento de luva']; });
  console.log(await act('ligar para o cockpit')); await until(() => window.__DBG.GAME.chapter === 'climax' && !window.__DBG.GAME.busy, 'climax');
  await pg.evaluate(() => { const D = window.__DBG; D.P.x = 0; D.P.z = D.rowZ(23) + .3; });
  await until(() => !document.getElementById('credits').classList.contains('hidden'), 'credits');
  console.log((await pg.evaluate(() => window._log)).join(' | ').slice(0, 3000));
  console.log('ERRORS:\n' + errs.join('\n'));
  await b.close(); process.exit(0);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
