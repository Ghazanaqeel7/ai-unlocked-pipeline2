#!/usr/bin/env python3
"""Comment-to-DM funnel + YouTube comment auto-replies. DRY-RUN unless PUBLISH_LIVE=1. Polling (run every 15 min by responder.yml).
Keyword comment (e.g. GUIDE) on IG/FB/YouTube ->
  IG : private reply DM "follow us, then reply DONE" -> on DONE we verify is_user_follow_business -> DM the Vault link (follow-gate)
  FB : private reply with the same ask; Meta gives no follow check for people, so DONE unlocks the link on trust
  YT : templated public reply with the Vault link (rate-limited, varied wording)
State: data/responder_state.json (committed by the workflow). Caps per run keep us inside API limits."""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'publish'))
from common import J, http, google_token, LIVE, GRAPH, ROOT
SP = os.path.join(ROOT, 'data', 'responder_state.json')
CAP = 15
YT_REPLIES = ["Thanks for commenting! Here is the free PDF vault: {u}", "Love it. Your free playbook is here: {u}", "Done! Grab the PDF guides here: {u}"]

def words():
    w = {'GUIDE'}
    mon = J('monetization.json', {}); w.add((mon.get('comment_word_default') or 'GUIDE').upper())
    jd = os.path.join(ROOT, 'jobs')
    for j in (os.listdir(jd) if os.path.isdir(jd) else []):
        g = J(f'jobs/{j}/project/src/guide.json', {}) or {}
        cw = (g.get('cta') or {}).get('comment_word')
        if cw: w.add(cw.upper())
    return w

def hit(text, ws): return any(w in (text or '').upper().split() or w in (text or '').upper() for w in ws)

def main():
    st = J('data/responder_state.json', {'done': {}, 'asked': {}}); ws = words(); n = 0
    vault = (J('monetization.json', {}) or {}).get('vault_url', '')
    pt, ig, fb = os.environ.get('META_PAGE_ACCESS_TOKEN'), os.environ.get('IG_USER_ID'), os.environ.get('FB_PAGE_ID')
    ask = ('Thanks for commenting! To unlock the free PDF: 1) follow @AIGraphicTV, 2) reply DONE here. '
           'I will send the link right away.')
    def send_dm(rcpt, text):
        print(f'  dm -> {list(rcpt.values())[0]}: {text[:60]}')
        return (not LIVE) or http('POST', f'{GRAPH}/{ig}/messages', js={'recipient': rcpt, 'message': {'text': text}, 'access_token': pt})[0] == 200
    if pt and ig:
        c, media, _ = http('GET', f'{GRAPH}/{ig}/media?fields=id,comments.limit(25){{id,text,from}}&limit=8&access_token={pt}')
        for m in (media.get('data', []) if c == 200 and isinstance(media, dict) else []):
            for cm in (m.get('comments') or {}).get('data', []):
                if cm['id'] in st['done'] or not hit(cm.get('text'), ws) or n >= CAP: continue
                if send_dm({'comment_id': cm['id']}, ask): st['done'][cm['id']] = 1; st['asked'][(cm.get('from') or {}).get('id', cm['id'])] = 'ig'; n += 1
        c, conv, _ = http('GET', f'{GRAPH}/{ig}/conversations?platform=instagram&fields=participants,messages.limit(1){{message,from}}&limit=25&access_token={pt}')
        for cv in (conv.get('data', []) if c == 200 and isinstance(conv, dict) else []):
            msg = (cv.get('messages', {}).get('data') or [{}])[0]; uid = (msg.get('from') or {}).get('id')
            if uid and st['asked'].get(uid) == 'ig' and (msg.get('message') or '').strip().upper().startswith('DONE'):
                ok = http('GET', f'{GRAPH}/{uid}?fields=is_user_follow_business&access_token={pt}')[1]
                if isinstance(ok, dict) and ok.get('is_user_follow_business'):
                    if send_dm({'id': uid}, f'You are in! Free PDF vault: {vault}'): st['asked'][uid] = 'sent'
                else: send_dm({'id': uid}, 'I cannot see the follow yet. Follow @AIGraphicTV, then reply DONE again.')
    if pt and fb:
        c, posts, _ = http('GET', f'{GRAPH}/{fb}/posts?fields=id,comments.limit(25){{id,message,from}}&limit=6&access_token={pt}')
        for p in (posts.get('data', []) if c == 200 and isinstance(posts, dict) else []):
            for cm in (p.get('comments') or {}).get('data', []):
                if cm['id'] in st['done'] or not hit(cm.get('message'), ws) or n >= CAP: continue
                print(f'  fb private reply -> {cm["id"]}')
                if not LIVE or http('POST', f'{GRAPH}/{cm["id"]}/private_replies', data={'message': f'Thanks! Free PDF vault (follow the page to stay updated): {vault}', 'access_token': pt})[0] == 200:
                    st['done'][cm['id']] = 1; n += 1
    tok = google_token(); own = (J('research/config.json', {}) or {}).get('own_channel')
    if tok and own:
        c, th, _ = http('GET', f'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&allThreadsRelatedToChannelId={own}&maxResults=50&order=time', {'Authorization': f'Bearer {tok}'})
        for t in (th.get('items', []) if c == 200 and isinstance(th, dict) else []):
            top = t['snippet']['topLevelComment']; sn = top['snippet']
            if top['id'] in st['done'] or sn.get('authorChannelId', {}).get('value') == own or not hit(sn.get('textDisplay'), ws) or n >= CAP: continue
            txt = YT_REPLIES[n % len(YT_REPLIES)].format(u=vault); print(f'  yt reply -> {top["id"]}: {txt[:50]}')
            if not LIVE or http('POST', 'https://www.googleapis.com/youtube/v3/comments?part=snippet', {'Authorization': f'Bearer {tok}'}, js={'snippet': {'parentId': top['id'], 'textOriginal': txt}})[0] == 200:
                st['done'][top['id']] = 1; n += 1
    if LIVE: json.dump(st, open(SP, 'w'), indent=1)
    print(f'responder: {n} actions (live={LIVE})')

if __name__ == '__main__': main()
