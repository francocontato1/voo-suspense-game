// Converte módulos ES do three.js (GLTFLoader, SkeletonUtils, BufferGeometryUtils) em script clássico
import fs from 'fs';
const conv = (src, name, ret, extra = '') => {
  let s = fs.readFileSync(src, 'utf8');
  s = s.replace(/import\s*\{([^}]*)\}\s*from\s*'three';/g, (m, n) => `const {${n}} = THREE;`);
  s = s.replace(/import\s*\{([^}]*)\}\s*from\s*'[^']*BufferGeometryUtils\.js';/g, (m, n) => `const {${n}} = BGU;`);
  s = s.replace(/^export\s*\{[^}]*\};?/gm, '').replace(/^export\s+(function|class|const)/gm, '$1');
  return `const ${name} = (function(){\n${extra}${s}\nreturn ${ret};\n})();\n`;
};
let out = '/* three.js r160 examples (MIT): BufferGeometryUtils, GLTFLoader, SkeletonUtils — convertidos para script clássico */\n';
out += conv('tools/BufferGeometryUtils.js', 'BGU', '{ toTrianglesDrawMode, mergeGeometries }');
out += conv('tools/GLTFLoader.js', 'GLTFLoaderLib', '{ GLTFLoader }');
out += conv('tools/SkeletonUtils.js', 'SkeletonUtils', '{ clone, retarget }');
out += 'window.GLTFLoader = GLTFLoaderLib.GLTFLoader; window.SkeletonUtils = SkeletonUtils;\n';
out += fs.readFileSync('node_modules/meshoptimizer/meshopt_decoder.cjs', 'utf8');
fs.writeFileSync('tools/vendor.js', out); console.log('vendor', out.length);
