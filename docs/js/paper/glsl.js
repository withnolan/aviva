// glsl.js: every GLSL chunk of the aviva paper sheet, as strings.
//
// One deformation function, paperDeform(rest), shapes the sheet. It runs in the vertex shader of the visible
// material, the shadow-depth material, the contact-shadow caster and the GPU picker, so shadows and pointer hits
// always follow the bent / folded sheet. Normals are forward differences of the same function.
//
//   rest (m) -> cockle (tiny waviness) -> folds / curls / dog-ear / peel (one hinge primitive with a bend radius,
//   optional cone taper and rest-space mask) -> pleats + fan -> cylindrical bend -> twist -> flutter
//
// Units: metres. Rest frame: x in [-W/2, W/2], y in [-H/2, H/2], z = 0, front face normal +z.

export const MAX_FOLDS = 12;

/* ------------------------------------------------------------------------------------------------ noise */
export const NOISE = /* glsl */`
float pp_h13(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float pp_h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float pp_vn3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(pp_h13(i), pp_h13(i + vec3(1,0,0)), f.x), mix(pp_h13(i + vec3(0,1,0)), pp_h13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(pp_h13(i + vec3(0,0,1)), pp_h13(i + vec3(1,0,1)), f.x), mix(pp_h13(i + vec3(0,1,1)), pp_h13(i + vec3(1,1,1)), f.x), f.y), f.z); }
float pp_vn2(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(pp_h12(i), pp_h12(i + vec2(1,0)), f.x), mix(pp_h12(i + vec2(0,1)), pp_h12(i + vec2(1,1)), f.x), f.y); }
float pp_fbm2(vec2 p){ return 0.5 * pp_vn2(p) + 0.3 * pp_vn2(p * 2.07 + 3.1) + 0.2 * pp_vn2(p * 4.31 + 7.7); }
`;

