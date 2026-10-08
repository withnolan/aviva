# 01b — Technique research (web-researcher, Task B)

Status: COMPLETE (all 6 topics). Sections 2, 3 and 4 are backed by a working prototype in `work/scripts/paper-proto/` (rendered and inspected in headless Chromium); the import map and copy script are tested.
Pinned versions (verified with `npm view` on 2026-10-01 and in `node_modules/*/package.json`): **three 0.186.1, gsap 3.15.0, lenis 1.3.26**.

---------------------------------------------------------------------------------------------------

## 1. Lusion / ORYZO "Oryzo BTS" series: what I could and could not read

**Could not read the posts themselves.** `blog.lusion.co`, `oryzo.ai`, `x.com`, `tympanus.net` (Codrops), `discourse.threejs.org`, `yusually.it.com`, `utsubo.com`, `gsap.com` and `webflow.com` are all blocked by the egress proxy (`EGRESS_BLOCKED`). Everything below about the series comes from WebSearch result snippets and from GitHub (which is reachable).

What the search snippets establish (titles, dates, structure):

| Part | Title (from the blog's URL/titles) | Status seen in search |
|---|---|---|
| 1 / 7 | Concept and Creative Direction | Published (X post 2026-03/04). Oryzo is described as a year-long internal project; started early 2025 after a heavy client period; Lusion had never made a site for a *physical* product. |
| 2 / 7 | 3D Design and Motion Graphics (3D, motion graphics, visual systems behind the site and launch film) | Published 2 April 2026, ~12 min read. |
| 3 / 7 | Website UX/UI and Illustrations (keeping the interface quiet so content does the talking) | Published (X post 2026-04). |
| 4 / 7 | **WebGL / ThreeJS Tricks 1** | Listed in the Part 1-3 "series" checklists; search tools showed only Parts 1-3 as live in April 2026. I could not confirm whether Parts 4-7 are now live. |
| 5 / 7 | WebGL / ThreeJS Tricks 2 | as above |
| 6 / 7 | WebGL / ThreeJS Tricks 3 | as above |
| 7 / 7 | WebGL / ThreeJS Tricks 4 | as above |

Other facts from search results (secondary sources, not Lusion's own words): Oryzo won Awwwards Site of the Month (April 2026) plus a Developer Award; commentators describe "one hero object rendered live in Three.js with real weight and inertia, easing that mimics physics, and a scroll that moves the camera through true Z-axis depth rather than sliding 2D layers". A commenter on Part 3 asked about Gaussian splatting, which the mission notes says Lusion used for the photoreal desk scenes together with Houdini renders and photography.

**Conclusion for aviva:** the WebGL tricks of Parts 4-7 are unknown to me. I do not guess at them. The effect-level approach is below (topics 2-5); it is built from first principles and from open-source, GitHub-readable work.

### Things Lusion has published openly that ARE readable (MIT, GitHub) and are directly useful

1. **`lusionltd/WebGL-Scroll-Sync`** (MIT; Vite demo; README read in full, local clone in the scratchpad). It is Lusion's own stated answer to the problem "one WebGL canvas, many DOM elements, no scroll-jacking":
   - Native scroll is not on the same thread/timing as `requestAnimationFrame`, so a `position: fixed` canvas reading `scrollY` in rAF can lag/drift on touch devices.
   - Their trick: make the canvas `position: absolute` and, **every rAF, translate it to the current scroll offset**. If the browser scrolls between two frames, the canvas physically scrolls with the page, so 3D stays glued to the DOM; it never *drifts* but may *clip* at the viewport edge during fast scrolls.
   - Mitigations they name: render extra vertical padding (they use +25 % top and bottom), or render to a full-screen framebuffer and edge-blend.
   - For aviva (rule 4 says "one fixed full-screen canvas"): keep `position: fixed` (simplest, and our scene is not glued to specific DOM boxes; the sheet floats in screen space) and drive the scene from smoothed scroll (Lenis) **inside the same ticker**. Only if the sheet must stay locked to a DOM rectangle on touch devices (e.g. the "printed on aviva" zoom moment, the tier-picker stack), use their absolute-canvas + padding trick for that case. Idea only; write our own code.
2. **`lusionltd/ORYZO-1`**: coaster models + paper only (already studied by the lead).

### Public Oryzo-sibling projects on GitHub worth reading (technique, MIT-licensed or demos)

- **`hamzahossainX/Product-in-motion` ("ERASER-1", a vinyl eraser as an "open-weight AI model")**: raw three.js, Lenis, GSAP SplitText only, no ScrollTrigger. Summary read via WebFetch of its README: custom post chain written by hand (TAA with Halton jitter + depth reprojection, FXAA, bokeh, multi-mip bloom, ACES inside a colour-grade, **blue-noise dither before sRGB encode**, no post library); every frame "reset-then-claim": wipe colour grade/light/hero transform, then each visible section blends weighted claims by its scroll ratio, which gives free cross-fades between overlapping sections; each section owns a `ScrollRange` with `fit()` remapping, so scrubbing is deterministic backwards and forwards; geometry/materials/graphite dust generated in code; env map is a PMREM built at runtime; 18 draw calls, 208 kB gz JS; reduced-motion keeps the look but removes self-animation. This "reset-then-claim" frame loop is a very good pattern for aviva (see topic 4).
- **`huxlic/korvo`** (React Three Fiber + GSAP, Oryzo homage) and **`sakshamfit/oryzo`** (unrelated real-estate site, Lenis + ScrollTrigger + R3F, scroll-scrubbed frame sequence) exist but add little.
- **Codrops "Building an Interactive Crumpled Paper Effect with Houdini VAT and Three.js"** by Toi Nagasawa, 2026-09-19 (article blocked; **repo is readable**: `item-develop/paper-crumple-demo`, MIT; I cloned a fork `jarolinplasencio18-web/paper-crumple-demo` and read `src/paper-vat.js`). Technique: a Houdini Vellum crumple baked to Vertex Animation Textures (50 frames, ~3500 points, FBX 1.2 MB + EXR 1.7 MB), decoded on the CPU into per-frame position/normal arrays, smooth normals computed per *point id* (the mesh is a triangle soup, so computeVertexNormals would give faceted shading), plus cannon-es for throwing. **Useful lesson for aviva:** a real crumple is a baked simulation; we have no Houdini, and 3 MB would blow our budget, so we bake our own tiny one (see crumple in topic 2).
- **Amanda Ghassaei's Origami Simulator** (`amandaghassaei/OrigamiSimulator`, MIT; paper "Fast, Interactive Origami Simulation using GPU Computation", Ghassaei/Demaine/Gershenfeld, 7OSME): GPU dynamic relaxation of a triangulated crease pattern (pin-jointed truss + angular constraints), three.js rendering. Used here as the reference for "what physically-correct folding looks like"; we choose a cheaper kinematic approach (topic 2).

Sources for this topic: blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction, ...-part-3-7-website-ux-ui-and-illustrations (URLs from search results; not fetchable), x.com/lusionltd status posts (search snippets), github.com/lusionltd (WebFetch), github.com/lusionltd/WebGL-Scroll-Sync (cloned, README read), github.com/hamzahossainX/Product-in-motion (WebFetch), github.com/jarolinplasencio18-web/paper-crumple-demo (cloned; `src/paper-vat.js` read), github.com/amandaghassaei/OrigamiSimulator (search snippet).

---------------------------------------------------------------------------------------------------

## 2. A convincing real-time sheet of paper (three 0.186.1)

**Everything in this section was prototyped and rendered in headless Chromium (SwiftShader WebGL2)** in `work/scripts/paper-proto/` (see "Appendix A: the prototype" for how to run it). Screenshots were inspected; GLSL compiled against the real 0.186 chunks. What I could not measure: real-GPU frame times (SwiftShader only) and real-phone behaviour. Where something is a recommendation but not prototyped, it says so.

### 2.0 The architecture in one paragraph
One `THREE.Mesh` with one `MeshPhysicalMaterial` (so we keep three's IBL, sheen, shadows, tone mapping, colour management) patched with `onBeforeCompile`. The geometry is the **flat rest sheet** (metres, x in [-0.105, 0.105], y in [-0.1485, 0.1485], z = 0). **All shape comes from one GLSL function** `deformPoint(restXY)` that runs `rest -> folds/curls -> pleats -> bend -> twist -> flutter -> crumple`. Normals are not stored: they are the cross product of forward differences of that same function (3 evaluations per vertex). The same GLSL chunk is reused by the **shadow depth material, the contact-shadow caster, and the GPU picker**, so shadows and pointer hits follow the bent/folded sheet. All animation = changing a handful of uniforms from GSAP/ScrollTrigger. No morph targets, no CPU skinning, nothing to bake except (optionally) the crumple.

### 2.1 Geometry, thickness, the clean edge

- **Segments.** A4 is 210 x 297 mm. Use square cells: `segW = round(210/s)`, `segH = round(297/s)`. s = 2.5 mm -> 84 x 119 (10,200 verts per surface), s = 1.64 mm -> 128 x 181 (23,300 verts per surface). Recommended: **84 x 119 on phones, 128 x 181 on desktop** (the hero + crumple moments). With even segment counts the centre lines x = 0 and y = 0 are vertex lines, so the A4 -> A5 -> A6 halving creases land exactly on mesh edges. Diagonal creases cannot, and a 0.4 mm bend radius is narrower than a cell: the crease then looks like a crisp ramp between two vertices. That reads fine (checked in the dart-plane renders) because normals are recomputed per vertex.
- **Thickness: one geometry, three parts.** Top surface + bottom surface (reverse winding) + 4 edge "wall" ribbons (vertex pairs top/bottom along the perimeter), merged in one `BufferGeometry` with one extra attribute `aShell = (side, outX, outY, wallV)` (side +1 top, -1 bottom, 0 wall). In the vertex shader: `P + N * side * t/2`; wall vertices use the outward in-plane direction deformed by the same function (`o = deform(rest + out*eps) - P`, orthogonalised to N). 2 x 10,200 + walls = ~40.8k triangles at 84 x 119 (measured: `renderer.info` reported 81.6k per frame = main pass + shadow pass). Back-face culling stays on (`FrontSide`), so `faceDirection`/double-sided hacks are not needed, and the bottom surface can have its own UV offset (+0.37, +0.61) so the two sides do not show the same fibre pattern.
- **The "0.1 mm" edge-on moment.** Real thickness (0.0001 m) is sub-pixel at any sane distance. Pass `uPixelSize = metres per pixel at the sheet` (= `2 * dist * tan(fov/2) / (drawingBufferHeight)`, recomputed per frame on the CPU) and use `t = max(realThickness, 1.2 * uPixelSize)` in the shader. Result (tested at ry = 90 deg): a clean, anti-aliased, ~1.2 px line, and at ry = 84 deg a visible thin slab. For the beat itself you can also *exaggerate* thickness (uniform `uThickness`, e.g. 1.5 mm) and animate it back to 0.1 mm as the dimension line says "0.1 mm". MSAA (`antialias: true`) is what makes the hairline smooth; do not rely on FXAA.
- **Frustum culling.** The rest-pose bounding sphere is wrong once the vertices move; set `mesh.frustumCulled = false` (or give the geometry a large sphere), otherwise the sheet pops out at screen edges.
- **Pitfall found while building it:** `new THREE.Vector4()` defaults to `w = 1`, not 0. A "zero" uniform `uBend = new Vector4()` silently enabled the flutter amplitude `uBend.w = 1 m` and turned the sheet into a twisted ribbon. Always construct `new THREE.Vector4(0,0,0,0)`.

### 2.2 The one deformation primitive: a hinge with a bend radius

Everything that bends is the same function. A crease is a hinge with r ~ 0.4 mm; a page curl is r ~ 20 mm; a roll is angle >> pi. Derivation: with hinge point `Q`, unit axis `a`, unit direction `m` (perpendicular to `a`, pointing to the part that moves), `u = normalize(cross(a, m)) * sign(theta)`, and for a vertex `p`: `s = dot(p-Q, m)` (distance past the hinge), `g = dot(p-Q, a)`, `h = dot(p-Q, u)`. For `s <= 0` nothing moves. Otherwise `phi = min(s/r, |theta|)` and the vertex is placed on the arc, then carried along the rotated tangent, carrying its height `h` along the rotated normal:

```glsl
void applyFold(inout vec3 p, vec3 rest, vec4 Q, vec4 A, vec4 M, vec4 R) {
  float th = A.w; if (abs(th) < 1e-5) return;
  if (M.w > 0.5 && dot(rest.xy, R.xy) + R.z < 0.0) return;      // optional rest-space mask (see layers below)
  vec3 a = A.xyz, m = M.xyz, u = normalize(cross(a, m)) * sign(th);
  float t = abs(th), r = max(Q.w, 1e-4);
  vec3 d = p - Q.xyz; float s = dot(d, m); if (s <= 0.0) return;
  float g = dot(d, a), h = dot(d, u);
  float phi = min(s / r, t), tail = max(s - r * t, 0.0);
  vec3 tT = m * cos(t) + u * sin(t);                             // tangent after the arc
  vec3 nPhi = u * cos(phi) - m * sin(phi);                       // rotated normal
  p = Q.xyz + a * g + m * (r * sin(phi)) + u * (r * (1.0 - cos(phi))) + tT * tail + nPhi * h;
}
```
Properties (all checked in renders): C0-continuous for any input, arc-length preserving for a flat sheet (no stretching, so paper does not "rubber"), works on a sheet that is already folded (stacks of layers move together), and the sign of `theta` chooses valley (+z) or mountain (-z). Uniform arrays `uFoldQ/A/M/R[MAX_FOLDS=12]` (4 x vec4 per fold); loop `for (i < MAX_FOLDS) { if (i >= uFoldCount) break; ... }` (WebGL2 allows dynamic loop bounds; cost is trivial).

**Authoring folds in the plane of the flat-folded sheet.** Every classic origami step happens on a sheet lying flat, so define each fold as a 2D line in XY of the *current* flat state, not in the sheet's own rest coordinates (a stack of two layers has one crease line in the XY plane but two different lines in rest space). Helper (in `paper.js`): `fold2D({ p:[x,y], dir:[dx,dy], side:[sx,sy], toward:+1|-1, angle, radius, restMask })`: `side` = a vector pointing to the part that moves, `toward` +1 valley / -1 mountain; it builds `(a, m)` so that `cross(a, m)` points to +z. Animation = set each fold's `.t` in 0..1 and upload `angle * t` (`setFolds`). Sequencing is just `gsap.timeline` over the `.t` values.

**Two stacked layers that must move differently** (the paper-plane wings: one layer folds up, the other down): add a `restMask` half-plane in *rest* space (`dot(rest.xy, n) + d > 0`); the left half-sheet (rest x < 0) and the right half-sheet (rest x > 0) are the two layers after the centre fold. Used in the dart plane below.

**Prototyped fold sequences (A4, metres, verified visually step by step):**
- **Dart paper plane, 7 folds** (`dartPlaneFolds()`): (1,2) top corners to the centre line: hinge through the nose `(0, +H/2)` with directions `(1,-1)` and `(-1,-1)`, moving side toward the corners, valley, pi; (3,4) the new slanted edges to the centre line: hinge from the nose at 22.5 degrees off the centre line, `dir = (sin(pi/8), -cos(pi/8))`, valley, pi; (5) fold in half along `x = 0`, **mountain**, pi; (6,7) wings: hinge from the nose `(0, H/2)` to `(-0.045, -H/2)`, valley 90 deg on the front layer (mask rest x < 0) and mountain 90 deg on the back layer (mask rest x > 0), radius 1.2 mm. The result at t = 7 is a recognisable dart plane (see `work/scripts/paper-proto`, `?pose=dart&t=7`). Orientation: after step 5 the keel hangs from the wing hinge; rotate the finished object so the fold-spine points down; the flight path is then a plain rigid motion of `mesh.matrix` (CatmullRomCurve3 + a little roll/pitch noise).
- **Halving A4 -> A5 -> A6** (`halvingFolds()`): fold 1 hinge `y = 0`, `dir = (1,0)`, `side = (0,1)`, valley, pi; fold 2 hinge `x = 0`, `dir = (0,1)`, `side = (1,0)`, valley, pi. Because the ISO 216 ratio is sqrt(2), each fold lands the edges exactly on top of each other, so the two stacked layers coincide to the cell. Stack gap after a flat fold is `2 * radius` (0.8 mm with r = 0.4 mm): small enough to look like paper, large enough that top/bottom layers do not z-fight. Use `polygonOffset`-free logic: do not reduce radius below ~0.3 mm unless the thickness is also > 0.2 mm.
- **Letter / envelope** (not coded, same primitive): two parallel folds at `y = +/-H/6` (valley up from the bottom, then valley down from the top) give the letter fold; for the "fold-to-encrypt" envelope: fold in thirds, then two small valley folds at the open ends, then a diagonal corner flap. Whatever the step count, it is <= 12 `fold2D` calls.
- **Accordion pleats and a hand fan** (`uPleat = (period, gamma, fanAngle, pivot)`, prototyped, `?pose=fan`): closed-form triangular wave `x' = x cos(gamma)`, `z' = +/- f sin(gamma)` (arc-length preserving) then an optional radial map `ang = x * fanAngle`, `r = pivot + y` that bends the pleated strip into a fan. Animate `gamma` 0 -> 0.6 for the "pleat" and `fanAngle` 0 -> 3.2 rad/m for the opening. This is the origami "fan" for free.

### 2.3 Normals (the decision)
- **Chosen: forward differences of the deform function** (3 evaluations per vertex, step `eps = 0.5 * cell`). It is the only method that stays correct for *every* operation including noise/crumple/tear. Cost: 3x the deformation ALU; at 40k vertices with 12 folds that is ~0.5 M fold evaluations per frame, trivial on desktop and fine on phones; the crumple op is the expensive one (see 2.7).
- Analytic alternative (carry `n` through each `applyFold` as `n' = t(phi)*n_m + nPhi*n_u + a*n_a`): exact and 3x cheaper but every new op needs its own derivative; only worth it if the shader is ALU-bound on low-end phones.
- CPU recompute (`computeVertexNormals`) every frame: no, upload cost and it fights the shader deformation.
- Fragment-level detail does not need these: fibre normal maps are applied in tangent space with three's derivative-based TBN (`getTangentFrame`, works on deformed meshes because it uses screen-space derivatives of position and UV).

### 2.4 Curls, bends, rolls, falling flutter
- **Page curl / corner curl / roll** = one `applyFold` with a large radius: `radius 0.02-0.03, angle 0.9-1.0 pi`, hinge near an edge, animate the hinge position across the sheet (tested: `?pose=curl`, reads exactly like a page turn lifting). For a true *cone* curl (corner curl with a tapering radius) set `r = r0 + k * g` along the axis coordinate `g`; this is an approximation of the cone development (not exactly isometric) but looks right for a lifting corner.
- **Global cylindrical bend:** `an = s*k; p = along + nrm*(sin(an)/k); p.z += (1-cos(an))/k` about a line at angle `uBend.y`; arc-length preserving. Tested at k = 2..7 (1/m).
- **Twist** about the long axis (`uBend.z`, rad per metre of y) and **flutter** (`uBend.w` amplitude * value-noise(xy * freq, time)) for the "drifting down" intro; keep amplitude <= 1.2 cm and combine with a rigid sway; a real falling sheet is a rocking glide, so drive position/rotation with a damped sine pair (GSAP) and let flutter only add the soft ripple.
- Do not animate curvature and flutter with `lerp` of positions; animate parameters.

### 2.5 Tearing (prototyped, `?pose=tear`)
Do not cut the mesh. Draw **two full copies of the sheet** (two meshes sharing the geometry and textures, each with its own uniform set, `uTear = (nx, ny, offset, +1/-1)` in rest space). Each piece `discard`s the other's side along a **jagged line evaluated per fragment** from `vRest` (varying carrying the rest position): `d = dot(rest, n) - off + amp * (noise(rest*f) + 0.5*noise(rest*4f))`; plus a hash-dithered `fuzz` (0.8 mm) so the edge is ragged and fibrous, plus a brighter band (`mix(diffuse, 1, 0.55)` within 1.6 mm of the tear) because torn paper shows raw white fibres. Both pieces then move with ordinary rigid transforms/folds (tested: two pieces pulled apart). The shadow-depth material has the same `discard`. Result is pixel-sharp at any zoom, with no webbing between pieces (the failure mode of splitting by vertex side). Cost: 2x draw of the sheet during the tear only.

### 2.6 Crumpling (the hard one; honest status)
What I tried, in order, with screenshots:
1. **Lerp flat -> faceted ball + noise** (octahedral map of the rectangle onto a sphere, radius = min over ~44 random tangent planes = convex-polyhedron facets, plus ~14 V-shaped great-circle crease dents, plus fine value noise): at crumple progress 0.8-1.0 this **reads as a crumpled paper wad** (see `?pose=crumple&t=0.8`); the intermediate 0.3-0.5 reads as crinkled foil/cloth. Pure noise displacement (smooth FBM, Voronoi-cell lumps) read as "cauliflower" or foam, not paper: rounded bumps are the tell, paper has flat facets and sharp ridges.
2. **N random 3D hinge folds in sequence** (each `applyFold` with a random axis and plane through the sheet centre): rejected, flaps swing out like shards (continuous, but not "folding over").
3. Known artifacts of the shipped approach: small sawtooth along the octahedral seams and creases (crease width below cell size). Mitigations: 128 x 181 segments (the sawtooth halves), widen crease falloff, or swap in a dedicated 160 x 226 "ball" mesh for the resting wad; at the crumple frames use `uDeformEps = 0.35 * cell`.
- **Recommended for the final resting ball (Phase 4 decision for the lead/visual-designer):** keep (1) for the in-motion crumple (0.4-0.9 s, cheap, scrubbable, no baked data), and judge the resting ball at the real camera. If it must be a hero close-up, bake a better wad **offline in Node** (no Houdini needed): a ~5k-particle cloth with distance + bending constraints, plastic crease memory and a shrinking sphere, 6 keyframes of positions as Float16 (~180 KB), played back as morph targets (`geometry.morphAttributes.position` + `mesh.morphTargetInfluences`; three's morph path is compatible with `onBeforeCompile`), with per-vertex normals recomputed per keyframe (the Codrops VAT demo had to use smooth *per-point* normals because its mesh was a triangle soup: keep our mesh indexed). The Codrops/Houdini route baked 50 frames x 3500 points for 3 MB (FBX + EXR): too heavy for our 3 MB total; ours would be ~1/15 of that.
- Cost: the wad function loops 44 planes + 14 creases + 2 Voronoi; with 3 finite-difference evaluations that is the most expensive op; only enable `uCrumple > 0` for the CTA beat and `#define`-out the loop otherwise (use `customProgramCacheKey` + a define to compile a variant without it, or just branch on the uniform: dynamic branches are cheap when uniformly false).

### 2.7 Origami forms for the gallery (crane, boat, hat, fan, plane)
- **Plane, fan, boat/hat family (simple folds):** procedural. The plane is above. The fan is `uPleat`. The classic boat/hat is fold-in-half + two corner folds to the centre + two cuffs up + "open the base": its last step is not a hinge fold, so show the *folded* states with `fold2D` (fine for a 3D thumbnail) or model the final form.
- **Crane (bird base, petal folds, reverse folds):** not a half-space-fold sequence; do **not** try to fold it procedurally. Model it as a low-poly mesh (~60-120 flat triangles, flat-shaded, hand-authored vertex table in code or exported once from any DCC as a ~5 KB glTF), render with the same paper material (plain `MeshPhysicalMaterial` + the fibre normal map, no deformation chunk), and give every form the same slab thickness by using `onBeforeCompile` thickness offset or just a 0.2 mm `DoubleSide` shell. Real origami physics (Ghassaei's Origami Simulator: GPU dynamic relaxation on a triangulated crease pattern) is MIT but its input is FOLD files and its solver is a few thousand lines: not worth it for 5 gallery thumbnails.
- Gallery performance: five static meshes, each < 200 triangles, one shared material: negligible.

### 2.8 Paper material: what makes it read as paper

Recommended base (`MeshPhysicalMaterial`), tuned by eye in the lab:
```js
color '#f4f2ec' (never pure #fff: white clips under the key light and has no tone left to hold the fibre/shadow detail)
roughness 0.92, metalness 0, ior 1.45, specularIntensity 0.35        // paper is almost pure diffuse with a faint sheen
sheen 1, sheenColor (0.20,0.19,0.17), sheenRoughness 0.7            // fibre fuzz: soft grazing glow on silhouettes (cost: one extra BRDF term, negligible)
normalMap = fibre tile (RG8 packed), normalScale 0.55;  roughnessMap = formation tile (reads .g)
envMapIntensity ~0.55-1.0;  toneMapping NeutralToneMapping (see 2.10)
```
**Procedural fibre normal map (the macro look).** Real paper at normal viewing distance shows no fibres, only soft mottling and a faint tooth; at macro it shows crossing fibres 20-40 um wide and 1-3 mm long. Therefore three layers:
1. **Fibre tile, 30 mm per tile, 1024 px, RG8 packed normal** (tooth + fibres): `texture.repeat = (210/30, 297/30)` and mip-mapped with anisotropy 8 so it fades to a gentle micro-roughness at distance (no shimmer). Two generators are in `paper-textures.js`: a CPU one (canvas-free height field of ~12k curved fibre splats + tooth noise, Sobel -> normal; **2.5-3 s in this sandbox**, too slow) and the recommended **GPU one** (`makeFibreTileGPU`): a full-screen pass where each pixel loops over the 7 x 7 neighbouring cells x 7 fibres per cell (random centre, angle with machine-direction bias, length 0.8-2.6 mm, tapered gaussian cross-section) with an **analytic gradient** (no extra height taps), tileable by wrapping the cell index; output RG8 render target with `generateMipmaps`; ~ms on a real GPU. Three 0.186 accepts a packed RG normal map when `texture.format === RGFormat` (`USE_PACKED_NORMALMAP`, Z reconstructed), saving a channel and memory.
2. **Formation tile, 105 mm, 256 px RGBA8** (R cloudiness, G roughness multiplier ~0.9 +/- 0.07, B thickness for backlit transmission): four octaves of tileable value noise. This is the subtle mottling you see when you hold paper to the light, and the clouded look in the backlit test image.
3. **Macro fibre layer, 3 mm per tile, 1024 px (3 um/px)**, injected after `normal_fragment_maps`, faded by a screen-space footprint test (`fwidth` of the macro UV x 1024 < ~0.6-2.5 texels per pixel), so it contributes *only* when the camera is within a few centimetres: `normal = normalize(normal + (tbn[0]*mm.x + tbn[1]*mm.y) * 1.1 * fade)`. Without the fade it shimmers at distance.
- The prototype's macro render (`?macro=1`, grazing light, 1 cm field) shows convincing crossing fibres plus tooth; fibres are a bit thin and sparse: increase `widthMM` to 0.04-0.05 and `fibresPerCell`, add a soft halo (second gaussian) in the visual-designer pass. Tune `strength` and `normalScale` under raking light, not under the studio key.
- Colour variation: a very slow +/- 1.5 % luminance modulation from the formation tile (`diffuseColor.rgb *= 0.985 + 0.03*fm.r`) kills the "flat vector white" look at zero cost.

**Do not use `MeshPhysicalMaterial.transmission/thickness`** for paper. It forces an extra full-scene render into a transmission render target every frame (opaque scene rendered again, mip-chain blurred by roughness) and models glass-like refraction, which is wrong for a diffusing sheet. Our translucency is a few ALU in the same pass.

### 2.9 Light through paper (prototyped, `?back=...&trans=...`)
Injected after `#include <lights_fragment_end>` (the same chunk name exists in 0.186; `directionalLights[i].direction` is in view space, `getIBLIrradiance(vec3 viewNormal)` exists when an env map is present):
```glsl
vec4 fm = texture2D(uFormationMap, vRoughnessMapUv);
float thick = mix(0.75, 1.25, fm.b);
vec3 Nb = -normal, V = normalize(vViewPosition), trans = vec3(0.0);
for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
  vec3 L = directionalLights[i].direction;
  float back = saturate(dot(Nb, L));                                                // light hitting the far face
  float fwd  = pow(saturate(dot(V, -normalize(L + normal * 0.25))), 3.0);          // glow when looking toward the light through the sheet (Barre-Brisebois/Bouchard GDC 2011 form)
  trans += directionalLights[i].color * (0.65 * back + 0.9 * fwd * step(0.0, dot(Nb, L)));
}
trans += getIBLIrradiance(Nb) * 0.35;                                              // sky/studio light from behind
reflectedLight.indirectDiffuse += trans * uTrans / thick * uTransTint * material.diffuseColor * RECIPROCAL_PI;
```
`uTrans` ~ 0.15-0.3 (my estimate from typical 80 gsm copy-paper opacity of ~90+ %, i.e. only a few percent of light passes: tune by eye, this number is not sourced), `uTransTint` warm (#ffe9c8). **Test result:** with `trans = 0` and only a back light the sheet is black (no leaks); at 0.3 a warm tan with cloud-like formation; at 0.8 a bright cream. Notes: (a) it is deliberately **not shadowed by the sheet's own shadow map** (a shadow-mapped back light would shadow the sheet's own front face); other casters will not shadow it either (acceptable); (b) cost is ~1 texture fetch + a handful of dot/pow per light, i.e. unmeasurable next to the PBR loop; (c) the back face of the sheet (what you see when it is flipped) gets the same treatment because `normal` is the visible-side normal.

### 2.10 Environment, lights, tone mapping, colour management (white on white)
- **Environment:** a purpose-built studio scene rendered once with `PMREMGenerator.fromScene(scene, 0.02)`: dark-grey box room, white floor bounce plane, a large warm top-left softbox (HDR emissive `MeshBasicMaterial` colour x 6), a cool right strip (x 2.2), a back rim bar, an overhead fill. HDR values are preserved (PMREM target is half-float). File `studio.js`. `RoomEnvironment` also works (5 kB, boxy softboxes, a point light inside) and is a fine fallback. Gradient lighting across the sheet (one side brighter) is what stops white paper looking like a flat cut-out; keep the key at a raking angle (~55-65 degrees from the normal) and `environmentIntensity` 0.5-0.6 (`scene.environmentIntensity`).
- **Lights:** one `DirectionalLight` key (warm `#fff6ea`, intensity ~1.1) + environment. Optionally a second weak cool fill. A backlight only for the "light through paper" beat. Fewer direct lights keep the fragment shader (and `NUM_DIR_LIGHTS` loop for translucency) small.
- **Tone mapping: `THREE.NeutralToneMapping` (Khronos PBR Neutral), exposure ~1.0.** It keeps the white at white without ACES' hue shifts/desaturation, and AgX's lifted, low-contrast greys. Use albedo ~0.8-0.9 linear (#f4f2ec); my first renders at key 1.6 / env 1.0 clipped the whole sheet to a featureless cream: drop to key 1.1 / env 0.55 and the fibre and fold shading come back. Set `renderer.outputColorSpace = SRGBColorSpace` (default) and keep data textures (`normalMap`, formation, paint, render targets) at `NoColorSpace`.
- **Banding:** large near-white gradients (background, floor) band in 8-bit. `material.dithering = true` (built-in `dithering_fragment`) on the floor/background materials, or a CSS grain overlay (below).
- **Background:** the page background colour = the floor colour; the floor is a huge plane with the same colour and (optionally) fog or a radial fade so there is no horizon.

### 2.11 Shadows: contact shadow (prototyped) + real shadow map for self-shadowing
- **Ground shadow = contact-shadow technique** (three.js example `webgl_shadow_contact`, read from GitHub r186): an orthographic camera under the floor looking up renders the caster with a depth-based alpha (`(1 - fragCoordZ) * darkness`, black) into a 512 px RT; two separable blur passes (`HorizontalBlurShader` + `VerticalBlurShader` from `three/addons/shaders/`, second at 0.4x blur); the result is the `map` of a transparent plane at the floor. Because the sheet is vertex-deformed, the caster must be a **twin mesh** with a depth material that includes our deformation chunk, placed on its own **layer** (the shadow camera only sees that layer): `contact.js` (`ContactShadow`, `createCasterMaterial`). Two pitfalls hit while building it: (1) the blur plane must be on the shadow camera's layer too, otherwise the blur passes draw nothing and the shadow texture ends up empty; (2) the display plane needs `side: DoubleSide` and a `polygonOffset` because the example's `rotateX(+PI/2)` + `scale.y = -1` trick flips its winding. Update only while the sheet moves (or every frame during flight); 512 px RT + 2 blur passes ~ 0.3 ms desktop. Tune `darkness` 0.8-1.2 and `opacity` 0.25-0.4 (my first test was far too dark), blur 3-4, so the shadow is soft and light.
- **Self-shadowing (folds, plane wings, curls):** a real `DirectionalLight.shadow` with `PCFShadowMap` (**in 0.186 `PCFSoftShadowMap` is removed**: it warns and falls back to `PCFShadowMap`; PCF now uses a Vogel-disk + interleaved-gradient-noise filter with `shadow.radius`), 2048 px (1024 on phones), tight orthographic frustum (+/-0.3 m), `bias -0.0004`, `normalBias 0.0008`. The deformed mesh needs `mesh.customDepthMaterial = createPaperDepthMaterial(shared)` (a `MeshDepthMaterial` with the same deformation and the tear `discard`). In 0.186 shadow maps use native depth textures, so no depth packing is needed. In the headless test the PCF edge looked fairly hard even at `radius = 4`; judge on a real GPU, and fall back to `VSMShadowMap` (soft by construction, `blurSamples`) if needed. Make **only the sheet** `castShadow` and let the contact shadow be the floor shadow (set `floor.receiveShadow = false`), which avoids shadow-acne on the white floor.
- `PCSS`-style variable penumbra is not worth it here; the contact shadow's depth-based alpha already gives contact hardening.

### 2.12 Anti-aliasing and post-processing that stays fast
- **Default: no composer.** `new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })` (MSAA on the default framebuffer; cheap on tile-based mobile GPUs), `NeutralToneMapping` in the material pipeline, `dithering` where needed. Vignette and film grain as **CSS overlays** (a fixed `<div>` with a radial-gradient and a small tiled noise PNG/SVG-filter with `mix-blend-mode: multiply/soft-light`, opacity 0.04-0.08): zero GPU cost, always sharp, trivially disabled for reduced motion. (The ERASER-1 sibling site does a full hand-written TAA/bokeh/bloom chain; for a white sheet that is a lot of cost for no visible gain.)
- **If a composer is wanted** (a depth-of-field in the macro beat, a LUT): `new EffectComposer(renderer, new WebGLRenderTarget(w, h, { type: HalfFloatType, samples: 4 }))` + `RenderPass` + `ShaderPass`es + `OutputPass` (tone mapping + sRGB at the end). **The `samples: 4` is what keeps MSAA** (a plain composer target is not anti-aliased). Tested in the import-map page (renders fine). Avoid `UnrealBloomPass` (multi-mip blur chain; white paper would bloom everywhere). `SMAAPass` (+65 kB of JS) is a fallback if MSAA targets are not wanted.

### 2.13 Extreme-macro fibres and the ink microscope
- **Macro of the fibre network:** the macro layer of 2.8 is the answer; add DOF-like softness with the camera `near` plane and a tiny `fov`, not a post pass; move the camera to ~1-2 cm and rake the light. An orthographic top-down "microscope" view with a mask circle in CSS (`clip-path: circle()`) is cheaper than any lens effect.
- **Ink spreading through fibres (prototyped both ways):**
  - *Simulation (`ink.js`, ping-pong half-float RTs, anisotropic diffusion tensor aligned with a fibre-orientation field, capillary threshold)*: it works and conserves mass, but **explicit diffusion is far too slow** for a visible blot: with the stability limit `dt * (Dxx + Dyy) < 0.5` the blot radius was ~6 px after 400 steps on a 512 grid (sigma ~ sqrt(2 D dt n)); it would need thousands of steps, it cannot be scrubbed backwards by scroll, and it needs `EXT_color_buffer_float` (present on virtually all current phones but not guaranteed). I do not recommend it for scroll-driven use.
  - ***Recommended: closed-form "ink front" (`ink-front.js`, one fragment shader, no state).*** Ink coverage is a function of (position, progress `t`): a ragged blot of radius `0.16 + 0.34 sqrt(t)` mm (edge roughened with FBM of angle and position), plus **70 procedural fibres drawn in the same loop**, each of which carries ink along its own line for `wickLen * t` beyond the blot when it crosses it (the feathery tendrils), darker core (`exp(-r/R)`), paper mottling and a microscope vignette. Verified at t = 0.05 / 0.35 / 1.0: a believable bleed that is perfectly scrubbable and costs ~70 iterations/pixel (use it only inside the microscope viewport or at half resolution on phones). The designer can tune fibre width (12-24 um), count, and add a second, fainter "halo" blot for the damp-paper edge.

### 2.14 Summary of costs (to the best of my knowledge; real-device numbers still to be measured by the web-developer)
| Item | GPU cost | Memory |
|---|---|---|
| Sheet slab, 84 x 119 (mobile) / 128 x 181 (desktop) | 40.8k / 93k triangles, ~3x deform ALU per vertex | < 3 MB geometry |
| Deformation (12 folds + bend + pleat, x3 for normals) | trivial | - |
| Crumple wad op (44 planes + 14 creases + 2 Voronoi, x3) | the heavy one; enable only for the CTA beat | - |
| Fibre tile 1024 RG8 + mips | one-off pass | ~2.8 MB |
| Macro tile 1024 RG8 + mips | one-off | ~2.8 MB |
| Formation 256 RGBA8 | negligible | 0.35 MB |
| Paint RT 1536 x 2172 RGBA8 + mips (only on the drawing section) | per frame: one instanced draw + mip regen | ~17.8 MB (1024 x 1448: 7.9 MB for phones) |
| Studio PMREM | one-off at load | ~0.5-1 MB |
| Contact shadow (512 RT x 2 + blurs) | ~0.3 ms | 2 MB |
| Shadow map 2048 (1024 on phones) | one extra depth pass of the sheet | 16 MB (4 MB) |
| Translucency | a few ALU per light | - |

---------------------------------------------------------------------------------------------------


## 3. Drawing on a 3D surface (pencil cursor; prototyped end to end)

**Pipeline:** pointer -> rest-space UV on the sheet -> stroke smoothing -> GPU brush into a render target -> the paper material samples that RT at `vRest / uSheet + 0.5` -> `diffuseColor = mix(diffuse, graphite, alpha)`. Files: `picking.js`, `paint.js`, and the `uPaint` hook in `paper.js`.

### 3.1 Pointer -> UV
- **Flat or rigidly posed sheet (the writing section):** plain ray/plane. `ray = raycaster.setFromCamera(ndc, cam)`; transform the ray into the mesh's object space (`mesh.worldToLocal`), intersect the plane z = 0, `u = x/0.210 + 0.5`, `v = y/0.297 + 0.5`. Free, exact, no GPU. Use this if the drawing section keeps the sheet flat (recommended: ease any bend/flutter to 0 while the user draws).
- **Any deformed pose: GPU picking (tested).** `three.Raycaster` is wrong on a vertex-shader-deformed mesh (it intersects the undeformed geometry). Instead render the sheet only (layer 2, twin mesh with a pick material that includes the deformation chunk) into a **4 x 4 px render target** through a camera narrowed to the pointer pixel with `camera.setViewOffset(W, H, px - 2, py - 2, 4, 4)`; the fragment writes rest UV as **12-bit pairs packed in RGBA8** (R = u>>4, G = v>>4, B = (u&15)<<4 | (v&15), A = 255 top face / 128 bottom face / 0 miss; 12 bits = 0.05 mm on A4) and `renderer.readRenderTargetPixelsAsync` (exists in 0.186; requires RGBA + UnsignedByte, as used) reads one pixel back with no pipeline stall (result 1-2 frames late; only one pick in flight). Tested: flat sheet centre -> (0.501, 0.501), edges correct, off-sheet -> miss, and on a curled pose the centre pick correctly hit the *underside* of the curled flap (`side = -1`). The pick camera must copy the main camera (`copy(camera, false)`) and call `setViewOffset` per pick.
- Touch: `pointerdown/move/up` with `touch-action: none` on the canvas **only while the drawing section is active** (otherwise scrolling is broken); use `event.getCoalescedEvents()` for high-rate input; `setPointerCapture`.

### 3.2 Painting target: GPU brush into a render target (not a CanvasTexture)
- A `CanvasTexture` whose `needsUpdate` is set every pointer move re-uploads the whole canvas (a 1536 x 2172 RGBA canvas is 13 MB per upload): jank on phones. Instead: `WebGLRenderTarget(1536, 2172, { depthBuffer:false, generateMipmaps:true, minFilter: LinearMipmapLinear })` (1024 x 1448 on phones), brush segments drawn as **one instanced draw per frame** (`InstancedBufferGeometry`, per-instance `aA, aB, aPr` = segment endpoints and pressure), `NormalBlending`, `autoClear = false`. Batch everything: my first version drew each segment separately and was dramatically slower because **three regenerates the whole mip chain after every render into a mip-mapped RT**; one flush per frame = one mip regen.
- Brush fragment: capsule distance to the segment in **millimetres** (so the pencil is round regardless of the 210:297 aspect), soft edge (`hard 0.35`), and graphite grain from the paper's own fibre tile (`texture2D(uTooth, p/30mm)`; graphite catches on the ridges: `grain = 0.5 + 1.6*(g.x*0.7 + g.y*0.7) + 0.5*hash`, alpha = `core * pressure * smoothstep(0.15, 0.85, grain) * 0.55`), colour (0.045, 0.045, 0.05) linear. Repeated strokes get darker (normal blending accumulates), like real pencil.
- Material hook: in the fragment, after `color_fragment`: `if (uPaintOn > 0.5 && vShell > 0.5) { vec4 pc = texture2D(uPaint, vRest/uSheet + 0.5); diffuseColor.rgb = mix(diffuseColor.rgb, pc.rgb, pc.a); }` (`vShell` = the top/bottom varying, so only the front face shows the drawing). The ink-blue accent works the same way with a different brush colour. Optional: lower roughness a touch where `pc.a` is high (graphite has a faint sheen).
- **Unlimited undo (pencil only):** `PaintLayer.clear()` = one `setRenderTarget(rt); clear()`. For real undo keep the stroke list (u, v, t arrays) and replay up to N-1 strokes after clearing.
- Tested render: spiral, wavy line and a fast scribble (fast = light, thin; slow = dark, wide) with visible graphite grain at macro zoom.

### 3.3 Stroke smoothing and pressure
- Ignore sub-0.25 mm moves; keep the last 3 points; draw a **quadratic Bezier from midpoint(p0,p1) to midpoint(p1,p2) with control p1** (C1-continuous, lags one sample), subdivided into ~0.6 mm segments. Catmull-Rom works too but overshoots at sharp turns; midpoint quadratics never do.
- **Pressure from speed** (no stylus needed): `speed = dist_mm / dt_ms`; `target = clamp(1.15 - 0.9*speed, 0.35, 1)`; low-pass 0.35 per sample; pressure scales radius (0.55-1.0) and alpha. If `event.pressure > 0 && event.pointerType === 'pen'`, use it instead.
- Pencil cursor: CSS `cursor: none` + a fixed-position SVG pencil element following the pointer with `transform: translate3d`, tilted ~20 degrees, hotspot at the tip (CSS custom cursors with images are limited to ~128 px and look blurry on high-DPI); hide it for `pointer: coarse`.

### 3.4 Performance
Per frame while drawing: one instanced draw of up to a few dozen segments into the RT (< 0.1 ms) + one mip regen of the RT (~0.2-0.5 ms on desktop, more on phones; skip the mip regen by setting `generateMipmaps=false` and `minFilter=LinearFilter` while the sheet is large on screen and the drawing is the foreground). Throttle `flush()` to rAF. Memory in 2.14.

---------------------------------------------------------------------------------------------------

## 4. Scroll choreography: Lenis 1.3.26 + GSAP 3.15.0 ScrollTrigger driving one persistent scene

### 4.1 The integration (tested: wheel scrolling, pin, scrub, horizontal gallery all produced the expected progress values)
```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, /* syncTouch false: native touch scrolling */ });
lenis.on('scroll', ScrollTrigger.update);                 // ScrollTrigger reads the smoothed position
gsap.ticker.add((t) => lenis.raf(t * 1000));              // ONE clock: GSAP's ticker drives Lenis (seconds -> ms)
gsap.ticker.lagSmoothing(0);                              // no catch-up jumps in scrubbed animations
// render the 3D scene from the SAME ticker, after the scroll update (see 4.3)
gsap.ticker.add(renderFrame);
```
Do not also pass `autoRaf: true` (it would run a second rAF loop). `lenis.css` must be linked (`html.lenis body { height:auto }`, see section 6). Lenis honours `prefers-reduced-motion` by default (`respectReducedMotion: true`: lerp forced to 1, programmatic scrolls instant; `lenis.prefersReducedMotion` to read it).

### 4.2 One master timeline vs per-section triggers: use both, with a state object
- Keep a single plain object `S` (the "scene state": `S.fold`, `S.curl`, `S.camera`, `S.crumple`, `S.pencil`, ...). **ScrollTriggers only write into `S`** (never into three objects). The render function maps `S` -> uniforms/transforms.
- For the global camera path/hero choreography use **one master timeline scrubbed over the whole page**: `gsap.timeline({ scrollTrigger: { trigger: 'main', start: 0, end: 'max', scrub: 0.6 } })`. **Pitfall (verified):** `end: 'bottom bottom'` of a wrapper computed *before* later pins add their spacer under-counts the page height, and the timeline finishes early (progress 1.0 at 1800 px of 4200 px in my test). `end: 'max'` (= `ScrollTrigger.maxScroll`) fixed it (progress = scrollY / 4200). Alternatively create triggers in DOM order and call `ScrollTrigger.refresh()` after pins exist.
- For each section use its own trigger with `scrub: true` (or `scrub: 0.3` for a light smoothing) writing section-local progress (`S.fold = self.progress`), plus `onEnter/onLeave` to toggle section modes (e.g. "drawing active": enable pointer capture, flatten the sheet).
- **Overlapping sections cross-fade** best with the "reset then claim" frame pattern seen in the ERASER-1 sibling site: each frame, reset the shared state to defaults, then every visible section **adds a weighted claim** (`weight = smoothstep` of its own scroll ratio). That gives seamless transitions with no per-pair handoff code, and scrubbing backwards is automatically correct because nothing is stateful.
- Pinning: `pin: true` on a full-height section for the dwell moments (the edge-on "0.1 mm", the A4 -> A6 halving); use `anticipatePin: 1` only if you see a pin jump on iOS. `pinSpacing` default is fine. Do not pin the canvas itself: the canvas is `position: fixed` and never moves.

### 4.3 Keeping DOM and canvas in sync
- **Same clock, order matters:** Lenis updates the scroll in `gsap.ticker` callback #1, ScrollTrigger updates through the `scroll` event, and the render function runs in the **next ticker callback**, so the frame uses this frame's scroll. Never `requestAnimationFrame` a separate render loop next to the GSAP ticker (two clocks = jitter between DOM text and the 3D sheet).
- **Why not read `window.scrollY` in the render function?** With native touch scrolling the browser scrolls on the compositor thread and the value read in rAF can lag one frame; Lusion's own write-up ("WebGL-Scroll-Sync", MIT, read in full) describes this and their trick (an `absolute` canvas that is re-offset to the scroll position every rAF so it physically scrolls with the page between frames, plus ~25 % vertical padding of rendered pixels to hide the clip). For aviva the 3D sheet floats in screen space, so a fixed canvas + Lenis-smoothed state is enough; **use their trick only for elements that must stay locked to a DOM box on touch devices**.
- `scrub: 0.5-1` on ScrollTrigger gives easing/inertia in the *animation values* (so the sheet glides to its new pose rather than snapping to the scroll position) and hides the one-frame lag. For uniform values that jump (e.g. fold progress), additionally damp in the render function: `x += (target - x) * (1 - Math.exp(-dt * 10))`.
- Resize: `ScrollTrigger.refresh()` after fonts/images load (`document.fonts.ready`) and on `ResizeObserver` of `main`; call `lenis.resize()` only if you disable `autoResize`.

### 4.4 Horizontal-scroll gallery inside a vertical page (tested)
```js
const track = document.querySelector('#track');
gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none',
  scrollTrigger: { trigger: '#gal', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth),
                   pin: true, scrub: true, invalidateOnRefresh: true, onUpdate: (st) => { S.gallery = st.progress; } } });
```
Measured on a 4-panel, 800 x 600 test: page height grew from 4 x 600 to 4800 (= pin spacer 2400), the track transform was -300 / -1200 / -2100 / -2400 px at scroll 1500 / 2400 / 3300 / 3900. `invalidateOnRefresh` + function-based values keep it correct after resize/orientation change. For the origami gallery the 3D forms can be positioned from the DOM cards' rects each frame (`el.getBoundingClientRect()` cached in a `ResizeObserver`, not read during scroll).

### 4.5 Mobile specifics
- Keep **native touch scrolling** (Lenis `syncTouch: false`, the default): iOS momentum feels right and the address bar collapses normally. `syncTouch: true` mimics inertia but README warns it can be unstable on iOS < 16.
- **Address-bar resize:** the viewport height changes by ~60-100 px when the bar collapses; do **not** resize the WebGL canvas for height-only changes under ~120 px on touch devices (it reallocates the drawing buffer and the picture jumps). Size the canvas with `lvh`/`innerHeight` once, and listen to `resize` only for width changes or large height changes (orientation). ScrollTrigger already ignores small mobile height resizes by default on touch (`ignoreMobileResize`, verified in `ScrollTrigger.js`: it refreshes only if the width changed or the height changed by > 25 %).
- Use `100svh` for pinned DOM sections that should never be taller than the visible area, `100lvh` for the fixed canvas.
- `ScrollTrigger.normalizeScroll(true)` is not needed with Lenis; do not enable both.
- Nested scrollers (the paper "BibTeX" code box): `data-lenis-prevent` on that element, or `allowNestedScroll: true`.
- iOS/Safari caps rAF at 60 fps and 30 fps in low-power mode: do not tune for 120 Hz.

### 4.6 Reduced motion
`const reduce = matchMedia('(prefers-reduced-motion: reduce)')`. When true: Lenis smoothing is already off; do not create the scrubbed master timeline; instead create per-section `ScrollTrigger`s with `onEnter` that **set the sheet to the section's final pose directly** (or cross-fade between pre-rendered poses), no flutter, no camera drift, no continuous rotation, no particles; keep colour/typography. `gsap.matchMedia()` is the clean way: `mm.add('(prefers-reduced-motion: no-preference)', () => { /* full choreography */ }); mm.add('(prefers-reduced-motion: reduce)', () => { /* calm version */ });` (it auto-reverts when the setting changes). Render **on demand** in this mode (only when the pose changes).

---------------------------------------------------------------------------------------------------

## 5. Performance on phones, fallbacks, reduced motion, shader compilation, context loss

### 5.1 Device tiers and DPR (no CDN: do not use a benchmark-data library unless you self-host its data)
`@pmndrs/detect-gpu` classifies GPUs from benchmark data fetched from unpkg by default (self-hosting that data is supported via `benchmarksURL`), too heavy for our budget. Use a cheap three-signal heuristic plus a runtime governor:
```js
const mobile = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad/.test(navigator.userAgent);
const lowMem = (navigator.deviceMemory ?? 4) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4;   // deviceMemory is Chromium-only
const tier = mobile ? (lowMem ? 0 : 1) : 2;
const maxDpr = [1.0, 1.5, 2.0][tier];                    // CLAUDE.md rule: 2 desktop, 1.5 mobile
const segW = [70, 84, 128][tier], segH = Math.round(segW * 297 / 210);
const shadowSize = [0, 1024, 2048][tier];                // tier 0: contact shadow only
```
- **Runtime governor:** measure the average frame time over 1 s; if > 24 ms (< ~40 fps) for 2 consecutive seconds, drop `renderer.setPixelRatio` by 0.25 steps down to 1.0; if still slow, disable the macro layer, the translucency loop, then self-shadowing; never go back up within a session (avoids oscillation). Three's `renderer.info.render.triangles` and `performance.now()` are enough; no extra library.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, maxDpr))`; `powerPreference: 'high-performance'`; on phones `antialias: true` is usually cheap, but test on a low-end device and fall back to `antialias:false` + FXAA at tier 0.
- Vertex uniform budget: my deformation chunk uses ~48 (folds) + 44 (facets) + 14 (creases) + ~12 = ~120 vec4. `MAX_VERTEX_UNIFORM_VECTORS` is guaranteed >= 256 in WebGL2 but three's own lights/matrices use some; **check `renderer.capabilities.maxVertexUniforms`** (SwiftShader reports 4096; real phones are usually >= 1024) and drop `MAX_FOLDS`/`N_FACETS` (or move facets into a small `DataTexture`) if it reports < 256.
- Memory: build textures at 512 px on tier 0; dispose generators' render-target scene objects after use (`geometry.dispose(); material.dispose()` as in `makeFibreTileGPU`); `renderer.info.memory` to watch.

### 5.2 Rendering on demand and pausing
- Pause when hidden: `document.addEventListener('visibilitychange', () => { document.hidden ? gsap.ticker.sleep() : gsap.ticker.wake(); })` (GSAP's ticker already stops on a hidden tab via rAF; make it explicit and also stop the Lenis raf: it is in the same ticker).
- **On-demand rendering:** keep a `dirty` flag; set it from ScrollTrigger callbacks (`lenis.on('scroll')`), pointer events, and any running tween (GSAP `onUpdate`). In `renderFrame`, `if (!dirty && !lenis.isScrolling && !animating) return;` and clear it after rendering. A static sheet then costs zero GPU (battery!). Also render once on `resize`.
- `IntersectionObserver`-gate the macro/ink shader: when its section is off screen, skip the ink pass.
- Avoid per-frame allocations (`new Vector3` in the loop): reuse temporaries (the ERASER-1 repo enforces "zero allocation in the frame loop"; good practice for mobile GC).

### 5.3 Shader compilation hitches
- `await renderer.compileAsync(scene, camera)` (exists in 0.186; uses `KHR_parallel_shader_compile` where available, otherwise compiles synchronously with a console warning, as seen in headless) **behind the loader**: it compiles every material in the scene, including `customDepthMaterial`s and shadow variants. Objects that appear later (the crumple variant, the picking twin, torn pieces) must be in the scene (`visible = true`, or `scene.add` with `frustumCulled` false) during that call, or call `compileAsync` again on them when their section is a screen away.
- Use stable `material.customProgramCacheKey` strings (done in the prototype) so variants compile once; toggling `#define`s at runtime recompiles (hitch): prefer uniforms.
- Generate textures (fibre/macro/formation, PMREM) during the loader; the loader's line-drawing animation (A4 outline with dimension lines) hides it.

### 5.4 WebGL fallback
1. Detect: `const canvas = document.createElement('canvas'); const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });` (also accepted by `new THREE.WebGLRenderer({ failIfMajorPerformanceCaveat: true })` in 0.186; this option typically refuses software renderers, which is what the cloud screenshot tool uses (SwiftShader), so do NOT set it when a `?force=1` query flag is present, or the headless screenshots will show the fallback; untested here). three 0.186 needs WebGL2 (`WebGL.isWebGL2Available()` in `three/addons/capabilities/WebGL.js`).
2. If it fails (or `navigator.connection?.saveData` is true): add `document.documentElement.classList.add('no-webgl')`; CSS shows a **static composition** per section: pre-rendered poster images of the sheet in each pose, produced by `tools/shoot.mjs`/the lab page with the real renderer and committed as small WebP (< 60 KB each), cross-faded by `IntersectionObserver` or simply stacked in the DOM flow. The DOM content, copy and the research-paper link all work without WebGL (rule 5).
3. Wrap the three init in `try/catch`; on exception run the same fallback and `console.warn` once.

### 5.5 Context loss
three 0.186 handles it internally: `onContextLost` calls `preventDefault()` (so the browser may restore) and sets a flag that makes `renderer.render` a no-op (line `if (_isContextLost === true) return;`); `onContextRestore` re-initialises GL state and keeps shadow-map settings. **What it does not restore is your own render-target content**: the paint layer strokes, ink RTs, the generated fibre/macro render-target textures and the PMREM environment must be regenerated: listen on `renderer.domElement` for `webglcontextrestored` and re-run `makeFibreTileGPU`, `pmrem.fromScene`, contact-shadow update, and replay the stroke list (keep it, see 3.2). Test with `renderer.forceContextLoss()` / `renderer.forceContextRestore()` (and `WEBGL_lose_context` in DevTools).

### 5.6 Other robustness
- `renderer.domElement.addEventListener('webglcontextlost', ...)` -> show the poster fallback until restored.
- Fonts: `document.fonts.ready` before `ScrollTrigger.refresh()` (layout shifts move triggers).
- Keyboard users: the canvas is decorative (`aria-hidden="true"`); do not trap focus; the drawing section needs a keyboard alternative (a "type a line" button that draws a pre-baked stroke).
- `Page Visibility` + `pagehide`: dispose big RTs on `pagehide` if bfcache matters.

---------------------------------------------------------------------------------------------------


## 6. Self-hosting the libraries (verified against `node_modules`)

### 6.1 Versions and licences

| Package | Version (npm latest 2026-10-01 == installed) | Licence | Licence file shipped in the npm tarball? |
|---|---|---|---|
| three | 0.186.1 | MIT ("Copyright 2010-2026 Three.js Authors") | yes: `node_modules/three/LICENSE` |
| lenis | 1.3.26 | MIT (darkroom.engineering) | yes: `node_modules/lenis/LICENSE` |
| gsap | 3.15.0 | **Standard "No Charge" GSAP License** (package.json `"license": "Standard 'no charge' license: https://gsap.com/standard-license"`) | **No LICENSE file in the tarball.** The licence is referenced from every file header (`@license Copyright 2008-2026, GreenSock. All rights reserved. Subject to the terms at https://gsap.com/standard-license`) and from `README.md` |

**GSAP licence, exactly** (text of the "Standard 'No Charge' GSAP License", effective April 30, 2025, read from the ScanCode licence database on GitHub since gsap.com is blocked here: `aboutcode-org/scancode-toolkit/.../gsap-standard-no-charge-2025.LICENSE`; the gsap README confirms "GSAP is now 100% FREE including ALL of the bonus plugins ... even for commercial use", thanks to Webflow):
- **Grant:** Webflow grants a non-exclusive, worldwide licence "to use, reproduce, display, and implement GSAP Products solely for Permitted Uses". **Permitted Uses** = use "on any website, web application, or digital interface by any person or entity" (including companies competing with Webflow in other areas).
- **Prohibited Uses:** using GSAP "in tools that allow users to build visual animations without code that encourages, induces, or materially assists in creating a solution that competes with Webflow's visual animation building capabilities". **Restrictions:** no Prohibited Uses without written consent; no reverse-engineering GSAP to create Competitive Products (visual animation builders); **do not remove or alter proprietary notices or branding** from GSAP products.
- **Verdict for aviva:** a free public parody website is a plain Permitted Use. Self-hosting copies of the files is "reproduce/display/implement". Obligation: keep the `/*! ... @license ... */` headers intact in the copied files (do not strip them when minifying; esbuild's `--legal-comments=inline` keeps `/*!` comments). Webflow may update the licence; the licence says updates will not materially degrade use. Because the tarball has no LICENSE file, ship `docs/vendor/gsap/LICENSE.txt` containing: the licence name, the URL, the effective date, and the three restrictions above (summary, with the URL as the authority), and list GSAP in `docs/CREDITS.md`.
- Not an OSI open-source licence. Do not describe aviva's vendor folder as "all MIT": say "three and lenis: MIT; gsap: GreenSock Standard No-Charge License".

### 6.2 What to copy (all paths verified; every relative import inside the copied files resolves)

```
docs/vendor/
  three/three.module.js        (imports ./three.core.js, so BOTH are needed; there is no three.module.min.js in 0.186)
  three/three.core.js
  three/LICENSE
  three/addons/...             mirror of node_modules/three/examples/jsm/<path>; addons do `from 'three'` and relative imports
  gsap/index.js  gsap-core.js  CSSPlugin.js  ScrollTrigger.js  Observer.js   (+ LICENSE.txt we write)
  lenis/lenis.mjs  lenis.css  LICENSE
```
- `gsap/index.js` imports `./gsap-core.js` and `./CSSPlugin.js`; it exports `gsap` (named and default). `ScrollTrigger.js` imports only `./Observer.js` and exports `ScrollTrigger` (named + default). Do NOT use `gsap/all.js` (pulls in every plugin).
- `lenis.mjs` has no imports, `export { Lenis as default }`. The package `exports` map points `lenis` to `dist/lenis.mjs`. Do not use `lenis.min.js` (UMD, global) with the import map.
- Addons proposed (transitive imports resolved by the script; sizes unminified): `environments/RoomEnvironment` (5 kB), `postprocessing/EffectComposer + RenderPass + ShaderPass + OutputPass` (+ Pass, MaskPass, `shaders/CopyShader`, `shaders/OutputShader`) (~30 kB), `shaders/HorizontalBlurShader` + `VerticalBlurShader` (1 kB each; the contact shadow), `utils/BufferGeometryUtils` (38 kB), `misc/GPUComputationRenderer` (14 kB; only if a ping-pong simulation is wanted: my recommended ink effect does not need it), `math/ImprovedNoise` (3 kB; CPU-side noise, e.g. baking a crumple). The prototype itself imports only `three` (no addons) except the blur shaders. Optional: `SMAAPass` (+SMAAShader, 65 kB; not needed when the composer target is multisampled), `UnrealBloomPass` (avoid), `lights/RectAreaLightUniformsLib` (**315 kB** of LTC tables: skip), `loaders/GLTFLoader`.
- Not needed (we generate everything in code): any loader, `three.webgpu.js`, `three.tsl.js`, `three.cjs`.
- Verified pitfall: `lenis.css` contains `html.lenis, html.lenis body { height: auto; }`, which **overrides a `body { height: 400vh }`**: the page then has no scroll height. Give the scroll height to a wrapper element (`<main>`), never to `body`.

### 6.3 Size budget (measured)

| | raw | gzip -9 | esbuild-minified | minified + gzip |
|---|---|---|---|---|
| three.core.js | 1,458,113 | 286,358 | 389,591 | 104,062 |
| three.module.js | 662,772 | 130,745 | 376,181 | 92,224 |
| gsap-core + CSSPlugin + Observer + ScrollTrigger + index | 376,373 | ~109,000 | 116,787 | ~48,000 |
| lenis.mjs | 33,166 | 8,236 | 18,714 | 5,446 |
| all of docs/vendor (script output) | ~2.7 MB | | **~0.94 MB (JS)** | **~257 KB gz (all JS together, one stream)** |

Raw copies are 2.4 MB of JS on the wire if the host did not compress; GitHub Pages does gzip JS/CSS/HTML, but **the local `python3 -m http.server` and Playwright tests do not**, so the `shoot.mjs` download-size number would show 2.4 MB for the raw vendor. **Recommendation: minify the vendor files** with esbuild (`MINIFY=1`, the script default): licence banners survive, GLSL template strings are untouched, and the page loads the same code (I ran the full import-map test with both variants). This leaves >2 MB of the ~3 MB budget for textures/fonts. (Add `esbuild` as a devDependency in package.json, or the script falls back to `npx --yes esbuild@0.28.2`.)

### 6.4 Working import map (tested in headless Chromium, SwiftShader WebGL2, **under a sub-path `/sub/path/` to mimic a GitHub Pages project site**)

```html
<link rel="stylesheet" href="./vendor/lenis/lenis.css">
<script type="importmap">
{ "imports": {
  "three":         "./vendor/three/three.module.js",
  "three/addons/": "./vendor/three/addons/",
  "gsap":          "./vendor/gsap/index.js",
  "gsap/":         "./vendor/gsap/",
  "lenis":         "./vendor/lenis/lenis.mjs"
} }
</script>
<script type="module">
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import Lenis from 'lenis';
</script>
```
- The import map must come **before** any module script and be inline or an external `<script type="importmap" src>`; relative values resolve against the page URL (inline map) so `./vendor/...` works at `/` and at `/aviva/` alike. `index.html` lives in `docs/`, so `./vendor` is right for it; a page in `docs/lab/` needs its own map with `../vendor/...`, or use root-relative paths only if the site is served from the domain root (not on a GitHub project page).
- Result of the test page (`work/scripts/importmap-test.mjs` + a scratch page): `THREE.REVISION "186"`, `WebGL 2.0`, EffectComposer with a 4x MSAA half-float target + OutputPass rendered, `GSAP 3.15.0`, `ScrollTrigger 3.15.0`, Lenis wheel scrolling moved `scrollY` 0 -> 1800 and a scrubbed ScrollTrigger tween reached 1.0. No console errors (only the favicon 404 of my scratch page).

### 6.5 Copy script

`work/scripts/copy-vendor.sh` (written and tested; web-developer runs `bash work/scripts/copy-vendor.sh` from the repo root after `npm install`; optional arg = destination, default `docs/vendor`; `MINIFY=0` for plain copies). It: copies and minifies three + chosen addons with their transitive imports (resolved by an inline node snippet, fails loudly on a missing/unresolved import), copies the five gsap ESM files, writes `gsap/LICENSE.txt`, copies lenis + css + LICENSE. Edit the `ADDONS=( ... )` array to add addons.


## Appendix A: the prototype (all files in `work/scripts/paper-proto/`, scratch only; nothing in `docs/`)

| File | What it is |
|---|---|
| `paper.js` | geometry (top/bottom/walls), the deformation GLSL chunk, `MeshPhysicalMaterial` patch (fibre + macro layers, translucency, tear, paint hook), depth material, `fold2D`/`setFolds`, `dartPlaneFolds`, `halvingFolds`, crumple facets, `createPaper()` |
| `paper-textures.js` | CPU fibre generator (slow, reference) and **GPU fibre tile generator**, formation tile |
| `studio.js` | PMREM studio environment scene |
| `contact.js` | `ContactShadow` + deformation-aware caster material |
| `picking.js` | GPU rest-UV picking |
| `paint.js` | instanced GPU pencil brush with smoothing and pressure |
| `ink-front.js` / `ink.js` | closed-form scrubbable ink bleed (recommended) / ping-pong diffusion (not recommended) |
| `index.html` | scene driven by query params, e.g. `?pose=dart&t=5`, `?pose=curl&t=0.7&rad=0.03`, `?pose=crumple&t=0.85&fov=22&sw=128&sh=181`, `?pose=tear&t=1.6`, `?pose=fan&g=0.6&open=3.2`, `?pose=flat&draw=1`, `?macro=1`, `?back=5&key=0&env=0&trans=0.3`, `?contact=1`, `?pick=1`, `&bg=%23707782&nofloor=1` for silhouette inspection |
| `montage.mjs`, `shoot.mjs`, `stitch.mjs`, `shoot-ink.mjs` | Playwright helpers (SwiftShader launch flags copied from `tools/shoot.mjs`) |

Run it: `bash work/scripts/copy-vendor.sh /tmp/lab/vendor && ln -s "$PWD/work/scripts/paper-proto" /tmp/lab/proto && python3 -m http.server 8130 --directory /tmp/lab` then open `http://localhost:8130/proto/index.html?pose=dart&t=7` (the import map in `index.html` uses `../vendor/...`). `node work/scripts/paper-proto/montage.mjs out.png 3 600 480 "<query>" "<query>" ...` renders several poses into one image (expects the server on :8130). This code is a research sketch for the visual-designer (look) and the web-developer (integration); it is written for our own project and uses no Lusion code. It is not production-hardened (e.g. the CPU texture generator is slow, picking assumes a single sheet, the proto's debug flags are minimal).

## Appendix B: what I could not verify / gaps
1. **Oryzo BTS Parts 1-7 (blog.lusion.co) could not be read** (egress block); Parts 4-7 ("WebGL/ThreeJS Tricks 1-4") may or may not be published; nothing in this file claims to describe their content. Readable Lusion repos: `ORYZO-1` (assets only) and `WebGL-Scroll-Sync` (summarised in section 1 and 4.3).
2. **Real-GPU and real-phone performance** is unmeasured (headless SwiftShader only). All frame-time statements are estimates from workload size, flagged as such.
3. The **crumple** is "good in motion, acceptable as a resting ball", not "photoreal"; the offline-bake alternative is described but not built.
4. Shadow softness of PCF in 0.186 could not be judged reliably under SwiftShader.
5. gsap.com, webflow.com, threejs.org docs, Codrops, discourse.threejs.org were blocked; GSAP licence text was read from the ScanCode licence database copy on GitHub (identical title/date to the published licence) and cross-checked with the `README.md` and `package.json` in the npm tarball; Webflow can change it ("Amendments" clause: revised terms apply to later versions; earlier versions may be kept).

## Appendix C: sources
- Lusion `WebGL-Scroll-Sync` (MIT): https://github.com/lusionltd/WebGL-Scroll-Sync ; `ORYZO-1`: https://github.com/lusionltd/ORYZO-1 ; Oryzo BTS Part 1 / Part 3 URLs (not fetchable here): https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction , https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations
- ERASER-1 sibling (raw three.js + Lenis, TAA, reset-then-claim): https://github.com/hamzahossainX/Product-in-motion
- Crumpled paper with Houdini VAT: https://github.com/jarolinplasencio18-web/paper-crumple-demo (fork of item-develop/paper-crumple-demo; Codrops article 2026-09-19 by Toi Nagasawa, not fetchable)
- Origami Simulator (Ghassaei, Demaine, Gershenfeld): https://github.com/amandaghassaei/OrigamiSimulator , https://amandaghassaei.com/projects/origami_simulator/
- three.js contact shadow example source: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/webgl_shadow_contact.html ; three.js source chunks read locally in `node_modules/three/src/renderers/shaders/` (meshphysical, normal_fragment_*, lights_fragment_*, shadowmap_pars_fragment, envmap_physical_pars_fragment) and `.../webgl/WebGLShadowMap.js`
- Translucency: Barre-Brisebois and Bouchard, "Approximating Translucency for a Fast, Cheap and Convincing Subsurface Scattering Look", GDC 2011 (https://frostbite.com/frostbite/news/approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look); three.js ships a `SubsurfaceScatteringShader` based on it
- Khronos PBR Neutral tone mapper: https://github.com/KhronosGroup/ToneMapping (announced 2024-05-16; supported by three.js as `NeutralToneMapping`)
- Lenis: https://github.com/darkroomengineering/lenis (README in `node_modules/lenis/README.md`); GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ ; GSAP licence: https://gsap.com/community/standard-license/
- detect-gpu: https://github.com/pmndrs/detect-gpu ; three.js context loss notes: https://discourse.threejs.org/t/webglcontextrestored-event-not-fired/27316
- Codrops/Lusion background (not fetchable): https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/ 
