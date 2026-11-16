# Escurece as roupas (mantém a pele) — usado para o "padre" ficar de preto clerical
import sys, colorsys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB'); px = im.load(); w, h = im.size
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]; hh, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        skin = (hh < 0.11 or hh > 0.95) and s > 0.22 and v > 0.28
        if not skin:
            k = 0.22 + 0.10 * v; px[x, y] = (int(r * k + 8), int(g * k + 8), int(b * k + 10))
im.save(sys.argv[2])