/* ------------------------------------------------------------------------------------------------ deformation (vertex) */
export const DEFORM_PARS = /* glsl */`
#define PAPER_MAX_FOLDS ${MAX_FOLDS}
uniform vec2  uSheet;                      // W, H (m)
uniform float uHalfThick;                  // effective half thickness (m): CPU = 0.5 * max(thickness, 1.2 px)
uniform float uDeformEps;                  // forward-difference step in rest space (m), ~0.5 cell
uniform int   uFoldCount;
uniform vec4  uFoldQ[PAPER_MAX_FOLDS];     // xyz: point on the hinge, w: bend radius (m)
uniform vec4  uFoldA[PAPER_MAX_FOLDS];     // xyz: hinge axis (unit), w: signed angle (rad)
uniform vec4  uFoldM[PAPER_MAX_FOLDS];     // xyz: unit direction to the MOVING side, w: 1 = use rest mask
uniform vec4  uFoldR[PAPER_MAX_FOLDS];     // xyz: rest mask (apply if dot(rest, xy) + z > 0), w: cone taper (1/m)
uniform vec4  uBend;                       // x: curvature (1/m), y: bend-line angle (rad), z: twist (rad/m along y), w: -
uniform vec4  uPleat;                      // x: period (m), y: gamma (rad), z: fan opening (rad/m), w: fan pivot (m)
uniform vec4  uFlutter;                    // x: amplitude (m), y: frequency (1/m), z: time, w: seed
uniform vec4  uCockle;                     // x: amplitude (m), y: frequency (1/m), z: seed
uniform vec3  uShift;                      // a rigid shift after everything (the crumple slides onto the ball's centre)
${NOISE}
void paperFold(inout vec3 p, vec2 rest, vec4 Q, vec4 A, vec4 M, vec4 R) {
  float th = A.w; if (abs(th) < 1e-5) return;
  if (M.w > 0.5 && dot(rest, R.xy) + R.z < 0.0) return;
  vec3 a = A.xyz, m = M.xyz;
  vec3 u = normalize(cross(a, m)) * sign(th);
  vec3 d = p - Q.xyz; float s = dot(d, m); if (s <= 0.0) return;
  float g = dot(d, a), h = dot(d, u);
  float r = max(Q.w * (1.0 + R.w * g), 1e-4);          // cone taper: the radius grows along the axis (corner curls)
  float t = abs(th);
  float phi = min(s / r, t), tail = max(s - r * t, 0.0);
  vec3 tT = m * cos(t) + u * sin(t);
  vec3 nPhi = u * cos(phi) - m * sin(phi);
  p = Q.xyz + a * g + m * (r * sin(phi)) + u * (r * (1.0 - cos(phi))) + tT * tail + nPhi * h;
}
vec3 paperDeform(vec2 rest) {
  vec3 p = vec3(rest, 0.0);
  if (uCockle.x > 0.0) {                               // a real sheet is never perfectly flat: sub-mm waviness
    vec2 q = rest * uCockle.y;
    p.z += uCockle.x * ((pp_vn3(vec3(q, uCockle.z)) - 0.5) * 1.4 + (pp_vn3(vec3(q * 2.3, uCockle.z + 7.0)) - 0.5) * 0.6);
  }
  for (int i = 0; i < PAPER_MAX_FOLDS; i++) { if (i >= uFoldCount) break; paperFold(p, rest, uFoldQ[i], uFoldA[i], uFoldM[i], uFoldR[i]); }
  if (uPleat.y > 1e-4) {                               // accordion pleats (arc-length preserving) + optional fan opening
    float w = uPleat.x, g = uPleat.y, sx = p.x + 0.5 * uSheet.x, i = floor(sx / w), f = sx - i * w;
    float up = mod(i, 2.0) < 0.5 ? 1.0 : -1.0;
    float x0 = i * w * cos(g), z0 = (up > 0.0 ? 0.0 : w * sin(g));
    p.x = x0 + f * cos(g) - 0.5 * uSheet.x * cos(g); p.z += z0 + up * f * sin(g);
    if (uPleat.z > 1e-4) { float ang = p.x * uPleat.z, rr = uPleat.w + (p.y + 0.5 * uSheet.y); p.x = sin(ang) * rr; p.y = cos(ang) * rr - uPleat.w - 0.5 * uSheet.y; }
  }
  if (abs(uBend.x) > 1e-4) {                           // cylindrical bend about a line through the centre
    vec2 ax = vec2(cos(uBend.y), sin(uBend.y)), nr = vec2(-ax.y, ax.x);
    float s = dot(p.xy, nr), k = uBend.x, an = s * k;
    p.xy = ax * dot(p.xy, ax) + nr * (sin(an) / k); p.z += (1.0 - cos(an)) / k;
  }
  if (abs(uBend.z) > 1e-4) { float a = p.y * uBend.z, c = cos(a), sn = sin(a); p.xz = vec2(c * p.x - sn * p.z, sn * p.x + c * p.z); }
  if (uFlutter.x > 0.0) {
    vec2 q = p.xy * uFlutter.y;
    p.z += uFlutter.x * ((pp_vn3(vec3(q, uFlutter.z + uFlutter.w)) - 0.5) * 1.6 + (pp_vn3(vec3(q * 1.9 + 4.0, uFlutter.z * 1.3)) - 0.5) * 0.5);
  }
  return p + uShift;
}
void paperSurface(vec2 rest, out vec3 P, out vec3 N) {
  float e = uDeformEps;
  P = paperDeform(rest);
  vec3 Pu = paperDeform(rest + vec2(e, 0.0)), Pv = paperDeform(rest + vec2(0.0, e));
  N = normalize(cross(Pu - P, Pv - P));
}
`;

// Vertex body: computes `paperPos` (object space) and `paperNormal`, plus the varyings.
// aShell = (side, outX, outY, wallV): side +1 top / -1 bottom / 0 edge wall; (outX, outY) outward rest direction; wallV +-1.
export const DEFORM_VERTEX = /* glsl */`
vec3 paperP, paperN; paperSurface(position.xy, paperP, paperN);
vec3 paperPos, paperNormal;
if (aShell.x != 0.0) { paperPos = paperP + paperN * (aShell.x * uHalfThick); paperNormal = paperN * aShell.x; }
else {
  vec3 o = paperDeform(position.xy + aShell.yz * uDeformEps) - paperP; o = normalize(o - paperN * dot(o, paperN));
  paperPos = paperP + paperN * (aShell.w * uHalfThick); paperNormal = o;
}
vRest = position.xy; vShell = aShell.x;
`;

export const VERTEX_VARYINGS = /* glsl */`
attribute vec4 aShell;
varying vec2 vRest; varying float vShell; varying vec3 vPaperWorld;
`;

