from pathlib import Path

IMPROVED_DIR = Path("C:/Users/PC/Desktop/aidevgen/lead-gen/demos/relaunch-plumlink-co-uk/improved_plumlink.co.uk")
TEMPLATE = Path("C:/Users/PC/Desktop/aidevgen/lead-gen/scripts/widget-embed.html")

WIDGET_URL = "https://widget-plumlink-co-uk.vercel.app"
PRIMARY_COLOR = "#151D37"
COMPANY_NAME = "Plumlink"

snippet = TEMPLATE.read_text(encoding="utf-8")
snippet = (snippet
    .replace("{{WIDGET_URL}}", WIDGET_URL)
    .replace("{{PRIMARY_COLOR}}", PRIMARY_COLOR)
    .replace("{{COMPANY_NAME}}", COMPANY_NAME))

embedded = 0
skipped = 0

for html_path in IMPROVED_DIR.glob("*.html"):
    text = html_path.read_text(encoding="utf-8", errors="replace")
    if 'id="vw-bubble"' in text:
        skipped += 1
        continue
    if "</body>" in text:
        text = text.replace("</body>", snippet + "\n</body>", 1)
    else:
        text = text + snippet
    html_path.write_text(text, encoding="utf-8")
    embedded += 1

print(f"Widget embedded in {embedded} pages, {skipped} already had it.")
