import { Lang } from "./types";

/**
 * Site-wide constants — single source of truth for SEO/GEO metadata.
 * The canonical production origin. NEVER change this once the site has been
 * cited by AI corpora / external links; permanence is the whole point.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permissionless.fi";

export const AUTHOR_NAME = "Eric Cheung";

/** One-line author bio for the Person entity (Knowledge-Graph signal). */
export const AUTHOR_DESCRIPTION =
  "Author of Permissionless Finance. Writes on the market microstructure of perpetual futures, drawing on a PhD and over a decade spanning traditional finance, trading, and blockchain research and development.";

/**
 * The author's public profiles — feeds schema.org `sameAs`, the primary way
 * search/AI engines resolve a Person to a Knowledge-Graph entity.
 * TODO(author): add real URLs (GitHub, X/Twitter, LinkedIn, Google Scholar,
 * ORCID, personal site). Left empty → `sameAs` is omitted until provided.
 */
export const AUTHOR_SAMEAS: string[] = [];

export const SITE_NAME: Record<Lang, string> = {
  zh: "无需许可的金融",
  en: "Permissionless Finance",
};

export const SITE_SUBTITLE: Record<Lang, string> = {
  zh: "从永续合约到链上全球市场",
  en: "From Perpetual Futures to the On-Chain Global Market",
};

export const SITE_TAGLINE: Record<Lang, string> = {
  zh: "市场微观结构视角",
  en: "A Market Microstructure Perspective",
};

/** Full book title, "Title: Subtitle" form, per language */
export const BOOK_TITLE: Record<Lang, string> = {
  zh: `${SITE_NAME.zh}：${SITE_SUBTITLE.zh}`,
  en: `${SITE_NAME.en}: ${SITE_SUBTITLE.en}`,
};

export const SITE_DESCRIPTION: Record<Lang, string> = {
  zh: "一本关于永续合约市场微观结构的开放获取著作。33 章系统论述数字资产市场的定价、资金费率、清算、流动性与波动性机制。CC BY 4.0 开放许可。",
  en: "An open-access book on the market microstructure of perpetual futures — 33 chapters on funding, liquidation, liquidity, and volatility across on-chain and centralized digital-asset markets. Licensed CC BY 4.0.",
};

export const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
