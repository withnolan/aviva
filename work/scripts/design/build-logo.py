#!/usr/bin/env python3
"""Draw the aviva wordmark, logomark and lockup as SVG (docs/assets/logo/).

    python work/scripts/design/build-logo.py <HankenGrotesk[wght].ttf> [--preview out.html]

The wordmark is Hanken Grotesk at a variable weight between Light and Regular (WGHT below), re-spaced by hand
(per-pair gaps measured between outlines, not side-bearings) and with one change to the drawing: the tittle of
the i is a portrait 1 : sqrt(2) rectangle, exactly as wide as the stem. The dot on the i is a sheet of A4.
Each letter is its own <path> with an id (wm-a1, wm-v1, wm-i, wm-i-dot, wm-v2, wm-a2) so the floor decal and
any animation can address letters. Units: font units (1000 per em), y up converted to SVG y down.
"""
import json
import math
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.environ.get('LOGO_OUT', os.path.join(ROOT, 'docs', 'assets', 'logo'))

WGHT = int(os.environ.get('LOGO_WGHT', 340))           # between Light (300) and Regular (400): calm at 4 m wide on the floor, still firm at 16 px
# Gaps between letter outlines, in font units, measured at the x-height band (hand-tuned by eye).
GAPS = {('a', 'v'): 50, ('v', 'i'): 58, ('i', 'v'): 58, ('v', 'a'): 40}
if os.environ.get('LOGO_GAPS'):
    _g = json.loads(os.environ['LOGO_GAPS']); GAPS = {('a', 'v'): _g[0], ('v', 'i'): _g[1], ('i', 'v'): _g[2], ('v', 'a'): _g[3]}
SQRT2 = math.sqrt(2)
GRAPHITE = '#2A2926'


def glyph_path(gs, name, dx):
    """SVG path for a glyph, translated by dx and flipped so y grows downwards from the baseline."""
    pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    gs[name].draw(TransformPen(pen, (1, 0, 0, -1, dx, 0)))
    return pen.getCommands()


def bounds(gs, name):
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    return bp.bounds  # xMin, yMin, xMax, yMax (y up)


def layout(font_path):
    f = instancer.instantiateVariableFont(TTFont(font_path), {'wght': WGHT})
    gs = f.getGlyphSet()
    seq = [('a', 'a'), ('v', 'v'), ('i', 'dotlessi'), ('v', 'v'), ('a', 'a')]
    ids = ['wm-a1', 'wm-v1', 'wm-i', 'wm-v2', 'wm-a2']
    x = 0.0
    letters = []
    prev = None
    for (key, gname), gid in zip(seq, ids):
        xmin, ymin, xmax, ymax = bounds(gs, gname)
        if prev is None:
            dx = -xmin                       # first outline starts at x = 0
        else:
            dx = prev['right'] + GAPS[(prev['key'], key)] - xmin
        letters.append({'id': gid, 'key': key, 'glyph': gname, 'dx': dx, 'left': dx + xmin, 'right': dx + xmax,
                        'top': ymax, 'bottom': ymin, 'd': glyph_path(gs, gname, dx)})
        prev = letters[-1]
    stem = letters[2]
    stem_w = stem['right'] - stem['left']
    dot_w = stem_w
    dot_h = dot_w * SQRT2
    cap = f['OS/2'].sCapHeight              # 697: the tittle tops out at cap height, as the original dot does
    dot = {'id': 'wm-i-dot', 'x': stem['left'], 'y': -cap, 'w': dot_w, 'h': dot_h}
    width = letters[-1]['right']
    xh = f['OS/2'].sxHeight
    return {'letters': letters, 'dot': dot, 'width': width, 'cap': cap, 'xheight': xh,
            'descent': min(l['bottom'] for l in letters)}


