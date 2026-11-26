#!/usr/bin/env python3
"""Build docs/vault/vault.json: every APPROVED guide.pdf (Gate 2 = video + PDF, so status video_approved/published)
plus the live monetization offers. The PDFs stay as GitHub release assets (job-<id>/guide.pdf); the Vault links to them.
Run in CI (vault.yml). A guide is listed only if its release asset really exists (HEAD check)."""
import json, os, re, sys, urllib.request
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OK = ('video_approved', 'published')

def exists(url):
    try:
        req = urllib.request.Request(url, method='HEAD'); urllib.request.urlopen(req, timeout=20); return True
    except Exception: return False

def main():
    st = json.load(open(os.path.join(ROOT, 'state.json'), encoding='utf-8'))
    mon = json.load(open(os.path.join(ROOT, 'monetization.json'), encoding='utf-8'))
    skip_check = '--no-check' in sys.argv
    guides = []
    for jid, j in st['jobs'].items():
        if j.get('status') not in OK or not re.match(r'\d', jid): continue
        vurl = j.get('video_url', '')
        pdf = j.get('guide_url') or (vurl.rsplit('/', 1)[0] + '/guide.pdf' if vurl else '')
        if not pdf or not (skip_check or exists(pdf)): continue
        meta = {}
        try: meta = json.load(open(os.path.join(ROOT, 'jobs', jid, 'meta.json'), encoding='utf-8'))
        except Exception: pass
        desc = (meta.get('description') or '').strip().split('\n')[0]
        guides.append({'id': jid, 'title': j.get('title') or meta.get('title') or jid, 'pdf_url': pdf, 'video_url': vurl,
                       'youtube_url': j.get('yt_url', ''), 'summary': desc[:220], 'tags': (meta.get('tags') or [])[:6],
                       'date': (j.get('decided_at') or j.get('updated') or '')[:10]})
    guides.sort(key=lambda g: g['date'], reverse=True)
    live = lambda xs: [{k: v for k, v in x.items() if k != 'live'} for x in xs if x.get('live') and x.get('url')]
    out = {'brand': mon.get('brand'), 'vault_url': mon.get('vault_url'), 'guides': guides, 'offers': live(mon.get('offers', [])),
           'affiliates': live(mon.get('affiliates', [])), 'disclosure': mon.get('disclosure', '')}
    json.dump(out, open(os.path.join(ROOT, 'docs', 'vault', 'vault.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(f'vault: {len(guides)} guides, {len(out["offers"])} live offers')

if __name__ == '__main__': main()
