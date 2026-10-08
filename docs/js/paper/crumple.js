// crumple.js: plays back the offline crumple bake (work/scripts/crumple/bake.mjs -> docs/assets/paper/crumple.bin[.gz])
// as three morph targets on a jittered single-surface mesh, rendered with the same paper material ('crumple' variant:
// rest-space uv for the pencil / ink dot / formation, baked ambient occlusion in the vertex colours, both faces lit).
//
// progress t in 0..1 walks the K keyframes (flat -> ball); the web-developer eases t and rolls the ball rigidly.
import * as THREE from 'three';
import { makeCrumpleGrid, decodeCrumple } from './crumple-grid.js';
import { createPaperMaterial, createPaperDepthMaterial, createCasterMaterial } from './material.js';

async function fetchBuffer(url) {
  const r = await fetch(url); if (!r.ok) throw new Error(`${r.status} ${url}`);
  let buf = await r.arrayBuffer();
  const u8 = new Uint8Array(buf, 0, 2);
  if (u8[0] === 0x1f && u8[1] === 0x8b) {            // gzip (GitHub Pages does not compress .bin): inflate in the browser
    const ds = new DecompressionStream('gzip');
    buf = await new Response(new Blob([buf]).stream().pipeThrough(ds)).arrayBuffer();
  }
  return buf;
}

export async function loadCrumple(sys, url) {
  const candidates = url ? [url] : [new URL('../../assets/paper/crumple.bin.gz', import.meta.url).href, new URL('../../assets/paper/crumple.bin', import.meta.url).href];
  let buf = null, lastErr = null;
  for (const u of candidates) { try { buf = await fetchBuffer(u); break; } catch (e) { lastErr = e; } }
  if (!buf) throw lastErr || new Error('no crumple data');
  const D = decodeCrumple(buf);
  // the baked AO is ray-traced per vertex (noisy): smooth it over the grid (3 x 3, twice) so it reads as soft occlusion
  for (let k = 0; k < D.K; k++) {
    const A = D.ao[k], nx = D.nx, ny = D.ny, T = new Float32Array(A.length);
    for (let pass = 0; pass < 2; pass++) {
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) for (let c = 0; c < 2; c++) {
        let sum = 0, w = 0;
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= ny) continue;
          const ww = (di === 0 && dj === 0) ? 2 : 1; sum += A[(jj * nx + ii) * 2 + c] * ww; w += ww;
        }
        T[(j * nx + i) * 2 + c] = sum / w;
      }
      A.set(T);
    }
  }
  const G = makeCrumpleGrid(D.nx, D.ny, D.seed, { w: 0.21, h: 0.297 }, D.jitter);
  const n = D.n, K = D.K;
  const geo = new THREE.BufferGeometry();
  geo.setIndex(new THREE.BufferAttribute(n > 65535 ? G.tris : new Uint16Array(G.tris), 1));
  const rest = new Float32Array(n * 2); rest.set(G.rest);
  geo.setAttribute('aRest', new THREE.BufferAttribute(rest, 2));
  // per keyframe: positions, smooth normals, AO (r = front, g = back)
  const tmp = new THREE.BufferGeometry(); tmp.setIndex(geo.index);
  const P = [], N = [], A = [];
  let radius = 0.035;
  for (let k = 0; k < K; k++) {
    const pos = D.positions[k];
    tmp.setAttribute('position', new THREE.BufferAttribute(pos, 3)); tmp.deleteAttribute('normal'); tmp.computeVertexNormals();
    P.push(new THREE.BufferAttribute(pos, 3)); N.push(new THREE.BufferAttribute(tmp.getAttribute('normal').array.slice(), 3));
    // 4 components (USE_COLOR_ALPHA): three 0.186's morphcolor_vertex only compiles for vec4 colours with morph targets
    const ao = new Float32Array(n * 4); for (let i = 0; i < n; i++) { ao[i * 4] = D.ao[k][i * 2]; ao[i * 4 + 1] = D.ao[k][i * 2 + 1]; ao[i * 4 + 2] = 1; ao[i * 4 + 3] = 1; }
    A.push(new THREE.BufferAttribute(ao, 4));
    if (k === K - 1) { let m = 0; for (let i = 0; i < n; i++) m += Math.hypot(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); radius = m / n * 1.15; }
  }
  geo.setAttribute('position', P[0]); geo.setAttribute('normal', N[0]); geo.setAttribute('color', A[0]);
  geo.morphAttributes.position = P.slice(1); geo.morphAttributes.normal = N.slice(1); geo.morphAttributes.color = A.slice(1);
  geo.morphTargetsRelative = false;
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 0.2);
  const data = { geometry: geo, K, n, radius, center: D.center, swap: D.swap };
  return {
    data, radius, center: D.center, swap: D.swap,
    /** a crumple mesh bound to a sheet's uniforms (pencil, ink dot, formation follow the sheet) */
    createMesh(d, uniforms, contact) {
      const mesh = new THREE.Mesh(d.geometry, createPaperMaterial(uniforms, { variant: 'crumple' }));
      mesh.customDepthMaterial = createPaperDepthMaterial(uniforms, 'crumple');
      mesh.frustumCulled = false; mesh.morphTargetInfluences = new Array(d.K - 1).fill(0);
      mesh.name = 'paper.crumple';
      if (contact) {
        const caster = new THREE.Mesh(d.geometry, createCasterMaterial(uniforms, contact.uniforms, 'crumple'));
        caster.frustumCulled = false; caster.layers.set(contact.layer); caster.morphTargetInfluences = mesh.morphTargetInfluences; mesh.add(caster);
      }
      return mesh;
    },
    /** t 0..1 -> blend between the two neighbouring keyframes */
    setProgress(mesh, t) {
      const f = THREE.MathUtils.clamp(t, 0, 1) * (K - 1), i = Math.min(Math.floor(f), K - 2), w = f - i;
      const inf = mesh.morphTargetInfluences; inf.fill(0);
      if (i >= 1) inf[i - 1] = 1 - w;      // keyframe i is morph target i-1 (keyframe 0 is the base)
      inf[i] = w;                           // keyframe i+1
    },
  };
}
