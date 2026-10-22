"""Subset the self-hosted fonts. Run once after changing the character set or weights:
python3 scripts/build-fonts.py  (needs fonttools and brotli)
Reads the Fontsource packages in node_modules and writes WOFF2 files to public/fonts."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable"
OUT = ROOT / "public/fonts"

# Basic Latin, Latin-1, curly quotes, ellipsis, en dash, bullet, minus, thin and no-break spaces
UNICODES = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [
    0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x2013, 0x2022, 0x2212, 0x2009, 0x202F,
]
FEATURES = ["kern", "liga", "calt", "case", "tnum", "lnum", "onum", "pnum", "ccmp", "locl", "mark", "mkmk"]

JOBS = [
    # Newsreader: one weight, optical sizes kept for headings from 12px to 72px
    ("newsreader/files/newsreader-latin-opsz-normal.woff2", "newsreader-roman.woff2", {"wght": 400, "opsz": (12, 72)}),
    # The italic only sets quotes (22px) and the headline accent, so its optical range starts at 24
    ("newsreader/files/newsreader-latin-opsz-italic.woff2", "newsreader-italic.woff2", {"wght": 400, "opsz": (24, 72)}),
    ("inter/files/inter-latin-wght-normal.woff2", "inter.woff2", {"wght": (400, 600)}),
]

for src, dest, limits in JOBS:
    font = TTFont(SRC / src, lazy=False)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = FEATURES
    options.hinting = False
    options.desubroutinize = True
    options.name_IDs = ["*"]
    sub = subset.Subsetter(options)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    font = instancer.instantiateVariableFont(font, limits)
    path = OUT / dest
    font.flavor = "woff2"
    font.save(path)
    print(f"{dest}: {path.stat().st_size // 1024} KB")
