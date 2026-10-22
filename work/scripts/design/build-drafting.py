#!/usr/bin/env python3
"""build-drafting.py: the drafting-room SVGs of Part 11 (brief 5.12, 11.9 T31 and T29).

  docs/assets/illustrations/iso216-wall.svg   s05: the ISO 216 wall: A0-A8 nested from one corner, the 1 : sqrt 2
                                              diagonal through every opposite corner, A0's dimensions, and the
                                              drawing's title block in A0's own bottom-right corner (ISO 7200 style).
  docs/assets/illustrations/fold-notation.svg s06b: the dart plane's seven folds on an A4 face (210 x 297 mm user
                                              units, registered to the sheet), Yoshizawa-Randlett lines (valley =
                                              dashes, mountain = dash-dot-dot), numbered circles and fold arrows.
  docs/assets/illustrations/crease-grid.svg   s06b: the 5 mm drafting grid as a seamless 25 mm tile.

Lettering is Hanken Grotesk (docs/assets/fonts, OFL), converted to outlines and reused with <use>, so the files
render the same inline, as <img> and when drawn into a canvas texture (an SVG image cannot load web fonts).
Colours follow tokens.css v2.1 (decision #43). XML comments never contain a double hyphen.

Usage: python3 -I work/scripts/design/build-drafting.py
"""
import math
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'assets', 'illustrations')
FONT = os.path.join(ROOT, 'docs', 'assets', 'fonts', 'hanken-grotesk-var-latin.woff2')

GRAPHITE, MUTED, INK, BLUEPRINT = '#2A2926', '#615F58', '#1F1B6E', '#1D4590'

def num(v):
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


class Face:
    """One static instance of the variable font, with glyph outlines cached per size."""
    def __init__(self, key, wght):
        f = instancer.instantiateVariableFont(TTFont(FONT), {'wght': wght})
        self.key, self.gs, self.cmap, self.hmtx = key, f.getGlyphSet(), f.getBestCmap(), f['hmtx']
        self.upm = f['head'].unitsPerEm

    def advance(self, ch, size):
        return self.hmtx[self.cmap[ord(ch)]][0] * size / self.upm

    def outline(self, ch, size):
        s = size / self.upm
        pen = SVGPathPen(self.gs, ntos=lambda v: num(round(v, 1)))   # 0.1 px is plenty at 8 to 12 px
        self.gs[self.cmap[ord(ch)]].draw(TransformPen(pen, (s, 0, 0, -s, 0, 0)))
        return pen.getCommands()


class Lettering:
    """Registers each (face, size, glyph) once in <defs>; text is a row of <use x y>."""
    def __init__(self):
        self.defs = {}

    def gid(self, face, size, ch):
        k = f'{face.key}{num(size).replace(".", "_")}-{ord(ch):x}'
        if k not in self.defs:
            self.defs[k] = face.outline(ch, size)
        return k

    def width(self, face, size, text, track=0.0):
        return sum(face.advance(c, size) for c in text) + track * size * (len(text) - 1)

    def text(self, face, size, text, x, y, track=0.0, anchor='start'):
        w = self.width(face, size, text, track)
        x0 = x - (w if anchor == 'end' else w / 2 if anchor == 'middle' else 0)
        out, cx = [], x0
        for c in text:
            if c != ' ':
                out.append(f'<use href="#{self.gid(face, size, c)}" x="{num(cx)}" y="{num(y)}"/>')
            cx += face.advance(c, size) + track * size
        return ''.join(out)

    def defs_svg(self):
        return ''.join(f'<path id="{k}" d="{d}"/>' for k, d in self.defs.items() if d)


MED, REG = Face('m', 500), Face('r', 400)


def write(name, svg):
    path = os.path.join(OUT, name)
    assert '--' not in ''.join(part.split('-->')[0] for part in svg.split('<!--')[1:]), 'double hyphen in a comment'
    with open(path, 'w') as fh:
        fh.write(svg)
    print(f'{name}: {len(svg.encode()) / 1024:.1f} KB')


