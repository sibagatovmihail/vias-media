#!/usr/bin/env python3
"""Outline of a word set in one of the site's fonts, as SVG path data.

The "Leistungen" word mask on the homepage (assets/js/v2/main.js, MASK_WORDS)
is a clip path made of these outlines: live <text> inside a clipPath stops
rendering in Chrome once it is magnified more than about ten times.

    python3 tools/word-path.py LEISTUNGEN I
    python3 tools/word-path.py SERVICES I

Prints a JS object: d (path, y down, cap top at 0), w (advance width),
h (cap height), f (ink box of the focus letter: x0, x1), all in font units.
Needs fontTools and brotli (pip install fonttools brotli).
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONT = 'assets/fonts/bebas-neue-latin.woff2'


def main():
    word = sys.argv[1]
    focus = sys.argv[2] if len(sys.argv) > 2 else word[len(word) // 2]
    font = TTFont(FONT)
    cmap, glyphs, hmtx = font.getBestCmap(), font.getGlyphSet(), font['hmtx']
    cap = font['OS/2'].sCapHeight
    x, parts, box = 0, [], None
    for ch in word:
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphs, ntos=lambda v: str(int(round(v))))
        glyphs[name].draw(TransformPen(pen, (1, 0, 0, -1, x, cap)))   # flip y, move to its place
        parts.append(pen.getCommands())
        if ch == focus and box is None:
            b = BoundsPen(glyphs)
            glyphs[name].draw(b)
            box = (round(x + b.bounds[0]), round(x + b.bounds[2]))
        x += hmtx[name][0]
    print("{ d: '%s', w: %d, h: %d, f: [%d, %d] }" % (''.join(parts), x, cap, box[0], box[1]))


if __name__ == '__main__':
    main()
