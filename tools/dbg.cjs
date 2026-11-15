const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await b.newPage({ viewport: { width: 480, height: 270 } }); pg.setDefaultTimeout(300000);
  await pg.addInitScript(() => { try { localStorage.setItem('voo0471_opts', JSON.stringify({ q: 0 })); localStorage.setItem('voo0471', JSON.stringify({ ch: 'marta', clues: ['luva','porta','escala'], flags: { lavOpened: true, suspectDiego: true } })); } catch (e) {} });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + e.stack));
  await pg.goto('file://' + process.cwd() + '/index.html?debug&norender&speed=6');
  await pg.waitForFunction(() => !document.getElementById('title').classList.contains('hidden'));
  await pg.click('#btnContinue');
  await pg.waitForFunction(() => window.__DBG.GAME.chapter === 'marta' && window.__DBG.P.mode === 'walk');
  console.log(await pg.evaluate(() => { const D = window.__DBG; const it = D.WORLD.interact.find(i => /Acordar/.test(typeof i.label === 'function' ? i.label() : i.label) && i.enabled()); it.action(it); return 'ok'; }));
  for (let k = 0; k < 12; k++) {
    await pg.waitForTimeout(1500);
    const s = await pg.evaluate(() => { const D = window.__DBG; return { busy: D.GAME.busy, dlg: D.UI.dlg.active, typing: D.UI.dlg.typing, choices: [...document.querySelectorAll('#dlgChoices button')].map(b => b.textContent), text: document.getElementById('dlgText').textContent.slice(0, 60), mode: D.P.mode }; });
    console.log(JSON.stringify(s));
    await pg.evaluate(() => { const D = window.__DBG; const btns = [...document.querySelectorAll('#dlgChoices button')]; if (btns.length) btns[btns.length - 1].click(); else D.dialogAdvance(); });
  }
  console.log(errs.join('\n')); await b.close();
})();
