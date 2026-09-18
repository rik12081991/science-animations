#!/usr/bin/env python3
"""Build single-file pages into dist/.

  python3 build.py            -> dist/<topic>.html for each topic, plus dist/all.html
  python3 build.py electrolysis

Each output inlines core/styles.css, all core scripts and the topic script(s), so the
file works offline from anywhere (Files app on iPad, AirDrop, a static host, an iframe).
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
DIST = ROOT / 'dist'
INDEX = (ROOT / 'index.html').read_text(encoding='utf-8')

def read(rel):
    return (ROOT / rel).read_text(encoding='utf-8')

def topics():
    return sorted(p.stem for p in (ROOT / 'topics').glob('*.js') if not p.name.endswith('.design.js'))

def core_scripts():
    return [m for m in re.findall(r'<script src="([^"]+)"></script>', INDEX) if m.startswith('core/')]

def build(topic_ids, out_name, default_topic=None, student=False):
    html = INDEX
    css = read('core/styles.css')
    html = re.sub(r'<link rel="stylesheet" href="core/styles.css">', lambda m: '<style>\n' + css + '\n</style>', html)
    html = html.replace('<link rel="manifest" href="manifest.webmanifest">\n', '')
    scripts = core_scripts()
    for t in topic_ids:
        scripts.append(f'topics/{t}.js')
        if (ROOT / f'topics/{t}.design.js').exists():
            scripts.append(f'topics/{t}.design.js')
    inline = ''.join(f'<script>\n{read(s)}\n</script>\n' for s in scripts)
    if default_topic:
        inline += f"<script>window.DEFAULT_TOPIC = '{default_topic}';</script>\n"
    if student:
        inline += "<script>window.BUILD = { student: true };</script>\n"
    html = re.sub(r'(<script src="[^"]+"></script>\n)+', lambda m: inline, html, count=1)
    title = default_topic.replace('-', ' ').title() if default_topic else 'Science Animations'
    html = html.replace('<title>Science Animations</title>', f'<title>{title} · Science Animations</title>')
    DIST.mkdir(exist_ok=True)
    out = DIST / out_name
    out.write_text(html, encoding='utf-8')
    print(f'wrote {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} KB)')

def write_sw(files):
    sw = read('sw.js')
    sw = re.sub(r'const FILES = \[.*?\];', 'const FILES = [' + ', '.join(f"'./{f}'" for f in files) + '];', sw, flags=re.S)
    (DIST / 'sw.js').write_text(sw, encoding='utf-8')
    (DIST / 'manifest.webmanifest').write_text(read('manifest.webmanifest').replace('./index.html', './all.html'), encoding='utf-8')

if __name__ == '__main__':
    wanted = sys.argv[1:] or topics()
    for t in wanted:
        build([t], f'{t}.html', default_topic=t)
        build([t], f'{t}-student.html', default_topic=t, student=True)
    if not sys.argv[1:]:
        build(topics(), 'all.html')
        write_sw([f'{t}.html' for t in topics()] + [f'{t}-student.html' for t in topics()] + ['all.html'])
