// contact.js: soft contact shadow for a deformable object on an "infinite white floor", after three.js' webgl_shadow_contact example
// (ortho camera under the floor looking up, depth -> alpha, two separable blur passes), with OUR deformation-aware caster material.
import * as THREE from 'three';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';

export class ContactShadow {
  /** @param casterMaterial a depth-style material that deforms like the paper and writes (0,0,0,(1-depth)*darkness) */
  constructor(renderer, { size = 1.2, height = 0.5, res = 512, blur = 3.0, opacity = 0.55, floorY = 0 } = {}) {
    this.renderer = renderer; this.blurAmount = blur; this.size = size; this.res = res;
    this.rt = new THREE.WebGLRenderTarget(res, res); this.rtBlur = new THREE.WebGLRenderTarget(res, res);
    this.rt.texture.generateMipmaps = this.rtBlur.texture.generateMipmaps = false;
    this.group = new THREE.Group(); this.group.position.y = floorY;
    const g = new THREE.PlaneGeometry(size, size).rotateX(Math.PI / 2);   // as in the three.js example: faces down, then scale.y = -1 flips it up and un-mirrors the v coordinate
    this.plane = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: this.rt.texture, transparent: true, opacity, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    this.plane.renderOrder = 1; this.plane.scale.y = -1;               // flip: the ortho camera looks UP from below, so v is mirrored
    this.group.add(this.plane);
    this.blurPlane = new THREE.Mesh(g); this.blurPlane.layers.set(1); this.blurPlane.visible = false;   /* must be on the shadow camera's layer */ this.group.add(this.blurPlane);
    this.cam = new THREE.OrthographicCamera(-size / 2, size / 2, size / 2, -size / 2, 0, height); this.cam.rotation.x = Math.PI / 2; this.group.add(this.cam);
    this.cam.layers.set(1);                                             // only objects on layer 1 (the paper's shadow-caster twin) are drawn
    this.hBlur = new THREE.ShaderMaterial(HorizontalBlurShader); this.vBlur = new THREE.ShaderMaterial(VerticalBlurShader);
    this.hBlur.depthTest = this.vBlur.depthTest = false;
  }
  _blur(a) {
    const r = this.renderer; this.blurPlane.visible = true;
    this.blurPlane.material = this.hBlur; this.hBlur.uniforms.tDiffuse.value = this.rt.texture; this.hBlur.uniforms.h.value = a / this.res;
    r.setRenderTarget(this.rtBlur); r.render(this.blurPlane, this.cam);
    this.blurPlane.material = this.vBlur; this.vBlur.uniforms.tDiffuse.value = this.rtBlur.texture; this.vBlur.uniforms.v.value = a / this.res;
    r.setRenderTarget(this.rt); r.render(this.blurPlane, this.cam); this.blurPlane.visible = false;
  }
  /** call when the sheet moved (or every frame while it moves). `scene` contains the casters on layer 1. */
  update(scene) {
    const r = this.renderer, bg = scene.background, a = r.getClearAlpha(), prevRT = r.getRenderTarget();
    scene.background = null; r.setClearAlpha(0); this.plane.visible = false;
    r.setRenderTarget(this.rt); r.clear(); r.render(scene, this.cam); if (globalThis.__cdbg) console.log('caster pass tris', r.info.render.triangles, 'calls', r.info.render.calls);
    this._blur(this.blurAmount); this._blur(this.blurAmount * 0.4);
    r.setRenderTarget(prevRT); r.setClearAlpha(a); scene.background = bg; this.plane.visible = true;
  }
}

/** depth-style caster that follows the paper's deformation (use on a twin mesh that shares geometry and lives on layer 1) */
export function createCasterMaterial(shared, DEFORM_GLSL, VERT_BEGIN, darkness = 2.0) {
  const m = new THREE.MeshDepthMaterial(); m.depthTest = false; m.depthWrite = false;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared, { darkness: { value: darkness } });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aShell;\nvarying float vWorldWad; varying vec2 vRest;\n' + DEFORM_GLSL)
      .replace('#include <begin_vertex>', VERT_BEGIN + '\nvec3 transformed = deformed;');
    shader.fragmentShader = 'uniform float darkness;\n' + shader.fragmentShader.replace('gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );', 'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );');
  };
  m.customProgramCacheKey = () => 'aviva-caster-v1';
  return m;
}
