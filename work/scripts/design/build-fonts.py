#!/usr/bin/env python3
"""Build aviva's self-hosted web fonts into docs/assets/fonts/.

Run with a Python that has fontTools + brotli (e.g. a scratch venv):
    python work/scripts/design/build-fonts.py [cache_dir]

Sources (SIL Open Font License 1.1, from github.com/google/fonts):
  - Hanken Grotesk (variable, wght 100-900), Copyright 2021 The Hanken Grotesk Project Authors. No Reserved Font Name.
  - DM Mono Regular, Copyright 2020 The DM Mono Project Authors. No Reserved Font Name.

What it does to Hanken Grotesk (a "Modified Version" under the OFL; the name is kept because there is no RFN):
  1. Limits the weight axis to 300-500 (the three weights the site uses, plus everything in between).
  2. Re-draws the superior figures (1 2 3 4 superior) as composites of the numerator figures, so "m2" and "g/m2"
     sit at cap height instead of floating above it (the shipped glyphs top out at 907 units, cap height is 697).
  3. Adds U+2082 SUBSCRIPT TWO (for CO2e) from the denominator two, dropped below the baseline.
  4. Adds U+2009 THIN SPACE and U+202F NARROW NO-BREAK SPACE (0.18 em).
  5. Subsets to Latin + the punctuation and maths signs the copy uses; drops hinting; writes WOFF2.
"""
import os
import sys
import urllib.parse
import urllib.request

from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.varLib import instancer
from fontTools import subset

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'assets', 'fonts')
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'work', 'scripts', 'design', '.font-cache')
GF = 'https://raw.githubusercontent.com/google/fonts/main/ofl/'

SOURCES = {
    'hanken': 'hankengrotesk/HankenGrotesk[wght].ttf',
    'hanken_ofl': 'hankengrotesk/OFL.txt',
    'dmmono': 'dmmono/DMMono-Regular.ttf',
    'dmmono_ofl': 'dmmono/OFL.txt',
}

# Latin + what the copy needs: x, division, superscripts, micro, plus-minus, fractions, middle dot, dashes, quotes,
# ellipsis, primes-free; maths (minus, radical, approx, <=, >=, infinity, not-equal); arrows; thin spaces.
UNICODES = (
    list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) +
    [0x131, 0x152, 0x153, 0x2C6, 0x2DA, 0x2DC] +
    list(range(0x2002, 0x200C)) + list(range(0x2010, 0x2016)) + list(range(0x2018, 0x201F)) +
    [0x2020, 0x2021, 0x2022, 0x2026, 0x2030, 0x2039, 0x203A, 0x2044, 0x202F] +
    list(range(0x2070, 0x20A0)) + [0x20AC, 0x2122] + list(range(0x2190, 0x2194)) +
    [0x2212, 0x2215, 0x2219, 0x221A, 0x221E, 0x2248, 0x2260, 0x2264, 0x2265, 0x25CA, 0xFB01, 0xFB02]
)
MONO_UNICODES = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x2212, 0x2248]


def fetch(key):
    os.makedirs(CACHE, exist_ok=True)
    rel = SOURCES[key]
    dest = os.path.join(CACHE, rel.replace('/', '_'))
    if not os.path.exists(dest):
        url = GF + urllib.parse.quote(rel)
        print('download', url)
        urllib.request.urlretrieve(url, dest)
    return dest


def add_glyph(font, name, glyph, advance, hvar_like=None, unicode=None):
    """Insert or replace a TrueType glyph in a variable font, keeping gvar/HVAR/cmap consistent."""
    glyf = font['glyf']
    order = font.getGlyphOrder()
    if name not in order:
        font.setGlyphOrder(order + [name])
        glyf.glyphOrder = font.getGlyphOrder()
    glyf[name] = glyph
    glyph.recalcBounds(glyf)
    lsb = getattr(glyph, 'xMin', 0) if glyph.numberOfContours != 0 else 0
    font['hmtx'][name] = (advance, lsb)
    if 'gvar' in font:
        font['gvar'].variations[name] = []          # static outline/offsets; components still vary
    if 'HVAR' in font and hvar_like is not None:
        m = font['HVAR'].table.AdvWidthMap.mapping
        m[name] = m[hvar_like]                     # advance varies like its source glyph
    if unicode is not None:
        for t in font['cmap'].tables:
            if t.isUnicode():
                t.cmap[unicode] = name
    font['maxp'].numGlyphs = len(font.getGlyphOrder())


def composite(font, base, dx, dy):
    pen = TTGlyphPen(font.getGlyphSet())
    pen.addComponent(base, (1, 0, 0, 1, dx, dy))
    return pen.glyph()


def empty(font):
    return TTGlyphPen(font.getGlyphSet()).glyph()


def subset_and_save(font, unicodes, path):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    opts.notdef_outline = True
    opts.hinting = False
    opts.glyph_names = False
    opts.drop_tables += ['DSIG']
    sub = subset.Subsetter(options=opts)
    sub.populate(unicodes=unicodes)
    sub.subset(font)
    font.flavor = 'woff2'
    font.save(path)
    print('wrote', os.path.relpath(path, ROOT), os.path.getsize(path), 'bytes')


def build_hanken():
    f = TTFont(fetch('hanken'))
    f = instancer.instantiateVariableFont(f, {'wght': (300, 500)})
    f.ensureDecompiled()                           # gvar is lazy; decompile before the glyph order changes
    gv = f['gvar']
    gv.variations = {g: gv.variations.get(g, []) for g in f.getGlyphOrder()}
    hm = f['hmtx']
    # 2. superior figures from numerators, nudged up 14 units and given 20 units more side-bearing each side
    for sup, base in (('uni00B9', 'one.numr'), ('uni00B2', 'two.numr'), ('uni00B3', 'three.numr'), ('uni2074', 'four.numr')):
        add_glyph(f, sup, composite(f, base, 20, 14), hm[base][0] + 40, hvar_like=base)
    # 3. subscript two from the denominator two, dropped 110 units below the baseline
    add_glyph(f, 'uni2082', composite(f, 'two.dnom', 20, -110), hm['two.dnom'][0] + 40, hvar_like='two.dnom', unicode=0x2082)
    # 4. thin and narrow no-break spaces
    add_glyph(f, 'uni2009', empty(f), 180, hvar_like='space', unicode=0x2009)
    add_glyph(f, 'uni202F', empty(f), 180, hvar_like='space', unicode=0x202F)
    subset_and_save(f, UNICODES, os.path.join(OUT, 'hanken-grotesk-var-latin.woff2'))


def build_mono():
    f = TTFont(fetch('dmmono'))
    subset_and_save(f, MONO_UNICODES, os.path.join(OUT, 'dm-mono-400-latin.woff2'))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    build_hanken()
    build_mono()
    for k in ('hanken_ofl', 'dmmono_ofl'):
        src = fetch(k)
        name = {'hanken_ofl': 'OFL-HankenGrotesk.txt', 'dmmono_ofl': 'OFL-DMMono.txt'}[k]
        with open(src, 'rb') as a, open(os.path.join(OUT, name), 'wb') as b:
            b.write(a.read())
        print('wrote', os.path.join('docs/assets/fonts', name))
