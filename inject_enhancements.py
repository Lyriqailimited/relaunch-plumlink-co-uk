import os, glob

base = r'C:\Users\PC\Desktop\aidevgen\lead-gen\demos\relaunch-plumlink-co-uk\improved_plumlink.co.uk'

css_inject = '<link href="assets/css/plumlink-enhance.css" id="plumlink-enhance-css" media="all" rel="stylesheet"/>\n'
js_inject = '<script src="https://cdn.jsdelivr.net/npm/motion@12.12.1/dist/motion.js"></script>\n<script src="assets/js/plumlink-enhance.js"></script>\n'

html_files = [f for f in glob.glob(os.path.join(base, '*.html')) if os.path.basename(f) != 'index.html']

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'plumlink-enhance' in content:
        print(f'SKIP (already injected): {os.path.basename(filepath)}')
        continue

    modified = False

    if '</head>' in content:
        content = content.replace('</head>', css_inject + '</head>', 1)
        modified = True

    if '</body>' in content:
        content = content.replace('</body>', js_inject + '</body>', 1)
        modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'DONE: {os.path.basename(filepath)}')
    else:
        print(f'WARN: {os.path.basename(filepath)}')

# Fix redirect
index_path = os.path.join(base, 'index.html')
with open(index_path, 'w', encoding='utf-8') as f:
    f.write('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=index_edebe0ec.html"></head><body><a href="index_edebe0ec.html">Click here</a></body></html>')
print('DONE: index.html redirect fixed')
print(f'\nTotal: {len(html_files)} files')
