"""Shared helpers: http, Google OAuth token refresh, state reads. Stdlib only."""
import json, os, urllib.parse, urllib.request, urllib.error
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')

def J(p, d=None):
    try: return json.load(open(os.path.join(ROOT, p), encoding='utf-8'))
    except Exception: return d

def http(method, url, headers=None, data=None, js=None, timeout=120):
    h = dict(headers or {})
    if js is not None: data = json.dumps(js).encode(); h.setdefault('Content-Type', 'application/json; charset=utf-8')
    elif isinstance(data, dict): data = urllib.parse.urlencode(data).encode()
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, data=data, headers=h, method=method), timeout=timeout)
        b = r.read(); return r.status, (json.loads(b) if b[:1] in (b'{', b'[') else b), dict(r.headers)
    except urllib.error.HTTPError as e:
        b = e.read(); return e.code, (json.loads(b) if b[:1] in (b'{', b'[') else b), {}

def google_token():
    ids = [os.environ.get(k) for k in ('YT_CLIENT_ID', 'YT_CLIENT_SECRET', 'YT_REFRESH_TOKEN')]
    if not all(ids): return None
    c, body, _ = http('POST', 'https://oauth2.googleapis.com/token', data={'client_id': ids[0], 'client_secret': ids[1],
                      'refresh_token': ids[2], 'grant_type': 'refresh_token'})
    return body.get('access_token') if c == 200 else None

LIVE = os.environ.get('PUBLISH_LIVE') == '1'
GRAPH = 'https://graph.facebook.com/v21.0'
