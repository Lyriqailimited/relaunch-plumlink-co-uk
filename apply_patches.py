import json, re
from pathlib import Path

IMPROVED_DIR = Path("C:/Users/PC/Desktop/aidevgen/lead-gen/demos/relaunch-plumlink-co-uk/improved_plumlink.co.uk")

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print("BeautifulSoup not available, using regex-based patching")

skill_output = json.loads((IMPROVED_DIR / "ui_ux_pro_max_output.json").read_text(encoding="utf-8"))
css = skill_output.get("css", "")
patches = skill_output.get("attribute_patches", [])

# (1) Write the delta CSS
css_dir = IMPROVED_DIR / "assets" / "css"
css_dir.mkdir(parents=True, exist_ok=True)
(css_dir / "relaunch.css").write_text(css, encoding="utf-8")
print(f"CSS written: {len(css)} chars")

# Also inject progress bar + back-to-top HTML and JS into all pages
EXTRAS_HTML = '''<div id="rl-progress"></div>
<button id="rl-back-top" aria-label="Back to top" onclick="window.scrollTo({top:0,behavior:'smooth'})"><i data-lucide="arrow-up"></i></button>
<script>
(function(){
  var prog=document.getElementById('rl-progress');
  var btn=document.getElementById('rl-back-top');
  window.addEventListener('scroll',function(){
    var s=document.documentElement;
    var pct=(s.scrollTop/(s.scrollHeight-s.clientHeight))*100;
    if(prog)prog.style.width=pct+'%';
    if(btn){btn.classList.toggle('visible',s.scrollTop>300);}
  },{passive:true});
})();
</script>
'''

# (2) Apply attribute patches using BeautifulSoup if available
if HAS_BS4:
    for html_path in IMPROVED_DIR.glob("*.html"):
        soup = BeautifulSoup(html_path.read_text(encoding="utf-8", errors="replace"), "html.parser")
        touched = False
        for patch in patches:
            sel = patch.get("selector")
            if not sel:
                continue
            try:
                nodes = soup.select(sel)
            except Exception as e:
                print(f"  Selector error {sel!r}: {e}")
                continue
            for node in nodes:
                for k, v in (patch.get("set") or {}).items():
                    if k.lower() == "class":
                        continue
                    node[k] = v
                    touched = True
                lucide = patch.get("replace_with_lucide")
                if lucide and re.match(r'^[a-z0-9-]{1,40}$', lucide):
                    new = soup.new_tag("i")
                    new["data-lucide"] = lucide
                    node.replace_with(new)
                    touched = True
        # Inject extras before </body>
        body_tag = soup.find('body')
        if body_tag:
            extras_soup = BeautifulSoup(EXTRAS_HTML, "html.parser")
            for tag in extras_soup.contents:
                body_tag.append(tag)
            touched = True
        if touched:
            html_path.write_text(str(soup), encoding="utf-8")
    print(f"Applied {len(patches)} attribute patches with BeautifulSoup.")
else:
    # Fallback: just inject extras before </body>
    for html_path in IMPROVED_DIR.glob("*.html"):
        text = html_path.read_text(encoding="utf-8", errors="replace")
        if 'id="rl-progress"' not in text and '</body>' in text:
            text = text.replace('</body>', EXTRAS_HTML + '</body>', 1)
            html_path.write_text(text, encoding="utf-8")
    print(f"Applied extras (no BS4, skipped attribute patches).")

print("Done.")
