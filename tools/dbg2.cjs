const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await b.newPage({ viewport: { width: 480, height: 270 } }); pg.setDefaultTimeout(300000);
  await pg.addInitScript(() => { localStorage.setItem('voo0471_opts', JSON.stringify({ q: 0 })); localStorage.setItem('voo0471', JSON.stringify({ ch: 'marta', clues: ['corpo'], flags: { lavOpened: true } })); });
  const errs = []; pg.on('pageerror', e => errs.push(e.message + ' ' + (e.stack||'').split('\n')[1]));
  await pg.goto('file://' + process.cwd() + '/dist/voo0471_offline.html?debug&norender');
  await pg.waitForFunction(() => !document.getElementById('title').classList.contains('hidden'));
  await pg.click('#btnContinue'); await pg.evaluate(() => setInterval(() => { if (window.__DBG.GAME.paused) document.getElementById('btnResume').click(); }, 100));
  await pg.waitForFunction(() => window.__DBG.GAME.chapter === 'marta' && window.__DBG.P.mode === 'walk');
  await pg.evaluate(() => { const D = window.__DBG; D.P.x = 0; D.P.z = 14.2; D.P.yaw = -2.5; const it = D.WORLD.interact.find(i => /padre/.test(typeof i.label === 'function' ? i.label() : i.label)); window._r = it ? 'found' : 'none'; it && it.action(it); });
  for (let i = 0; i < 8; i++) { await pg.waitForTimeout(1500); console.log(JSON.stringify(await pg.evaluate(() => { const D = window.__DBG; return { r: window._r, busy: D.GAME.busy, mode: D.P.mode, dlg: D.UI.dlg.active, ch: document.querySelectorAll('#dlgChoices button').length, paused: D.GAME.paused, anims: D.GAME.anims.length, timers: D.GAME.timers.length, t: D.GAME.t.toFixed(1) }; }))); }
  console.log(errs.join('\n')); await b.close();
})();
