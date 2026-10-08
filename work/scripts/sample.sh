#!/usr/bin/env bash
# sample.sh: average colour (hex) of a WxH box in an ORYZO reference frame.
# Usage: work/scripts/sample.sh <frame-number-prefix> "<label>:x,y[,w,h]" ...
# Coordinates are frame px (1440x748 frame; page viewport is rows 34-743).
set -e
dir=/home/user/aviva/reference/oryzo-frames
f=$(ls $dir/${1}_*.jpg | head -1); shift
for spec in "$@"; do
  label=${spec%%:*}; c=${spec#*:}
  IFS=, read -r x y w h <<<"$c"; w=${w:-6}; h=${h:-6}
  hex=$(convert "$f" -crop ${w}x${h}+${x}+${y} +repage -resize 1x1\! -format "%[hex:p{0,0}]" info:)
  printf "%-4s %-28s #%s\n" "$(basename $f | cut -d_ -f1)" "$label" "$hex"
done