# ═══════════════════════════════ T31 · the ISO 216 wall (s05) ═══════════════════════════════
# Units are CSS px of the 1440 x 900 frame the drawing is designed for (k = 0.48 px per mm).
def iso_wall():
    L = Lettering()
    K = 0.48
    SIZES = [('A0', 841, 1189), ('A1', 594, 841), ('A2', 420, 594), ('A3', 297, 420), ('A4', 210, 297),
             ('A5', 148, 210), ('A6', 105, 148), ('A7', 74, 105), ('A8', 52, 74)]   # ISO 216, mm
    AX, AY = 1340.0, 96.0          # the shared corner (top right of every size): clear of the mm ruler and its readout
    W0, H0 = 841 * K, 1189 * K
    left, bottom = AX - W0, AY + H0

    rects, labels = [], []
    for i, (n, w, h) in enumerate(SIZES):
        x, y = AX - w * K, AY
        rects.append(f'<rect id="wall-{n.lower()}" data-size="{n}" data-mm="{w} x {h}" x="{num(x)}" y="{num(y)}" '
                     f'width="{num(w * K)}" height="{num(h * K)}" pathLength="1"/>')
        # each label sits at the top-left corner of the part of its size that the next size leaves free: the left
        # strip while it is wide enough (A0 to A4), then the strip under the next size (A5 to A7); A8 has no next size
        # (A5 to A7, set flush right in that strip, so the diagonal never runs through a label)
        if i + 1 < len(SIZES) and (w - SIZES[i + 1][1]) * K < 26:
            lab = L.text(MED, 9.5, n, AX - 5, AY + SIZES[i + 1][2] * K + 12.5, 0.06, 'end')
        else:
            lab = L.text(MED, 9.5, n, x + 5, y + 13.5, 0.06)
        labels.append(f'<g id="wall-label-{n.lower()}">{lab}</g>')
    # A0, the reference, carries its size; the others follow from the note in the title block
    dims_txt = [L.text(MED, 9, '841 × 1189 mm', left + 5, AY + 27, 0.06)]

    # the diagonal: every size's opposite corner lies on one line of slope sqrt 2 (ISO rounding moves A8's by < 0.4 px)
    ext = 10
    ux, uy = -W0 / math.hypot(W0, H0), H0 / math.hypot(W0, H0)
    x8, y8 = AX - SIZES[-1][1] * K, AY + SIZES[-1][2] * K      # it starts at A8's corner, clear of the smallest labels
    diag = (f'<path id="wall-diagonal" d="M{num(x8)} {num(y8)}L{num(left + ux * ext)} {num(bottom + uy * ext)}" '
            f'stroke-dasharray="14 3 2 3"/>')
    ratio_y = 343
    ratio = L.text(MED, 9.5, '1 : √2', AX - (ratio_y - AY) / math.sqrt(2) + 9, ratio_y, 0.06)

    # the title block, in A0's own bottom-right corner and exactly as wide as A1 (594 mm)
    tw, r1, r2, r3 = 594 * K, 30, 36, 26
    tx, ty = AX - tw, bottom - (r1 + r2 + r3)
    mark_w = 34
    tb = (f'<path d="M{num(tx)} {num(bottom)}V{num(ty)}H{num(AX)}'
          f'M{num(tx)} {num(ty + r1)}H{num(AX)}M{num(tx)} {num(ty + r1 + r2)}H{num(AX)}M{num(AX - mark_w)} {num(ty)}V{num(ty + r1)}"/>')
    pad = 9
    title = L.text(MED, 11.5, 'SHEET SIZES A0–A8', tx + pad, ty + 19.5, 0.08)
    src1 = L.text(REG, 9.5, 'AFTER LICHTENBERG (1786),', tx + pad, ty + r1 + 15, 0.06)
    src2 = L.text(REG, 9.5, 'DIN 476 (1922) AND ISO 216 (1975)', tx + pad, ty + r1 + 28, 0.06)
    note = L.text(REG, 10, 'A0 = 1 m². Each size is half the one before.', tx + pad, ty + r1 + r2 + 17)
    s = 20 / 30                                                      # the logomark at 20 px tall
    mx, my = AX - mark_w / 2 - 13 * s, ty + r1 / 2 - 15 * s
    mark = (f'<path transform="translate({num(mx)} {num(my)}) scale({num(s)})" stroke-width="1.5" stroke-linecap="butt" '
            'd="M6.05 8H0.05M8.05 6V0M6.05 22H0.05M8.05 24V30M19.95 8H25.95M17.95 6V0M19.95 22H25.95M17.95 24V30"/>')

    # the drawing's bounds in the 1440 x 900 frame
    bx0, by0, bx1, by1 = math.floor(left + ux * ext - 3), math.floor(AY - 4), math.ceil(AX + 4), math.ceil(bottom + uy * ext + 3)
    vb = f'{bx0} {by0} {bx1 - bx0} {by1 - by0}'
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{bx1 - bx0}" height="{by1 - by0}" role="img" aria-labelledby="wall-t wall-d">'
        '<title id="wall-t">Sheet sizes A0 to A8, nested</title>'
        '<desc id="wall-d">A technical drawing: the ISO 216 sizes A0 to A8 drawn from one shared corner, a diagonal through '
        'all their opposite corners because every size is 1 : √2, A0 marked 841 × 1189 mm, and a title block: '
        'sheet sizes A0 to A8, after Lichtenberg (1786), DIN 476 (1922) and ISO 216 (1975). A0 = 1 m². Each size is half the one before.</desc>'
        '<!-- AVIVA s05, the ISO 216 wall (brief 5.12, task T31). Built by work/scripts/design/build-drafting.py; edit the script, '
        'not this file. Units: CSS px of the 1440 x 900 frame, 0.48 px per mm. The active size: set href on #wall-active '
        'and #wall-active-label to #wall-a4 ... #wall-a8 (empty to hide); its draw-on is stroke-dashoffset 1 to 0 (every '
        'size has pathLength 1). Lettering: Hanken Grotesk (SIL OFL 1.1, see assets/fonts/OFL-HankenGrotesk.txt) as outlines. -->'
        '<style>'
        f'#wall-sizes{{fill:none;stroke:{GRAPHITE};stroke-opacity:.55;stroke-width:.75}}'
        f'#wall-sizes #wall-a0{{stroke-opacity:.8}}'
        f'#wall-labels,#wall-title{{fill:{GRAPHITE}}}#wall-src,#wall-note{{fill:{MUTED}}}'
        f'#wall-dims-txt{{fill:{BLUEPRINT}}}'
        f'#wall-diagonal{{fill:none;stroke:{BLUEPRINT};stroke-width:.75}}'
        f'#wall-tb{{fill:none;stroke:{GRAPHITE};stroke-opacity:.8;stroke-width:.75}}#wall-mark{{fill:none;stroke:{GRAPHITE}}}'
        f'#wall-active{{fill:{INK};fill-opacity:.05;stroke:{INK};stroke-width:2;stroke-dasharray:1;stroke-dashoffset:0}}'
        f'#wall-active-label{{fill:{INK}}}'
        '</style>'
        f'<defs>{L.defs_svg()}</defs>'
        f'<g id="wall-sizes">{"".join(rects)}</g>'
        f'<g id="wall-dims-txt">{"".join(dims_txt)}</g>'
        f'{diag}<g id="wall-ratio" fill="{BLUEPRINT}">{ratio}</g>'
        f'<g id="wall-labels" data-copy="s05.wall.label">{"".join(labels)}</g>'
        f'<g id="wall-tb">{tb}</g><g id="wall-mark">{mark}</g>'
        f'<g id="wall-title" data-copy="s05.wall.title">{title}<g id="wall-src">{src1}{src2}</g></g>'
        f'<g id="wall-note" data-copy="s05.wall.note">{note}</g>'
        '<use id="wall-active" href="#wall-a4"/><use id="wall-active-label" href="#wall-label-a4"/>'
        '</svg>\n')
    write('iso216-wall.svg', svg)
    return {'viewBox': vb, 'left': bx0, 'top': by0, 'width': bx1 - bx0, 'height': by1 - by0}


