"""Trace the approved artwork into outlined SVG production variants.

Run with uv run --with vtracer==0.6.15 --with pillow --with numpy
--with svgpathtools --with reportlab python scripts/build-fola-brand.py.
Raster original is read-only. Layers are converted directly to vector paths.
"""
from pathlib import Path
from xml.etree import ElementTree as ET
import copy
import json
import re
import shutil

import numpy as np
from PIL import Image
from svgpathtools import parse_path
import vtracer

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "brand/fola-village/official"
PUBLIC = ROOT / "public/brand/fola-village"
SOURCE = ROOT / "brand/fola-village/selected-drum-01-10/final-choice/fola-village-logo.png"
INK, GOLD, RED, GREEN, PAPER = "#0F0D0B", "#F2C230", "#C8321F", "#2F6B3A", "#FFF7E6"
SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)


def bounds(elements):
    boxes = [e["box"] for e in elements]
    return min(b[0] for b in boxes), min(b[2] for b in boxes), max(b[1] for b in boxes), max(b[3] for b in boxes)


def svg(elements, variant="colour", pad=10):
    x, y, right, bottom = bounds(elements)
    w, h = right-x+pad*2, bottom-y+pad*2
    head = f'<svg xmlns="{SVG_NS}" viewBox="{x-pad:.2f} {y-pad:.2f} {w:.2f} {h:.2f}" width="{w:.2f}" height="{h:.2f}">'
    parts = []
    for item in elements:
        if variant in ("ink", "white") and item["kind"] == "drum" and item["colour"] == GOLD:
            continue  # Keep the river as transparent negative space in one-colour artwork.
        e = copy.deepcopy(item["element"])
        colour = item["colour"]
        if variant == "light" and colour == INK:
            colour = PAPER
        elif variant == "ink":
            colour = INK
        elif variant == "white":
            colour = "#FFFFFF"
        e.set("fill", colour)
        e.set("fill-rule", "nonzero")
        parts.append(ET.tostring(e, encoding="unicode"))
    return head + "".join(parts) + "</svg>"


def horizontal(symbol, wordmark):
    # Nested SVG viewports reuse the exact outlined emblem and lettering.
    a, b = ET.fromstring(symbol), ET.fromstring(wordmark)
    a.set("x", "0"); a.set("y", "0"); a.set("width", "300"); a.set("height", "350")
    b.set("x", "338"); b.set("y", "0"); b.set("width", "650"); b.set("height", "350")
    return f'<svg xmlns="{SVG_NS}" viewBox="0 0 1000 350" width="1000" height="350">' + ET.tostring(a, encoding="unicode") + ET.tostring(b, encoding="unicode") + "</svg>"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    (OUT / "svg").mkdir(exist_ok=True)
    shutil.copyfile(SOURCE, OUT / "approved-original.png")
    rgba = np.array(Image.open(SOURCE).convert("RGBA"))
    rgb = rgba[:, :, :3].astype(float)
    colours = [INK, GOLD, RED, GREEN]
    palette = np.array([[int(c[i:i+2], 16) for i in (1, 3, 5)] for c in colours])
    nearest = ((rgb[:, :, None, :] - palette[None, None, :, :]) ** 2).sum(axis=3).argmin(axis=2)
    solid = rgba[:, :, 3] >= 180
    elements = []
    for index, colour in enumerate(colours):
        mask = solid & (nearest == index)
        pixels = np.where(mask[:, :, None], [0, 0, 0, 255], [255, 255, 255, 255]).astype("uint8")
        traced = vtracer.convert_pixels_to_svg(
            list(map(tuple, pixels.reshape(-1, 4).tolist())),
            (rgba.shape[1], rgba.shape[0]), colormode="binary", mode="spline",
            filter_speckle=14, corner_threshold=75, length_threshold=4,
            path_precision=2,
        )
        for e in ET.fromstring(traced):
            if not e.get("d"):
                continue
            p = parse_path(e.get("d"))
            t = re.fullmatch(r"translate\(([-\d.]+),([-\d.]+)\)", e.get("transform", ""))
            dx, dy = (float(t[1]), float(t[2])) if t else (0, 0)
            b = p.bbox()
            box = b[0]+dx, b[1]+dx, b[2]+dy, b[3]+dy
            if box[3]-box[2] < 3 or box[1]-box[0] < 3:
                continue
            kind = "wordmark" if box[2] >= 860 else "drum"
            if box[3] < 205 and box[1]-box[0] < 150 and colour != INK:
                kind = "dot"
            elements.append({"element": e, "colour": colour, "box": box, "kind": kind})
    assert sum(e["kind"] == "dot" for e in elements) == 3, "Expected exactly three community dots"
    groups = {
        "stacked": elements,
        "wordmark": [e for e in elements if e["kind"] == "wordmark"],
        "emblem": [e for e in elements if e["kind"] != "wordmark"],
        "drum": [e for e in elements if e["kind"] == "drum"],
    }
    for variant in ("colour", "light", "ink", "white"):
        for name, es in groups.items():
            (OUT / "svg" / f"fola-{name}-{variant}.svg").write_text(svg(es, variant))
        (OUT / "svg" / f"fola-horizontal-{variant}.svg").write_text(
            horizontal(svg(groups["emblem"], variant), svg(groups["wordmark"], variant)))
    icon = ET.fromstring(svg(groups["drum"], pad=35))
    icon.set("width", "64"); icon.set("height", "64")
    for e in icon:
        if e.get("fill") == INK:
            e.set("class", "ink")
    style = ET.Element(f"{{{SVG_NS}}}style")
    style.text = "@media(prefers-color-scheme:dark){.ink{fill:#FFF7E6}}"
    icon.insert(0, style)
    ET.ElementTree(icon).write(OUT / "favicon.svg", encoding="unicode")
    for f in (OUT / "svg").glob("*.svg"):
        shutil.copyfile(f, PUBLIC / f.name)
    shutil.copyfile(OUT / "favicon.svg", PUBLIC / "favicon.svg")
    summary = {
        "source": str(SOURCE.relative_to(ROOT)), "approved_by": "Frank", "approved_date": "2026-10-26",
        "palette": {"ink": INK, "gold": GOLD, "red": RED, "green": GREEN, "paper": PAPER},
        "vectorization": "VTracer 0.6.15, isolated colour layers; outlined type; original retained",
        "dots": 3, "favicon_dots": 0, "paths": len(elements),
        "files": sorted(f.name for f in (OUT / "svg").glob("*.svg")),
    }
    (OUT / "manifest.json").write_text(json.dumps(summary, indent=2) + "\n")
    # Numeric curve data is used by the vector PDF export, without rasterizing.
    records = []
    for item in elements:
        records.append({k: item[k] for k in ("colour", "box", "kind")} | {"d": item["element"].get("d"), "transform": item["element"].get("transform")})
    (OUT / "vector-paths.json").write_text(json.dumps(records))
    print(f"Created {len(summary['files'])} outlined SVG variants and drum-only adaptive favicon.")


if __name__ == "__main__":
    main()