/* ------------------------------------------------------------------------------------------------ tear (shared by all fragment variants) */
export const TEAR_PARS = /* glsl */`
uniform vec4 uTear0; uniform vec4 uTear1;          // xy: unit normal (rest), z: offset (m), w: side kept (+1/-1), 0 = no line
uniform vec4 uTearFx0; uniform vec4 uTearFx1;      // x: tear front along the line (m, from the line's start), y: gap (m), z: jag amplitude (m), w: jag frequency (1/m)
float pp_th2(vec2 p){ p = fract(p * vec2(.1031, .1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float pp_tn2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(pp_th2(i), pp_th2(i + vec2(1,0)), f.x), mix(pp_th2(i + vec2(0,1)), pp_th2(i + vec2(1,1)), f.x), f.y); }
// signed distance (m) to the jagged tear line; > 0 on the side the normal points to. along = coordinate along the line.
float tearDist(vec2 r, vec4 L, vec4 F, out float along) {
  vec2 n = L.xy, t = vec2(-n.y, n.x);
  along = dot(r, t);
  float j = F.z * ((pp_tn2(vec2(along * F.w, 1.7)) - 0.5) * 2.0 + 0.45 * (pp_tn2(vec2(along * F.w * 3.7, 5.3)) - 0.5) * 2.0
                 + 0.18 * (pp_tn2(r * F.w * 11.0) - 0.5) * 2.0);
  return dot(r, n) - L.z + j;
}
// returns > 0 when the fragment is kept; band = 0..1 closeness to a torn edge (raw, brighter fibres)
float tearKeep(vec2 r, float pxm, out float band) {
  band = 0.0; float keep = 1.0;
  for (int k = 0; k < 2; k++) {
    vec4 L = k == 0 ? uTear0 : uTear1; vec4 F = k == 0 ? uTearFx0 : uTearFx1;
    if (L.w == 0.0) continue;
    float along; float d = tearDist(r, L, F, along) * L.w;
    // the torn stretch is along < front; ahead of the front both pieces meet exactly (complementary)
    float torn = 1.0 - smoothstep(F.x - 0.004, F.x, along);
    float gap = F.y * torn * smoothstep(F.x, F.x - 0.05, along);
    float fz = (pp_tn2(r * 2600.0) - 0.5) * 0.0005 * torn + (pp_tn2(r * 900.0) - 0.5) * 0.0004 * torn;   // fibrous fringe
    float s = d - 0.5 * gap + fz;
    keep = min(keep, s);
    band = max(band, torn * (1.0 - smoothstep(0.0, max(0.0011, 1.5 * pxm), max(s, 0.0))));
  }
  return keep;
}
`;

/* ------------------------------------------------------------------------------------------------ fragment pars (paper look) */
export const PAPER_FRAG_PARS = /* glsl */`
varying vec2 vRest; varying float vShell; varying vec3 vPaperWorld; varying vec3 vPaperFaceN;
uniform vec2 uSheet;
uniform vec3 uKeyDir;                              // world direction toward the key light (the cut edge shades like the lit face)
uniform vec3 uPaperColor;                          // linear albedo
uniform float uGain;                               // per-sheet light gain (drying-line focus etc.)
uniform sampler2D uTooth;  uniform vec4 uToothP;   // x tile (m), y strength, zw bottom-face offset (tiles)
uniform sampler2D uMacro;  uniform vec4 uMacroP;   // x tile (m), y strength, z amount 0..1, w texels per tile
uniform sampler2D uFormation; uniform vec4 uFormP; // xy offset (sheet uv), z mottle amount, w back-face offset
uniform vec4 uEdgeP;                               // x bevel width (px), y bevel strength, z wall brightness, w tear band brightness
uniform vec4 uTransP;                              // x amount, y forward glow, z environment share, w watermark amount
uniform vec3 uTransTint;
uniform sampler2D uWatermark; uniform vec4 uWatermarkRect;   // xy centre (m, rest), zw size (m)
uniform sampler2D uPaint; uniform vec4 uPaintP;    // x on, y face (+1 / -1 / 0 both), z ghost (0.12), w darkness
uniform vec3 uGraphite;
uniform vec4 uInkDot; uniform vec3 uInkColor; uniform vec3 uInkDeep;  // dot: xy (m), z radius (m), w amount
uniform vec4 uBleed;                               // xy centre (m, rest), z progress 0..1, w amount
uniform sampler2D uFloorPrint; uniform vec4 uFloorRect;      // xy origin (world xz), zw size (m)
uniform vec4 uShow; uniform vec3 uShowTint;        // x amount, y floor height (world y), z gap range (m), w lod per mm
uniform vec4 uMarks;                               // x crease-line darkening, y graphite map lines (s06 v0.1), z dimension lines, w unused
${TEAR_PARS}
${NOISE}
mat3 paperTBN(vec3 eye, vec3 N, vec2 uv) {
  vec3 q0 = dFdx(eye), q1 = dFdy(eye); vec2 st0 = dFdx(uv), st1 = dFdy(uv);
  vec3 q1p = cross(q1, N), q0p = cross(N, q0);
  vec3 T = q1p * st0.x + q0p * st1.x, B = q1p * st0.y + q0p * st1.y;
  float det = max(dot(T, T), dot(B, B)); float sc = det == 0.0 ? 0.0 : inversesqrt(det);
  return mat3(T * sc, B * sc, N);
}
// ink dot, 3 mm, soaked through the fibres: ragged edge, darker rim (the drying ring), feathers along the grain
float inkDotCover(vec2 r, out float rim) {
  rim = 0.0; if (uInkDot.w <= 0.0) return 0.0;
  vec2 d = (r - uInkDot.xy) * 1000.0; d.x *= 0.93;          // mm; slightly faster along the grain (x)
  float R = uInkDot.z * 1000.0, rr = length(d), a = atan(d.y, d.x);
  float rag = R * (1.0 + 0.07 * (pp_fbm2(vec2(cos(a), sin(a)) * 2.2 + 3.0) - 0.5) + 0.05 * (pp_vn2(d * 6.0) - 0.5));
  float aa = max(fwidth(rr), 0.015);
  float c = 1.0 - smoothstep(rag - aa - 0.04, rag + aa, rr);
  float feather = (1.0 - smoothstep(rag, rag + 0.35, rr)) * smoothstep(0.55, 0.9, pp_vn2(vec2(d.x * 2.0, d.y * 9.0))) * 0.55;
  rim = smoothstep(rag * 0.62, rag * 0.97, rr) * c;
  return clamp(max(c, feather), 0.0, 1.0) * uInkDot.w;
}
`;

