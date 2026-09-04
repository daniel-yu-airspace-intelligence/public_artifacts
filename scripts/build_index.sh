#!/usr/bin/env bash
# Regenerate index.html: one link per standalone *.html and per project dir (dir/index.html).
set -euo pipefail
cd "$(dirname "$0")/.."

{
  echo "<!doctype html><meta charset=utf-8><title>public_artifacts</title>"
  echo "<h1>public_artifacts</h1><ul>"
  find . -name '*.html' -not -path './index.html' -not -path './.git/*' | sort | while read -r f; do
    path="${f#./}"
    dir="${path%/*}"
    # A project is a dir with its own index.html; link the dir, skip its other pages.
    if [ -f "$dir/index.html" ]; then
      [ "$path" = "$dir/index.html" ] || continue
      link="$dir/"
    else
      link="$path"
    fi
    title=$(grep -o -i '<title>[^<]*' "$f" | head -1 | sed 's/<title>//i')
    [ -z "$title" ] && title="$link"
    echo "<li><a href=\"$link\">$title</a> — <code>$link</code></li>"
  done
  echo "</ul>"
} > index.html

echo "wrote index.html"
