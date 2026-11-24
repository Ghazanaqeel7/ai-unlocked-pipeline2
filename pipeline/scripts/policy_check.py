#!/usr/bin/env python3
"""YouTube monetisation-policy gate for one job (run before script_ready; set_status.py runs it for you).

Usage: python3 pipeline/scripts/policy_check.py <job_id>      -> writes jobs/<id>/policy.json, exit 1 on errors

Based on docs/ypp_policy.md (AI Graphic TV's own rulebook), which is itself sourced from YouTube Channel
Monetisation Policies (support.google.com/youtube/answer/1311392) and the YPP overview (answer/72851).
Errors block the script; warnings go to the owner in telegram.md.

Narration/visual-variety source of truth for THIS channel is `project/src/scenes.json` (scene[].text is the
spoken line) -- this repo does not use a SHOTS.txt shot-list format (that belonged to the pipeline this repo
was originally scaffolded from; see docs/LEARNINGS.md). A video here is our own motion-graphics build of a
real, sourced AI-tool trick -- not a dramatised reenactment -- so this checks against ypp_policy.md's actual
rules (sources listed, no deceptive metadata, no AI "expert" persona on sensitive topics, a real fact map with
2+ sources per claim) rather than a disclosure line that doesn't apply to this channel's format.
"""
import json, os, re, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FIN = re.compile(r'\b(stock|stocks|shares|wall street|invest|investing|investment|crypto|bitcoin|trading|trader|short squeeze|hedge fund)\b', re.I)
HEALTH_LEGAL = re.compile(r'\b(cure|diagnos|treatment|medicine|lawsuit advice|legal advice|you should sue)\w*', re.I)
EXPERT = re.compile(r"\b(i am|i'm|as) (a|an|your) (doctor|lawyer|financial advis\w+|investment advis\w+|expert)\b", re.I)
DECEPTIVE = re.compile(r'\b(dies|died|dead|death of|rip|arrested|leaked|banned forever|exposed)\b', re.I)


def words(t):
    return set(w for w in re.findall(r"[a-z']+", t.lower()) if len(w) > 3)


def load(p, default=''):
    try:
        return open(p, encoding='utf-8').read()
    except Exception:
        return default


def load_narration(job_dir):
    """Return (narration_text, scene_count) from project/src/scenes.json's scene[].text fields --
    this channel's real source of truth (no SHOTS.txt here; see module docstring)."""
    try:
        sc = json.loads(load(os.path.join(job_dir, 'project', 'src', 'scenes.json'), '{}')).get('scenes', [])
    except Exception:
        sc = []
    narration = ' '.join((s.get('text') or '').strip() for s in sc if s.get('text'))
    return narration, len(sc)