/* ------------------------------------------------------------------------------------------------ the ink front (The Bleed) */
// Closed form, scrubbable: coverage of ink at position p (mm, relative to the drop) for progress t in 0..1.
// A ragged blot growing ~sqrt(t), plus tendrils that wick along the real fibres of the macro tile: each texel of the
// fibre-geometry map stores its top fibre (centre offset, angle, half length), so the ink climbs the fibres you see.
export const INK_FRONT = /* glsl */`
uniform sampler2D uFibreGeo; uniform vec4 uFibreGeoP;   // x tile (mm), y max offset (mm), z max half length (mm), w enabled
// returns vec3(body coverage 0..1, damp halo 0..1, core weight 0..1)
vec3 inkFront(vec2 p, float t, float Rmax) {
  float r = length(p), a = atan(p.y, p.x);
  float R = Rmax * (0.04 + 0.96 * sqrt(clamp(t, 0.0, 1.0)));
  float rag = 1.0 + 0.16 * (pp_fbm2(vec2(cos(a), sin(a)) * 1.7 + 2.0) - 0.5) + 0.08 * (pp_fbm2(p / Rmax * 9.0) - 0.5);
  float Re = R * rag;
  float aa = max(fwidth(r), Rmax * 0.002);
  float blot = 1.0 - smoothstep(Re - aa * 1.5 - R * 0.015, Re + aa, r);
  float wick = 0.0;
  if (uFibreGeoP.w > 0.5) {
    vec4 g = texture2D(uFibreGeo, p / uFibreGeoP.x);
    if (g.a > 0.02) {
      vec2 off = (g.rg * 2.0 - 1.0) * uFibreGeoP.y;            // this texel's fibre centre, relative to the texel (mm)
      float ang = g.b * 3.14159265; vec2 dir = vec2(cos(ang), sin(ang));
      float hl = g.a * uFibreGeoP.z;                            // half length (mm)
      vec2 fc = p + off;                                        // fibre centre (mm, drop frame)
      float s0 = clamp(dot(-fc, dir), -hl, hl);                 // point of the fibre closest to the drop centre
      vec2 cl = fc + dir * s0; float dist = length(cl);
      float rag2 = 1.0 + 0.16 * (pp_fbm2(normalize(cl + 1e-5) * 1.7 + 2.0) - 0.5);
      float Rf = R * rag2;
      if (dist < Rf) {
        float chord = sqrt(max(Rf * Rf - dist * dist, 0.0));
        float sp = dot(p - fc, dir);
        float speed = 0.45 + 0.75 * abs(dir.x);                 // capillary flow is faster along the grain (x)
        float reach = chord + Rmax * 0.55 * t * speed * (0.6 + 0.8 * fract(g.b * 37.0 + g.a * 11.0));
        wick = 1.0 - smoothstep(reach - Rmax * 0.02, reach, abs(sp - s0));
        wick *= smoothstep(-hl, -hl + 0.02, sp) * (1.0 - smoothstep(hl - 0.02, hl, sp));
      }
    }
  }
  float halo = (1.0 - smoothstep(Re, Re * 1.22 + Rmax * 0.02, r)) * (1.0 - blot) * smoothstep(0.0, 0.15, t);
  float core = exp(-r / max(R * 0.45, 1e-4));
  return vec3(max(blot, wick), halo, core);
}
`;
