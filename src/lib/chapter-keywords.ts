import { Lang } from "./types";

/**
 * Controlled keyword vocabulary — the GEO/SEO "hidden in code" layer.
 *
 * These terms are emitted ONLY as machine-readable metadata (JSON-LD
 * `about`/`keywords` and <meta name="keywords">), never as hidden on-page text.
 * Hidden/stuffed body text is a Google spam violation; structured data is the
 * sanctioned way to associate a page with entities/keywords. See
 * tasks/keyword_chapter_map_2026-07.md.
 *
 * Terms must reflect what each chapter genuinely covers — this is an entity
 * association signal, not a wishlist. Keep 4–8 canonical phrases per chapter.
 */

/** Flagship terms for the whole book (homepage Book/WebSite entity). */
export const FLAGSHIP_KEYWORDS: Record<Lang, string[]> = {
  en: [
    "perpetual futures microstructure",
    "market microstructure",
    "perpetual futures",
    "crypto market microstructure",
    "funding rate",
    "liquidation",
    "crypto derivatives",
    "on-chain finance",
    "decentralized finance",
    "price discovery",
    "market liquidity",
    "digital asset markets",
  ],
  zh: [
    "市场微观结构",
    "永续合约",
    "加密衍生品",
    "资金费率",
    "清算",
    "链上金融",
    "去中心化金融",
    "价格发现",
    "市场流动性",
    "数字资产市场",
  ],
};

