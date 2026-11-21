#!/bin/bash
# Render one frame range of a composition. usage: render_chunk.sh jobs/<id> <from> <to> <outfile> [concurrency] [composition]
# composition defaults to "Doc" (16:9 long-form); pass "ShortDoc" for a 9:16 Shorts job.
# NOTE: a --scale=2 supersampled render (2x pixel dims, e.g. 1080x1920 -> 2160x3840) was tried here for
# extra text/border/gradient sharpness, but under this runner's software GL (--gl=swangle, no real GPU)
# it multiplied render time well past what a GitHub Actions job can tolerate — a job that normally
# finishes in ~45-50min was still stuck in the Render step 1h48m later and had to be cancelled. Reverted
# to a native-resolution render; crispness now comes only from the --jpeg-quality/--crf settings below
# and the lanczos downscale in finalize_long.sh's preview step, not from oversampling the render itself.
set -e
J="$1"; A="$2"; B="$3"; OUT="$4"; C="${5:-4}"; COMP="${6:-Doc}"; P="$J/project"; NP=$(nproc); [ "$C" -gt "$NP" ] && C=$NP
CH=$(command -v google-chrome || command -v chromium || command -v chromium-browser)
cd "$P"; [ -d node_modules ] || { npm ci --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund >/dev/null; }
mkdir -p out
npx remotion render src/index.jsx "$COMP" "$OUT" --frames="$A-$B" --gl=swangle ${CH:+--browser-executable=$CH} --concurrency=$C --image-format=jpeg --jpeg-quality=92 --crf=18
