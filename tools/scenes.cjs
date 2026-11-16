// captura cenas-chave renderizando sob demanda (sem GPU)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }); pg.setDefaultTimeout(600000);
  await pg.addInitScript(() => { try { localStorage.setItem('voo0471_opts', JSON.stringify({ q: 1 })); localStorage.setItem('voo0471', JSON.stringify({ ch: 'marta', clues: ['corpo','fibras','placa','livia','celular','bengala','fotoZoom','escuta'], flags: { lavOpened: true } })); } catch (e) {} });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + process.cwd() + '/dist/voo0471_offline.html?debug&norender');
  await pg.waitForFunction(() => !document.getElementById('title').classList.contains('hidden'));
  await pg.click('#btnContinue'); await pg.evaluate(() => setInterval(() => { if (window.__DBG.GAME.paused) document.getElementById('btnResume').click(); }, 100));
  await pg.waitForFunction(() => window.__DBG.GAME.chapter === 'marta' && window.__DBG.P.mode === 'walk');
  const snap = async (n) => { await pg.evaluate(() => { const D = window.__DBG; D.renderFrame(D.GAME.t); D.renderFrame(D.GAME.t); }); await pg.screenshot({ path: 'tools/shots/' + n + '.png' }); console.log('shot', n); };
  const waitText = (t) => pg.waitForFunction(t => (document.getElementById('dlgText').textContent + document.getElementById('subs').textContent).includes(t), t, { polling: 100 });
  const adv = () => pg.evaluate(() => { const D = window.__DBG; if (D.UI.dlg.active && !document.querySelector('#dlgChoices button')) D.dialogAdvance(); });
  /* padre
  await pg.evaluate(() => { const D = window.__DBG; D.P.x = 0; D.P.z = 14.2; D.P.yaw = -2.5; });
  await pg.evaluate(() => { const D = window.__DBG; const it = D.WORLD.interact.find(i => /padre/.test(typeof i.label === 'function' ? i.label() : i.label)); it.action(it); });
  await pg.waitForFunction(() => document.querySelector('#dlgChoices button')); await pg.waitForTimeout(1500); await snap('s2_padre');
  await pg.evaluate(() => [...document.querySelectorAll('#dlgChoices button')].pop().click()); await pg.waitForFunction(() => !window.__DBG.GAME.busy);
  */
  // clímax
  await pg.evaluate(() => { window.__DBG.STORY.climax(); });
  await waitText('Ninguém se mexe'); await pg.waitForTimeout(800); await snap('s3_climax_wide'); await adv();
  await waitText('Eu abro essa porta'); await pg.waitForTimeout(800); await snap('s4_padre_close'); await adv();
  await waitText('Por favor'); await pg.waitForTimeout(800); await snap('s5_livia_close'); await adv();
  await pg.waitForFunction(() => document.querySelector('#dlgChoices button')); await pg.evaluate(() => document.querySelector('#dlgChoices button').click());
  for (let i = 0; i < 80; i++) { await pg.waitForTimeout(250); if (await pg.evaluate(() => !document.getElementById('qte').classList.contains('hidden'))) break; await adv(); } for (let i = 0; i < 9; i++) { await pg.keyboard.press('KeyE'); await pg.waitForTimeout(40); }
  await pg.waitForTimeout(700); await snap('s7_halon');
  for (let i = 0; i < 60; i++) { await pg.waitForTimeout(250); if (await pg.evaluate(() => document.getElementById('dlgText').textContent.includes('Abraçadeiras'))) break; await adv(); } await pg.waitForTimeout(600); await snap('s8_tackle');
  console.log('errors', errs.join(' | ')); await b.close(); process.exit(0);
})().catch(e => { console.error('FAIL', e.message.slice(0, 300)); process.exit(1); });
