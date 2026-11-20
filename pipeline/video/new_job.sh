#!/bin/bash
# Start a job folder. usage: pipeline/video/new_job.sh <id> [long|short]   (id is numeric-first, e.g. 004-sears-fall)
# Default type is "long" (6-10min 16:9 deep-dive). Pass "short" for a 35-55s 9:16 Shorts job (ShortDoc composition).
set -e
ID="$1"; TYPE="${2:-long}"
[ -n "$ID" ] || { echo "usage: new_job.sh <id> [long|short]"; exit 1; }
case "$ID" in [0-9]*) ;; *) echo "id must start with a digit"; exit 1;; esac
case "$TYPE" in long|short) ;; *) echo "type must be 'long' or 'short'"; exit 1;; esac
D="jobs/$ID"; [ -e "$D" ] && { echo "$D exists"; exit 1; }
mkdir -p "$D"
rsync -a --exclude node_modules --exclude package-lock.json --exclude out --exclude 'public/assets/*' pipeline/template/ "$D/project/" 2>/dev/null || {
  mkdir -p "$D/project"; (cd pipeline/template-long && tar cf - --exclude=node_modules --exclude=out --exclude='public/assets/*' .) | (cd "$D/project" && tar xf -); }
mkdir -p "$D/project/public/assets" "$D/review"
echo "{\"type\": \"$TYPE\"}" > "$D/meta.json"
if [ "$TYPE" = "short" ]; then
  echo "created $D (type:short, composition:ShortDoc, 1080x1920, ~35-55s). Write: $D/script.md, $D/factmap.md, $D/project/src/scenes.json, $D/meta.json (add title/etc to the type key already set), $D/project/src/thumb.json"
else
  echo "created $D (type:long, composition:Doc, 1920x1080, ~6-10min). Write: $D/script.md, $D/factmap.md, $D/project/src/scenes.json, $D/meta.json (add title/etc to the type key already set), $D/project/src/thumb.json"
fi
