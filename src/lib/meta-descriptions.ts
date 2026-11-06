import { CHAPTER_ABSTRACTS } from "./chapter-abstracts";
import { getChapterDescription } from "./chapters";
import { SITE_DESCRIPTION } from "./site";
import { Lang } from "./types";

/**
 * Meta-description layer (search snippets, og:description, twitter:description).
 *
 * Machine-truncated descriptions ending in "…" read as broken snippets and are
 * often rewritten by search engines. Resolution order per page:
 *   1. a hand-written override below (EN ~120-160 chars, ZH <= ~100 chars),
 *      condensed from the authored abstract — metadata only, the chapter body
 *      is never touched;
 *   2. as many whole leading sentences of the abstract as fit the limit;
 *   3. the legacy word-boundary clamp (last resort, may end in "…").
 */
const MAX_LEN: Record<Lang, number> = { en: 160, zh: 100 };

export const META_DESCRIPTIONS: Record<string, Partial<Record<Lang, string>>> = {
  preface: {
    en: "Why this open-access book exists, who it is for, and how its 33 chapters in ten parts trace perpetual futures from a single order to on-chain global markets.",
    zh: "本书为何而写、写给谁，以及三十三章、十个篇章如何从一笔订单出发，追溯永续合约直至链上全球市场。",
  },
  disclaimer: {
    en: "Disclaimer for Permissionless Finance: an independent educational survey by Eric Cheung, drawn from public sources, provided as is, with an AI-use disclosure.",
  },
  about: {
    en: "About Eric Cheung, author of Permissionless Finance: a PhD, trader, and blockchain R&D practitioner writing on the market microstructure of perpetual futures.",
    zh: "关于《无需许可的金融》作者 Eric Cheung：博士、交易员与区块链研发实践者，从市场与技术两端书写永续合约的市场微观结构。",
  },
  "01": {
    en: "A digital asset is a cryptographic instrument whose custody, transfer, and settlement run on protocol code and consensus instead of financial intermediaries.",
  },
  "02": {
    en: "A perpetual future is a leveraged derivative with no expiry or delivery, kept anchored to the spot index by a periodic funding payment between longs and shorts.",
    zh: "永续合约是一种没有到期日与交割日的杠杆衍生品合约，借助多空之间周期性支付的资金费率，将其价格锚定于现货指数。",
  },
  "03": {
    en: "RWA tokenization and on-chain finance: why tokenized Treasuries like BlackRock's BUIDL matter as yield-bearing DeFi collateral, and where their limits lie.",
  },
  "04": {
    en: "Who trades perpetual futures: hedgers, profit-motivated traders, and futile traders, and how their interaction drives liquidity and price discovery.",
  },
  "05": {
    en: "The service providers of perpetual futures—exchanges, custodians, clearing entities, and liquidity providers—that carry a trade from intent to finality.",
  },
  "06": {
    en: "Perpetual futures market structure: how order submission, matching, settlement, and custody are configured, and how that shapes prices and risk.",
  },
  "08": {
    en: "Order book microstructure: how resting limit orders, ranked by price-time priority, turn dispersed private information into spread, depth, and flow signals.",
  },
  "09": {
    en: "Hyperliquid microstructure explained: an on-chain order book that orders by intent, cancel priority against MEV, the HLP vault and the JELLY episode.",
  },
  "11": {
    en: "Liquidation cascades in crypto perpetual futures: forced closing of leveraged positions pushes price further and triggers more liquidations. How to dampen it.",
  },
  "12": {
    en: "Auto-deleveraging (ADL) in perpetual futures: when the insurance fund runs out, top-ranked profitable positions are force-closed. Who bears the loss, and why.",
  },
  "13": {
    en: "Price discovery: how private information dispersed across many participants is aggregated by market mechanisms into a single public consensus price.",
  },
  "14": {
    en: "Index price, mark price, and oracle price: how perpetual futures engineer a fair-value benchmark to compute margin and trigger liquidation.",
  },
  "15": {
    en: "Informational efficiency: the degree to which digital asset prices fully and instantly reflect available information, precluding systematic excess returns.",
  },
  "16": {
    en: "Funding rate arbitrage is a delta-neutral trade—short the high-rate venue, long the low-rate one—reframed as the transmission mechanism of market efficiency.",
    zh: "资金费率套利是一种 delta 中性策略——在费率高的场所做空、在费率低的场所买入；本章将套利重构为市场效率的传导机制，而非无风险利润。",
  },
  "17": {
    en: "The limits to arbitrage: capital and margin constraints, execution risk, and uncertain convergence mean risk-free arbitrage in perpetuals is not risk-free.",
  },
  "18": {
    en: "Market anomalies in perpetual futures: price deviations that persist and stay statistically and economically significant after modelable arbitrage costs.",
  },
  "19": {
    en: "Market making is the professional production of liquidity: posting competitive bid and ask quotes to earn the spread in exchange for bearing quantifiable risk.",
  },
  "21": {
    en: "Liquidity governance: how to secure continuous order-book depth when the private incentive to supply it collapses precisely as demand for liquidity peaks.",
  },
  "22": {
    en: "Excess volatility is the systematic gap between a perpetual future's realized volatility and the volatility its information content alone should support.",
  },
  "24": {
    en: "Volatility forecasting estimates the future size of price moves, not their direction, on which market makers, portfolio managers, and exchanges base risk.",
  },
  "25": {
    en: "Market quality is how well a venue meets its participants' needs, measured as distance from a frictionless perfect market across five dimensions.",
  },
  "26": {
    en: "Crypto derivatives regulation as an economic problem: repairing perpetual futures market failures without destroying their innovation in price discovery.",
  },
  "27": {
    en: "Stock, FX and commodity perpetual futures: a thought experiment on how funding-rate anchoring could make perps a universal pricing layer for global assets.",
  },
  "28": {
    en: "Exchange architecture: how custody, matching, clearing and settlement, data, and governance are split between trusted entities and verifiable code.",
  },
  "29": {
    en: "Decentralized clearing and settlement: post-trade obligations discharged by one deterministic, replicated state machine whose trust rests on recomputability.",
    zh: "去中心化清结算由单一的、确定性的、可复制的状态机了结交易后义务，其信任不依托于资本、法律与监管，而依托于普遍的可重算性。",
  },
  "30": {
    en: "Embedded compliance compiles regulatory and governance rules into smart-contract logic, turning rules institutions may break into constraints code enforces.",
  },
  "31": {
    en: "When AI becomes market infrastructure, it acts as the autonomous executor of market-making, risk management, matching, and liquidation in perpetual markets.",
  },
  "32": {
    en: "Autonomous finance: financial services defined by AI agents making autonomous decisions over permissionless on-chain infrastructure, distinct from DeFi.",
  },
};

