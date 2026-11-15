const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: +(process.env.W||800), height: +(process.env.H||450) } }); pg.setDefaultTimeout(120000); await pg.addInitScript(q => { try { localStorage.setItem('voo0471_opts', JSON.stringify({ q })); } catch (e) {} }, +(process.env.Q||0));
  const errs = []; pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); }); pg.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + e.stack));
  await pg.goto('file://' + process.cwd() + '/index.html?debug&norender');
  await pg.waitForFunction(() => !document.getElementById('title').classList.contains('hidden') || document.getElementById('ldtxt').textContent.startsWith('Erro'), null, { timeout: 180000 });
  const fr = await pg.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else r(n / 4); }; requestAnimationFrame(f); })); console.log('fps', fr); console.log('loaded', await pg.evaluate(() => document.getElementById('ldtxt').textContent));
  if(!process.env.NOTITLE){await pg.waitForTimeout(1500); await pg.screenshot({ path: 'tools/shots/00_title.png' });}
  const shots = JSON.parse(require('fs').readFileSync(process.argv[2]||'tools/shots.json','utf8'));
  await pg.evaluate(() => { const D = window.__DBG; D.GAME.started = true; D.GAME.playing = true; D.GAME.fx.fade = 0; D.GAME.fxT.fade = 0; document.getElementById('title').classList.add('hidden'); document.getElementById('hud').classList.remove('hidden'); });
  for (const s of shots) {
    await pg.evaluate((s) => { const D = window.__DBG; if (s.eval) eval(s.eval); D.P.mode = s.mode || 'walk'; D.P.x = s.x; D.P.z = s.z; D.P.y = s.y || 1.2; D.P.eye = s.eye || 1.7; D.P.yaw = s.yaw || 0; D.P.pitch = s.pitch || 0; D.P.torch = !!s.torch; D.WORLD.lights.torch.intensity = s.torch ? 9 : 0; }, s);
    await pg.waitForTimeout(300); await pg.evaluate(() => { const D = window.__DBG; D.renderFrame(D.GAME.t); D.renderFrame(D.GAME.t); });
    await pg.screenshot({ path: 'tools/shots/' + s.n + '.png' });
  }
  console.log(errs.slice(0, 30).join('\n'));
  await b.close();
})();
