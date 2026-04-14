import re
from pathlib import Path

IMPROVED_DIR = Path("C:/Users/PC/Desktop/aidevgen/lead-gen/demos/relaunch-plumlink-co-uk/improved_plumlink.co.uk")

issues = []
html_files = sorted(IMPROVED_DIR.glob("*.html"))
existing_names = {p.name for p in html_files}

for p in html_files:
    text = p.read_text(encoding="utf-8", errors="replace")
    # (a) widget embed present exactly once
    vw_count = text.count('id="vw-bubble"')
    if vw_count != 1:
        issues.append(f"{p.name}: vw-bubble count = {vw_count}")
    # (a2) CDN marker
    cdn_count = text.count('data-relaunch-cdn')
    if cdn_count != 1:
        issues.append(f"{p.name}: data-relaunch-cdn marker count = {cdn_count}")
    # AOS.init
    aos_count = text.count('AOS.init')
    if aos_count != 1:
        issues.append(f"{p.name}: AOS.init count = {aos_count}")
    # relaunch.css
    if 'assets/css/relaunch.css' not in text:
        issues.append(f"{p.name}: relaunch.css link missing")
    # (b) hrefs
    for href in re.findall(r'href="([^"]+)"', text):
        if href.startswith(("http://", "https://", "//", "mailto:", "tel:", "#", "javascript:")):
            continue
        if href.startswith("assets/") or href.endswith((".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".webp", ".ico", ".gif")):
            continue
        target = href.split("#", 1)[0].split("?", 1)[0].lstrip("./")
        if target and target not in existing_names:
            issues.append(f"{p.name}: dangling href {href!r}")

# (c) local <img src> files exist
for p in html_files:
    text = p.read_text(encoding="utf-8", errors="replace")
    for src in re.findall(r'<img[^>]+src="([^"]+)"', text):
        if src.startswith(("http://", "https://", "data:")):
            continue
        local = (IMPROVED_DIR / src.lstrip("./")).resolve()
        if not local.exists():
            issues.append(f"{p.name}: missing image {src}")

print(f"HTML files checked: {len(html_files)}")
print(f"UNRESOLVED: {len(issues)}")
for i in issues[:30]:
    print(" -", i)
