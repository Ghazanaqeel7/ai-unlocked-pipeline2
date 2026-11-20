#!/usr/bin/env python3
"""Validate a long-form job before it is queued. usage: validate_long.py jobs/<id>
Checks scenes.json, thumb.json, meta.json, script length, visual variety. Exit 1 on errors.
Shared logic (TYPES, PRIMARY, no-repeat check) lives in beat_rules.py so validate_short.py stays in sync."""
import json, os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from beat_rules import TYPES, PRIMARY, flatten_beats, check_no_repeat

def main():
    job = sys.argv[1].rstrip('/'); errs = []; warns = []
    P = os.path.join(job, 'project', 'src')
    try: sc = json.load(open(os.path.join(P, 'scenes.json'), encoding='utf-8'))['scenes']
    except Exception as e: print('ERROR scenes.json unreadable:', e); sys.exit(1)
    try: meta = json.load(open(os.path.join(job, 'meta.json'), encoding='utf-8'))
    except Exception as e: print('ERROR meta.json unreadable:', e); sys.exit(1)
    ids = set(); words = 0; photos = 0; types = []
    for i, s in enumerate(sc):
        sid = s.get('id')
        if not sid or sid in ids: errs.append(f'scene {i}: missing/duplicate id')
        ids.add(sid)
        t = (s.get('text') or '').strip()
        if not t: errs.append(f'{sid}: empty narration text')
        words += len(t.split())
        beats = s['visual'] if isinstance(s.get('visual'), list) else [s.get('visual')]
        for b in beats:
            if not isinstance(b, dict) or b.get('type') not in TYPES: errs.append(f'{sid}: bad visual {b!r}'[:120]); continue
            types.append(b['type'])
            if b['type'] == 'headline' and re.search(r'reconstruct|sneaky deals|our take', str(b.get('source', '')), re.I):
                errs.append(f'{sid}: headline source must be a real attribution or omitted (not "{b.get("source")}")')
            if b['type'] == 'hookcard' and not b.get('text'): errs.append(f'{sid}: hookcard without text')
            if b['type'] == 'mockup' and not b.get('prompt'): errs.append(f'{sid}: mockup without prompt')
            if b['type'] == 'toolgrid' and len(b.get('tools', [])) < 2: warns.append(f'{sid}: toolgrid with <2 tools; use hookcard/mockup for a single tool')
            if b['type'] in ('compare', 'comparecard'):
                for r in b.get('rows', []):
                    for k in ('a', 'b'):
                        x = r.get(k)
                        if not (isinstance(x, (int, float)) or (isinstance(x, str) and x.strip())): errs.append(f'{sid}: {b["type"]} row "{r.get("label")}" {k} must be a number or short text')
            if b['type'] == 'stat' and abs(float(b.get('to', 0) or 0)) >= 100 and 'store' in (b.get('suffix', '') + b.get('label', '')).lower() and not b.get('icon'):
                warns.append(f'{sid}: count of stores without stat.icon; make the number visible')
            if b['type'] == 'photo':
                photos += 1
                if not (b.get('image') or {}).get('q') and not (b.get('image') or {}).get('file'): errs.append(f'{sid}: photo without image.q')
                if not b.get('fallback'): warns.append(f'{sid}: photo without fallback icon')
            if b['type'] == 'chart' and not b.get('data'): errs.append(f'{sid}: chart without data')
        if len(beats) > 1 and len(t.split()) < 8: warns.append(f'{sid}: several beats on a very short scene')
        if len(t.split()) > 75: warns.append(f'{sid}: scene is {len(t.split())} words (>~30 s on one visual)')
    if sc and types[-1:] != ['endcard']: warns.append('last scene is not an endcard')
    minutes = words / 150.0
    if meta.get('demo') and minutes >= 1.5: pass   # demo render (never published)
    elif minutes < 6: errs.append(f'narration only ~{minutes:.1f} min ({words} words); long-form needs >= 6 min (~900 words)')
    elif minutes < 8: warns.append(f'narration ~{minutes:.1f} min; target 6-10 min')
    # new scene-writing rule: a new visual at least every ~7 s on average (tighter than the old 15-18s pace)
    if len(types) < minutes * 60 / 7: warns.append(f'only {len(types)} beats for {minutes:.1f} min; render_guide.md asks for a new visual every 3-5 s')
    if len(set(types)) < 4: warns.append('low visual variety (<4 scene types)')
    if not any(t in PRIMARY for t in types): warns.append('no beats from the primary UI-card family (hookcard/mockup/toolgrid/comparecard/statcounter/stepflow); the secondary scenes are for occasional variety, not the whole video')
    for msg in check_no_repeat(types): warns.append(msg)
    for k in ('title', 'description', 'tags'):
        if not meta.get(k): errs.append(f'meta.json missing {k}')
    if meta.get('type') != 'long': errs.append('meta.json type must be "long"')
    if not (meta.get('news_hook') or {}).get('url') and not meta.get('evergreen_only'): warns.append('no news_hook (or set evergreen_only:true)')
    if not os.path.exists(os.path.join(job, 'factmap.md')): errs.append('factmap.md missing (2 independent sources per claim)')
    th = os.path.join(P, 'thumb.json')
    if not os.path.exists(th): errs.append('thumb.json missing')
    if not os.path.exists(os.path.join(P, 'guide.json')): warns.append('guide.json missing (companion guide.md/guide.pdf/social_copy.txt will be skipped for this job)')
    for w in warns: print('WARN ', w)
    for e in errs: print('ERROR', e)
    print(f'{len(sc)} scenes, {len(types)} beats, {words} words (~{minutes:.1f} min), {photos} photos')
    sys.exit(1 if errs else 0)
main()
