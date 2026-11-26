#!/usr/bin/env python3
"""High-retention + CTR rules for packaged jobs (meta.json has "package"). usage: check_script.py jobs/<id> (exit 1 on errors)
script.md must carry timing markers, one per line:
  [HOOK 0:02] <curiosity/pain-point line>          first marker, at or before 0:03
  [REHOOK 0:24] <open-loop line>                   gaps <= 30 s (long) / 10 s (short) up to the target length
  [CHAPTER 2 1:45] <title>                         long only: 4-5 chapters
meta.json needs: title_options (3, each < 55 chars), thumb_spec {text, layout}, target_seconds,
  and for shorts: related_video_title + pinned_comment containing {LONG_URL} (bridge into the long)."""
import json, os, re, sys

LIM = {'long': {'rehook': 30, 'target': (480, 600), 'chapters': (4, 5)},
       'short': {'rehook': 10, 'target': (40, 50), 'chapters': None}}

def secs(t):
    m, s = t.split(':'); return int(m) * 60 + int(s)

def check(job):
    errs, warns = [], []
    meta = json.load(open(os.path.join(job, 'meta.json'), encoding='utf-8'))
    pk = meta.get('package')
    if not pk: return errs, warns          # older jobs are not held to the growth rules
    fmt = 'long' if pk.get('slot') == 'long' else 'short'; lim = LIM[fmt]
    to = meta.get('title_options') or []
    if len(to) != 3: errs.append('meta.title_options must have exactly 3 titles')
    for t in to:
        if len(t) >= 55: errs.append(f'title option too long ({len(t)}>=55): {t}')
    ts = meta.get('thumb_spec') or {}
    if not ts.get('text') or not ts.get('layout'): errs.append('meta.thumb_spec needs text + layout')
    elif len(ts['text'].split()) > 5: warns.append('thumb_spec.text: keep it to 5 words or fewer')
    tgt = meta.get('target_seconds')
    if not tgt or not (lim['target'][0] <= tgt <= lim['target'][1]):
        errs.append(f"meta.target_seconds must be {lim['target'][0]}-{lim['target'][1]} for a {fmt}")
        tgt = tgt or lim['target'][0]
    if fmt == 'short':
        if not meta.get('related_video_title'): errs.append('short needs meta.related_video_title (the long it feeds)')
        if '{LONG_URL}' not in (meta.get('pinned_comment') or ''): errs.append('short pinned_comment must contain {LONG_URL}')
    sp = os.path.join(job, 'script.md')
    txt = open(sp, encoding='utf-8').read() if os.path.exists(sp) else ''
    marks = [(m.group(1), secs(m.group(2)), m.group(3)) for m in re.finditer(r'^\s*\[(HOOK|REHOOK|CHAPTER[^\s\]]*(?: \d+)?)\s+(\d+:\d{2})\]\s*(.*)$', txt, re.M)]
    hooks = [m for m in marks if m[0] == 'HOOK']
    if not hooks: errs.append('script.md has no [HOOK 0:0x] line')
    elif hooks[0][1] > 3: errs.append('first hook must land at or before 0:03')
    rh = sorted([m[1] for m in marks if m[0] in ('HOOK', 'REHOOK')])
    for a, b in zip(rh, rh[1:] + [tgt]):
        if b - a > lim['rehook']: errs.append(f"re-hook gap {a}s -> {b}s exceeds {lim['rehook']}s"); break
    if lim['chapters']:
        ch = [m for m in marks if m[0].startswith('CHAPTER')]
        if not lim['chapters'][0] <= len(ch) <= lim['chapters'][1]: errs.append(f'long needs {lim["chapters"][0]}-{lim["chapters"][1]} [CHAPTER n m:ss] markers (found {len(ch)})')
    return errs, warns

if __name__ == '__main__':
    e, w = check(sys.argv[1].rstrip('/'))
    for x in w: print('warn:', x)
    for x in e: print('ERROR:', x)
    sys.exit(1 if e else 0)
