import { SITE_URL, BOOK_TITLE, AUTHOR_NAME } from "./site";
import { getChapterMeta } from "./toc";
import { chapterHref } from "./keywords";
import { Lang } from "./types";

const YEAR = "2026";

/** APA + BibTeX citation for a chapter (rendered in the "Cite this chapter"
 *  chip). The book is an edited-work-style whole; each chapter is @incollection. */
export function chapterCitation(num: string, lang: Lang): { apa: string; bibtex: string } {
  const meta = getChapterMeta(num, lang);
  const title = meta?.title ?? num;
  const url = `${SITE_URL}${chapterHref(lang, num)}`;
  const book = BOOK_TITLE.en; // cite the canonical English book title
  const n = parseInt(num, 10);

  const apa = `Cheung, E. (${YEAR}). ${title}. In ${book}. ${url}`;

  const bibtex =
    `@incollection{cheung${YEAR}ch${num},\n` +
    `  author    = {Cheung, Eric},\n` +
    `  title     = {${title}},\n` +
    `  booktitle = {${book}},\n` +
    `  year      = {${YEAR}},\n` +
    (Number.isFinite(n) ? `  chapter   = {${n}},\n` : "") +
    `  url       = {${url}},\n` +
    `  note      = {Licensed under CC BY 4.0}\n` +
    `}`;

  return { apa, bibtex };
}

/** Highwire `citation_*` meta tags (Google Scholar / Zotero / Mendeley read
 *  these to recognize the page as a citable scholarly work). */
export function citationMeta(num: string, lang: Lang): Record<string, string> {
  const meta = getChapterMeta(num, lang);
  return {
    citation_title: meta?.title ?? num,
    citation_author: AUTHOR_NAME,
    citation_publication_date: YEAR,
    citation_inbook_title: BOOK_TITLE.en,
    citation_fulltext_html_url: `${SITE_URL}${chapterHref(lang, num)}`,
    citation_language: lang === "zh" ? "zh" : "en",
  };
}
