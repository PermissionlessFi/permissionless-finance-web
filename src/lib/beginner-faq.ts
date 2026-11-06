import { CHAPTER_FAQ } from "./faq";
import { GLOSSARY } from "./glossary";
import { getChapterMeta } from "./toc";

/**
 * Beginner FAQ (/faq) — a curated, read-only VIEW over content that already
 * exists in the repo. Nothing here is new prose about the subject:
 *   - "faq" items reuse a chapter's author-drafted Q&A from faq.ts verbatim;
 *   - "term" items reuse a glossary definition from glossary.ts verbatim,
 *     framed by a short English question (the answer is the definition).
 * The manuscript (content/) is never read or changed by this module.
 *
 * Target: high-volume beginner queries (funding rate, mark price vs index
 * price, liquidation, liquidation cascade, ADL, funding-rate arbitrage) that
 * today resolve to exchange help centres rather than to the book.
 */

type Ref =
  | { kind: "faq"; chapter: string; index: number }
  | { kind: "term"; id: string; qEn: string };

interface SectionDef {
  id: string;
  titleEn: string;
  /** Glossary term ids whose Chinese names form the section title in zh view. */
  zhTermIds: string[];
  items: Ref[];
}

const faq = (chapter: string, index: number): Ref => ({ kind: "faq", chapter, index });
const term = (id: string, qEn: string): Ref => ({ kind: "term", id, qEn });

const SECTIONS: SectionDef[] = [
  {
    id: "basics",
    titleEn: "Perpetual futures basics",
    zhTermIds: ["perpetual-futures"],
    items: [
      faq("02", 0),
      term("leverage", "What is leverage in perpetual futures?"),
      term("open-interest", "What is open interest?"),
    ],
  },
  {
    id: "funding-rate",
    titleEn: "Funding rate and funding-rate arbitrage",
    zhTermIds: ["funding-rate", "funding-rate-arbitrage"],
    items: [
      term("funding-rate", "What is the funding rate in perpetual futures?"),
      faq("10", 0),
      faq("10", 1),
      term("basis", "What is the basis?"),
      faq("16", 0),
      faq("16", 1),
      faq("17", 1),
    ],
  },
  {
    id: "mark-price-vs-index-price",
    titleEn: "Mark price vs index price",
    zhTermIds: ["mark-price", "index-price"],
    items: [
      faq("14", 0),
      term("mark-price", "What is the mark price?"),
      term("index-price", "What is the index price?"),
      faq("14", 1),
      term("oracle", "What is a price oracle?"),
    ],
  },
  {
    id: "liquidation",
    titleEn: "Liquidations and liquidation cascades",
    zhTermIds: ["liquidation", "liquidation-cascade"],
    items: [
      term("liquidation", "What is liquidation in perpetual futures?"),
      faq("07", 2),
      term("bankruptcy-price", "What is the bankruptcy price?"),
      faq("11", 0),
      faq("11", 1),
      faq("11", 2),
    ],
  },
  {
    id: "adl",
    titleEn: "Insurance funds and auto-deleveraging (ADL)",
    zhTermIds: ["insurance-fund", "auto-deleveraging"],
    items: [
      faq("12", 0),
      faq("12", 1),
      faq("12", 2),
      term("socialized-loss", "What is a socialized loss?"),
    ],
  },
];

export interface FaqItem {
  /** Stable anchor id on /faq (derived from the English question). */
  anchor: string;
  qEn: string;
  aEn: string;
  /** Chinese question/answer when the source has one (term items: the term name). */
  qZh?: string;
  aZh?: string;
  /** Source chapter (first glossary chapter for term items). */
  chapter: string;
  chapterTitleEn: string;
  chapterTitleZh: string;
  /** Glossary id for term items (links to /glossary#id). */
  termId?: string;
}

export interface FaqSection {
  id: string;
  titleEn: string;
  titleZh: string;
  items: FaqItem[];
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function glossaryTerm(id: string) {
  const t = GLOSSARY.find((g) => g.id === id);
  if (!t) throw new Error(`beginner-faq: unknown glossary id "${id}"`);
  return t;
}

function resolve(ref: Ref): FaqItem {
  if (ref.kind === "term") {
    const t = glossaryTerm(ref.id);
    const chapter = t.chapters[0];
    return {
      anchor: slug(ref.qEn),
      qEn: ref.qEn,
      aEn: t.defEn,
      qZh: t.zh,
      aZh: t.defZh,
      chapter,
      chapterTitleEn: getChapterMeta(chapter, "en")?.title ?? "",
      chapterTitleZh: getChapterMeta(chapter, "zh")?.title ?? "",
      termId: t.id,
    };
  }
  const en = CHAPTER_FAQ[ref.chapter]?.en?.[ref.index];
  if (!en) throw new Error(`beginner-faq: missing faq.ts entry ${ref.chapter}#${ref.index}`);
  const zh = CHAPTER_FAQ[ref.chapter]?.zh?.[ref.index];
  return {
    anchor: slug(en.q),
    qEn: en.q,
    aEn: en.a,
    ...(zh ? { qZh: zh.q, aZh: zh.a } : {}),
    chapter: ref.chapter,
    chapterTitleEn: getChapterMeta(ref.chapter, "en")?.title ?? "",
    chapterTitleZh: getChapterMeta(ref.chapter, "zh")?.title ?? "",
  };
}

/** The resolved FAQ, grouped by topic. Throws at build time on a dangling reference. */
export function beginnerFaq(): FaqSection[] {
  return SECTIONS.map((s) => ({
    id: s.id,
    titleEn: s.titleEn,
    titleZh: s.zhTermIds.map((id) => glossaryTerm(id).zh).join(" / "),
    items: s.items.map(resolve),
  }));
}

/** Flat list of every item (FAQPage mainEntity order). */
export function beginnerFaqItems(): FaqItem[] {
  return beginnerFaq().flatMap((s) => s.items);
}

/** Glossary terms this page covers (term items + section topics), de-duplicated,
 *  for the DefinedTerm nodes that join the site-wide /glossary DefinedTermSet. */
export function beginnerFaqTerms() {
  const ids = new Set<string>();
  for (const s of SECTIONS) {
    s.zhTermIds.forEach((id) => ids.add(id));
    s.items.forEach((r) => r.kind === "term" && ids.add(r.id));
  }
  return [...ids].map(glossaryTerm);
}
