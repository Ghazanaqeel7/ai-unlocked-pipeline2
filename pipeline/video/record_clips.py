#!/usr/bin/env python3
"""Record real headless-browser screen captures for `liveclipcard` beats in a job's scenes.json.
usage: record_clips.py jobs/<id>   --selftest runs offline checks (no network/browser)

Runs in GitHub Actions (same place fetch_assets.py runs, right before `npm ci`). Scope (confirmed by
the user): public open-source URLs only (GitHub repos, HuggingFace spaces, public docs, open demo
pages) — never a site requiring login. Every clip gets a short, strict time budget; a site that blocks
headless browsers, times out, or has no selector to click just means that one clip is skipped — this
script must NEVER fail the job over a recording failure.

Mirrors fetch_assets.py's own pattern exactly: walks scenes.json, and on a successful recording writes
`resolved: {file: "assets/clips/<sceneId>-<beatIndex>.mp4"}` back onto that beat's own dict in
scenes.json (then rewrites the file) — LiveClipCard.jsx reads `visual.resolved.file` the same way
common.jsx's `resolvedSrc()` already does for images, with no new Remotion-side capability needed.
No `resolved` key means record_clips.py never attempted it or the attempt failed; LiveClipCard.jsx
renders its own generic fallback card in that case, so a render never ships a blank frame.

Clips are written to project/public/assets/clips/ — a sub-folder of public/assets/, which render.yml's
tar-refresh step already excludes (`--exclude='public/assets/*'`) so a job's recorded clips persist
across re-renders exactly like its fetched stock photos, with no extra exclude rule needed.
"""
import json, os, re, sys, subprocess, shutil, time

TIME_BUDGET_S = 12          # hard wall-clock cap per clip, nav + actions + stop, per the user's ask
VIEWPORT = {'width': 1280, 'height': 800}
# Scope (user-confirmed): only attempt public, loginless, open-source-adjacent surfaces. Anything else
# just falls through to LiveClipCard's generic fallback — this is a safety net, not the only gate;
# scenes.json authors should only ever point `liveclipcard.url` at pages like these in the first place.
ALLOWED_HOST_RE = re.compile(
    r'(^|\.)(github\.com|raw\.githubusercontent\.com|huggingface\.co|readthedocs\.io|'
    r'npmjs\.com|pypi\.org|docs\.python\.org|developer\.mozilla\.org|arxiv\.org)$', re.I)
COOKIE_SELECTORS = [
    'button:has-text("Accept")', 'button:has-text("Accept all")', 'button:has-text("I agree")',
    'button:has-text("Got it")', '#cookie-accept', '[aria-label="Accept cookies"]',
]


def host_allowed(url):
    try:
        from urllib.parse import urlparse
        host = urlparse(url).hostname or ''
    except Exception:
        return False
    return bool(ALLOWED_HOST_RE.search(host))


def walk_liveclip_beats(scenes):
    """yields (scene_id, beat_index, beat_dict) for every liveclipcard beat, matching Doc.jsx's own
    `${sc.id}-${bi}` key scheme exactly, so filenames line up 1:1 with render-time beat identity."""
    for s in scenes:
        beats = s['visual'] if isinstance(s.get('visual'), list) else [s.get('visual')]
        for bi, b in enumerate(beats):
            if isinstance(b, dict) and b.get('type') == 'liveclipcard':
                yield s.get('id'), bi, b


