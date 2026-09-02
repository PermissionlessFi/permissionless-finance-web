/**
 * Learning paths — the site's core engine. Three tracks (trader / quant /
 * builder); the quant track ends in two specialization branches (arbitrage /
 * market-making), matching Parts VI and VII. Chapter titles resolve from
 * toc.ts at render time so paths never drift from the single source of truth.
 * Stage rationale copy is render-layer only (manuscript untouched).
 */

export interface PathStage {
  zh: string;
  en: string;
  /** one-line "why this stage" shown under the stage name */
  whyZh: string;
  whyEn: string;
  chapters: string[];
  /** specialization branch (rendered as a fork at the end of a track) */
  branch?: boolean;
}

export interface LearningPath {
  id: "trader" | "quant" | "builder";
  zh: string;
  en: string;
  /** identity statement — "this track is for you if…" */
  whoZh: string;
  whoEn: string;
  color: string;
  stages: PathStage[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "trader",
    zh: "交易者",
    en: "Trader",
    whoZh: "你想在永续合约市场中交易并活下来:读懂对手、读懂盘口、读懂那些能强平你的机制。",
    whoEn: "You want to trade perpetual futures and survive: understand your counterparties, the order book, and the mechanisms that can liquidate you.",
    color: "#b0703b",
    stages: [
      { zh: "地基", en: "Foundations", whyZh: "先弄清这个市场为什么存在,以及永续合约凭什么成为主导工具。", whyEn: "Why this market exists, and why the perpetual became its dominant instrument.", chapters: ["01", "02"] },
      { zh: "生态与对手", en: "The Ecosystem", whyZh: "你的每一笔成交都有对手方——认识参与者、服务商与市场结构的权衡。", whyEn: "Every fill has a counterparty — know the participants, service providers, and structural trade-offs.", chapters: ["04", "05", "06"] },
      { zh: "订单与盘口", en: "Orders & the Book", whyZh: "订单类型是交易的语言,订单簿是价格形成的现场。", whyEn: "Order types are the language of trading; the order book is where price happens.", chapters: ["07", "08"] },
      { zh: "资金费与强平", en: "Funding & Liquidation", whyZh: "资金费率的博弈、杠杆-强平的反身性、保险基金——决定你盈亏与生死的三个机制。", whyEn: "Funding-rate games, leverage-liquidation reflexivity, and the insurance fund — the three mechanisms that decide your P&L and survival.", chapters: ["10", "11", "12"] },
      { zh: "价格与波动", en: "Price & Volatility", whyZh: "价格从哪里来、标记价由谁治理、波动为何聚集——风控的认知基础。", whyEn: "Where price comes from, who governs the mark price, why volatility clusters — the cognitive basis of risk control.", chapters: ["13", "14", "22", "24"] },
      { zh: "评判市场", en: "Judging Venues", whyZh: "用五维框架评估一个交易场所值不值得你把保证金放进去。", whyEn: "A five-dimensional framework for deciding whether a venue deserves your margin.", chapters: ["25"] },
    ],
  },
  {
    id: "quant",
    zh: "量化研究者",
    en: "Quant Researcher",
    whoZh: "你想把这个市场变成可检验的模型:微观结构、定价机制、效率与异象,最终走向套利或做市的专精。",
    whoEn: "You want to turn this market into testable models: microstructure, pricing mechanisms, efficiency and anomalies — ending in an arbitrage or market-making specialization.",
    color: "#3f6cb3",
    stages: [
      { zh: "地基", en: "Foundations", whyZh: "资产类别的独特性决定了模型假设的边界。", whyEn: "The asset class's distinctiveness sets the boundary conditions of your models.", chapters: ["01", "02", "03"] },
      { zh: "微观结构", en: "Microstructure", whyZh: "订单流、订单簿与撮合机制——一切量化信号的物理层。", whyEn: "Order flow, the book, and matching mechanics — the physical layer beneath every quant signal.", chapters: ["07", "08", "09"] },
      { zh: "定价机制", en: "Pricing Mechanisms", whyZh: "资金费率、强平级联与保险基金构成永续合约特有的定价动力学。", whyEn: "Funding rates, liquidation cascades, and insurance funds form the pricing dynamics unique to perpetuals.", chapters: ["10", "11", "12"] },
      { zh: "信息与效率", en: "Information & Efficiency", whyZh: "价格发现、基准治理与信息效率——检验策略前先检验市场。", whyEn: "Price discovery, benchmark governance, informational efficiency — test the market before you test the strategy.", chapters: ["13", "14", "15"] },
      { zh: "波动性", en: "Volatility", whyZh: "四源头分解、聚集机制与预测——风险模型的核心构件。", whyEn: "Four-source decomposition, clustering mechanics, forecasting — the core components of any risk model.", chapters: ["22", "23", "24"] },
      { zh: "专精:套利", en: "Specialize: Arbitrage", whyZh: "传导机制、套利的风险、异象——为什么无风险套利并非无风险。", whyEn: "Transmission mechanisms, the risks of arbitrage, anomalies — why risk-free arbitrage is not risk-free.", chapters: ["16", "17", "18"], branch: true },
      { zh: "专精:做市", en: "Specialize: Market-Making", whyZh: "流动性供给的博弈、内生脆弱性与激励设计——做市是流动性的治理工程。", whyEn: "Liquidity-provision games, endogenous fragility, incentive design — market-making as liquidity governance.", chapters: ["19", "20", "21"], branch: true },
    ],
  },
  {
    id: "builder",
    zh: "构建者",
    en: "Builder",
    whoZh: "你想构建交易基础设施:从订单簿与撮合,到去中心化清结算架构、嵌入式合规与 AI 基础设施。",
    whoEn: "You want to build trading infrastructure: from order books and matching to decentralized clearing-and-settlement architecture, embedded compliance, and AI infrastructure.",
    color: "#2f8f6f",
    stages: [
      { zh: "地基", en: "Foundations", whyZh: "理解你要服务的资产类别与它对基础设施的独特要求。", whyEn: "Understand the asset class you serve and its unusual infrastructure demands.", chapters: ["01", "02", "03"] },
      { zh: "市场结构", en: "Market Structure", whyZh: "结构演进的权衡、订单语言与订单簿——系统的需求规格书。", whyEn: "Structural trade-offs, order language, and the book — the system's requirements document.", chapters: ["06", "07", "08"] },
      { zh: "机制设计", en: "Mechanism Design", whyZh: "Hyperliquid 的工程创新、资金费率、保险基金与价格基准治理——机制即产品。", whyEn: "Hyperliquid's engineering, funding rates, insurance funds, benchmark governance — the mechanism is the product.", chapters: ["09", "10", "12", "14"] },
      { zh: "质量与监管", en: "Quality & Regulation", whyZh: "五维市场质量与监管经济学——你的设计目标函数与约束条件。", whyEn: "Five-dimensional market quality and the economics of regulation — your objective function and constraints.", chapters: ["25", "26"] },
      { zh: "架构", en: "Architecture", whyZh: "从单体黑箱到分层架构、理想的去中心化清结算、嵌入式合规——本书的工程核心。", whyEn: "From monolith to layered architecture, ideal decentralized clearing and settlement, embedded compliance — the book's engineering core.", chapters: ["28", "29", "30"] },
      { zh: "前沿", en: "Frontier", whyZh: "永续合约重塑资产定价的思想实验,以及 AI 成为市场基础设施之后的世界。", whyEn: "The thought experiment of perpetuals reshaping asset pricing, and the world after AI becomes market infrastructure.", chapters: ["27", "31", "32", "33"] },
    ],
  },
];
