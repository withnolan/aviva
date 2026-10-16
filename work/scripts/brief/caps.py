# Decision #30: visible brand "aviva" -> "AVIVA" in Parts 1-8 of the brief (Part 9 is historical).
# Skips URLs, paths, file names, identifiers and keys: any "aviva" touching a letter, digit, "_", "/", "-", or followed by ".x".
import re, pathlib, sys
brief = pathlib.Path(__file__).parents[3] / 'work' / '04-creative-brief.md'
t = brief.read_text(encoding='utf-8')
cut = t.index('## Part 9. ')
head, tail = t[:cut], t[cut:]
pat = re.compile(r'(?<![A-Za-z0-9_/\-])aviva(?![A-Za-z0-9_/\-])(?!\.[A-Za-z0-9])')
n = len(pat.findall(head))
new = pat.sub('AVIVA', head)
left = [m.start() for m in re.finditer(r'aviva', new)]
print('converted', n)
for p in left:
    print('kept lowercase:', repr(new[max(0, p-30):p+25]))
if '--apply' in sys.argv:
    brief.write_text(new + tail, encoding='utf-8'); print('applied')
