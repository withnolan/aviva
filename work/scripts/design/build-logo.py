#!/usr/bin/env python3
"""Draw the AVIVA wordmark, logomark, lockup and floor decal as SVG (docs/assets/logo/). v2: capitals (decision #30).

    python3 work/scripts/design/build-logo.py <HankenGrotesk[wght].ttf>
    env: LOGO_WGHT (default 340)  LOGO_STEM (V|I closest approach, default 72)  LOGO_DIAG (A|V, default 68)  LOGO_OUT

AVIVA is a palindrome and A, V and I are symmetric letters, so the word is built mirror-symmetric about the I:
the two A's are one drawing, the two V's are one drawing, and the spacing on either side of the I is identical.

Spacing follows the type designer's rule for capitals, measured between the real ink profiles (not side-bearings or
bounding boxes): a straight stem next to a diagonal (V|I, I|V) is set by its closest approach, at the top of the V;
two parallel diagonals (A|V, V|A) are set by the even band between them, a little tighter, because a band of white
reads wider than a point. (Averaging the white across the cap height was tried and rejected: the open triangle under
V|I let the V's arms touch the I.)
Each letter is its own <path> (wm-a1, wm-v1, wm-i, wm-v2, wm-a2) so animations and the floor decal can address
letters. Units: font units (1000 per em), y up converted to SVG y down, baseline at y = 0.
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
from fontTools.pens.recordingPen import DecomposingRecordingPen

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.environ.get('LOGO_OUT', os.path.join(ROOT, 'docs', 'assets', 'logo'))
WGHT = float(os.environ.get('LOGO_WGHT', 340))     # a touch above Light: calm at display size, firm in the 18 px nav
STEM = float(os.environ.get('LOGO_STEM', 72))     # closest approach, a straight stem next to a diagonal (font units)
DIAG = float(os.environ.get('LOGO_DIAG', 68))      # closest approach between two parallel diagonals (font units)
SQRT2 = math.sqrt(2)
GRAPHITE = '#2A2926'


def r(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


def glyph_path(gs, name, dx):
    pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    gs[name].draw(TransformPen(pen, (1, 0, 0, -1, dx, 0)))
    return pen.getCommands()


def bounds(gs, name):
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    return bp.bounds


def segments(gs, name, steps=10):
    """The glyph outline flattened to line segments (font units, y up)."""
    rp = DecomposingRecordingPen(gs)
    gs[name].draw(rp)
    segs, start, cur = [], None, None

    def quad(p0, p1, p2):
        out = []
        for i in range(1, steps + 1):
            t = i / steps
            out.append(((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]))
        return out

    for op, args in rp.value:
        if op == 'moveTo':
            start = cur = args[0]
        elif op == 'lineTo':
            segs.append((cur, args[0])); cur = args[0]
        elif op == 'qCurveTo':
            pts = list(args)
            on = pts[-1]
            offs = pts[:-1]
            p0 = cur
            for i, c in enumerate(offs):                 # implied on-curve points between consecutive off-curve points
                nxt = on if i == len(offs) - 1 else ((c[0] + offs[i + 1][0]) / 2, (c[1] + offs[i + 1][1]) / 2)
                for q in quad(p0, c, nxt):
                    segs.append((p0, q)); p0 = q
            cur = on
        elif op == 'curveTo':
            p1, p2, p3 = args
            p0 = cur
            for i in range(1, steps + 1):
                t = i / steps
                q = tuple((1 - t) ** 3 * p0[k] + 3 * (1 - t) ** 2 * t * p1[k] + 3 * (1 - t) * t * t * p2[k] + t ** 3 * p3[k] for k in (0, 1))
                segs.append((cur, q)); cur = q
            cur = p3
        elif op in ('closePath', 'endPath'):
            if start is not None and cur != start:
                segs.append((cur, start))
            cur = start
    return segs


def profile(segs, ys):
    """For each y: (leftmost x, rightmost x) of the ink, or None where the row is empty."""
    out = []
    for y in ys:
        xs = []
        for (x0, y0), (x1, y1) in segs:
            if (y0 <= y < y1) or (y1 <= y < y0):
                xs.append(x0 + (y - y0) * (x1 - x0) / (y1 - y0))
        out.append((min(xs), max(xs)) if xs else None)
    return out


def closest(prof_l, prof_r, dx):
    """Closest horizontal approach between the left glyph's right profile and the right glyph's left profile (moved by dx)."""
    return min(b[0] + dx - a[1] for a, b in zip(prof_l, prof_r) if a is not None and b is not None)


def layout(font_path):
    f = instancer.instantiateVariableFont(TTFont(font_path), {'wght': WGHT})
    gs = f.getGlyphSet()
    cap = f['OS/2'].sCapHeight
    ys = [cap * (i + 0.5) / 60 for i in range(60)]
    prof = {g: profile(segments(gs, g), ys) for g in ('A', 'V', 'I')}
    seq = ['A', 'V', 'I', 'V', 'A']
    ids = ['wm-a1', 'wm-v1', 'wm-i', 'wm-v2', 'wm-a2']
    letters, prev = [], None
    for g, gid in zip(seq, ids):
        xmin, ymin, xmax, ymax = bounds(gs, g)
        if prev is None:
            dx = -xmin
        else:
            target = STEM if 'I' in (prev['g'], g) else DIAG
            left = [None if p is None else (p[0] + prev['dx'], p[1] + prev['dx']) for p in prof[prev['g']]]
            dx = target - closest(left, prof[g], 0.0)                 # closest approach is linear in dx
        letters.append({'id': gid, 'g': g, 'dx': dx, 'left': dx + xmin, 'right': dx + xmax, 'top': ymax, 'bottom': ymin, 'd': glyph_path(gs, g, dx)})
        prev = letters[-1]
    # mirror check: the space on both sides of the I must match (it does by construction: same glyphs, same solve)
    width = letters[-1]['right']
    return {'letters': letters, 'width': width, 'cap': cap, 'top': max(l['top'] for l in letters), 'bottom': min(l['bottom'] for l in letters), 'font': f}


def wordmark_paths(L, fill='currentColor'):
    return f'<g fill="{fill}">' + ''.join(f'<path id="{l["id"]}" d="{l["d"]}"/>' for l in L['letters']) + '</g>'


def svg_doc(view, body, title, extra=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" role="img" aria-label="{title}"{extra}>'
            f'<title>{title}</title>{body}</svg>\n')


def crop_marks(x, y, w, h, gap, arm, stroke, color='currentColor'):
    """Printer's crop marks for the trim box (x, y, w, h): two arms per corner, outside the box, not touching."""
    lines = []
    for cx, sx in ((x, -1), (x + w, 1)):
        for cy, sy in ((y, -1), (y + h, 1)):
            lines.append((cx + sx * gap, cy, cx + sx * (gap + arm), cy))
            lines.append((cx, cy + sy * gap, cx, cy + sy * (gap + arm)))
    p = ' '.join(f'M{r(a)} {r(b)}H{r(c)}' if b == d else f'M{r(a)} {r(b)}V{r(d)}' for a, b, c, d in lines)
    return f'<path d="{p}" fill="none" stroke="{color}" stroke-width="{r(stroke)}" stroke-linecap="butt"/>'


