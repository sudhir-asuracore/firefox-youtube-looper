#!/usr/bin/env bash
set -euo pipefail

VERSION=$(python - <<'PY'
import json
from pathlib import Path
print(json.loads(Path("manifest.json").read_text()).get("version", "0.0.0"))
PY
)

mkdir -p dist
zip -r "dist/yt-looper-${VERSION}.zip" \
  manifest.json \
  loop-utils.js \
  content-script.js \
  content-style.css

echo "Built dist/yt-looper-${VERSION}.zip"
