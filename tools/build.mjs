// Build: concatena src/js/*.js + CSS + HTML, embute three.js + GLTFLoader/meshopt e assets.
//  - index.html ................ versão web (modelos 3D e música carregados de assets3d/)
//  - dist/voo0471_offline.html  versão offline: um único arquivo com tudo embutido
//  - dist/web/ ................. pasta pronta para publicar (index.html + assets3d/)
import fs from 'fs'; import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rd = p => fs.readFileSync(path.join(root, p));
let three = rd('tools/three.min.js').toString();
three = three.replace(/console\.warn\("Scripts "build\/three\.js" and "build\/three\.min\.js" are deprecated[^)]*\);?/, '');
three += '\n' + rd('tools/vendor.js').toString();
const small = {};
for (const f of fs.readdirSync(path.join(root, 'assets'))) {
  const ext = path.extname(f).slice(1); const key = path.basename(f, '.' + ext); if (ext === 'txt') continue;
  small[key] = `data:image/${ext === 'png' ? 'png' : 'jpeg'};base64,${rd('assets/' + f).toString('base64')}`;
}
const big = {}; for (const f of fs.readdirSync(path.join(root, 'assets3d'))) big[f] = rd('assets3d/' + f).toString('base64');
const js = fs.readdirSync(path.join(root, 'src/js')).filter(f => f.endsWith('.js')).sort().map(f => `// ==== ${f} ====\n` + rd('src/js/' + f).toString()).join('\n');
const tpl = rd('src/template.html').toString().replace('/*CSS*/', () => rd('src/style.css').toString()).replace('/*THREE*/', () => three).replace('/*GAME*/', () => '(function(){"use strict";\n' + js + '\n})();');
const manifest = fs.readdirSync(path.join(root, 'assets3d'));
const make = (assets) => tpl.replace('/*ASSETS*/', () => 'window.__MANIFEST=' + JSON.stringify(manifest) + ';window.__ASSETS=' + JSON.stringify(assets) + ';');
const web = make(small), off = make(Object.assign({}, small, big));
fs.mkdirSync(path.join(root, 'dist/web/assets3d'), { recursive: true });
fs.writeFileSync(path.join(root, 'index.html'), web);
fs.writeFileSync(path.join(root, 'dist/voo0471_offline.html'), off);
fs.writeFileSync(path.join(root, 'dist/web/index.html'), web);
for (const f of fs.readdirSync(path.join(root, 'dist/web/assets3d'))) fs.unlinkSync(path.join(root, 'dist/web/assets3d', f));
for (const f of fs.readdirSync(path.join(root, 'assets3d'))) { if (f.endsWith('.glb')) fs.writeFileSync(path.join(root, 'dist/web/assets3d', f + '.json'), JSON.stringify(big[f])); else fs.copyFileSync(path.join(root, 'assets3d', f), path.join(root, 'dist/web/assets3d', f)); }
// GitHub Pages: o index.html da raiz usa a mesma pasta
fs.mkdirSync(path.join(root, 'web_assets_note'), { recursive: true }); fs.rmSync(path.join(root, 'web_assets_note'), { recursive: true });
// variante para Artifact (o host injeta doctype/head/body)
let art = web.replace(/<!doctype html>\s*/i, '').replace(/<html[^>]*>\s*/i, '').replace(/<\/html>\s*$/i, '').replace(/<head>\s*/i, '').replace(/<\/head>\s*/i, '').replace(/<body>\s*/i, '').replace(/<\/body>\s*/i, '')
  .replace(/<meta charset="utf-8">\s*/i, '').replace(/<meta name="viewport"[^>]*>\s*/i, '').replace('<style>', '<style>:root{color-scheme:dark;background:#000}');
fs.writeFileSync(path.join(root, 'dist/web/artifact.html'), art);
console.log('built web', (web.length / 1048576).toFixed(2) + ' MB + assets3d', 'offline', (off.length / 1048576).toFixed(2) + ' MB');
