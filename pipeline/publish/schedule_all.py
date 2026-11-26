#!/usr/bin/env python3
"""Multi-platform scheduler: YouTube Long + Shorts, Instagram Reels, Facebook Reels. DRY-RUN unless PUBLISH_LIVE=1.
Only jobs the OWNER approved (status video_approved) are ever touched; this script never sets approval statuses.
  schedule_all.py            upload/schedule approved jobs (Long first, so Shorts can link to it)
  schedule_all.py comments   post the pinned-comment bridge once a YouTube video is public
Per job it records yt_id/yt_url/ig_id/fb_id via set_status.py (status unchanged).
NOTE: the YouTube API cannot PIN a comment. The bridge comment is posted and Slack asks you to pin it (one tap)."""
import datetime, json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'scripts'))
from common import J, http, google_token, LIVE, GRAPH, ROOT
from slack import post
PKT = datetime.timezone(datetime.timedelta(hours=5))
YT_BASE = 'https://www.youtube.com/watch?v='

def due(jid, cal):
    it = next((i for i in cal.get('items', []) if i.get('job') == jid), None)
    if it and it.get('date'):
        h, m = map(int, it['slot_pkt'].split(':'))
        return datetime.datetime.fromisoformat(it['date']).replace(hour=h, minute=m, tzinfo=PKT).astimezone(datetime.timezone.utc), it
    return datetime.datetime.now(datetime.timezone.utc), it

def record(jid, status, **kv):
    if not LIVE: return
    subprocess.run([sys.executable, 'pipeline/scripts/set_status.py', jid, status] + [f'{k}={v}' for k, v in kv.items()], cwd=ROOT, check=False)

def yt_upload(tok, jid, meta, video_path, when, long_url):
    short = (meta.get('package') or {}).get('slot', 'long') != 'long'
    desc = meta.get('description', '')
    if short and long_url: desc += f'\n\nFull video: {long_url}'
    body = {'snippet': {'title': (meta.get('title_options') or [meta['title']])[0][:100], 'description': desc[:4900],
                        'tags': meta.get('tags', [])[:15], 'categoryId': '28'},
            'status': {'privacyStatus': 'private', 'publishAt': when.strftime('%Y-%m-%dT%H:%M:%SZ'), 'selfDeclaredMadeForKids': False}}
    if when <= datetime.datetime.now(datetime.timezone.utc): body['status'] = {'privacyStatus': 'public', 'selfDeclaredMadeForKids': False}
    c, _, h = http('POST', 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
                   {'Authorization': f'Bearer {tok}', 'X-Upload-Content-Type': 'video/mp4'}, js=body)
    if c != 200: return None, f'init {c}'
    c, r, _ = http('PUT', h.get('Location') or h.get('location'), {'Content-Type': 'video/mp4'}, data=open(video_path, 'rb').read(), timeout=1800)
    return (r.get('id') if c in (200, 201) and isinstance(r, dict) else None), f'upload {c}'

