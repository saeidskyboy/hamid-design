#!/usr/bin/env bash
# Build index.html and screenshot preview PNGs of each design with headless Chrome.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/build.py
mkdir -p renders
shot() { # name query
  google-chrome --headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars \
    --window-size=1600,1000 --virtual-time-budget=40000 --screenshot="renders/$1.png" \
    "file://$PWD/index.html?$2&ui=0" >/dev/null 2>&1
}
for d in a b c; do
  shot "design-$d-day" "design=$d&view=${VIEW:-front}"
  shot "design-$d-night" "design=$d&view=${VIEW:-front}&night=1"
  shot "design-$d-corner" "design=$d&view=left"
  shot "design-$d-garden" "design=$d&view=garden"
done
ls -la renders/
