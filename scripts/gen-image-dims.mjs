#!/usr/bin/env node
/**
 * Snapshot every figure PNG's intrinsic pixel dimensions into
 * src/lib/image-dims.json (basename → [width, height]).
 *
 * WHY: setting width/height on <img> lets the browser reserve the correct
 * aspect-ratio box before the image loads, eliminating layout shift (CLS) —
 * a Core Web Vitals ranking factor. Reads the PNG IHDR header directly (no
 * dependency). Re-run when figures change: node scripts/gen-image-dims.mjs
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(process.cwd(), "public", "images");
const out = {};

for (const f of fs.readdirSync(DIR)) {
  // Only the figures the book actually renders (fig-N-M.png / fig-N-M-en.png);
  // the raw dl_* source images are never requested by a page.
  if (!/^fig-.*\.png$/i.test(f)) continue;
  const buf = Buffer.alloc(24);
  const fd = fs.openSync(path.join(DIR, f), "r");
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  // PNG signature is 8 bytes; IHDR width/height are big-endian u32 at 16/20.
  if (buf.toString("ascii", 1, 4) === "PNG") {
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    if (w > 0 && h > 0) out[f] = [w, h];
  }
}

const dest = path.join(process.cwd(), "src", "lib", "image-dims.json");
fs.writeFileSync(dest, JSON.stringify(out) + "\n");
console.log(`wrote image-dims.json: ${Object.keys(out).length} images`);
