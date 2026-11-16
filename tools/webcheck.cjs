const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const pg = await b.newPage({ viewport: { width: 480, height: 270 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('http://localhost:8765/index.html'); await pg.waitForFunction(() => !document.getElementById('title').classList.contains('hidden') || /Erro/.test(document.getElementById('ldtxt').textContent), null, { timeout: 280000 });
  console.log('state', await pg.evaluate(() => document.getElementById('ldtxt').textContent), 'errors:', errs.join(' | ')); await b.close(); })();
