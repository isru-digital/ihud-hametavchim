"""Builds the PWA / favicon icon set from LOGO.png.

The logo pixels are never redrawn: the gold mark is cropped from the original
file and placed, resized, on a solid white square.

Run from the repo root:  python scripts/make-icons.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'LOGO.png'
OUT = ROOT / 'docs' / 'icons'
OUT.mkdir(parents=True, exist_ok=True)

WHITE = (255, 255, 255)
MARK_ROWS = (0, 625)      # rows that contain the mark, above the Hebrew wordmark
SKIP_LEFT_COLS = 40       # the source has a faint grey stripe on its left edge

im = Image.open(SRC).convert('RGB')
arr = np.array(im).astype(int)
ink = arr.min(axis=2) < 235
ink[:, :SKIP_LEFT_COLS] = False
ys, xs = np.where(ink[MARK_ROWS[0]:MARK_ROWS[1]])
x0, x1 = xs.min(), xs.max()
y0, y1 = ys.min() + MARK_ROWS[0], ys.max() + MARK_ROWS[0]
mark = im.crop((x0, y0, x1 + 1, y1 + 1))


def tile(size, ratio):
    """Mark centred on a white square; `ratio` is the mark's longest side / size."""
    w, h = mark.size
    k = size * ratio / max(w, h)
    m = mark.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    canvas = Image.new('RGB', (size, size), WHITE)
    canvas.paste(m, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas


# "any" icons: generous clean margin.
tile(192, 0.72).save(OUT / 'icon-192.png', optimize=True)
tile(512, 0.72).save(OUT / 'icon-512.png', optimize=True)
# maskable: the whole mark sits inside the central 80% circle (safe zone).
tile(512, 0.60).save(OUT / 'icon-maskable-512.png', optimize=True)
# iOS: opaque, no alpha. iOS rounds the corners itself.
tile(180, 0.72).save(OUT / 'apple-touch-icon.png', optimize=True)
# favicons: larger mark, tabs are tiny.
tile(32, 0.90).save(OUT / 'favicon-32.png', optimize=True)
tile(256, 0.90).save(OUT / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])

for p in sorted(OUT.iterdir()):
    print(f'{p.name:26s} {Image.open(p).size}  {p.stat().st_size} bytes')
