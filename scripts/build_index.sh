#!/usr/bin/env bash
# Regenerate index.html: one link per *.html file in repo (except index.html).
set -euo pipefail
cd "$(dirname "$0")/.."

{
  echo "<!doctype html><meta charset=utf-8><title>public_artifacts</title>"
  echo "<h1>public_artifacts</h1><ul>"
  find . -name '*.html' -not -name 'index.html' -not -path './.git/*' | sort | while read -r f; do
    path="${f#./}"
    title=$(grep -o -i '<title>[^<]*' "$f" | head -1 | sed 's/<title>//i')
    [ -z "$title" ] && title="$path"
    echo "<li><a href=\"$path\">$title</a> — <code>$path</code></li>"
  done
  echo "</ul>"
} > index.html

echo "wrote index.html"
