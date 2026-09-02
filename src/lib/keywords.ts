import { Lang } from "./types";
import { ALL_CHAPTERS } from "./toc";
import { keyTermsForChapter } from "./glossary";
import slugsJson from "./chapter-slugs.json";

/**
 * SEO layer — keyword slugs and <title> overrides. See
 * tasks/keyword_chapter_map_2026-07.md for the keyword→chapter strategy.
 *
 * PERMANENCE WARNING: slugs are part of public URLs. Once the site is live
 * and cited (by AI corpora, backlinks, academic references) they must NEVER
 * change. chapter-slugs.json is also read by scripts/build-search-index.mjs.
 *
 * This layer NEVER touches the manuscript: page H1s and the book's chapter
 * titles stay exactly as authored. Only URL segments and <title> tags differ.
 */
const CHAPTER_SLUGS = slugsJson as Record<string, string>;

const VALID_NUMS = new Set(ALL_CHAPTERS.map((c) => c.num));

/** EN <title> overrides — front-load target keywords (H1 keeps the book title).
 *  Chapters absent here already carry their keyword in the original title. */
export const SEO_TITLES: Record<string, string> = {
  "02": "Perpetual Futures: History and the Rise of Crypto Derivatives",
  "06": "Perp DEX vs CEX: The Evolution of Market Structure",
  "10": "Funding Rates in Perpetual Futures: A Game-Theoretic Analysis",
  "11": "Liquidation Cascades: The Endogenous Reflexivity of Leverage",
  "12": "Insurance Funds and ADL: The Backstop Political Economy",
  "13": "Price Discovery in Crypto Perpetual Futures Markets",
  "14": "Mark Price, Index Price, and Oracles: Governing Benchmarks",
  "16": "Funding Arbitrage and the Basis Trade: Efficiency Transmission",
  "17": "Why Risk-Free Arbitrage Isn't: The Limits of Arbitrage in Crypto",
  "19": "Market Making in Perpetual Futures: Liquidity Games",
  "22": "Where Crypto Volatility Comes From: A Four-Source Decomposition",
  "26": "Regulating Crypto Derivatives: Between Innovation and Stability",
  "28": "Exchange Architecture: From Monolithic Black Box to Layers",
};

/** URL path segment for a chapter: "10" → "10-funding-rates"; front matter
 *  (preface/license/…) is already a semantic slug and passes through. */
export function chapterPath(num: string): string {
  const slug = CHAPTER_SLUGS[num];
  return slug ? `${num}-${slug}` : num;
}

/** Canonical href for a chapter page. Use this EVERYWHERE a chapter link is built. */
export function chapterHref(lang: Lang, num: string): string {
  return `/${lang}/${chapterPath(num)}`;
}

/**
 * Related chapters for a given chapter, ranked by shared glossary key-terms
 * (topical overlap) — a data-driven internal-linking signal, no hand-mapping.
 * Numbered chapters only; returns up to `limit` chapter nums.
 */
export function relatedChapters(num: string, limit = 4): string[] {
  if (!/^\d+$/.test(num)) return [];
  const mine = new Set(keyTermsForChapter(num).map((t) => t.id));
  if (!mine.size) return [];
  return ALL_CHAPTERS.filter((c) => /^\d+$/.test(c.num) && c.num !== num)
    .map((c) => ({
      num: c.num,
      overlap: keyTermsForChapter(c.num).filter((t) => mine.has(t.id)).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || parseInt(a.num, 10) - parseInt(b.num, 10))
    .slice(0, limit)
    .map((x) => x.num);
}

/**
 * Resolve an incoming [chapter] route param to a canonical chapter num.
 * Accepts: canonical ("10-funding-rates"), legacy ("10", "1"), stale/wrong
 * slugs ("10-anything") — the page 308-redirects non-canonical forms.
 * Returns null for unknown chapters (→ 404).
 */
export function resolveChapterParam(param: string): string | null {
  if (VALID_NUMS.has(param) && !CHAPTER_SLUGS[param]) return param; // front matter
  const m = param.match(/^(\d{1,2})(?:-.*)?$/);
  if (m) {
    const num = m[1].padStart(2, "0");
    return VALID_NUMS.has(num) ? num : null;
  }
  return null;
}
