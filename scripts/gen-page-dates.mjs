#!/usr/bin/env node
/**
 * Snapshot a per-route last-modified date for NON-chapter pages into
 * src/lib/page-dates.json (chapters use content-dates.json).
 *
 * Date = newest git commit date across the route's own source files (page +
 * its view component / data). Committed as a stable snapshot because Vercel
 * builds from a fresh checkout. Re-run before deploy:
 *   node scripts/gen-page-dates.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROUTES = {
  "/": ["src/app/page.tsx"],
  "/contents": ["src/app/contents/page.tsx", "src/components/ContentsView.tsx", "src/lib/toc.ts"],
  "/paths": ["src/app/paths/page.tsx", "src/components/PathsView.tsx"],
  "/labs": ["src/app/labs/page.tsx", "src/components/labs/LabsView.tsx", "src/lib/labs.ts"],
  "/labs/liquidation-cascade": ["src/components/labs/CascadeLab.tsx"],
  "/labs/funding-rate": ["src/components/labs/FundingLab.tsx"],
  "/labs/order-book": ["src/components/labs/OrderBookLab.tsx"],
  "/labs/execution-duel": ["src/components/labs/ExecutionDuel.tsx"],
  "/labs/survivor": ["src/components/labs/SurvivorGame.tsx"],
  "/download": ["src/app/download/page.tsx", "src/components/DownloadView.tsx", "src/lib/external.ts"],
  "/problems": ["src/app/problems/page.tsx", "src/components/ProblemsView.tsx"],
  "/glossary": ["src/app/glossary/page.tsx", "src/components/GlossaryView.tsx", "src/lib/glossary.ts"],
  "/community": ["src/app/community/page.tsx", "src/components/CommunityView.tsx"],
  "/support": ["src/app/support/page.tsx", "src/components/SupportView.tsx"],
};

function gitDate(files) {
  const existing = files.filter((f) => fs.existsSync(path.join(process.cwd(), f)));
  if (!existing.length) return "";
  try {
    return execFileSync("git", ["log", "-1", "--format=%cI", "--", ...existing], {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim();
  } catch {
    return "";
  }
}

const out = {};
for (const [route, files] of Object.entries(ROUTES)) {
  const d = gitDate(files);
  if (d) out[route] = new Date(d).toISOString();
}
const dest = path.join(process.cwd(), "src", "lib", "page-dates.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 0) + "\n");
console.log(`wrote page-dates.json: ${Object.keys(out).length} routes`);
