"""Set every pixel's RGB to one colour, keep alpha (so the PNG's alpha is the ink coverage). Usage: flatten-rgb.py in.png hex"""
import sys
from PIL import Image
path, hexcol = sys.argv[1], sys.argv[2].lstrip('#')
rgb = tuple(int(hexcol[i:i + 2], 16) for i in (0, 2, 4))
im = Image.open(path).convert('RGBA')
a = im.getchannel('A')
out = Image.new('RGBA', im.size, rgb + (0,))
out.putalpha(a)
out.save(path, optimize=True)
print(path, im.size, 'alpha range', a.getextrema())
