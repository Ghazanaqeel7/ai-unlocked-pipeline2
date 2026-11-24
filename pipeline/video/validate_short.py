#!/usr/bin/env python3
"""Validate a Shorts job before it is queued. usage: validate_short.py jobs/<id>
Mirrors validate_long.py but with 9:16/35-55s bands. Shares TYPES/PRIMARY/no-repeat rules
from beat_rules.py so long and short formats stay in sync on the REGISTRY and visual-variety rules.
Exit 1 on errors."""
import json, os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from beat_rules import TYPES, PRIMARY, flatten_beats, check_no_repeat, check_no_identical_beats, check_required_props, load_custom_types

def main():
    job = sys.argv[1].rstrip('/'); errs = []; warns = []
    P = os.path.join(job, 'project', 'src')
    try: sc = json.load(open(os.path.join(P, 'scenes.json'), encoding='utf-8'))['scenes']
    except Exception as e: print('ERROR scenes.json unreadable:', e); sys.exit(1)
    errs.extend(check_no_identical_beats(sc))  # render_guide.md no-repeated-scenes rule
    try: meta = json.load(open(os.path.join(job, 'meta.json'), encoding='utf-8'))
    except Exception as e: print('ERROR meta.json unreadable:', e); sys.exit(1)
    allowed_types = TYPES | load_custom_types(job)
    ids = set(); words = 0; types = []
    for i, s in enumerate(sc):
        sid = s.get('id')
        if not sid or sid in ids: errs.append(f'scene {i}: missing/duplicate id')
        ids.add(sid)
        t = (s.get('text') or '').strip()
        if not t: errs.append(f'{sid}: empty narration text')
        words += len(t.split())
        beats = s['visual'] if isinstance(s.get('visual'), list) else [s.get('visual')]
        for b in beats:
            if not isinstance(b, dict) or b.get('type') not in allowed_types: errs.append(f'{sid}: bad visual {b!r}'[:120]); continue
            types.append(b['type'])
            if b['type'] == 'hookcard' and not b.get('text'): errs.append(f'{sid}: hookcard without text')
            if b['type'] == 'mockup' and not b.get('prompt'): errs.append(f'{sid}: mockup without prompt')
            if b['type'] == 'toolgrid' and len(b.get('tools', [])) < 2: warns.append(f'{sid}: toolgrid with <2 tools; use hookcard/browsersim for a single tool')
            for msg in check_required_props(b): errs.append(f'{sid}: {msg}')
            if b['type'] in ('compare', 'comparecard'):
                for r in b.get('rows', []):
                    for k in ('a', 'b'):
                        x = r.get(k)
                        if not (isinstance(x, (int, float)) or (isinstance(x, str) and x.strip())): errs.append(f'{sid}: {b["type"]} row "{r.get("label")}" {k} must be a number or short text')
        if len(t.split()) > 40: warns.append(f'{sid}: scene is {len(t.split())} words (~16s+ on one beat; a Short needs faster cuts)')
    if sc and types[-1:] not in (['endcard'], ['socialctacard']): warns.append('last scene is neither an endcard nor a socialctacard')
    # Single clean closing beat (render_guide.md): socialctacard is the whole outro on its own — a
    # trailing endcard right after it is a redundant second closing screen, not a cleaner one.
    if len(types) >= 2 and types[-2:] == ['socialctacard', 'endcard']:
        errs.append('redundant endcard immediately after socialctacard; socialctacard should be the sole closing beat on a Short — drop the trailing endcard scene')
    # Shorts: ~2.4 words/sec spoken pace (slightly brisker than long-form) -> target 35-55s band
    seconds = words / 2.4
    if meta.get('demo') and seconds >= 10: pass   # demo render (never published)
    elif seconds < 35: errs.append(f'narration only ~{seconds:.0f}s ({words} words); Shorts need >= 35s')
    elif seconds > 55: errs.append(f'narration ~{seconds:.0f}s ({words} words); Shorts must stay <= 55s')
    # Strict pacing rule (render_guide.md): 14-16 fast beats at ~2.0-3.2s each, nothing sitting static.
    if not (meta.get('demo') and seconds < 10):
        if len(types) < 14: warns.append(f'only {len(types)} beats; render_guide.md asks for 14-16 fast beats (2.0-3.2s each) on a Short')
        elif len(types) > 16: warns.append(f'{len(types)} beats; render_guide.md asks for 14-16 fast beats (2.0-3.2s each) on a Short, not more')
        avg = seconds / max(1, len(types))
        if avg < 2.0: warns.append(f'~{avg:.1f}s/beat on average; below the 2.0-3.2s pacing band, beats may feel rushed')
        elif avg > 3.2: warns.append(f'~{avg:.1f}s/beat on average; above the 2.0-3.2s pacing band, split the longer scenes into more beats')
    if len(set(types)) < 2 and len(types) > 2: warns.append('low visual variety for a multi-beat Short (<2 distinct scene types)')
    if not any(t in PRIMARY for t in types): warns.append('no beats from the primary UI-card family (hookcard/toolgrid/browsersim/dochighlighter/workflowstepper/datavizcard/socialctacard); Shorts should lead with these, not the long-form secondary types')
    for msg in check_no_repeat(types, max_run=1): warns.append(msg)  # Shorts: don't even allow back-to-back repeats
    for k in ('title', 'description', 'tags'):
        if not meta.get(k): errs.append(f'meta.json missing {k}')
    if meta.get('type') != 'short': errs.append('meta.json type must be "short"')
    if not os.path.exists(os.path.join(job, 'factmap.md')): warns.append('factmap.md missing (2 independent sources per claim) — recommended even for Shorts')
    th = os.path.join(P, 'thumb.json')
    if not os.path.exists(th): warns.append('thumb.json missing (Shorts rely mostly on the cover frame, but a thumb.json still helps the dashboard)')
    if not os.path.exists(os.path.join(P, 'guide.json')): warns.append('guide.json missing (companion guide.md/guide.pdf/social_copy.txt will be skipped for this job)')
    for w in warns: print('WARN ', w)
    for e in errs: print('ERROR', e)
    print(f'{len(sc)} scenes, {len(types)} beats, {words} words (~{seconds:.0f}s)')
    sys.exit(1 if errs else 0)
main()
