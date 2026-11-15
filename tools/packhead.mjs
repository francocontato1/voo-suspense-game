import fs from 'fs';
import { MeshoptSimplifier } from 'meshoptimizer';
const b = fs.readFileSync(process.argv[2]);
const jl = b.readUInt32LE(12); const j = JSON.parse(b.slice(20, 20 + jl));
const binStart = 20 + jl + 8; const bin = b.slice(binStart);
const bv = j.bufferViews;
const view = (i, T, n) => new T(bin.buffer.slice(bin.byteOffset + bv[i].byteOffset, bin.byteOffset + bv[i].byteOffset + bv[i].byteLength));
const idx = view(0, Uint16Array), pos = view(1, Float32Array), nrm = view(2, Float32Array), uv = view(3, Float32Array);
await MeshoptSimplifier.ready;
const idx32 = new Uint32Array(idx);
const [lod] = MeshoptSimplifier.simplify(idx32, pos, 3, Math.floor(idx.length * 0.12 / 3) * 3, 0.02, ['LockBorder']);
const lod16 = new Uint16Array(lod);
console.log('verts', pos.length / 3, 'tris', idx.length / 3, 'lod tris', lod16.length / 3);
// header: nv, ni, nl (uint32) then pos f32, nrm f32, uv f32, idx u16, lod u16
const hdr = new Uint32Array([pos.length / 3, idx.length, lod16.length]);
const parts = [hdr, pos, nrm, uv, idx, lod16].map(a => Buffer.from(a.buffer, a.byteOffset, a.byteLength));
fs.writeFileSync(process.argv[3], Buffer.concat(parts));
// bounds per axis
let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(let i=0;i<pos.length;i+=3)for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],pos[i+k]);mx[k]=Math.max(mx[k],pos[i+k]);}
console.log(mn,mx);
