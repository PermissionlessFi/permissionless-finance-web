import { ALL_CHAPTERS, getChapterMeta } from "./toc";
import { getChapterDescription, getRawChapter } from "./chapters";
import { CHAPTER_ABSTRACTS } from "./chapter-abstracts";
import { chapterHref } from "./keywords";
import {
  SITE_URL, SITE_NAME, SITE_SUBTITLE, SITE_DESCRIPTION,
  BOOK_TITLE, AUTHOR_NAME, LICENSE_URL,
} from "./site";
import { Lang } from "./types";

function shorten(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

/** First sentence of an abstract — the definition-first line, ideal for the
 *  llms.txt index (what an agent reads to decide what to fetch). */
function firstSentence(text: string): string {
  const m = text.match(/^.*?[.。](?=\s|$)/);
  return (m ? m[0] : text).trim();
}

/** Best one-line description for a chapter in the llms.txt index: the authored
 *  definition-first abstract opening, falling back to the extracted paragraph. */
function chapterBlurb(num: string, lang: Lang, cap: number): string {
  const abs = CHAPTER_ABSTRACTS[num]?.[lang];
  return abs ? shorten(firstSentence(abs), cap + 60) : shorten(getChapterDescription(lang, num), cap);
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

  const numbered = ALL_CHAPTERS.filter((c) => isNumbered(c.num));
  const front = ALL_CHAPTERS.filter((c) => !isNumbered(c.num));

  L.push("## Chapters (English)");
  for (const c of numbered) {
    const t = getChapterMeta(c.num, "en")!.title;
    const d = chapterBlurb(c.num, "en", 110);
    L.push(`- [Chapter ${parseInt(c.num)}: ${t}](${SITE_URL}${chapterHref("en", c.num)}.md)${d ? `: ${d}` : ""}`);
  }
  L.push("");

  L.push("## 章节（中文）");
  for (const c of numbered) {
    const t = getChapterMeta(c.num, "zh")!.title;
    const d = chapterBlurb(c.num, "zh", 60);
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