MARK_W, MARK_H = 26, 30
MARK = {'h': 14, 'gap': 2, 'arm': 6, 'stroke': 1.5}


def logomark(stroke=None, color='currentColor', m=MARK):
    h = m['h']; w = h / SQRT2
    x = (MARK_W - w) / 2; y = (MARK_H - h) / 2
    return crop_marks(x, y, w, h, m['gap'], m['arm'], stroke or m['stroke'], color), (x, y, w, h)


def main():
    font_path = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)
    L = layout(font_path)
    W, top, bot = L['width'], L['top'], -L['bottom']           # top = cap + overshoot, bot = overshoot below the baseline
    # 1. wordmark: a tight box, baseline at y = 0
    with open(os.path.join(OUT, 'wordmark.svg'), 'w') as fh:
        fh.write(svg_doc(f'0 {r(-top)} {r(W)} {r(top + bot)}', wordmark_paths(L), 'AVIVA'))
    # 2. floor decal: graphite, padding 4 % of the width on every side so a mip-mapped blur never clips
    fpad = W * 0.04
    fview = f'{r(-fpad)} {r(-top - fpad)} {r(W + 2 * fpad)} {r(top + bot + 2 * fpad)}'
    with open(os.path.join(OUT, 'wordmark-floor.svg'), 'w') as fh:
        fh.write(svg_doc(fview, wordmark_paths(L, GRAPHITE), 'AVIVA (floor decal)'))
    # 3. logomark (unchanged drawing)
    mark, _ = logomark()
    with open(os.path.join(OUT, 'logomark.svg'), 'w') as fh:
        fh.write(svg_doc(f'0 0 {MARK_W} {MARK_H}', mark, 'AVIVA logomark: crop marks around an empty A4'))
    # 4. lockup: the mark is LOCK_SCALE x the cap height, centred on the caps' midline; LOCK_GAP x cap to the A
    cap = L['cap']
    k = float(os.environ.get('LOCK_SCALE', 1.24)) * cap / MARK_H
    mark_h = MARK_H * k
    gap = float(os.environ.get('LOCK_GAP', 0.24)) * cap
    ty = -cap / 2 - mark_h / 2
    body = (f'<g transform="translate(0 {r(ty)}) scale({r(k)})">{mark}</g>'
            f'<g transform="translate({r(MARK_W * k + gap)} 0)">{wordmark_paths(L)}</g>')
    lw = MARK_W * k + gap + W
    t0, b0 = min(ty, -top), max(ty + mark_h, bot)
    with open(os.path.join(OUT, 'lockup.svg'), 'w') as fh:
        fh.write(svg_doc(f'0 {r(t0)} {r(lw)} {r(b0 - t0)}', body, 'AVIVA'))
    # 5. metrics for the 3D floor decal and anything that places letters
    letters = [{'id': l['id'], 'glyph': l['g'], 'left': round(l['left'], 1), 'right': round(l['right'], 1)} for l in L['letters']]
    pw, ph = W + 2 * fpad, top + bot + 2 * fpad
    uv = lambda x: round((x + fpad) / pw, 4)
    meta = {
        'version': 2, 'case': 'upper', 'weight': WGHT, 'stem_gap': STEM, 'diag_gap': DIAG, 'units_per_em': 1000,
        'width': round(W, 1), 'cap_height': cap, 'top_with_overshoot': round(top, 1), 'bottom_overshoot': round(bot, 1),
        'letters': letters,
        'floor_viewbox': fview,
        'floor_uv': {
            'note': 'u right, v down, origin top-left of wordmark-floor.png',
            'baseline_v': round((top + fpad) / ph, 4), 'cap_v': round((top - cap + fpad) / ph, 4),
            'letters_u': {l['id']: [uv(l['left']), uv(l['right'])] for l in L['letters']},
            'i_centre_u': uv((L['letters'][2]['left'] + L['letters'][2]['right']) / 2),
        },
    }
    with open(os.path.join(OUT, 'wordmark-metrics.json'), 'w') as fh:
        json.dump(meta, fh, indent=1)
    print(json.dumps({k: meta[k] for k in ('weight', 'stem_gap', 'diag_gap', 'width', 'cap_height', 'letters')}, indent=1))


if __name__ == '__main__':
    main()