export const CHAPTER_KEYWORDS: Record<string, Record<Lang, string[]>> = {
  "01": { en: ["digital assets", "crypto vs traditional assets", "asset classes", "bearer assets", "24/7 markets"], zh: ["数字资产", "传统资产对比", "资产类别", "全天候市场"] },
  "02": { en: ["perpetual futures", "perpetual swap", "history of perpetual futures", "crypto derivatives", "BitMEX", "funding mechanism"], zh: ["永续合约", "永续合约起源", "加密衍生品", "衍生品市场"] },
  "03": { en: ["tokenization", "future of finance", "on-chain finance", "real world assets", "digital asset value"], zh: ["代币化", "金融的未来", "链上金融", "现实世界资产"] },
  "04": { en: ["market participants", "trader behavior", "market makers", "retail traders", "leverage trading"], zh: ["市场参与者", "交易者行为", "做市商", "杠杆交易"] },
  "05": { en: ["crypto exchanges", "centralized exchange", "trading ecosystem", "custody", "liquidity providers"], zh: ["加密交易所", "中心化交易所", "交易生态", "托管"] },
  "06": { en: ["market structure", "perp DEX vs CEX", "decentralized exchange", "market design"], zh: ["市场结构", "中心化与去中心化交易所", "市场设计"] },
  "07": { en: ["order types", "limit order", "market order", "stop order", "trading mechanics"], zh: ["订单类型", "限价单", "市价单", "交易机制"] },
  "08": { en: ["order book microstructure", "limit order book", "market microstructure", "bid-ask spread", "market depth", "price impact", "slippage"], zh: ["订单簿微观结构", "限价订单簿", "市场微观结构", "买卖价差", "市场深度", "滑点"] },
  "09": { en: ["Hyperliquid", "onchain order book", "perpetual DEX", "onchain microstructure", "HLP"], zh: ["Hyperliquid", "链上订单簿", "永续DEX", "链上微观结构"] },
  "10": { en: ["funding rate", "funding rate mechanism", "perpetual futures funding", "game theory", "basis"], zh: ["资金费率", "资金费率机制", "博弈论", "基差"] },
  "11": { en: ["liquidation cascade", "liquidation spiral", "leverage", "reflexivity", "forced liquidation", "deleveraging"], zh: ["清算级联", "清算螺旋", "杠杆", "反身性", "强制平仓"] },
  "12": { en: ["insurance fund", "auto-deleveraging", "ADL", "socialized losses", "clearing backstop"], zh: ["保险基金", "自动减仓", "ADL", "损失社会化"] },
  "13": { en: ["price discovery", "information incorporation", "lead-lag relationship", "spot-futures", "market microstructure"], zh: ["价格发现", "信息融入", "领先滞后关系", "现货期货"] },
  "14": { en: ["mark price", "index price", "oracle", "price benchmark", "oracle manipulation"], zh: ["标记价格", "指数价格", "预言机", "价格基准"] },
  "15": { en: ["market efficiency", "informational efficiency", "efficient market hypothesis", "digital asset markets"], zh: ["市场效率", "信息效率", "有效市场假说"] },
  "16": { en: ["funding rate arbitrage", "basis trade", "cash and carry", "arbitrage", "market efficiency"], zh: ["资金费率套利", "基差交易", "套利", "市场效率"] },
  "17": { en: ["limits to arbitrage", "arbitrage risk", "risk-free arbitrage", "noise trader risk"], zh: ["套利限制", "套利风险", "无风险套利"] },
  "18": { en: ["market anomalies", "arbitrage failure", "mispricing", "market inefficiency"], zh: ["市场异象", "套利失灵", "错误定价"] },
  "19": { en: ["market making", "liquidity provision", "liquidity games", "market maker strategies"], zh: ["做市", "流动性供给", "流动性博弈"] },
  "20": { en: ["liquidity fragility", "endogenous liquidity", "liquidity crisis", "flash crash", "market depth"], zh: ["流动性脆弱性", "内生流动性", "流动性危机", "闪崩"] },
  "21": { en: ["liquidity incentives", "liquidity mining", "public goods", "incentive design", "market governance"], zh: ["流动性激励", "流动性挖矿", "公共品", "激励设计"] },
  "22": { en: ["volatility", "excess volatility", "volatility decomposition", "crypto volatility"], zh: ["波动率", "超额波动", "波动来源分解"] },
  "23": { en: ["volatility clustering", "volatility persistence", "realized volatility", "market microstructure", "GARCH"], zh: ["波动率聚集", "波动持续性", "已实现波动率", "市场微观结构"] },
  "24": { en: ["volatility forecasting", "realized volatility", "implied volatility", "risk management"], zh: ["波动率预测", "已实现波动率", "隐含波动率", "风险管理"] },
  "25": { en: ["market quality", "market liquidity", "market efficiency metrics", "market evaluation"], zh: ["市场质量", "市场流动性", "市场评价"] },
  "26": { en: ["crypto regulation", "derivatives regulation", "financial regulation", "innovation and stability"], zh: ["加密监管", "衍生品监管", "金融监管"] },
  "27": { en: ["global asset pricing", "perpetual futures pricing", "price discovery", "market infrastructure"], zh: ["全球资产定价", "永续合约定价", "价格发现"] },
  "28": { en: ["exchange architecture", "matching engine", "trading system design", "layered architecture"], zh: ["交易所架构", "撮合引擎", "系统设计", "分层架构"] },
  "29": { en: ["decentralized clearing", "settlement", "clearing and settlement", "DeFi infrastructure", "central counterparty"], zh: ["去中心化清算", "结算", "清结算", "中央对手方"] },
  "30": { en: ["embedded compliance", "regtech", "automated governance", "on-chain compliance"], zh: ["嵌入式合规", "自动化治理", "链上合规"] },
  "31": { en: ["AI trading", "AI market infrastructure", "algorithmic trading", "autonomous agents"], zh: ["AI交易", "AI市场基础设施", "算法交易", "自主智能体"] },
  "32": { en: ["autonomous finance", "decentralized finance", "on-chain global market", "future of finance"], zh: ["自主金融", "去中心化金融", "链上全球市场"] },
  "33": { en: ["market microstructure research", "perpetual futures research", "open problems", "research outlook"], zh: ["市场微观结构研究", "研究展望", "开放问题"] },
};

/** JSON-LD `about` entities from a keyword list. */
export function keywordThings(names: string[]): { "@type": "Thing"; name: string }[] {
  return names.map((name) => ({ "@type": "Thing", name }));
}

/**
 * English-only search-intent additions, merged into CHAPTER_KEYWORDS.en
 * right after the first two (primary) keywords.
 * Kept separate so topical updates do not touch the localized lists.
 */
export const CHAPTER_KEYWORDS_EN_EXTRA: Record<string, string[]> = {
  "03": ["RWA collateral", "tokenized Treasuries", "BUIDL"],
  "27": ["equity perpetual futures", "stock perps", "commodity perpetual futures"],
};

/** Keyword array for a chapter in one language (empty for front matter). */
export function chapterKeywords(num: string, lang: Lang): string[] {
  const base = CHAPTER_KEYWORDS[num]?.[lang] ?? [];
  if (lang !== "en") return base;
  const extra = CHAPTER_KEYWORDS_EN_EXTRA[num] ?? [];
  return [...base.slice(0, 2), ...extra.filter((k) => !base.includes(k)), ...base.slice(2)];
}
