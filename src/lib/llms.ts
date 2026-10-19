import { ALL_CHAPTERS, getChapterMeta } from "./toc";
import { getRawChapter } from "./chapters";
import { chapterMetaDescription } from "./meta-descriptions";
import { chapterHref } from "./keywords";
import { PUBLISHED_LABS } from "./labs";
import {
  SITE_URL, SITE_NAME, SITE_SUBTITLE, SITE_DESCRIPTION,
  BOOK_TITLE, AUTHOR_NAME, LICENSE_URL, AUTHOR_X_URL, ORG_SAMEAS,
} from "./site";
import { Lang } from "./types";

/** One-line chapter description for the llms.txt index (what an agent reads to
 *  decide what to fetch): the same whole-sentence, definition-first line used
 *  as the page's meta description — never cut mid-sentence. */
function chapterBlurb(num: string, lang: Lang): string {
  return chapterMetaDescription(num, lang);
}

const isNumbered = (num: string) => /^\d+$/.test(num);

/**
 * /llms.txt — the llmstxt.org convention: a Markdown map of the whole book so
 * an AI agent can see the structure and jump straight to any chapter's clean
 * Markdown (every chapter URL + ".md"). See tasks/geo_seo_plan_2026-07-04.md 2.3.
 */
export function buildLlmsTxt(): string {
  const L: string[] = [];
  L.push(`# ${SITE_NAME.en} — ${SITE_NAME.zh}`);
  L.push("");
  L.push(`> ${SITE_DESCRIPTION.en}`);
  L.push("");
  L.push(
    `${SITE_SUBTITLE.en}. A bilingual (English / 中文), open-access book by ` +
      `${AUTHOR_NAME}, licensed under CC BY 4.0. The full text of any chapter is ` +
      `available as clean Markdown by appending \`.md\` to its URL — e.g. ` +
      `${SITE_URL}${chapterHref("en", "10")}.md.`
  );
  L.push("");

  // Entity + attribution block: lets an agent tie the book to its author and
  // official profiles, and cite it correctly (CC BY 4.0 requires attribution).
  L.push("## Author and citation");
  L.push(`- Title: ${BOOK_TITLE.en} (Chinese edition: ${BOOK_TITLE.zh})`);
  L.push(`- Author: ${AUTHOR_NAME} — ${SITE_URL}${chapterHref("en", "about")} · ${AUTHOR_X_URL}`);
  L.push(`- Official profiles: ${ORG_SAMEAS.join(" · ")}`);
  L.push(`- License: CC BY 4.0 (${LICENSE_URL}) — free to share and adapt with attribution`);
  L.push(
    `- Cite as: Cheung, Eric (2026). ${BOOK_TITLE.en}. ${SITE_URL}. Licensed under CC BY 4.0. ` +
      `(Per-chapter APA/BibTeX: "Cite this chapter" at the end of each chapter page; ` +
      `book-level BibTeX: ${SITE_URL}${chapterHref("en", "license")})`
  );
  L.push("");

  const numbered = ALL_CHAPTERS.filter((c) => isNumbered(c.num));
  const front = ALL_CHAPTERS.filter((c) => !isNumbered(c.num));

  L.push("## Chapters (English)");
  for (const c of numbered) {
    const t = getChapterMeta(c.num, "en")!.title;
    const d = chapterBlurb(c.num, "en");
    L.push(`- [Chapter ${parseInt(c.num)}: ${t}](${SITE_URL}${chapterHref("en", c.num)}.md)${d ? `: ${d}` : ""}`);
  }
  L.push("");

  L.push("## 章节（中文）");
  for (const c of numbered) {
    const t = getChapterMeta(c.num, "zh")!.title;
    const d = chapterBlurb(c.num, "zh");
    L.push(`- [第 ${parseInt(c.num)} 章：${t}](${SITE_URL}${chapterHref("zh", c.num)}.md)${d ? `：${d}` : ""}`);
  }
  L.push("");

  L.push("## About");
  for (const c of front) {
    const t = getChapterMeta(c.num, "en")!.title;
    L.push(`- [${t}](${SITE_URL}${chapterHref("en", c.num)}.md)`);
  }
  L.push(`- [License — CC BY 4.0](${LICENSE_URL})`);
  L.push("");

  L.push("## Learning resources");
  L.push(`- [Glossary](${SITE_URL}/glossary): bilingual definitions of the core terms of perpetual-futures market microstructure`);
  L.push(`- [Learning paths](${SITE_URL}/paths): reading orders for traders, quant researchers, and builders`);
  L.push(`- [Labs](${SITE_URL}/labs): interactive simulators of the book's mechanisms`);
  for (const lab of PUBLISHED_LABS) {
    L.push(`  - [${lab.en}](${SITE_URL}/labs/${lab.slug}): ${lab.learnEn}`);
  }
  L.push("");

  L.push("## Full text");
  L.push(`- [Complete book — English](${SITE_URL}/llms-full-en.txt)`);
  L.push(`- [完整书稿 — 中文](${SITE_URL}/llms-full-zh.txt)`);
  L.push("");

  return L.join("\n");
}

/**
 * /llms-full-{lang}.txt — the entire book concatenated as one plain-text
 * document, in reading order, each chapter carrying its canonical source URL.
 */
export function buildLlmsFull(lang: Lang): string {
  const P: string[] = [];
  P.push(`# ${BOOK_TITLE[lang]}`);
  P.push("");
  P.push(`By ${AUTHOR_NAME}. Licensed under CC BY 4.0 (${LICENSE_URL}). Source: ${SITE_URL}`);
  for (const c of ALL_CHAPTERS) {
    const raw = getRawChapter(lang, c.num);
    if (!raw) continue;
    P.push("");
    P.push("---");
    P.push("");
    P.push(`<!-- ${SITE_URL}${chapterHref(lang, c.num)} -->`);
    P.push("");
    P.push(raw.trim());
  }
  P.push("");
  return P.join("\n");
}