/** Split into sentences, keeping terminal punctuation (EN . ! ? and the CJK
 *  full-width stop, exclamation and question marks U+3002 / U+FF01 / U+FF1F). */
function sentences(text: string, lang: Lang): string[] {
  const parts = lang === "zh" ? text.match(/[^\u3002\uff01\uff1f]+[\u3002\uff01\uff1f]/g) ?? [] : text.split(/(?<=[.!?])\s+/);
  // Drop a trailing fragment (e.g. text already cut with "…").
  return parts.map((s) => s.trim()).filter((s) => /[.!?\u3002\uff01\uff1f]$/.test(s));
}

/** As many whole leading sentences as fit within `max`; "" if even the first does not. */
function leadingSentences(text: string, lang: Lang, max: number): string {
  let out = "";
  for (const s of sentences(text, lang)) {
    const next = out ? `${out}${lang === "zh" ? "" : " "}${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  return out;
}

/** Legacy fallback: trim at a word boundary and mark the cut. */
function clampMeta(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return (at > max * 0.6 ? cut.slice(0, at) : cut).trimEnd() + "…";
}

/** The meta description for a chapter or front-matter page. */
export function chapterMetaDescription(num: string, lang: Lang): string {
  const max = MAX_LEN[lang];
  const override = META_DESCRIPTIONS[num]?.[lang];
  if (override) return override;

  const abstract = CHAPTER_ABSTRACTS[num]?.[lang];
  if (abstract) return leadingSentences(abstract, lang, max) || clampMeta(abstract, max);

  const extracted = getChapterDescription(lang, num);
  if (extracted) {
    const whole = leadingSentences(extracted.replace(/(…|……)$/, ""), lang, max);
    return whole || extracted;
  }
  return SITE_DESCRIPTION[lang];
}
