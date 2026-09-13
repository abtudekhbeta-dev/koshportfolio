#!/usr/bin/env python3
"""Build Kosh brand assets: OG card + PWA raster icons. Stage under .grok/."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/workspace")
STAGE = ROOT / ".grok"
FONTS = STAGE / "fonts"

BG = (9, 9, 11, 255)
FG = (242, 242, 244, 255)
MUTED = (155, 155, 163, 255)
SUBTLE = (110, 110, 118, 255)
CHART = (122, 162, 255, 255)
CHART_FILL = (122, 162, 255, 46)
BENCH = (154, 154, 164, 255)
GRID = (38, 38, 43, 255)
TILE = (9, 9, 11, 255)

# Geometric K in a 32×32 tile (matches public/favicon.svg)
K_POLY_32 = [
    (8, 4),
    (12, 4),
    (12, 12),
    (20, 4),
    (24, 4),
    (15, 14),
    (24, 24),
    (20, 24),
    (12, 14),
    (12, 24),
    (8, 24),
]
NAV_32 = [(6, 28), (12, 26), (16, 27), (22, 24), (26, 26)]


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def smooth_series(keys: list[float], n: int) -> np.ndarray:
    xs = np.linspace(0, len(keys) - 1, n)
    out = np.empty(n, dtype=np.float64)
    for i, x in enumerate(xs):
        lo = int(math.floor(x))
        hi = min(lo + 1, len(keys) - 1)
        t = x - lo
        t = t * t * (3 - 2 * t)
        out[i] = lerp(keys[lo], keys[hi], t)
    return out


def draw_round_polyline(draw: ImageDraw.ImageDraw, pts: list[tuple[float, float]], fill, width: int) -> None:
    ip = [(int(round(x)), int(round(y))) for x, y in pts]
    draw.line(ip, fill=fill, width=width, joint="curve")
    r = max(1, width // 2)
    for x, y in ip:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=fill)


def paint_mark(size: int) -> Image.Image:
    """Favicon mark at `size` px, drawn 4× then downsampled."""
    s = size * 4
    scale = s / 32.0
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, s - 1, s - 1), radius=8 * scale, fill=TILE)
    k = [(x * scale, y * scale) for x, y in K_POLY_32]
    d.polygon(k, fill=FG)
    nav = [(x * scale, y * scale) for x, y in NAV_32]
    stroke = max(4, int(round(2.0 * scale)))
    draw_round_polyline(d, nav, CHART, stroke)
    return im.resize((size, size), Image.Resampling.LANCZOS)


def paint_og() -> Image.Image:
    W, H = 2400, 1260  # 2× 1200×630
    im = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(im, "RGBA")

    # Quiet radial lift so the lockup sits on a slightly elevated field.
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    cx, cy = W // 2, int(H * 0.46)
    for i, alpha in enumerate((18, 12, 7, 3)):
        r = 820 - i * 90
        od.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(16, 16, 18, alpha))
    im = Image.alpha_composite(im, overlay)
    d = ImageDraw.Draw(im, "RGBA")

    # Quiet radial lift so the lockup sits on a slightly elevated field.
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    cx, cy = W // 2, int(H * 0.46)
    for i, alpha in enumerate((18, 12, 7, 3)):
        r = 820 - i * 90
        od.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(16, 16, 18, alpha))
    im = Image.alpha_composite(im, overlay)
    d = ImageDraw.Draw(im, "RGBA")

    title_font = font("IBMPlexSans-SemiBold.ttf", 176)
    cap_font = font("IBMPlexMono-Regular.ttf", 32)
    legend_font = font("IBMPlexSans-Medium.ttf", 28)
    tick_font = font("IBMPlexMono-Regular.ttf", 24)

    title = "Kosh"
    tb = d.textbbox((0, 0), title, font=title_font)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]

    # Chart geometry
    chart_w, chart_h = 1480, 420
    chart_x = (W - chart_w) // 2
    # Lockup: mark+title, gap, chart, gap, caption — vertically centered as a block.
    mark = 92
    gap_title_chart = 72
    gap_chart_cap = 48
    cap_h = 36
    lock_h = mark + gap_title_chart + chart_h + gap_chart_cap + cap_h
    lock_top = (H - lock_h) // 2

    # Mark + wordmark, optically centered
    title_y = lock_top + (mark - th) // 2 - tb[1]
    gap_mk = 28
    lock_w = mark + gap_mk + tw
    lock_x = (W - lock_w) // 2
    tile = paint_mark(mark)
    im.paste(tile, (lock_x, lock_top), tile)
    d = ImageDraw.Draw(im, "RGBA")
    d.text((lock_x + mark + gap_mk, title_y), title, font=title_font, fill=FG)

    chart_y = lock_top + mark + gap_title_chart

    # 10y indexed paths — mix pulls ahead after a 2020-shaped dip.
    nifty_keys = [100, 118, 122, 138, 96, 168, 156, 188, 208, 222, 232]
    mix_keys = [100, 128, 132, 154, 90, 192, 176, 228, 258, 276, 292]
    n = 360
    mix = smooth_series(mix_keys, n)
    nifty = smooth_series(nifty_keys, n)
    lo = min(float(mix.min()), float(nifty.min())) * 0.92
    hi = max(float(mix.max()), float(nifty.max())) * 1.04

    def xy(series: np.ndarray) -> list[tuple[float, float]]:
        pts = []
        for i, v in enumerate(series):
            x = chart_x + (i / (n - 1)) * chart_w
            y = chart_y + chart_h - ((v - lo) / (hi - lo)) * chart_h
            pts.append((x, y))
        return pts

    mix_pts = xy(mix)
    nifty_pts = xy(nifty)

    # Hairline grid — three quiet horizontals, no numbers.
    for t in (0.0, 0.5, 1.0):
        y = chart_y + chart_h * t
        d.line((chart_x, y, chart_x + chart_w, y), fill=GRID, width=2)

    # Mix area fill
    fill_pts = mix_pts + [(mix_pts[-1][0], chart_y + chart_h), (mix_pts[0][0], chart_y + chart_h)]
    d.polygon(fill_pts, fill=CHART_FILL)

    draw_round_polyline(d, nifty_pts, BENCH, 5)
    draw_round_polyline(d, mix_pts, CHART, 7)

    # Legend, top-right of chart
    legend_y = chart_y - 44
    nifty_label, mix_label = "Nifty", "Mix"
    nb = d.textbbox((0, 0), nifty_label, font=legend_font)
    mb = d.textbbox((0, 0), mix_label, font=legend_font)
    lx = chart_x + chart_w
    # Nifty
    sw = 28
    d.text((lx - (nb[2] - nb[0]), legend_y), nifty_label, font=legend_font, fill=BENCH)
    nx = lx - (nb[2] - nb[0]) - 16 - sw
    d.line((nx, legend_y + 16, nx + sw, legend_y + 16), fill=BENCH, width=5)
    # Mix
    mix_x = nx - 36 - (mb[2] - mb[0])
    d.text((mix_x, legend_y), mix_label, font=legend_font, fill=CHART)
    mx = mix_x - 16 - sw
    d.line((mx, legend_y + 16, mx + sw, legend_y + 16), fill=CHART, width=6)

    # Year ticks
    ticks = [("2016", 0.0), ("2020", 0.4), ("2026", 1.0)]
    tick_y = chart_y + chart_h + 10
    for label, t in ticks:
        x = chart_x + t * chart_w
        bb = d.textbbox((0, 0), label, font=tick_font)
        if t == 0.0:
            tx = x
        elif t == 1.0:
            tx = x - (bb[2] - bb[0])
        else:
            tx = x - (bb[2] - bb[0]) / 2
        d.text((tx, tick_y), label, font=tick_font, fill=SUBTLE)

    caption = "Current-mix path · 10y adj close"
    cb = d.textbbox((0, 0), caption, font=cap_font)
    cap_y = chart_y + chart_h + gap_chart_cap
    d.text(((W - (cb[2] - cb[0])) / 2, cap_y), caption, font=cap_font, fill=MUTED)

    return im.resize((1200, 630), Image.Resampling.LANCZOS).convert("RGB")


def main() -> None:
    STAGE.mkdir(parents=True, exist_ok=True)

    og = paint_og()
    og_png = STAGE / "og-raw.png"
    og.save(og_png, "PNG")

    for size, name in ((192, "icon-192.png"), (512, "icon-512.png"), (180, "icon-180.png"), (16, "favicon-16.png")):
        mark = paint_mark(size)
        out = STAGE / name
        rgb = Image.new("RGB", (size, size), (9, 9, 11))
        rgb.paste(mark, (0, 0), mark)
        rgb.save(out, "PNG", optimize=True)
        print(f"wrote {out} {rgb.size}")

    print(f"wrote {og_png} {og.size}")


if __name__ == "__main__":
    main()
