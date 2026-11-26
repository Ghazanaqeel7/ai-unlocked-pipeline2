#!/usr/bin/env python3
"""Weekly growth check -> Slack. Goals by 2027-02-01: 4,000 watch hours (365 d) + 1,000 subscribers.
Watch hours + top videos need the YouTube OAuth secrets (Analytics API); without them we report public subs/views only.
Also writes docs/research/growth_progress.json for the dashboard."""
import datetime, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'publish')); sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'scripts'))
from common import J, http, google_token, ROOT
from slack import post
GOAL_H, GOAL_S, DEADLINE = 4000, 1000, datetime.date(2027, 2, 1)

def main():
    today = datetime.date.today(); left = max(1, (DEADLINE - today).days)
    own, key = (J('research/config.json', {}) or {}).get('own_channel'), os.environ.get('YT_API_KEY')
    subs = views = None
    if own and key:
        c, r, _ = http('GET', f'https://www.googleapis.com/youtube/v3/channels?part=statistics&id={own}&key={key}')
        if c == 200 and r.get('items'): s = r['items'][0]['statistics']; subs, views = int(s.get('subscriberCount', 0)), int(s.get('viewCount', 0))
    hours = week_h = None; top = []
    tok = google_token()
    if tok:
        H = {'Authorization': f'Bearer {tok}'}; A = 'https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE'
        c, r, _ = http('GET', f'{A}&startDate={today - datetime.timedelta(days=365)}&endDate={today}&metrics=estimatedMinutesWatched', H)
        if c == 200 and r.get('rows'): hours = r['rows'][0][0] / 60
        c, r, _ = http('GET', f'{A}&startDate={today - datetime.timedelta(days=7)}&endDate={today}&metrics=estimatedMinutesWatched', H)
        if c == 200 and r.get('rows'): week_h = r['rows'][0][0] / 60
        c, r, _ = http('GET', f'{A}&startDate={today - datetime.timedelta(days=28)}&endDate={today}&metrics=views,estimatedMinutesWatched&dimensions=video&sort=-estimatedMinutesWatched&maxResults=5', H)
        rows = r.get('rows', []) if c == 200 else []
        if rows and key:
            ids = ','.join(x[0] for x in rows); c, v, _ = http('GET', f'https://www.googleapis.com/youtube/v3/videos?part=snippet&id={ids}&key={key}')
            tt = {i['id']: i['snippet']['title'] for i in v.get('items', [])} if c == 200 else {}
            top = [(tt.get(x[0], x[0]), int(x[1]), x[2] / 60) for x in rows]
    L = [f'*Weekly growth check* ({today}), {left} days to Feb 1']
    L.append(f'Watch hours (365 d): {hours:,.0f} / {GOAL_H:,} ({100*hours/GOAL_H:.1f}%), need ~{(GOAL_H-hours)/left:.1f} h/day' if hours is not None
             else 'Watch hours: add YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN to track this')
    if week_h is not None: L.append(f'This week: {week_h:,.1f} h')
    L.append(f'Subscribers: {subs:,} / {GOAL_S:,} ({100*subs/GOAL_S:.1f}%)' if subs is not None else 'Subscribers: not available (check YT_API_KEY / own_channel)')
    if top: L += ['Top topics (28 d):'] + [f'  {i+1}. {t[:60]}: {v:,} views, {h:.1f} h' for i, (t, v, h) in enumerate(top)]
    post('\n'.join(L))
    json.dump({'date': str(today), 'watch_hours': hours, 'goal_hours': GOAL_H, 'subs': subs, 'goal_subs': GOAL_S, 'week_hours': week_h,
               'deadline': str(DEADLINE), 'top': top}, open(os.path.join(ROOT, 'docs', 'research', 'growth_progress.json'), 'w'), indent=1)

if __name__ == '__main__': main()
