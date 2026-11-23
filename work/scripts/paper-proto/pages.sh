#!/usr/bin/env bash
# pages.sh: rasterise docs/research/aviva-a4.pdf into the eight s13 page textures (T36; T35 format: WebP 1240 x 1754,
# <= 120 KB each) at docs/assets/paper/pages/page-N.webp. Needs pdftoppm (poppler) and ImageMagick with WebP.
#   bash work/scripts/paper-proto/pages.sh
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../../.." && pwd); OUT="$ROOT/docs/assets/paper/pages"; TMP=$(mktemp -d)
mkdir -p "$OUT"
pdftoppm -r 150 -png "$ROOT/docs/research/aviva-a4.pdf" "$TMP/p"
n=1
for f in $(ls "$TMP"/p-*.png | sort -V); do
  for q in 80 72 64 56 48; do
    convert "$f" -resize 1240x1754! -quality $q -define webp:method=6 "$OUT/page-$n.webp"
    [ "$(stat -c %s "$OUT/page-$n.webp")" -le 122880 ] && break
  done
  echo "page-$n.webp $(identify -format '%wx%h' "$OUT/page-$n.webp") q$q $(( $(stat -c %s "$OUT/page-$n.webp") / 1024 )) KB"
  n=$((n + 1))
done
rm -rf "$TMP"
