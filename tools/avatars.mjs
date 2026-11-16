// Converte avatares Microsoft Rocketbox (FBX, MIT) em .glb compactos para o jogo:
// FBX2glTF -> remove cores de vértice -> texturas WebP redimensionadas -> gltfpack (meshopt)
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const S = process.env.S; const RB = S + '/dl/rb/Assets'; const OUT = process.argv[2]; const TMP = S + '/convtmp';
const F2G = S + '/tools/node_modules/fbx2gltf/bin/Linux/FBX2glTF', GP = S + '/tools/node_modules/.bin/gltfpack';
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(TMP, { recursive: true });
const AV = JSON.parse(process.argv[3]); const ANIMS = JSON.parse(process.argv[4] || '[]');
const readGlb = f => { const b = fs.readFileSync(f); const jl = b.readUInt32LE(12); const j = JSON.parse(b.slice(20, 20 + jl)); const bo = 20 + jl; const bl = b.readUInt32LE(bo); return { j, bin: b.slice(bo + 8, bo + 8 + bl) }; };
function webp(src, dst, size, q = 78, alpha = false, dark = false) { if (dark) { execFileSync('convert', [src, '-resize', `${size}x${size}`, dst + '.png']); execFileSync('python3', [path.dirname(new URL(import.meta.url).pathname) + '/darken.py', dst + '.png', dst + '.png']); src = dst + '.png'; } execFileSync('convert', [src, '-resize', `${size}x${size}`, ...(alpha ? [] : ['-alpha', 'off']), '-quality', String(q), '-define', 'webp:method=6', dst]); }
for (const [key, rel, tier] of AV) {
  const dir = `${RB}/Avatars/${rel}`; const name = path.basename(rel); const fbx = `${dir}/Export/${name}_facial.fbx`;
  const raw = `${TMP}/${key}`; execFileSync(F2G, ['--binary', '--input', fbx, '--output', raw], { stdio: 'ignore' });
  const { j, bin } = readGlb(raw + '.glb'); const work = `${TMP}/${key}_w`; fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work);
  fs.writeFileSync(`${work}/m.bin`, bin); j.buffers = [{ uri: 'm.bin', byteLength: bin.length }];
  const KEEP = ['AA_VI_00_Sil', 'AA_VI_01_PP', 'AA_VI_02_FF', 'AA_VI_06_CH', 'AA_VI_07_SS', 'AA_VI_10_aa', 'AA_VI_11_E', 'AA_VI_12_I', 'AA_VI_13_O', 'AA_VI_14_U',
    'AK_01_BrowDownLeft', 'AK_02_BrowDownRight', 'AK_03_BrowInnerUp', 'AK_04_BrowOuterUpLeft', 'AK_05_BrowOuterUpRight', 'AK_07_CheekSquintLeft', 'AK_08_CheekSquintRight',
    'AK_09_EyeBlinkLeft', 'AK_10_EyeBlinkRight', 'AK_19_EyeSquintLeft', 'AK_20_EyeSquintRight', 'AK_21_EyeWideLeft', 'AK_22_EyeWideRight', 'AK_25_JawOpen',
    'AK_30_MouthFrownLeft', 'AK_31_MouthFrownRight', 'AK_36_MouthPressLeft', 'AK_37_MouthPressRight', 'AK_38_MouthPucker', 'AK_44_MouthSmileLeft', 'AK_45_MouthSmileRight',
    'AK_46_MouthStretchLeft', 'AK_47_MouthStretchRight', 'AK_48_MouthUpperUpLeft', 'AK_49_MouthUpperUpRight', 'AK_50_NoseSneerLeft', 'AK_51_NoseSneerRight', 'AK_34_MouthLowerDownLeft', 'AK_35_MouthLowerDownRight', 'AU_41_LidDroop'];
  for (const m of j.meshes) {
    let names = null;
    for (const p of m.primitives) {
      delete p.attributes.COLOR_0;
      if (!p.targets) continue;
      const all = p.targets.map(t => (j.accessors[t.POSITION].name || '').replace('blendShape1.', ''));
      const keep = tier === 'key' ? KEEP : ['AK_09_EyeBlinkLeft', 'AK_10_EyeBlinkRight', 'AK_25_JawOpen'];
      const idx = keep.map(k => all.indexOf(k)).filter(i => i >= 0); names = idx.map(i => all[i].replace(/^(AA_VI_\d\d_|AK_\d\d_|AU_\d\d_)/, ''));
      p.targets = idx.map(i => ({ POSITION: p.targets[i].POSITION }));
    }
    if (!names) delete m.weights; else { m.weights = names.map(() => 0); m.extras = { targetNames: names }; }
  }
  const tex = fs.readdirSync(`${dir}/Textures`); const find = s => tex.find(t => t.endsWith(s)); const T = f => `${dir}/Textures/${f}`;
  const big = tier === 'key' ? 1024 : 512; j.images = []; j.textures = []; j.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
  const addTex = (file, size, alpha, q) => { const out = `${path.basename(file, '.tga')}.webp`; webp(T(file), `${work}/${out}`, size, q, alpha, key === 'padre' && /body_color/.test(file)); j.images.push({ uri: out, mimeType: 'image/webp' }); j.textures.push({ sampler: 0, source: j.images.length - 1 }); return j.textures.length - 1; };
  for (const m of j.materials) {
    delete m.extras; const suf = m.name.split('_').pop(); const alpha = suf === 'opacity';
    const pbr = m.pbrMetallicRoughness = { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: suf === 'head' ? .55 : .8 };
    const col = find(`_${suf}_color.tga`) || find('_head_color.tga');
    pbr.baseColorTexture = { index: addTex(col, alpha ? (tier === 'key' ? 512 : 256) : (suf === 'body' || suf === 'head' ? big : big / 2), alpha, alpha ? 82 : (suf === 'head' ? 84 : 76)) };
    if (alpha) { m.alphaMode = 'MASK'; m.alphaCutoff = .32; m.doubleSided = true; delete m.normalTexture; }
    else { m.alphaMode = 'OPAQUE'; const nrm = find(`_${suf}_normal.tga`); if (tier === 'key' && nrm) m.normalTexture = { index: addTex(nrm, 512, false, 80) }; else delete m.normalTexture; }
  }
  // separa o corpo (sem blendshapes) da cabeça (com blendshapes) em malhas distintas com a mesma skin
  if (tier === 'key') { const m = j.meshes[0]; const bodyIdx = m.primitives.findIndex(p => j.materials[p.material].name.endsWith('_body'));
    if (bodyIdx >= 0) { const bp = m.primitives.splice(bodyIdx, 1)[0]; delete bp.targets; j.meshes.push({ name: 'body', primitives: [bp] }); m.name = 'head';
      const ni = j.nodes.findIndex(n => n.mesh === 0); const nn = { ...j.nodes[ni], name: 'bodymesh', mesh: j.meshes.length - 1 }; delete nn.children; j.nodes.push(nn);
      const parent = j.nodes.find(n => (n.children || []).includes(ni)); if (parent) parent.children.push(j.nodes.length - 1); else j.scenes[0].nodes.push(j.nodes.length - 1); } }
  delete j.animations; fs.writeFileSync(`${work}/m.gltf`, JSON.stringify(j));
  execFileSync(GP, ['-i', `${work}/m.gltf`, '-o', `${OUT}/av_${key}.glb`, '-cc', '-kn', '-km', '-noq'], { stdio: 'ignore' });
  console.log(key, (fs.statSync(`${OUT}/av_${key}.glb`).size / 1024).toFixed(0) + 'KB');
}
for (const [key, rel] of ANIMS) {
  const raw = `${TMP}/an_${key}`; execFileSync(F2G, ['--binary', '--input', `${RB}/Animations/${rel}`, '--output', raw], { stdio: 'ignore' });
  execFileSync(GP, ['-i', raw + '.glb', '-o', `${OUT}/an_${key}.glb`, '-cc', '-kn', '-af', '20', '-noq'], { stdio: 'ignore' });
  console.log('anim', key, (fs.statSync(`${OUT}/an_${key}.glb`).size / 1024).toFixed(0) + 'KB');
}
