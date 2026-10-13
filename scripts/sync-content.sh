#!/usr/bin/env bash
# Re-materialize the web app's content after manuscript changes.
# The app is self-contained for deployment: content/ and public/images are REAL
# copies (Vercel cannot follow the old absolute symlinks). Run this after any
# edit to chapters/{en,zh} or after re-running the figure-optimization pipeline.
set -euo pipefail
cd "$(dirname "$0")/.."
BOOK=..
for lang in en zh; do
  rsync -a --delete --copy-links "$BOOK/chapters/$lang/" "content/$lang/"
done
# Optimized figures come from the EPUB pipeline (1600px, palette-quantized):
#   NODE_PATH=web/node_modules node build_pdf/optimize_epub_images.js <src> <out>
rsync -a --delete /Users/lealzhang/permissionless-v10/build_pdf/epub_build/images/ public/images/
node scripts/gen-content-dates.mjs
node scripts/gen-page-dates.mjs
node scripts/gen-image-dims.mjs
echo "content synced — rebuild before deploying"