def main():
    comments = len(sys.argv) > 1 and sys.argv[1] == 'comments'
    st, cal = J('state.json', {'jobs': {}}), J('docs/calendar.json', {})
    tok = google_token()
    jobs = [(j, v) for j, v in st['jobs'].items() if v.get('status') == 'video_approved']
    jobs.sort(key=lambda x: 0 if (J(f'jobs/{x[0]}/meta.json', {}).get('package') or {}).get('slot', 'long') == 'long' else 1)
    for jid, j in jobs:
        meta = J(f'jobs/{jid}/meta.json', {}); pk = meta.get('package') or {}
        when, it = due(jid, cal)
        long_job = next((k for k, v in st['jobs'].items() if (J(f'jobs/{k}/meta.json', {}).get('package') or {}).get('slot') == 'long'
                         and (J(f'jobs/{k}/meta.json', {}).get('package') or {}).get('id') == pk.get('id') and k != jid), None) if pk.get('slot') != 'long' else None
        long_url = YT_BASE + st['jobs'][long_job]['yt_id'] if long_job and st['jobs'][long_job].get('yt_id') else ''
        if comments:                                           # phase 2: bridge comment after the video is public
            if j.get('yt_id') and not j.get('yt_comment_id') and datetime.datetime.now(datetime.timezone.utc) >= when:
                text = (meta.get('pinned_comment') or '').replace('{LONG_URL}', long_url or '')
                print(f'[{jid}] comment: {text[:80]}')
                if LIVE and tok and text:
                    c, r, _ = http('POST', 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet', {'Authorization': f'Bearer {tok}'},
                        js={'snippet': {'videoId': j['yt_id'], 'topLevelComment': {'snippet': {'textOriginal': text}}}})
                    if c == 200: record(jid, 'video_approved', yt_comment_id=r['id']); post(f"Pin this comment on `{jid}` (API cannot pin): {YT_BASE}{j['yt_id']}")
            continue
        if pk.get('slot') != 'long' and long_job and not st['jobs'][long_job].get('yt_id'):
            print(f'[{jid}] waits for its long ({long_job}) to be on YouTube'); continue
        vp = os.path.join(ROOT, 'jobs', jid, 'project', 'out', 'final.mp4')
        print(f"[{jid}] {pk.get('slot','long')} -> due {when:%Y-%m-%d %H:%M}Z  live={LIVE}")
        if not j.get('yt_id'):
            if LIVE and tok and (os.path.exists(vp) or j.get('video_url')):
                if not os.path.exists(vp):
                    os.makedirs(os.path.dirname(vp), exist_ok=True)
                    open(vp, 'wb').write(http('GET', j['video_url'], timeout=1800)[1])
                vid, info = yt_upload(tok, jid, meta, vp, when, long_url)
                print('  youtube:', vid or info)
                if vid:
                    record(jid, 'video_approved', yt_id=vid, yt_url=YT_BASE + vid)
                    j['yt_id'] = vid
                    th = os.path.join(ROOT, 'jobs', jid, 'thumbnail.jpg')
                    if os.path.exists(th) and pk.get('slot', 'long') == 'long':
                        http('POST', f'https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={vid}', {'Authorization': f'Bearer {tok}', 'Content-Type': 'image/jpeg'}, data=open(th, 'rb').read())
            else: print('  youtube: dry-run or missing YT_* secrets')
        reel = pk.get('slot', 'long') != 'long' and j.get('video_url')
        if reel and datetime.datetime.now(datetime.timezone.utc) >= when:   # Reels publish at their window (no native scheduling)
            cap = meta.get('description', '')[:2000]
            ig, fb, pt = os.environ.get('IG_USER_ID'), os.environ.get('FB_PAGE_ID'), os.environ.get('META_PAGE_ACCESS_TOKEN')
            if LIVE and pt and ig and not j.get('ig_id'):
                c, r, _ = http('POST', f'{GRAPH}/{ig}/media', data={'media_type': 'REELS', 'video_url': j['video_url'], 'caption': cap, 'access_token': pt})
                if c == 200:
                    import time
                    for _ in range(30):
                        time.sleep(10); s = http('GET', f"{GRAPH}/{r['id']}?fields=status_code&access_token={pt}")[1]
                        if isinstance(s, dict) and s.get('status_code') == 'FINISHED': break
                    c2, r2, _ = http('POST', f'{GRAPH}/{ig}/media_publish', data={'creation_id': r['id'], 'access_token': pt})
                    if c2 == 200: record(jid, 'video_approved', ig_id=r2['id'])
                print('  instagram:', c)
            if LIVE and pt and fb and not j.get('fb_id'):
                c, r, _ = http('POST', f'{GRAPH}/{fb}/video_reels', data={'upload_phase': 'start', 'access_token': pt})
                if c == 200:
                    http('POST', r['upload_url'], {'Authorization': f'OAuth {pt}', 'file_url': j['video_url']})
                    c2, r2, _ = http('POST', f'{GRAPH}/{fb}/video_reels', data={'upload_phase': 'finish', 'video_id': r['video_id'], 'video_state': 'PUBLISHED', 'description': cap, 'access_token': pt})
                    if c2 == 200: record(jid, 'video_approved', fb_id=r['video_id'])
                print('  facebook:', c)
    if not jobs: print('no video_approved jobs')

if __name__ == '__main__': main()
