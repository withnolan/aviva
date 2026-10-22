#!/usr/bin/env bash
# stage.sh: a staging copy of docs/ for the paper module (decision #45: docs/js/paper/ stays bootable at every save).
# Edits go to the stage's copies of docs/js/paper/ and docs/lab/; everything else in the stage is a symlink to docs/,
# so the stage is the live site plus the work in progress. `land` boot-checks the stage, then switches the changed
# files into docs/ by rename (all in a few milliseconds) and boot-checks the live site.
#
#   STAGE=/path/to/stage work/scripts/stage.sh init    # (re)build the stage from docs/ and serve it on :8091
#   STAGE=/path/to/stage work/scripts/stage.sh check   # refresh the symlinks, syntax- and boot-check the stage
#   STAGE=/path/to/stage work/scripts/stage.sh diff    # list the staged files that differ from docs/
#   STAGE=/path/to/stage work/scripts/stage.sh land    # check, then switch the changed files into docs/, check live
set -euo pipefail
ROOT=/home/user/aviva
STAGE=${STAGE:-${TMPDIR:-/tmp}/aviva-stage}
PORT=${PORT:-8091}
LAB=${LAB:-state=herorest}
cmd=${1:-check}

relink() {
  mkdir -p "$STAGE/docs/js"
  for e in "$ROOT"/docs/* "$ROOT"/docs/.nojekyll; do
    [ -e "$e" ] || continue; n=$(basename "$e")
    [ "$n" = js ] || [ "$n" = lab ] && continue
    [ -L "$STAGE/docs/$n" ] || ln -s "$e" "$STAGE/docs/$n"
  done
  for e in "$ROOT"/docs/js/*; do
    n=$(basename "$e"); [ "$n" = paper ] && continue
    [ -L "$STAGE/docs/js/$n" ] || ln -s "$e" "$STAGE/docs/js/$n"
  done
}
serve() {
  if ! curl -s -o /dev/null "http://localhost:$PORT/"; then
    nohup python3 -m http.server "$PORT" --directory "$STAGE/docs" >/dev/null 2>&1 &
    sleep 1
  fi
}
changed() { (cd "$STAGE/docs" && find js/paper lab -type f) | while read -r f; do cmp -s "$STAGE/docs/$f" "$ROOT/docs/$f" || echo "$f"; done; }
syntax() { for f in "$STAGE"/docs/js/paper/*.js "$STAGE"/docs/lab/*.js; do node --check "$f"; done; }

case "$cmd" in
  init)
    rm -rf "$STAGE"; mkdir -p "$STAGE/docs/js"
    cp -r "$ROOT/docs/js/paper" "$STAGE/docs/js/paper"; cp -r "$ROOT/docs/lab" "$STAGE/docs/lab"
    relink; serve; echo "stage at $STAGE, http://localhost:$PORT/" ;;
  diff) changed ;;
  check)
    relink; serve; syntax
    node "$ROOT/work/scripts/boot-check.mjs" --base "http://localhost:$PORT" --lab "$LAB" ;;
  land)
    relink; serve; syntax
    node "$ROOT/work/scripts/boot-check.mjs" --base "http://localhost:$PORT" --lab "$LAB" || { echo "the stage does not boot: nothing landed"; exit 1; }
    mapfile -t files < <(changed)
    [ ${#files[@]} -eq 0 ] && { echo "nothing to land"; exit 0; }
    for f in "${files[@]}"; do mkdir -p "$(dirname "$ROOT/docs/$f")"; cp "$STAGE/docs/$f" "$ROOT/docs/$f.landing"; done
    for f in "${files[@]}"; do mv -f "$ROOT/docs/$f.landing" "$ROOT/docs/$f"; done
    echo "landed: ${files[*]}"
    node "$ROOT/work/scripts/boot-check.mjs" --base "http://localhost:8080" --lab "$LAB" ;;
  *) echo "usage: stage.sh init|check|diff|land"; exit 2 ;;
esac
