"""Export genuine vector PDF masters and a compact brand guide from SVG paths."""
from pathlib import Path
import json
import re
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from svgpathtools import parse_path, Line, CubicBezier, QuadraticBezier

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "brand/fola-village/official"
RECORDS = json.loads((OUT / "vector-paths.json").read_text())
INK, GOLD, RED, GREEN, PAPER = "#0F0D0B", "#F2C230", "#C8321F", "#2F6B3A", "#FFF7E6"


def draw_logo(c, records, x, y, width, height, variant="colour"):
    left = min(r["box"][0] for r in records); right = max(r["box"][1] for r in records)
    top = min(r["box"][2] for r in records); bottom = max(r["box"][3] for r in records)
    scale = min(width/(right-left), height/(bottom-top))
    c.saveState()
    c.translate(x+(width-(right-left)*scale)/2, y+(height-(bottom-top)*scale)/2)
    c.scale(scale, -scale); c.translate(-left, -bottom)
    for r in records:
        if variant == "ink" and r["kind"] == "drum" and r["colour"] == GOLD:
            continue
        t = re.fullmatch(r"translate\(([-\d.]+),([-\d.]+)\)", r["transform"] or "")
        dx, dy = (float(t[1]), float(t[2])) if t else (0, 0)
        p = parse_path(r["d"]).translated(complex(dx, dy))
        cp = c.beginPath()
        for sub in p.continuous_subpaths():
            cp.moveTo(sub.start.real, sub.start.imag)
            for seg in sub:
                if isinstance(seg, Line):
                    cp.lineTo(seg.end.real, seg.end.imag)
                elif isinstance(seg, CubicBezier):
                    cp.curveTo(seg.control1.real, seg.control1.imag, seg.control2.real, seg.control2.imag, seg.end.real, seg.end.imag)
                elif isinstance(seg, QuadraticBezier):
                    a = seg.start + (seg.control-seg.start)*2/3
                    b = seg.end + (seg.control-seg.end)*2/3
                    cp.curveTo(a.real, a.imag, b.real, b.imag, seg.end.real, seg.end.imag)
                else:
                    raise ValueError(f"Unsupported path segment: {type(seg)}")
            if sub.isclosed():
                cp.close()
        color = r["colour"]
        if variant == "light" and color == INK: color = PAPER
        if variant == "ink": color = INK
        c.setFillColor(HexColor(color)); c.drawPath(cp, fill=1, stroke=0, fillMode=1)
    c.restoreState()


def text(c, x, y, line, size=11, colour=INK, bold=False):
    c.setFillColor(HexColor(colour)); c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawString(x, y, line)