def r(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


def wordmark_paths(L, fill='currentColor'):
    out = []
    for l in L['letters']:
        out.append(f'<path id="{l["id"]}" d="{l["d"]}"/>')
    d = L['dot']
    out.insert(3, f'<rect id="{d["id"]}" x="{r(d["x"])}" y="{r(d["y"])}" width="{r(d["w"])}" height="{r(d["h"])}"/>')
    return f'<g fill="{fill}">' + ''.join(out) + '</g>'


def svg_doc(view, body, title, extra=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" role="img" aria-label="{title}"{extra}>'
            f'<title>{title}</title>{body}</svg>\n')


def crop_marks(x, y, w, h, gap, arm, stroke, color='currentColor'):
    """Printer's crop marks for the trim box (x, y, w, h): two arms per corner, outside the box, not touching."""
    lines = []
    for cx, sx in ((x, -1), (x + w, 1)):
        for cy, sy in ((y, -1), (y + h, 1)):
            # horizontal arm, on the trim line y = cy, running away from the box
            lines.append((cx + sx * gap, cy, cx + sx * (gap + arm), cy))
            # vertical arm, on the trim line x = cx
            lines.append((cx, cy + sy * gap, cx, cy + sy * (gap + arm)))
    p = ' '.join(f'M{r(a)} {r(b)}H{r(c)}' if b == d else f'M{r(a)} {r(b)}V{r(d)}' for a, b, c, d in lines)
    return f'<path d="{p}" fill="none" stroke="{color}" stroke-width="{r(stroke)}" stroke-linecap="butt"/>'


MARK_W, MARK_H = 26, 30     # portrait grid for the logomark
MARK = {'h': 14, 'gap': 2, 'arm': 6, 'stroke': 1.5}   # trim box 14 tall (1 : sqrt 2), arms 3x the gap


def logomark(stroke=None, color='currentColor', m=MARK):
    """The logomark on a 26 x 30 grid: an empty 1 : sqrt(2) trim box marked by printer's crop marks.
    Arms are three times the gap, so the eight strokes read as the extended edges of a sheet, not a ring."""
    h = m['h']
    w = h / SQRT2
    x = (MARK_W - w) / 2
    y = (MARK_H - h) / 2
    return crop_marks(x, y, w, h, m['gap'], m['arm'], stroke or m['stroke'], color), (x, y, w, h)


def main():
    font_path = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)
    L = layout(font_path)
    W = L['width']
    asc = L['cap']
    desc = -L['descent']
    # 1. wordmark: tight box, baseline at y = 0 inside the viewBox
    pad = 0
    view = f'{r(-pad)} {r(-asc - pad)} {r(W + 2 * pad)} {r(asc + desc + 2 * pad)}'
    with open(os.path.join(OUT, 'wordmark.svg'), 'w') as fh:
        fh.write(svg_doc(view, wordmark_paths(L), 'aviva'))
    # 2. floor wordmark: graphite, generous padding so mip-mapped blur never clips (see 05 §6)
    fpad = W * 0.04
    fview_h = asc + desc + 2 * fpad
    fview = f'{r(-fpad)} {r(-asc - fpad)} {r(W + 2 * fpad)} {r(fview_h)}'
    with open(os.path.join(OUT, 'wordmark-floor.svg'), 'w') as fh:
        fh.write(svg_doc(fview, wordmark_paths(L, GRAPHITE), 'aviva (floor decal)'))
    # 3. logomark
    mark, box = logomark()
    with open(os.path.join(OUT, 'logomark.svg'), 'w') as fh:
        fh.write(svg_doc(f'0 0 {MARK_W} {MARK_H}', mark, 'aviva logomark: crop marks around an empty A4'))
    # 4. lockup: mark left of wordmark, mark height = LOCK_SCALE x cap height, centred on the x-height midline
    k = float(os.environ.get('LOCK_SCALE', 1.18)) * asc / MARK_H      # font units per mark unit
    mark_h = MARK_H * k
    gap = float(os.environ.get('LOCK_GAP', 0.30)) * asc                 # space between the crop-mark arms and the a
    ty = -L['xheight'] / 2 - mark_h / 2
    body = (f'<g transform="translate(0 {r(ty)}) scale({r(k)})">{mark}</g>'
            f'<g transform="translate({r(MARK_W * k + gap)} 0)">{wordmark_paths(L)}</g>')
    lw = MARK_W * k + gap + W
    top = min(ty, -asc)
    bot = max(ty + mark_h, desc)
    with open(os.path.join(OUT, 'lockup.svg'), 'w') as fh:
        fh.write(svg_doc(f'0 {r(top)} {r(lw)} {r(bot - top)}', body, 'aviva'))
    meta = {
        'weight': WGHT, 'gaps': {f'{a}{b}': v for (a, b), v in GAPS.items()}, 'units_per_em': 1000,
        'width': round(W, 1), 'cap_height': asc, 'x_height': L['xheight'], 'descent': round(desc, 1),
        'letters': [{k: (round(v, 1) if isinstance(v, float) else v) for k, v in l.items() if k in ('id', 'left', 'right')} for l in L['letters']],
        'i_dot': {k: round(v, 1) if isinstance(v, float) else v for k, v in L['dot'].items()},
        'floor_viewbox': fview,
    }
    with open(os.path.join(OUT, 'wordmark-metrics.json'), 'w') as fh:
        json.dump(meta, fh, indent=1)
    print(json.dumps(meta, indent=1))


if __name__ == '__main__':
    main()
