#!/usr/bin/env bash
set -euo pipefail

VERSION=$(sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' manifest.json | head -n 1)
if [ -z "${VERSION}" ]; then
  VERSION="0.0.0"
fi

mkdir -p dist
zip -r "dist/yt-looper-${VERSION}.zip" \
  manifest.json \
  icons \
  background.js \
  loop-utils.js \
  content-script.js \
  content-style.css

echo "Built dist/yt-looper-${VERSION}.zip"
