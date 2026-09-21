#!/usr/bin/env python3
"""Text-only verification of a topic in headless Chrome. One line of output per scenario.

  python3 tools/verify.py                       quick smoke: brine, steps + study check
  python3 tools/verify.py --preset cuso4-inert  smoke one preset
  python3 tools/verify.py --all                 full matrix (8 presets x 3 difficulties x 2 electrode modes)
  python3 tools/verify.py --topic fuel-cell     any of the above for another topic
  python3 tools/verify.py --preset brine --guide free --steps 0 --sim 5
  python3 tools/verify.py --preset brine --steps 3 --shot out.png [--width 640]

Rebuilds dist/ and docs/MAP.md first. Screenshots are downscaled to --width (default 640)
so they cost ~400 tokens instead of ~1000. Exit code 1 if any scenario reports errors.
"""
import argparse, os, pathlib, re, subprocess, sys, tempfile
from urllib.parse import quote

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
PRESETS = {'electrolysis': ['molten-pbbr2', 'molten-nacl', 'molten-al2o3', 'brine', 'dilute-nacl', 'cuso4-inert', 'cuso4-copper', 'dilute-h2so4'],
           'fuel-cell': ['acid', 'alkaline'],
           'reflection': ['single-ray', 'object']}
SCRATCH = os.environ.get('CLAUDE_SCRATCHPAD') or tempfile.gettempdir()

def build(topic):
    subprocess.run([sys.executable, str(ROOT / 'build.py'), topic], check=True, capture_output=True)
    subprocess.run([sys.executable, str(ROOT / 'tools/mapgen.py')], check=True, capture_output=True)
    src = (ROOT / f'dist/{topic}.html').read_text()
    hook = '<script>\n' + (ROOT / 'tools/harness.js').read_text() + '\n</script>'
    out = pathlib.Path(SCRATCH) / 'harness.html'
    out.write_text(src.replace('<div id="app"></div>', '<div id="app"></div>' + hook, 1))
    return out

def run(harness, params, shot=None, width=640):
    url = f'file://{harness}?' + '&'.join(f'{quote(str(k), safe="")}={quote(str(v), safe="")}' for k, v in params.items() if v is not None)
    args = [CHROME, '--headless=new', '--disable-gpu', '--virtual-time-budget=3000', '--window-size=1024,760']
    if shot:
        args += [f'--screenshot={shot}', url]
        subprocess.run(args, capture_output=True)
        subprocess.run(['sips', '--resampleWidth', str(width), shot], capture_output=True)
        return f'screenshot {shot} ({width}px wide)'
    res = subprocess.run(args + ['--dump-dom', url], capture_output=True, text=True)
    m = re.search(r'<pre id="errlog">([^<]*)', res.stdout)
    return m.group(1).strip() if m else 'NO ERRLOG (page did not boot)'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--topic', default='electrolysis')
    ap.add_argument('--preset'); ap.add_argument('--guide', choices=['steps', 'study', 'free'])
    ap.add_argument('--difficulty', choices=['easy', 'medium', 'hard']); ap.add_argument('--electrodes', choices=['cathode', 'anode', 'both'])
    ap.add_argument('--steps', type=int); ap.add_argument('--sim', default='1'); ap.add_argument('--last', help='sim seconds for the final step only'); ap.add_argument('--check', action='store_true')
    ap.add_argument('--open', type=int); ap.add_argument('--all', action='store_true')
    ap.add_argument('--param', action='append', default=[], help='extra URL param k=v, e.g. replenish=0')
    ap.add_argument('--shot'); ap.add_argument('--width', type=int, default=640)
    a = ap.parse_args()
    harness = build(a.topic)
    scenarios = []
    if a.all:
        for p in PRESETS[a.topic]:
            for e in ['cathode', 'anode', 'both']:
                scenarios.append({'preset': p, 'guide': 'steps', 'electrodes': e, 'steps': 12, 'sim': 1})
                for d in ['easy', 'medium', 'hard']:
                    scenarios.append({'preset': p, 'guide': 'study', 'electrodes': e, 'difficulty': d, 'check': 1})
            scenarios.append({'preset': p, 'guide': 'free', 'steps': 0, 'sim': 5})
    elif a.preset or a.guide or a.check or a.steps is not None or a.open is not None or a.shot:
        s = {'preset': a.preset, 'guide': a.guide, 'difficulty': a.difficulty, 'electrodes': a.electrodes, 'sim': a.sim}
        if a.check: s['check'] = 1
        elif a.open is not None: s['open'] = a.open
        else: s['steps'] = a.steps or 0
        if a.last: s['last'] = a.last
        for kv in a.param: k, v = kv.split('=', 1); s[k] = v
        scenarios.append(s)
    else:
        p0 = PRESETS[a.topic][3 if a.topic == 'electrolysis' else 0]
        scenarios = [{'preset': p0, 'guide': 'steps', 'steps': 12, 'sim': 1},
                     {'preset': p0, 'guide': 'study', 'difficulty': 'hard', 'check': 1}]
    failed = 0
    for s in scenarios:
        label = ' '.join(f'{k}={v}' for k, v in s.items() if v is not None)
        line = run(harness, s, shot=a.shot, width=a.width)
        bad = 'NO ERRORS' not in line and not line.startswith('screenshot')
        bad = bad or ' bad 0' not in line and 'questions' in line
        failed += bad
        print(('FAIL ' if bad else 'ok   ') + label + ' -> ' + line)
    sys.exit(1 if failed else 0)

if __name__ == '__main__':
    main()
