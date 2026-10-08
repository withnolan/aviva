#!/usr/bin/env bash
# bbox.sh: bounding box of "ink" inside a region of an ORYZO frame.
# Usage: work/scripts/bbox.sh <frame-prefix> x y w h <threshold%> [light|dark]
#   light = ink is brighter than threshold (light text on dark); dark = ink is darker.
# Prints: frame-coords box  x0..x1 (w)  y0..y1 (h), and y relative to viewport top (row 34).
dir=/home/user/aviva/reference/oryzo-frames
f=$(ls $dir/${1}_*.jpg | head -1)
x=$2; y=$3; w=$4; h=$5; t=$6; mode=${7:-light}
neg=""; [ "$mode" = "dark" ] && neg="-negate"
g=$(convert "$f" -crop ${w}x${h}+${x}+${y} +repage -colorspace Gray $neg -threshold ${t}% -format "%@" info:)
# g looks like WxH+X+Y
bw=${g%%x*}; rest=${g#*x}; bh=${rest%%+*}; rest=${rest#*+}; bx=${rest%%+*}; by=${rest#*+}
x0=$((x+bx)); y0=$((y+by)); x1=$((x0+bw-1)); y1=$((y0+bh-1))
printf "x %d..%d (w %d)  y %d..%d (h %d)  [vp y %d..%d]\n" $x0 $x1 $bw $y0 $y1 $bh $((y0-34)) $((y1-34))