def record_one(pw, url, actions, dest_webm):
    """One attempt, wrapped by the caller in an overall time budget. Returns True on success."""
    from playwright.sync_api import TimeoutError as PWTimeout
    browser = pw.chromium.launch(headless=True, args=['--autoplay-policy=no-user-gesture-required'])
    try:
        ctx = browser.new_context(
            viewport=VIEWPORT, record_video_dir=os.path.dirname(dest_webm), record_video_size=VIEWPORT,
        )
        page = ctx.new_page()
        page.set_default_timeout(5000)
        page.goto(url, wait_until='domcontentloaded', timeout=8000)
        for sel in COOKIE_SELECTORS:
            try:
                page.locator(sel).first.click(timeout=800)
                break
            except Exception:
                pass
        for act in (actions or []):
            try:
                kind = act.get('type')
                if kind == 'wait':
                    page.wait_for_timeout(int(act.get('ms', 600)))
                elif kind == 'scroll':
                    page.mouse.wheel(0, int(act.get('dy', 400)))
                    page.wait_for_timeout(300)
                elif kind == 'click' and act.get('selector'):
                    page.locator(act['selector']).first.click(timeout=1500)
                    page.wait_for_timeout(400)
            except (PWTimeout, Exception):
                continue  # one failed scripted action never kills the whole clip
        page.wait_for_timeout(500)
        video_path = page.video.path() if page.video else None
        ctx.close()
        if video_path and os.path.exists(video_path):
            if video_path != dest_webm:
                shutil.move(video_path, dest_webm)
            return True
        return False
    finally:
        browser.close()


def webm_to_mp4(src_webm, dest_mp4, fps=60):
    """Re-encode to crisp 60fps h264 mp4 (Playwright's own capture rate is lower; this just gives
    Remotion a smooth, standard-codec clip to composite, matching the rest of the pipeline's ffmpeg use)."""
    subprocess.run(
        ['ffmpeg', '-y', '-i', src_webm, '-r', str(fps), '-c:v', 'libx264', '-preset', 'fast',
         '-crf', '20', '-pix_fmt', 'yuv420p', '-an', dest_mp4],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )


def main():
    if '--selftest' in sys.argv:
        assert host_allowed('https://github.com/foo/bar')
        assert host_allowed('https://huggingface.co/spaces/x')
        assert not host_allowed('https://chatgpt.com/')
        assert not host_allowed('https://accounts.google.com/')
        print('selftest ok'); return
    job = sys.argv[1].rstrip('/')
    P = os.path.join(job, 'project')
    scenes_path = os.path.join(P, 'src', 'scenes.json')
    try:
        data = json.load(open(scenes_path, encoding='utf-8'))
    except Exception as e:
        print('record_clips: scenes.json unreadable, skipping clip recording:', e); return
    beats = list(walk_liveclip_beats(data.get('scenes', [])))
    if not beats:
        print('record_clips: no liveclipcard beats, nothing to do'); return

    try:
        from playwright.sync_api import sync_playwright
    except Exception as e:
        print('record_clips: playwright not installed, all liveclipcard beats fall back:', e); return

    clips_dir = os.path.join(P, 'public', 'assets', 'clips'); os.makedirs(clips_dir, exist_ok=True)
    recorded, skipped = 0, 0
    with sync_playwright() as pw:
        for sid, bi, b in beats:
            name = f'{sid}-{bi}'
            url = b.get('url', '')
            if not url or not host_allowed(url):
                print(f'record_clips: {name}: url not in the allowed public-site scope, skipping -> fallback card'); skipped += 1; continue
            webm = os.path.join(clips_dir, f'{name}.webm')
            mp4 = os.path.join(clips_dir, f'{name}.mp4')
            t0 = time.time()
            try:
                ok = record_one(pw, url, b.get('actions'), webm)
                if ok and time.time() - t0 <= TIME_BUDGET_S + 5:
                    webm_to_mp4(webm, mp4)
                    b['resolved'] = {'file': f'assets/clips/{name}.mp4'}
                    recorded += 1
                    print(f'record_clips: {name}: recorded {url}')
                else:
                    print(f'record_clips: {name}: no video produced for {url}, falling back'); skipped += 1
            except Exception as e:
                print(f'record_clips: {name}: failed ({e!r}) for {url}, falling back'); skipped += 1
            finally:
                for tmp in (webm,):
                    if os.path.exists(tmp):
                        try: os.remove(tmp)
                        except OSError: pass

    json.dump(data, open(scenes_path, 'w', encoding='utf-8'), indent=2)
    print(f'record_clips: {recorded} recorded, {skipped} fell back to generic card')


if __name__ == '__main__':
    main()
