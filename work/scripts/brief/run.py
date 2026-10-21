# Applies p1.py and p2.py to work/04-creative-brief.md. Usage: python3 run.py [--apply]
import sys, pathlib
here = pathlib.Path(__file__).parent
brief = here.parents[2] / 'work' / '04-creative-brief.md'
ns1, ns2 = {}, {}
exec((here / 'p1.py').read_text(encoding='utf-8'), ns1)
exec((here / 'p2.py').read_text(encoding='utf-8'), ns2)
blocks = [('p1', *b) for b in ns1['B']] + [('p2', *b) for b in ns2['B']]
reps = [('p1', *r) for r in ns1['R']] + [('p2', *r) for r in ns2['R']]
t = brief.read_text(encoding='utf-8')
problems = []
for src, start, end, new in blocks:
    c = t.count(start)
    if c != 1:
        problems.append(f'[{src} BLOCK] start x{c}: {start[:70]!r}')
        continue
    i = t.index(start)
    if t.find(end, i + len(start)) < 0:
        problems.append(f'[{src} BLOCK] end not found after start: {end[:70]!r}')
for src, old, new in reps:
    c = t.count(old)
    if c != 1:
        problems.append(f'[{src} R] x{c}: {old[:110]!r}')
print(f'{len(blocks)} blocks, {len(reps)} replacements, {len(problems)} problems')
for p in problems: print(' ', p)
if problems or '--apply' not in sys.argv:
    sys.exit(1 if problems else 0)
for src, start, end, new in blocks:
    i = t.index(start); j = t.index(end, i + len(start))
    t = t[:i] + new + t[j:]
for src, old, new in reps:
    assert t.count(old) == 1, (src, old[:80])
    t = t.replace(old, new, 1)
brief.write_text(t, encoding='utf-8')
print('applied')
