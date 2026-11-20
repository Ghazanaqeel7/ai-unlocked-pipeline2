#!/bin/bash
# Render one frame range of a composition. usage: render_chunk.sh jobs/<id> <from> <to> <outfile> [concurrency] [composition]
# composition defaults to "Doc" (16:9 long-form); pass "ShortDoc" for a 9:16 Shorts job.
# --scale=2 renders at 2x the composition's native pixel dimensions (e.g. 1080x1920 -> 2160x3840) for
# crisp text/thin-borders/gradients (Remotion's equivalent of a 2x devicePixelRatio/deviceScaleFactor
# render) — finalize_long.sh downscales the concatenated chunks back down to the native resolution
# afterwards, so the *published* video stays at its native size while benefiting from the supersampled
# render quality.
set -e
J="$1"; A="$2"; B="$3"; OUT="$4"; C="${5:-4}"; COMP="${6:-Doc}"; P="$J/project"; NP=$(nproc); [ "$C" -gt "$NP" ] && C=$NP
CH=$(command -v google-chrome || command -v chromium || command -v chromium-browser)
cd "$P"; [ -d node_modules ] || { npm ci --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund >/dev/null; }
mkdir -p out
npx remotion render src/index.jsx "$COMP" "$OUT" --frames="$A-$B" --scale=2 --gl=swangle ${CH:+--browser-executable=$CH} --concurrency=$C --image-format=jpeg --jpeg-quality=92 --crf=18
