import { SITE_URL, SITE_NAME, BOOK_TITLE, AUTHOR_NAME, AUTHOR_DESCRIPTION, AUTHOR_SAMEAS, ORG_SAMEAS, LICENSE_URL, SITE_DESCRIPTION } from "./site";
import { ALL_CHAPTERS, getChapterMeta } from "./toc";
import { chapterHref } from "./keywords";
import { FLAGSHIP_KEYWORDS, chapterKeywords, keywordThings } from "./chapter-keywords";
import { CHAPTER_FAQ } from "./faq";
import { CHAPTER_ABSTRACTS } from "./chapter-abstracts";
import { chapterCitation } from "./citation";
import { Lang } from "./types";

const langTag = (lang: Lang) => (lang === "zh" ? "zh-Hans" : "en");

/** The canonical author Person entity (shared @id). `sameAs` is the primary
 *  signal search/AI engines use to resolve a Person to a Knowledge-Graph node;
 *  it is omitted until AUTHOR_SAMEAS in site.ts is populated. */
function personNode() {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#author`,
    name: AUTHOR_NAME,
    url: `${SITE_URL}/en/about`,
    jobTitle: "Author",
    description: AUTHOR_DESCRIPTION,
    ...(AUTHOR_SAMEAS.length ? { sameAs: AUTHOR_SAMEAS } : {}),
  };
}

/** Project Organization entity (shared @id) — binds the site to @PermlessFi. */
function orgNode() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#org`,
    name: SITE_NAME.en,
    alternateName: SITE_NAME.zh,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    sameAs: ORG_SAMEAS,
    founder: { "@id": `${SITE_URL}/#author` },
  };
}

/** Book entity — shared @id so every page's structured data joins one graph. */
function bookNode(lang: Lang) {
  return {
    "@type": "Book",
    "@id": `${SITE_URL}/#book`,
    name: BOOK_TITLE[lang],
    author: { "@type": "Person", "@id": `${SITE_URL}/#author`, name: AUTHOR_NAME },
    inLanguage: langTag(lang),
    license: LICENSE_URL,
    isAccessibleForFree: true,
    bookFormat: "https://schema.org/EBook",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#org` },
    description: SITE_DESCRIPTION[lang],
    alternateName:
      lang === "zh" ? "永续合约的市场微观结构" : "The Market Microstructure of Perpetual Futures",
    keywords: FLAGSHIP_KEYWORDS[lang].join(", "),
    about: keywordThings(FLAGSHIP_KEYWORDS[lang]),
  };
}

/** JSON-LD for a chapter/front-matter page: Book + this page + breadcrumb.
 *  The page node carries chapter-level keywords/about (the entity signal) and
 *  an abstract — all machine-only, no visible page change. */
export function chapterJsonLd(opts: {
  lang: Lang;
  num: string;
  title: string;
  partTitle: string;
  modified: Date | null;
  description: string;
}) {
  const { lang, num, title, partTitle, modified, description } = opts;
  const pageUrl = `${SITE_URL}${chapterHref(lang, num)}`;
  const isNumbered = /^\d+$/.test(num);
  const kw = chapterKeywords(num, lang);
  const abstract = CHAPTER_ABSTRACTS[num]?.[lang] || description;

  const common = {
    name: title,
    isPartOf: { "@id": `${SITE_URL}/#book` },
    url: pageUrl,
    inLanguage: langTag(lang),
    // Authorship + reuse terms on every page node, so an engine that lands on a
    // single chapter can attribute and cite it without resolving the Book node.
    author: { "@id": `${SITE_URL}/#author` },
    publisher: { "@id": `${SITE_URL}/#org` },
    license: LICENSE_URL,
    isAccessibleForFree: true,
    ...(isNumbered ? { creditText: chapterCitation(num, lang).apa } : {}),
    ...(abstract ? { abstract } : {}),
    ...(kw.length ? { keywords: kw.join(", "), about: keywordThings(kw) } : {}),
    ...(modified ? { dateModified: modified.toISOString() } : {}),
  };

  const page = isNumbered
    ? { "@type": "Chapter", position: parseInt(num, 10), ...common }
    : { "@type": "WebPage", ...common };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME[lang], item: SITE_URL },
      { "@type": "ListItem", position: 2, name: isNumbered ? `${partTitle} · ${title}` : title, item: pageUrl },
    ],
  };

  const graph: object[] = [bookNode(lang), page, breadcrumb];

  // The About page is the author's entity page — attach the Person node.
  if (num === "about") graph.push(personNode());

  // FAQPage (only when the chapter has author-approved Q&A) → eligible for
  // Google "People also ask" and directly quotable by AI engines.
  const faq = CHAPTER_FAQ[num]?.[lang];
  if (faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      isPartOf: { "@id": `${SITE_URL}/#book` },
      inLanguage: langTag(lang),
      mainEntity: faq.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** JSON-LD for the homepage: WebSite + Author + the Book with the flagship
 *  keyword entities in BOTH languages (this is the primary place the site is
 *  associated with "market microstructure", "perpetual futures", etc.). */
export function homeJsonLd() {
  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: `${SITE_NAME.en} — ${SITE_NAME.zh}`,
    description: SITE_DESCRIPTION.en,
    inLanguage: ["en", "zh-Hans"],
    publisher: { "@id": `${SITE_URL}/#org` },
  };

  const author = personNode();

  const book = {
    ...bookNode("en"),
    keywords: [...FLAGSHIP_KEYWORDS.en, ...FLAGSHIP_KEYWORDS.zh].join(", "),
    about: keywordThings([...FLAGSHIP_KEYWORDS.en, ...FLAGSHIP_KEYWORDS.zh]),
    numberOfPages: ALL_CHAPTERS.filter((c) => /^\d+$/.test(c.num)).length,
    hasPart: ALL_CHAPTERS.filter((c) => /^\d+$/.test(c.num)).map((c) => ({
      "@type": "Chapter",
      position: parseInt(c.num, 10),
      name: getChapterMeta(c.num, "en")!.title,
      url: `${SITE_URL}${chapterHref("en", c.num)}`,
    })),
    workExample: [
      { "@type": "Book", inLanguage: "en", name: BOOK_TITLE.en, url: `${SITE_URL}/en/01-digital-assets` },
      { "@type": "Book", inLanguage: "zh-Hans", name: BOOK_TITLE.zh, url: `${SITE_URL}/zh/01-digital-assets` },
    ],
  };

  return { "@context": "https://schema.org", "@graph": [website, orgNode(), author, book] };
}
