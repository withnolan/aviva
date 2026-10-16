#!/usr/bin/env bash
# palette.sh: dominant colours (k-means-ish quantize) of a box in an ORYZO frame.
# Usage: work/scripts/palette.sh <frame-prefix> x y w h [ncolours]
dir=/home/user/aviva/reference/oryzo-frames
f=$(ls $dir/${1}_*.jpg | head -1)
convert "$f" -crop ${4}x${5}+${2}+${3} +repage -colors ${6:-4} -format %c histogram:info: | sort -rn | sed 's/^ *//' | awk '{print $1, $3}'
