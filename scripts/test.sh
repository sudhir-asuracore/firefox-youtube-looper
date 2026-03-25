#!/usr/bin/env bash
set -euo pipefail

python3 -m json.tool manifest.json > /dev/null

test -f content-script.js

test -f content-style.css

node tests/utils.test.js

echo "Basic checks passed"
