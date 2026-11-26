#!/usr/bin/env python3
"""Tiny Slack helper (chat.postMessage). Needs SLACK_BOT_TOKEN + SLACK_CHANNEL_ID. Never raises: prints and returns False."""
import json, os, sys, urllib.request

def post(text):
    tok, ch = os.environ.get('SLACK_BOT_TOKEN'), os.environ.get('SLACK_CHANNEL_ID')
    if not tok or not ch:
        print('[slack skipped: no token/channel]\n' + text); return False
    try:
        req = urllib.request.Request('https://slack.com/api/chat.postMessage', method='POST',
            data=json.dumps({'channel': ch, 'text': text[:3800], 'mrkdwn': True}).encode(),
            headers={'Authorization': f'Bearer {tok}', 'Content-Type': 'application/json; charset=utf-8'})
        r = json.load(urllib.request.urlopen(req, timeout=20))
        if not r.get('ok'): print('slack error:', r.get('error')); return False
        return True
    except Exception as e:
        print('slack failed:', e); return False

if __name__ == '__main__': post(' '.join(sys.argv[1:]))
