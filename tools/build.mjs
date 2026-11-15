// Build: concatena src/js/*.js + CSS + HTML e embute three.js e todos os assets em base64
// gerando um único arquivo HTML autocontido (dist/index.html e index.html na raiz).
import fs from 'fs'; import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rd = p => fs.readFileSync(path.join(root, p));
let three = rd('tools/three.min.js').toString();
three = three.replace(/console\.warn\("Scripts "build\/three\.js" and "build\/three\.min\.js" are deprecated[^)]*\);?/, '');
const assets = {};
for (const f of fs.readdirSync(path.join(root, 'assets'))) {
  const ext = path.extname(f).slice(1); const key = path.basename(f, '.' + ext);
  if (ext === 'txt') continue;
  const b64 = rd('assets/' + f).toString('base64');
  assets[key] = ext === 'bin' ? b64 : `data:image/${ext === 'png' ? 'png' : 'jpeg'};base64,${b64}`;
}
const js = fs.readdirSync(path.join(root, 'src/js')).filter(f => f.endsWith('.js')).sort()
  .map(f => `// ==== ${f} ====\n` + rd('src/js/' + f).toString()).join('\n');
const css = rd('src/style.css').toString();
let html = rd('src/template.html').toString();
html = html.replace('/*CSS*/', () => css)
  .replace('/*THREE*/', () => three)
  .replace('/*ASSETS*/', () => 'window.__ASSETS=' + JSON.stringify(assets) + ';')
  .replace('/*GAME*/', () => '(function(){"use strict";\n' + js + '\n})();');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('built', (html.length / 1024 / 1024).toFixed(2) + ' MB');
// variante para publicação como Artifact (sem doctype/html/head/body; o host injeta o esqueleto)
let art = html.replace(/<!doctype html>\s*/i, '').replace(/<html[^>]*>\s*/i, '').replace(/<\/html>\s*$/i, '')
  .replace(/<head>\s*/i, '').replace(/<\/head>\s*/i, '').replace(/<body>\s*/i, '').replace(/<\/body>\s*/i, '')
  .replace(/<meta charset="utf-8">\s*/i, '').replace(/<meta name="viewport"[^>]*>\s*/i, '');
art = art.replace('<style>', '<style>:root{color-scheme:dark;background:#000}');
fs.writeFileSync(path.join(root, 'dist/artifact.html'), art);
