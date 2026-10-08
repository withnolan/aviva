// picking.js: GPU picking of rest-space UV on a vertex-shader-deformed sheet (works for ANY pose: folded, curled, bent, crumpled).
// Renders only the sheet (layer 2) into a tiny render target through a camera zoomed on the pointer pixel (setViewOffset),
// writes the rest-space UV as 16-bit pairs into RGBA8, and reads 1 pixel back with readRenderTargetPixelsAsync (no pipeline stall).
import * as THREE from 'three';

export function createPickMaterial(shared, DEFORM_GLSL) {
  return new THREE.ShaderMaterial({
    uniforms: shared, side: THREE.FrontSide,
    vertexShader: `attribute vec4 aShell; varying vec2 vRest; varying float vSide;
${DEFORM_GLSL}
void main(){ vec3 P, N; float cw; deformSurface(position.xy, P, N, cw);
  float h = 0.5 * max(uThickness, uPixelSize * 1.2); vec3 q = P + N * (aShell.x * h);
  vRest = position.xy; vSide = aShell.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.0); }`,
    fragmentShader: `varying vec2 vRest; varying float vSide; uniform vec2 uSheet;
void main(){ if (vSide == 0.0) discard;                                   // ignore the thin edge walls
  vec2 q = floor(clamp(vRest / uSheet + 0.5, 0.0, 1.0) * 4095.0 + 0.5);      // 12 bits per axis (0.05 mm on A4)
  float uh = floor(q.x / 16.0), vh = floor(q.y / 16.0), ul = q.x - uh * 16.0, vl = q.y - vh * 16.0;
  gl_FragColor = vec4(uh, vh, ul * 16.0 + vl, vSide > 0.0 ? 255.0 : 128.0) / 255.0; }`,
  });
}

export class SheetPicker {
  /** @param twin a Mesh sharing the paper geometry with the pick material, placed on layer 2 as a child of the paper mesh */
  constructor(renderer, scene, camera, size = 4) {
    this.r = renderer; this.scene = scene; this.camera = camera; this.size = size;
    this.rt = new THREE.WebGLRenderTarget(size, size, { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: true, colorSpace: THREE.NoColorSpace, generateMipmaps: false });
    this.buf = new Uint8Array(size * size * 4); this.cam = camera.clone(); this.cam.layers.set(2); this.busy = false;
  }
  /** @returns {Promise<{u:number,v:number,side:1|-1}|null>}  u,v in 0..1 over the sheet (rest space), null if the pointer misses the sheet */
  async pick(clientX, clientY, canvas) {
    if (this.busy) return null; this.busy = true;
    const r = this.r, rect = canvas.getBoundingClientRect(), W = rect.width, H = rect.height, s = this.size;
    this.cam.copy(this.camera, false); this.cam.layers.set(2);
    this.cam.setViewOffset(W, H, Math.floor(clientX - rect.left - s / 2), Math.floor(clientY - rect.top - s / 2), s, s);   // frustum shrinks to the s*s pixels around the pointer
    const bg = this.scene.background, prev = r.getRenderTarget(), a = r.getClearAlpha(), tm = r.toneMapping;
    this.scene.background = null; r.toneMapping = THREE.NoToneMapping; r.setClearColor(0x000000, 0);
    r.setRenderTarget(this.rt); r.clear(); r.render(this.scene, this.cam); r.setRenderTarget(prev); this.scene.background = bg; r.setClearAlpha(a); r.toneMapping = tm;
    const c = (s >> 1) * s + (s >> 1);
    await r.readRenderTargetPixelsAsync(this.rt, 0, 0, s, s, this.buf);
    this.busy = false; const o = c * 4, A = this.buf[o + 3]; if (A === 0) return null;
    const R = this.buf[o], G = this.buf[o + 1], B = this.buf[o + 2];
    return { u: (R * 16 + (B >> 4)) / 4095, v: (G * 16 + (B & 15)) / 4095, side: A > 200 ? 1 : -1 };
  }
}
