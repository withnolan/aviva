#!/usr/bin/env bash
# peak.sh: the most "accent" pixels in a box: top N by (R-B) chroma, and the brightest N.
# Usage: work/scripts/peak.sh <frame-prefix> x y w h [mode: warm|bright|dark] [N]
dir=/home/user/aviva/reference/oryzo-frames
f=$(ls $dir/${1}_*.jpg | head -1)
mode=${6:-warm}; n=${7:-5}
convert "$f" -crop ${4}x${5}+${2}+${3} +repage txt:- | tail -n +2 | \
 sed -E 's/.*\(([0-9]+),([0-9]+),([0-9]+)\).*/\1 \2 \3/' | \
 awk -v m=$mode '{r=$1;g=$2;b=$3; if(m=="warm") k=r-b; else if(m=="bright") k=r+g+b; else k=-(r+g+b); printf "%d %02X%02X%02X\n", k, r,g,b}' | sort -rn | head -n 40 | \
 awk '{c[$2]++; if(!($2 in o)){o[$2]=NR; l[NR]=$2}} END{for(i=1;i<=NR;i++) if(l[i]!="") print "#" l[i]}' | head -n $n | tr '\n' ' '; echo
