#!/usr/bin/env node
/**
 * Snapshot each chapter's last-modified date into src/lib/content-dates.json.
 *
 * WHY: sitemap lastmod must NOT be the build time. Vercel checks out fresh on
 * every deploy, so file mtimes all become "now" — Google learns to distrust the
 * lastmod. This commits a STABLE date map instead (git commit date when the
 * content is tracked, else file mtime). Re-run before deploy after editing any
 * chapter:  node scripts/gen-content-dates.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const CHAPTERS = path.resolve(process.cwd(), "..", "chapters");
const out = {};

for (const lang of ["en", "zh"]) {
  const dir = path.join(CHAPTERS, lang);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const num = f.replace(/\.md$/, "");
    const fp = path.join(dir, f);
    let iso = "";
    try {
      iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", fp], {
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .trim();
    } catch {
      /* not tracked yet — fall back to mtime */
    }
    if (!iso) {
      try {
        iso = fs.statSync(fp).mtime.toISOString();
      } catch {}
    }
    if (iso && (!out[num] || iso > out[num])) out[num] = iso;
  }
}

const dest = path.join(process.cwd(), "src", "lib", "content-dates.json");
fs.writeFileSync(dest, JSON.stringify(out) + "\n");
console.log(`wrote content-dates.json: ${Object.keys(out).length} chapters`);
