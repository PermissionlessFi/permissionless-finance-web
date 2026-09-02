import { Part, Chapter, ChapterMeta, Lang } from "./types";

export const PARTS: Part[] = [
  {
    index: 0,
    title: { zh: "卷首", en: "Front Matter" },
    chapters: [
      { num: "preface", partIndex: 0, title: { zh: "前言", en: "Preface" } },
      { num: "disclaimer", partIndex: 0, title: { zh: "声明", en: "Disclaimer" } },
      { num: "license", partIndex: 0, title: { zh: "许可", en: "License" } },
      { num: "about", partIndex: 0, title: { zh: "关于作者", en: "About the Author" } },
    ],
  },
  {
    index: 1,
    title: { zh: "第一篇：地基", en: "Part I: Foundation" },
    chapters: [
      { num: "01", partIndex: 1, title: { zh: "数字资产的独特性与传统资产的对比", en: "The Distinctiveness of Digital Assets Compared with Traditional Assets" } },
      { num: "02", partIndex: 1, title: { zh: "衍生品市场与永续合约的崛起", en: "Derivatives Markets and the Rise of Perpetual Futures" } },
      { num: "03", partIndex: 1, title: { zh: "数字资产的独特价值与金融的未来", en: "The Distinctive Value of Digital Assets and the Future of Finance" } },
    ],
  },
  {
    index: 2,
    title: { zh: "第二篇：生态", en: "Part II: Ecosystem" },
    chapters: [
      { num: "04", partIndex: 2, title: { zh: "永续合约交易的参与者与行为", en: "Participants and Behavior in Perpetual Futures Trading" } },
      { num: "05", partIndex: 2, title: { zh: "永续合约交易的服务商与生态", en: "Service Providers and the Ecosystem of Perpetual Futures Trading" } },
      { num: "06", partIndex: 2, title: { zh: "永续合约市场结构的演进与权衡", en: "The Evolution and Trade-offs of Perpetual Futures Market Structure" } },
    ],
  },
  {
    index: 3,
    title: { zh: "第三篇：微观结构", en: "Part III: Microstructure" },
    chapters: [
      { num: "07", partIndex: 3, title: { zh: "订单与永续合约交易的语言", en: "Orders and the Language of Perpetual Futures Trading" } },
      { num: "08", partIndex: 3, title: { zh: "永续合约订单簿与市场微观结构", en: "The Perpetual Futures Order Book and Market Microstructure" } },
      { num: "09", partIndex: 3, title: { zh: "Hyperliquid 微观结构创新", en: "Hyperliquid's Microstructure Innovations" } },
    ],
  },
  {
    index: 4,
    title: { zh: "第四篇：定价机制", en: "Part IV: Pricing Mechanisms" },
    chapters: [
      { num: "10", partIndex: 4, title: { zh: "资金费率的博弈论分析", en: "A Game-Theoretic Analysis of Funding Rates" } },
      { num: "11", partIndex: 4, title: { zh: "杠杆与清算的内生反身性", en: "The Endogenous Reflexivity of Leverage and Liquidation" } },
      { num: "12", partIndex: 4, title: { zh: "保险基金的政治经济学", en: "The Political Economy of Insurance Funds" } },
    ],
  },
  {
    index: 5,
    title: { zh: "第五篇：信息与效率", en: "Part V: Information & Efficiency" },
    chapters: [
      { num: "13", partIndex: 5, title: { zh: "价格发现与信息融入的过程", en: "The Process of Price Discovery and Information Incorporation" } },
      { num: "14", partIndex: 5, title: { zh: "价格基准的治理：指数、标记价与预言机", en: "The Governance of Price Benchmarks — Indices, Mark Prices, and Oracles" } },
      { num: "15", partIndex: 5, title: { zh: "数字资产市场的信息效率", en: "Informational Efficiency in Digital Asset Markets" } },
    ],
  },
  {
    index: 6,
    title: { zh: "第六篇：套利与异象", en: "Part VI: Arbitrage & Anomalies" },
    chapters: [
      { num: "16", partIndex: 6, title: { zh: "套利与市场效率的传导机制", en: "Arbitrage and the Transmission Mechanisms of Market Efficiency" } },
      { num: "17", partIndex: 6, title: { zh: "套利的风险：为何无风险套利并非无风险", en: "The Risks of Arbitrage — Why Risk-Free Arbitrage Is Not Risk-Free" } },
      { num: "18", partIndex: 6, title: { zh: "套利失灵与市场异象", en: "Arbitrage Failure and Market Anomalies" } },
    ],
  },
  {
    index: 7,
    title: { zh: "第七篇：流动性", en: "Part VII: Liquidity" },
    chapters: [
      { num: "19", partIndex: 7, title: { zh: "流动性供给与博弈", en: "Liquidity Provision and Strategic Games" } },
      { num: "20", partIndex: 7, title: { zh: "流动性的内生性与脆弱性", en: "The Endogeneity and Fragility of Liquidity" } },
      { num: "21", partIndex: 7, title: { zh: "流动性治理的公共品困境与激励设计", en: "The Public-Goods Dilemma and Incentive Design of Liquidity Governance" } },
    ],
  },
  {
    index: 8,
    title: { zh: "第八篇：波动性", en: "Part VIII: Volatility" },
    chapters: [
      { num: "22", partIndex: 8, title: { zh: "波动性来源的四源头分解与超额波动", en: "A Four-Source Decomposition of Volatility and Excess Volatility" } },
      { num: "23", partIndex: 8, title: { zh: "波动率聚集的微观机制", en: "The Microstructural Mechanisms of Volatility Clustering" } },
      { num: "24", partIndex: 8, title: { zh: "波动率预测与决策", en: "Volatility Forecasting and Decision-Making" } },
    ],
  },
  {
    index: 9,
    title: { zh: "第九篇：工程", en: "Part IX: Engineering" },
    chapters: [
      { num: "25", partIndex: 9, title: { zh: "永续合约市场质量的五维评价", en: "A Five-Dimensional Evaluation of Perpetual Futures Market Quality" } },
      { num: "26", partIndex: 9, title: { zh: "创新与稳定之间的监管经济学", en: "The Economics of Regulation Between Innovation and Stability" } },
      { num: "27", partIndex: 9, title: { zh: "永续合约重塑全球资产定价的思想实验", en: "A Thought Experiment on Perpetual Futures Reshaping Global Asset Pricing" } },
      { num: "28", partIndex: 9, title: { zh: "从单体黑箱到分层架构", en: "From the Monolithic Black Box to Layered Architecture" } },
      { num: "29", partIndex: 9, title: { zh: "构建理想的去中心化清结算架构", en: "Designing an Ideal Decentralized Clearing and Settlement Architecture" } },
      { num: "30", partIndex: 9, title: { zh: "嵌入式合规与自动化治理", en: "Embedded Compliance and Automated Governance" } },
    ],
  },
  {
    index: 10,
    title: { zh: "第十篇：未来", en: "Part X: The Future" },
    chapters: [
      { num: "31", partIndex: 10, title: { zh: "当 AI 成为市场的基础设施", en: "When AI Becomes Market Infrastructure" } },
      { num: "32", partIndex: 10, title: { zh: "自主世界金融的全球愿景", en: "The Global Vision of Autonomous World Finance" } },
      { num: "33", partIndex: 10, title: { zh: "总结与研究展望", en: "Summary and Research Outlook" } },
    ],
  },
];

export const ALL_CHAPTERS: Chapter[] = PARTS.flatMap((p) => p.chapters);

export function getChapterMeta(num: string, lang: Lang): ChapterMeta | null {
  const idx = ALL_CHAPTERS.findIndex((c) => c.num === num);
  if (idx === -1) return null;

  const chapter = ALL_CHAPTERS[idx];
  const part = PARTS.find((p) => p.index === chapter.partIndex)!;

  return {
    num: chapter.num,
    lang,
    title: chapter.title[lang],
    partTitle: part.title[lang],
    prevChapter: idx > 0 ? ALL_CHAPTERS[idx - 1].num : null,
    nextChapter: idx < ALL_CHAPTERS.length - 1 ? ALL_CHAPTERS[idx + 1].num : null,
  };
}