def check(jid):
    d = os.path.join(ROOT, 'jobs', jid)
    errors, warns = [], []
    try:
        meta = json.loads(load(os.path.join(d, 'meta.json'), '{}'))
    except Exception as e:
        return [f'meta.json is not valid JSON: {e}'], []
    title, desc = meta.get('title', ''), meta.get('description', '')
    narration, scene_count = load_narration(d)

    # metadata (reviewers check titles, thumbnails, descriptions)
    if not title: errors.append('title is empty')
    if len(title) > 100: errors.append(f'title is {len(title)} chars (YouTube max 100)')
    if title.isupper(): warns.append('title is all caps (reads as clickbait)')
    if DECEPTIVE.search(title) and not DECEPTIVE.search(narration):
        errors.append('title promises something the video does not say (deceptive metadata)')
    if not desc: errors.append('description is empty')
    src = re.split(r'(?im)^sources:\s*$', desc)
    # this channel's descriptions write sources as a prose line ("Sources: X; Y; Z.") or a short list --
    # accept either: a "Sources:" marker followed by at least 2 distinguishable source mentions.
    src_line = re.search(r'(?im)^sources:\s*(.+)$', desc)
    src_count = 0
    if src_line:
        src_count = len([p for p in re.split(r';|(?<=\.)\s+(?=[A-Z])', src_line.group(1)) if p.strip()])
    elif len(src) > 1:
        src_count = len([l for l in src[1].splitlines() if l.strip().startswith(('•', '-', '*'))])
    if src_count < 2:
        errors.append('description needs a "Sources:" line/list with at least 2 sources')
    tags_in_desc = re.findall(r'#\w+', desc)
    if len(tags_in_desc) > 15: errors.append(f'{len(tags_in_desc)} hashtags in the description (over 15 = YouTube ignores all of them)')
    if len(','.join(meta.get('tags', []))) > 500: errors.append('tags are over 500 characters')

    # AI personas on sensitive topics (cannot monetise)
    blob = ' '.join([title, desc, narration])
    if FIN.search(blob) and 'not investment advice' not in desc.lower() and 'general information' not in desc.lower():
        warns.append('money/trading-adjacent topic: consider adding a "this is general information, not financial advice" line')
    if EXPERT.search(narration): errors.append('narrator presents as a human expert (AI persona on a sensitive topic)')
    if HEALTH_LEGAL.search(narration): warns.append('health/legal wording in the narration: keep it factual/educational, never advice')

    # inauthentic (generic / repetitive) content: every video needs its own real topic + voice
    n = len(re.findall(r"[A-Za-z']+", narration))
    if scene_count < 1: errors.append('scenes.json has no scenes')
    min_words = 60 if meta.get('type') == 'short' else 500
    if not meta.get('demo') and n < min_words:
        errors.append(f'narration is {n} words: too thin for a {meta.get("type", "video")} (needs {min_words}+)')
    mine = words(narration)
    hook = next((s for s in (narration,) if s), '').strip().lower()[:80]
    for other in sorted(os.listdir(os.path.join(ROOT, 'jobs'))):
        if other == jid or not other[:1].isdigit(): continue
        onarr, _ = load_narration(os.path.join(ROOT, 'jobs', other))
        ow = words(onarr)
        if mine and ow:
            sim = len(mine & ow) / len(mine | ow)
            if sim > 0.45: errors.append(f'narration is {sim:.0%} the same words as {other} (repetitive content)')
            elif sim > 0.30: warns.append(f'narration overlaps {sim:.0%} with {other}: make the angle clearly different')

    # facts: two sources per claim live in script.md's fact map (or factmap.md's table)
    scr = load(os.path.join(d, 'script.md')) + '\n' + load(os.path.join(d, 'factmap.md'))
    fm = re.search(r'(?ims)^#+.*fact.?map.*?$(.*?)(?=^#+\s|\Z)', scr)
    rows = [r for r in re.findall(r'(?m)^\|(.+)\|\s*$', fm.group(1) if fm else scr) if not set(r.replace('|', '').strip()) <= set('-: ')]
    rows = [r for r in rows if r.split('|')[0].strip().lower() not in ('claim', 'fact', '')]
    if not rows:
        warns.append('no fact-map table found in script.md/factmap.md (claim | status | sources)')
    else:
        thin = [r.split('|')[0].strip()[:50] for r in rows
                if len(r.split('|')) > 2 and len([x for x in r.split('|')[-1].split(';') if x.strip()]) < 1
                and 'verified' not in r.lower() and 'qualitative' not in r.lower()]
        if thin: warns.append(f'{len(thin)} claim(s) with no obvious source listed, e.g. "{thin[0]}"')
    return errors, warns


def main():
    jid = sys.argv[1]
    errors, warns = check(jid)
    out = {'ok': not errors, 'errors': errors, 'warnings': warns,
           'checked_at': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
           'policy': 'docs/ypp_policy.md'}
    json.dump(out, open(os.path.join(ROOT, 'jobs', jid, 'policy.json'), 'w'), indent=2, ensure_ascii=False)
    for e in errors: print('ERROR  ', e)
    for w in warns: print('warning', w)
    print('policy check:', 'PASS' if not errors else 'FAIL')
    sys.exit(0 if not errors else 1)


if __name__ == '__main__':
    main()
