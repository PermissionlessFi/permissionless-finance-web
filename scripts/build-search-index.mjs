#!/usr/bin/env node
/**
 * Build the Meilisearch index from the book's markdown.
 * One document per section (## / ###) so results jump to the right anchor.
 *
 * Env:
 *   MEILI_HOST       (default http://localhost:7700)
 *   MEILI_ADMIN_KEY  (the master/admin key — write access)
 *   MEILI_INDEX      (default permissionless-finance)
 *
 * Run from web/:  node scripts/build-search-index.mjs
 */
import { Meilisearch } from "meilisearch";
import fs from "node:fs";
import path from "node:path";

const HOST = process.env.MEILI_HOST || "http://localhost:7700";
const KEY = process.env.MEILI_ADMIN_KEY || "";
const INDEX = process.env.MEILI_INDEX || "permissionless-finance";
const CHAPTERS = path.resolve(process.cwd(), "..", "chapters"); // web/ -> ../chapters

// Keyword slugs (single source of truth shared with src/lib/keywords.ts)
const SLUGS = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src", "lib", "chapter-slugs.json"), "utf8"));
function chapterSeg(num) {
  return SLUGS[num] ? `${num}-${SLUGS[num]}` : num;
}

// Mirror the app's heading-id logic (mdx-components.tsx) so anchors match.
function headingId(text) {
  const m = text.match(/^(\d+(?:\.\d+)*)/);
  if (m) return `section-${m[1].replace(/\./g, "-")}`;
  // \p{L}/\p{N} keeps CJK — un-numbered Chinese headings previously slugged to ""
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-").slice(0, 50);
}

function plain(md) {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")   // images
    .replace(/\$\$[\s\S]*?\$\$/g, " ")        // display math
    .replace(/\$[^$\n]+?\$/g, " ")            // inline math
    .replace(/`[^`]*`/g, " ")                 // inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")  // links -> text
    .replace(/\[\d+\]/g, " ")                 // [N] citations
    .replace(/[|#>*_~`]/g, " ")               // md/table symbols
    .replace(/<[^>]+>/g, " ")                 // html
    .replace(/\s+/g, " ")
    .trim();
}

function docsFromChapter(lang, chapterNum, raw) {
  // strip the reference list so the bibliography isn't a search hit
  const cut = raw.split(/^##\s+(?:References|参考文献)\s*$/m)[0];
  const lines = cut.split("\n");
  const h1 = (lines.find((l) => /^#\s+/.test(l)) || "").replace(/^#\s+/, "").trim()
    .replace(/^Chapter\s+\d+:\s*/, "").replace(/^第\s*\d+\s*章\s*/, "");
  const chapterTitle = h1 || chapterNum;

  const sections = [];
  let cur = { title: chapterTitle, anchor: "", body: [] }; // intro (text before first ##)
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (m) {
      if (cur.body.join("").trim()) sections.push(cur);
      const title = m[2].trim();
      cur = { title, anchor: headingId(title), body: [] };
    } else if (!/^#\s+/.test(line)) {
      cur.body.push(line);
    }
  }
  if (cur.body.join("").trim()) sections.push(cur);

  return sections
    .map((s, i) => {
      const content = plain(s.body.join("\n"));
      if (!content) return null;
      return {
        // Meili primary keys only allow [a-zA-Z0-9_-]; anchors may now contain
        // CJK (kept as a data field below), so key by section position instead.
        id: `${lang}-${chapterNum}-s${i}`,
        lang,
        chapterNum,
        chapterTitle,
        sectionTitle: s.title,
        anchor: s.anchor,
        url: `/${lang}/${chapterSeg(chapterNum)}${s.anchor ? "#" + s.anchor : ""}`,
        content: content.slice(0, 6000),
      };
    })
    .filter(Boolean);
}

async function main() {
  const docs = [];
  for (const lang of ["en", "zh"]) {
    const dir = path.join(CHAPTERS, lang);
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const chapterNum = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      docs.push(...docsFromChapter(lang, chapterNum, raw));
    }
  }
  console.log(`built ${docs.length} search documents (en + zh)`);

  const client = new Meilisearch({ host: HOST, apiKey: KEY });
  const index = client.index(INDEX);
  await client.createIndex(INDEX, { primaryKey: "id" }).catch(() => {});
  await index.updateSettings({
    searchableAttributes: ["sectionTitle", "chapterTitle", "content"],
    filterableAttributes: ["lang", "chapterNum"],
    displayedAttributes: ["chapterNum", "chapterTitle", "sectionTitle", "anchor", "url", "lang", "content"],
    rankingRules: ["words", "typo", "proximity", "attribute", "exactness"],
  });
  await index.deleteAllDocuments();
  for (let i = 0; i < docs.length; i += 500) {
    await index.addDocuments(docs.slice(i, i + 500));
  }
  // wait for Meili to finish processing (version-agnostic: poll stats)
  for (let i = 0; i < 180; i++) {
    const st = await index.getStats();
    if (!st.isIndexing) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  const { numberOfDocuments } = await index.getStats();
  console.log(`indexed ${numberOfDocuments} docs into "${INDEX}" at ${HOST} ✓`);
}

main().catch((e) => { console.error(e); process.exit(1); });
