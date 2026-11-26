#!/usr/bin/env python3
"""Dual approval gates, mirrored to Slack. Approval itself happens in the Dashboard (or the existing Telegram buttons):
  Gate 1 = calendar + script  (job at script_ready/script_sent)       Gate 2 = final video + PDF (video_ready/video_sent)
usage: gates.py notify     post each new gate card once (dedupe in data/gates_notified.json)
       gates.py calendar   post the full calendar summary (Slot #1 first) to Slack
This script never approves anything and never changes state.json."""
import datetime, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'scripts'))
from slack import post
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
DASH = 'https://aigraphictv.vercel.app/dashboard.html'
NF = os.path.join(ROOT, 'data', 'gates_notified.json')

def J(p, d=None):
    try: return json.load(open(os.path.join(ROOT, p), encoding='utf-8'))
    except Exception: return d

def calendar_text(cal):
    its = cal.get('items', []); by = {}
    for i in its: by.setdefault(i['day'], []).append(i)
    L = [f"*7-Day Viral Content Calendar* ({cal.get('week')}): {sum(i['format']=='long' for i in its)} long + {sum(i['format']=='short' for i in its)} shorts",
         f"Approve in the Dashboard: {DASH} (Calendar tab). Gate 1a: the calendar. Slot #1 below is scripted first.", '']
    n = 0
    for day, xs in by.items():
        L.append(f'*{day}*')
        for i in xs:
            n += 1; tag = {'long': 'LONG', 'short_pain': 'SHORT pain', 'short_series': 'SHORT series'}[i['slot']]
            L.append(f"  #{n} {i['slot_pkt']} PKT {tag}: {i['title']}")
    return '\n'.join(L)

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'notify'
    cal = J('docs/calendar.json', {})
    if mode == 'calendar':
        post(calendar_text(cal)); return
    seen = J('data/gates_notified.json', {}); new = {}
    if cal.get('approval') == 'pending' and f"cal:{cal.get('week')}" not in seen:
        if post(calendar_text(cal)): new[f"cal:{cal.get('week')}"] = 1
    st = J('state.json', {'jobs': {}})
    for jid, j in st['jobs'].items():
        s = j.get('status')
        if s in ('script_ready', 'script_sent') and f'g1:{jid}' not in seen:
            if post(f"*Gate 1: script approval* `{jid}`: {j.get('title','')}\nApprove or reject in the Dashboard: {DASH}"): new[f'g1:{jid}'] = 1
        if s in ('video_ready', 'video_sent') and f'g2:{jid}' not in seen:
            v = j.get('video_url', ''); pdf = v.rsplit('/', 1)[0] + '/guide.pdf' if v else ''
            if post(f"*Gate 2: final video + PDF approval* `{jid}`: {j.get('title','')}\nVideo: {v}\nGuide PDF: {pdf}\nApproving the video approves the PDF too (Vault listing). Dashboard: {DASH}"): new[f'g2:{jid}'] = 1
    if new:
        seen.update(new); json.dump(seen, open(NF, 'w'), indent=1); print('notified', list(new))
    else: print('nothing new')

if __name__ == '__main__': main()
