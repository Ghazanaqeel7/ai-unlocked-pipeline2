#!/usr/bin/env python3
"""Daily package = 1 long (16:9, 8-10 min, 4-5 chapters) + 2 shorts (9:16, 40-50 s) from ONE research dossier.
  package.py calendar [--days 7] [--start YYYY-MM-DD]  -> docs/calendar.json (archives the old one), marks backlog ideas 'scheduled'
  package.py daily                                     -> docs/research/daily_package.json (today's package + dossier)
Shorts link to the long: related_video_title + pinned-comment bridge (publish step fills the real URL)."""
import datetime, json, os, shutil, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
P = lambda *a: os.path.join(ROOT, *a)
PKT = datetime.timezone(datetime.timedelta(hours=5))
SLOTS = [('long', 'long', '19:00'), ('short_pain', 'short', '07:30'), ('short_series', 'short', '21:30')]  # long is scripted first; times = PKT publish windows
SPEC = {'long': {'target_seconds': [480, 600], 'chapters': [4, 5], 'rehook_every': 30},
        'short_pain': {'target_seconds': [40, 50], 'rehook_every': 10},
        'short_series': {'target_seconds': [40, 50], 'rehook_every': 10}}

def load(p, d=None):
    try: return json.load(open(P(p), encoding='utf-8'))
    except Exception: return d

def save(p, o):
    json.dump(o, open(P(p), 'w', encoding='utf-8'), indent=2, ensure_ascii=False); open(P(p), 'a').write('\n')

def short_title(t, n=55): return t if len(t) <= n else t[:n - 1].rstrip() + '…'

def items_for_day(n, date, idea):
    day = date.strftime('%a %-d %b'); tool = idea['tool']
    why = f"Backlog #{idea['rank']} score {idea['score']} (demand {idea['demand']}, visual {idea['visual']}, pain-CTR {idea['ctr']})"
    long_title = short_title(idea['topic'])
    base = {'day': day, 'date': date.isoformat(), 'status': 'planned', 'package': f'd{n}', 'backlog_key': idea['key'],
            'why': why, 'long_title': long_title}
    out = []
    for slot, fmt, hhmm in SLOTS:
        it = dict(base, slot=slot, format=fmt, slot_pkt=hhmm, spec=SPEC[slot])
        if slot == 'long':
            it.update(topic=idea['topic'], angle=f"Full walkthrough: from the pain ('{idea['pain_hook']}') to a working result", title=long_title)
        elif slot == 'short_pain':
            it.update(topic=idea['topic'], angle=f"Pain-point hook: {idea['pain_hook']}", title=short_title(idea['pain_hook']),
                      related_video_title=long_title)
        else:
            it.update(topic=f"{tool} 7-day workflow: day {n}/7 of the series", angle=f"One repeatable {tool} workflow step, day {n} of 7",
                      title=short_title(f"{tool} workflow, day {n}/7"), related_video_title=long_title)
        out.append(it)
    return out

def calendar(days, start):
    bl = load('research/backlog.json', {'ideas': []})
    pick = [i for i in bl['ideas'] if i.get('status', 'idea') == 'idea']
    # one idea per tool inside a week keeps the channel non-repetitive (PIPELINE.md Never list)
    chosen, tools = [], set()
    for i in pick:
        if i['tool'] in tools: continue
        tools.add(i['tool']); chosen.append(i)
        if len(chosen) == days: break
    items = []
    for n, idea in enumerate(chosen, 1):
        items += items_for_day(n, start + datetime.timedelta(days=n - 1), idea)
        idea['status'] = 'scheduled'
    old = load('docs/calendar.json')
    if old and old.get('week'):
        os.makedirs(P('docs/calendar'), exist_ok=True)
        shutil.copy(P('docs/calendar.json'), P('docs/calendar', f"{old['week']}.json"))
    cal = {'week': start.isoformat(), 'made': datetime.datetime.now(PKT).isoformat(timespec='seconds'),
           'approval': 'pending',
           'note': f'7-Day Viral Content Calendar: {days} long + {days * 2} shorts = {days * 3} jobs. Each day: pain-point Short (07:30 PKT) -> Long (19:00) -> 7-Day-Series Short (21:30). Every item is fact-checked before its script is written.',
           'items': items}
    save('docs/calendar.json', cal); save('research/backlog.json', bl)
    print(f'calendar {start}: {len(chosen)} days, {len(items)} items')

def dossier(idea):
    ev = []
    def walk(o):
        if isinstance(o, dict):
            t = o.get('title')
            if isinstance(t, str) and idea['tool'].lower() in t.lower(): ev.append({k: o[k] for k in ('title', 'views', 'url', 'channel') if k in o})
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    for f in ('docs/research/latest.json', 'docs/research/news_hooks.json'):
        walk(load(f, {}))
    return {'tool': idea['tool'], 'topic': idea['topic'], 'pain_hook': idea['pain_hook'], 'evidence': ev[:6],
            'note': 'Fact-check against the official docs/changelog before scripting. Evidence = titles that mention the tool, not claims.'}

def daily():
    today = datetime.datetime.now(PKT).date().isoformat()
    cal = load('docs/calendar.json', {'items': []}); items = [i for i in cal.get('items', []) if i.get('date') == today]
    bl = load('research/backlog.json', {'ideas': []})
    if not items:                                   # calendar exhausted -> pop the top backlog idea
        idea = next((i for i in bl['ideas'] if i.get('status', 'idea') == 'idea'), None)
        if not idea: print('backlog empty'); return
        items = items_for_day(1, datetime.date.fromisoformat(today), idea); idea['status'] = 'scheduled'; save('research/backlog.json', bl)
    idea = next((i for i in bl['ideas'] if i['key'] == items[0]['backlog_key']), {'tool': '', 'topic': items[0]['topic'], 'pain_hook': ''})
    save('docs/research/daily_package.json', {'date': today, 'dossier': dossier(idea), 'items': items,
         'link_rule': 'Shorts: meta.related_video_title = long title; pinned_comment bridges to the long (use {LONG_URL}).'})
    print(f'daily package for {today}: {len(items)} items')

if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == 'calendar':
        days = int(a[a.index('--days') + 1]) if '--days' in a else 7
        start = datetime.date.fromisoformat(a[a.index('--start') + 1]) if '--start' in a else datetime.datetime.now(PKT).date() + datetime.timedelta(days=1)
        calendar(days, start)
    else: daily()