def guide():
    c = canvas.Canvas(str(OUT / "fola-brand-guide.pdf"), pagesize=(595, 842))
    c.setTitle("Fola Village - official brand guide")
    text(c, 42, 790, "FOLA VILLAGE", 22, bold=True)
    text(c, 42, 768, "Official logo and practical use guide | Approved 26 October 2026", 10)
    draw_logo(c, RECORDS, 170, 337, 255, 385)
    text(c, 42, 290, "The chosen identity", 16, bold=True)
    for y, line in zip([265, 247, 229, 211], [
        "Three community dots: red, gold and green, from left to right.",
        "Black drum and lettering. Green rim. Gold river.",
        "The italic Fola lettering is outlined in the vector files.",
        "Keep the source artwork together. Do not retype the wordmark.",
    ]): text(c, 42, y, line)
    for i, (name, value) in enumerate([("Ink", INK), ("Gold", GOLD), ("Red", RED), ("Green", GREEN), ("Paper", PAPER)]):
        x = 42+i*103
        c.setFillColor(HexColor(value)); c.rect(x, 115, 91, 55, fill=1, stroke=0)
        text(c, x, 96, name, 10, bold=True); text(c, x, 80, value, 9)
    text(c, 42, 40, "01 / Logo and palette", 9)
    c.showPage()
    text(c, 42, 790, "Use the right version.", 22, bold=True)
    c.setFillColor(HexColor(INK)); c.rect(310, 460, 243, 285, fill=1, stroke=0)
    draw_logo(c, RECORDS, 70, 485, 175, 240)
    draw_logo(c, RECORDS, 344, 485, 175, 240, "light")
    text(c, 55, 440, "Full colour on white or paper", 10, bold=True)
    text(c, 325, 440, "Light version on dark backgrounds", 10, bold=True)
    for y, line in zip(range(389, 244, -21), [
        "Leave clear space of at least one community dot around the logo.",
        "Stacked logo: aim for 120 px high on screen or 30 mm in print.",
        "Use the horizontal lockup where height is limited.",
        "Use the one-colour ink or white files for stamps and single-ink work.",
        "Keep proportions fixed. Do not stretch, rotate, outline or add effects.",
        "Do not place black artwork directly on dark backgrounds.",
        "Ask the printer for a physical colour proof; these masters use RGB.",
    ]): text(c, 42, y, line)
    emblem = [r for r in RECORDS if r["kind"] != "wordmark"]
    drum = [r for r in RECORDS if r["kind"] == "drum"]
    draw_logo(c, emblem, 60, 80, 155, 155)
    draw_logo(c, drum, 355, 80, 155, 155)
    text(c, 60, 63, "Emblem: includes the three dots", 10)
    text(c, 315, 63, "Favicon: drum only, no dots or text", 10)
    text(c, 42, 30, "02 / Application rules", 9)
    c.showPage()
    text(c, 42, 790, "Files for every use.", 22, bold=True)
    sections = [
        ("SVG / Scalable masters", "Stacked, horizontal, wordmark, emblem and drum-only files.", "Colour, light, ink and white. All lettering is outlined."),
        ("PNG / Transparent images", "512 px and 1600 px exports for documents, websites and artwork.", "Use SVG for larger printing; keep the approved original as reference."),
        ("Web and email", "WebP versions plus a 300 px email logo.", "Use light artwork on dark backgrounds; no external font is required."),
        ("Browser and device icons", "Adaptive SVG favicon; ICO with 16, 32 and 48 px frames.", "180 px Apple icon; 192 and 512 px device icons. Drum only."),
        ("Social", "1080 px square profile artwork and a 1200 x 630 sharing image.", "The social text is supporting copy, not part of the official logo."),
        ("PDF / Print masters", "Four vector artwork pages: colour, light, ink and horizontal.", "Supply the SVG or PDF to the printer; approve their colour proof."),
    ]
    y = 725
    for heading, a, b in sections:
        text(c, 42, y, heading, 14, bold=True)
        text(c, 42, y-24, a, 10); text(c, 42, y-41, b, 10)
        y -= 98
    text(c, 42, 70, "Website typography: Big Shoulders for headings; Archivo for reading.", 10)
    text(c, 42, 52, "Use real village photographs. Plans remain plans until confirmed operational.", 10)
    text(c, 42, 30, "03 / File guide", 9)
    c.save()


def masters():
    c = canvas.Canvas(str(OUT / "fola-print-masters.pdf"), pagesize=(595, 842))
    c.setTitle("Fola Village - vector print masters")
    for variant in ["colour", "light", "ink"]:
        if variant == "light":
            c.setFillColor(HexColor(INK)); c.rect(0, 0, 595, 842, fill=1, stroke=0)
        draw_logo(c, RECORDS, 60, 60, 475, 722, variant)
        c.showPage()
    emblem = [r for r in RECORDS if r["kind"] != "wordmark"]
    wordmark = [r for r in RECORDS if r["kind"] == "wordmark"]
    draw_logo(c, emblem, 35, 280, 160, 250)
    draw_logo(c, wordmark, 215, 280, 345, 250)
    c.save()


if __name__ == "__main__":
    guide(); masters()
    print("Created a three-page brand guide and four vector print-master pages.")
