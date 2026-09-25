from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.boundsPen import BoundsPen
import os

FONT_FILE = os.path.join(os.path.dirname(__file__), "AdFeatures_V2.woff")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "assets", "icons")

os.makedirs(OUTPUT_DIR, exist_ok=True)

font = TTFont(FONT_FILE)

# CSS class -> Unicode codepoint
icons = {
    "cellar": 0xA008,
    "pool": 0xA00E,
    "storageRoom": 0xA00F,
    "heating": 0xA010,
    "moroccanLounge": 0xA011,
    "europeanLounge": 0xA012,
    "garage": 0xA013,
    "fridge": 0xA014,
    "doubleGlazing": 0xA015,
    "terrace": 0xA016,
    "fullKitchen": 0xA017,
    "reinforcedDoor": 0xA018,
    "washer": 0xA019,
    "microwave": 0xA01A,
    "oven": 0xA01B,
    "security": 0xA01C,
    "airConditioning": 0xA01D,
    "fireplace": 0xA01E,
    "satellite": 0xA01F,
    "furnished": 0xA020,
    "mountainsViews": 0xA021,
    "exteriorFacade": 0xA022,
    "doorman": 0xA023,
    "seaViews": 0xA024,
    "elevator": 0xA025,
    "garden": 0xA026,
    "floor": 0xA027,
    "compass": 0xA028,
    "house": 0xA029,
    "sleep": 0xA02A,
    "house-boxes": 0xA02B,
    "house-persons": 0xA02C,
    "go-up": 0xA02D,
    "sand-clock": 0xA02E,
    "hammer": 0xA02F,
    "hand-key": 0xA030,
    "hand-house": 0xA031,
    "triangle": 0xA032,
    "bath": 0xA033,
    "bed": 0xA034,
    "home": 0xA035,
}

# Find glyph for Unicode codepoint
cmap = {}
for table in font["cmap"].tables:
    cmap.update(table.cmap)

glyph_set = font.getGlyphSet()

for name, codepoint in icons.items():

    glyph_name = cmap.get(codepoint)

    if not glyph_name:
        print(f"Not found: {name}")
        continue

    pen = SVGPathPen(glyph_set)
    glyph_set[glyph_name].draw(pen)

    path = pen.getCommands()

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -80 1160 1160">
    <g transform="scale(1,-1) translate(0,-1000)"><path fill="currentColor" d="{path}" /></g>
</svg>
'''

    output = os.path.join(OUTPUT_DIR, f"{name}.svg")

    with open(output, "w", encoding="utf-8") as f:
        f.write(svg)

    print(f"Created: {output}")

print("Done!")