# ═══════════════════════════ T29 · fold notation and the 5 mm grid (s06b) ═══════════════════════════
# Units are millimetres of the A4 face (210 x 297, y down, the nose at the top centre). At 46 vh the sheet is
# 414 px tall at 900, so 1 mm = 1.394 px: 0.72 mm is a 1 px line.
PX = 297 / 414
NOSE = (105.0, 0.0)
S8, C8 = math.sin(math.pi / 8), math.cos(math.pi / 8)
FOLDS = [  # n, kind (seen from the front of the flat sheet), end point; all start at the nose (folds.js dartPlane)
    (1, 'valley', (210.0, 105.0)),                 # top right corner to the centre line, 45 deg
    (2, 'valley', (0.0, 105.0)),
    (3, 'valley', (210.0, 105 * C8 / S8)),        # the slanted edge to the centre line: 22.5 deg off it, to the edge
    (4, 'valley', (0.0, 105 * C8 / S8)),
    (5, 'mountain', (105.0, 297.0)),               # in half along the centre line, behind
    (6, 'valley', (60.0, 297.0)),                  # the wings, 45 mm out at the tail (wing = 0.045 m)
    (7, 'valley', (150.0, 297.0)),
]
VALLEY = [4.0, 2.4]                                # dashes
MOUNTAIN = [4.5, 1.5, 0.75, 1.5, 0.75, 1.5]        # dash, dot, dot (never a plain dotted line: fact-check #15)
NUM_T = {1: 0.62, 2: 0.62, 3: 0.45, 4: 0.45, 5: 0.795, 6: 0.62, 7: 0.62}   # where each number sits on its line


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def reflect(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    d = math.hypot(dx, dy); dx, dy = dx / d, dy / d
    px, py = p[0] - a[0], p[1] - a[1]
    t = px * dx + py * dy
    fx, fy = a[0] + t * dx, a[1] + t * dy
    return (2 * fx - p[0], 2 * fy - p[1])


def arrow(p0, p1, bulge, kind):
    """A Yoshizawa-Randlett fold arrow from p0 to p1: an arc; valley = a solid head, mountain = a hollow half head."""
    mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    ln = math.hypot(dx, dy)
    nx, ny = -dy / ln, dx / ln
    c = (mx + nx * bulge * ln, my + ny * bulge * ln)
    tx, ty = p1[0] - c[0], p1[1] - c[1]
    tl = math.hypot(tx, ty); tx, ty = tx / tl, ty / tl
    hl, hw = 5.6, 2.5                               # head length and half width (mm): 7.8 x 7 px on screen
    bx, by = p1[0] - tx * hl, p1[1] - ty * hl
    end = (bx + tx * 0.6, by + ty * 0.6) if kind == 'valley' else p1
    body = f'M{num(p0[0])} {num(p0[1])}Q{num(c[0])} {num(c[1])} {num(end[0])} {num(end[1])}'
    lx, ly = bx - ty * hw, by + tx * hw
    rx, ry = bx + ty * hw, by - tx * hw
    if kind == 'valley':
        head = f'<path class="fold__head" d="M{num(p1[0])} {num(p1[1])}L{num(lx)} {num(ly)}L{num(rx)} {num(ry)}Z"/>'
    else:
        head = f'<path class="fold__head fold__head--open" d="M{num(p1[0])} {num(p1[1])}L{num(lx)} {num(ly)}L{num(bx)} {num(by)}"/>'
    return f'<path class="fold__arc" d="{body}"/>{head}'


def fold_notation():
    L = Lettering()
    groups, nums = [], []
    # where each fold's moving part goes (on the flat face): start, end, bulge
    ARROWS = {
        1: ((201.0, 5.0), (111.0, 95.0), 0.2),
        2: ((9.0, 5.0), (99.0, 95.0), -0.2),
        3: ((205.0, 112.0), (112.0, 146.0), -0.25),
        4: ((5.0, 112.0), (98.0, 146.0), 0.25),
        5: ((188.0, 160.0), (22.0, 160.0), 0.18),
        6: ((22.0, 284.0), (94.0, 284.0), -0.22),
        7: ((188.0, 284.0), (116.0, 284.0), 0.22),
    }
    for n, kind, end in FOLDS:
        dash = ' '.join(num(v) for v in (VALLEY if kind == 'valley' else MOUNTAIN))
        x1, y1 = end
        # each line starts 3 mm from the nose, so the seven meet in a clean point rather than a blot of dashes
        ln = math.hypot(x1 - NOSE[0], y1 - NOSE[1]); sx, sy = lerp(NOSE, end, 3.0 / ln)
        line = f'<path class="fold__line fold__line--{kind}" d="M{num(sx)} {num(sy)}L{num(x1)} {num(y1)}" stroke-dasharray="{dash}"/>'
        a0, a1, bulge = ARROWS[n]
        groups.append(f'<g class="fold" id="fold-{n}" data-fold="{n}" data-kind="{kind}" '
                      f'data-line="{num(NOSE[0])} {num(NOSE[1])} {num(x1)} {num(y1)}">{line}'
                      f'<g class="fold__arrow">{arrow(a0, a1, bulge, kind)}</g></g>')
        cx, cy = lerp(NOSE, end, NUM_T[n])
        r = 5.75
        digit = L.text(MED, 8.2, str(n), cx, cy + 2.95, 0, 'middle')
        nums.append(f'<g class="fold-num" id="fold-num-{n}" data-fold="{n}" data-at="{num(cx)} {num(cy)}">'
                    f'<circle cx="{num(cx)}" cy="{num(cy)}" r="{r}"/><g class="fold-num__n">{digit}</g></g>')
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="293" height="414" role="img" aria-labelledby="fold-t fold-d">'
        '<title id="fold-t">The seven folds of a paper dart</title>'
        '<desc id="fold-d">An A4 sheet marked with the seven folds of a paper dart in origami notation: valley folds as '
        'dashed lines, the mountain fold as a dash-dot-dot line, each numbered in order, with fold arrows.</desc>'
        '<!-- AVIVA s06b, the crease pattern (brief 5.12, task T29). Built by work/scripts/design/build-drafting.py; edit the '
        'script, not this file. Units: millimetres of the A4 face, y down, the nose at 105 0; the lines are the seven '
        'hinges of folds.js dartPlane() on the flat sheet, seen from the front (1 to 4, 6, 7 valley; 5 mountain). '
        'States: the custom property draw (0 to 1) on a fold group reveals its line from the nose; .is-active on a fold '
        'and on its number turns them blueprint and shows the fold arrow. Lettering: Hanken Grotesk (SIL OFL 1.1) as outlines. -->'
        '<style>'
        f'.fold__line{{fill:none;stroke:{GRAPHITE};stroke-opacity:.82;stroke-width:.72;stroke-linecap:butt}}'
        '.fold{clip-path:inset(0 0 calc((1 - var(--draw, 1)) * 100%) 0)}'
        f'.fold__arrow{{display:none;fill:none;stroke:{BLUEPRINT};stroke-width:.72;stroke-linecap:round;stroke-linejoin:round}}'
        f'.fold__head{{fill:{BLUEPRINT};stroke:none}}.fold__head--open{{fill:none;stroke:{BLUEPRINT}}}'
        f'.fold.is-active .fold__line{{stroke:{BLUEPRINT};stroke-opacity:1;stroke-width:1.08}}.fold.is-active .fold__arrow{{display:inline}}'
        f'.fold-num circle{{fill:#F7F5F0;stroke:{BLUEPRINT};stroke-width:.72}}.fold-num__n{{fill:{BLUEPRINT}}}'
        f'.fold-num.is-active circle{{fill:{BLUEPRINT}}}.fold-num.is-active .fold-num__n{{fill:#F7F5F0}}'
        '#fold-sheet{display:none;fill:#F7F5F0;stroke:#D9D6CE;stroke-width:.72}'
        '</style>'
        f'<defs>{L.defs_svg()}</defs>'
        '<rect id="fold-sheet" x="0" y="0" width="210" height="297"/>'
        f'<g id="fold-lines">{"".join(groups)}</g>'
        f'<g id="fold-nums">{"".join(nums)}</g>'
        '</svg>\n')
    write('fold-notation.svg', svg)


def crease_grid():
    # a 25 mm tile, centred on a major line so it tiles without doubled edges: minor lines every 5 mm at 10 %,
    # the major (every fifth) at 20 %, graphite. Size it to the sheet's scale: 25 mm = 25 x (sheet px / 297).
    minor = ''.join(f'M{v} -12.5V12.5M-12.5 {v}H12.5' for v in (-10, -5, 5, 10))
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12.5 -12.5 25 25" width="35" height="35">'
        '<!-- AVIVA s06b, the 5 mm drafting grid (brief 5.12, task T29): a seamless 25 mm tile. Built by '
        'work/scripts/design/build-drafting.py. Repeat it at 25 x (sheet height px / 297) px per tile. -->'
        f'<path d="{minor}" fill="none" stroke="{GRAPHITE}" stroke-opacity=".1" stroke-width=".36"/>'
        f'<path d="M0 -12.5V12.5M-12.5 0H12.5" fill="none" stroke="{GRAPHITE}" stroke-opacity=".2" stroke-width=".5"/>'
        '</svg>\n')
    write('crease-grid.svg', svg)


if __name__ == '__main__':
    print('wall placement in the 1440 x 900 frame:', iso_wall())
    fold_notation()
    crease_grid()
