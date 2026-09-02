/**
 * Open problems — one genuinely open research question per part, distilled
 * from the closing chapter of each part (its final discussion subsection and
 * chapter summary). Every question is traceable to the manuscript; wording
 * here is render-layer only and pending author review, like the abstracts
 * and FAQ. Terminology follows the book's discipline, which keeps clearing,
 * settlement, and liquidation strictly distinct in both editions.
 */

export interface OpenProblem {
  part: number;
  /** the part-closing chapter the question is distilled from */
  chapter: string;
  titleZh: string;
  titleEn: string;
  qZh: string;
  qEn: string;
  ctxZh: string;
  ctxEn: string;
}

export const OPEN_PROBLEMS: OpenProblem[] = [
  {
    part: 1,
    chapter: "03",
    titleZh: `第一篇:地基`,
    titleEn: `Part I: Foundation`,
    qZh: `在“有条件的无许可”构成链上金融现实终态的前提下，零知识证明合规凭证能够在多大程度上于主权合规约束之内保全无许可架构的自由度与信任税压缩收益？`,
    qEn: `Given that “conditional permissionlessness” constitutes the realistic end state of on-chain finance, to what extent can zero-knowledge compliance credentials preserve the freedoms of a permissionless architecture—and its trust-tax compression gains—within the constraints of sovereign compliance?`,
    ctxZh: `本章论证没有任何主要国家会让渡金融管辖权，完全无许可的全球金融在政治上不可行。书中仅将零知识合规凭证定位为在主权边界内最大化自由度的技术探索，其可达边界留待第30章与未来实践检验。`,
    ctxEn: `The chapter argues that no major state will cede financial jurisdiction, rendering fully permissionless global finance politically infeasible. The book positions zero-knowledge compliance credentials only as a technical exploration for maximizing freedom within the sovereign boundary, leaving its attainable limit to Chapter 30 and future practice.`,
  },
  {
    part: 2,
    chapter: "06",
    titleZh: `第二篇:生态`,
    titleEn: `Part II: Ecosystem`,
    qZh: `在完全透明的订单簿与50至100倍杠杆并存的链上永续合约市场中，基于零知识证明的“可验证但不暴露清算阈值”的选择性不透明设计，能否在不牺牲可验证性的前提下化解透明性、杠杆与安全之间的三元张力？`,
    qEn: `In on-chain perpetual futures markets that combine fully transparent order books with 50x–100x leverage, can selective opacity—zero-knowledge designs that remain verifiable without exposing liquidation thresholds—resolve the trilemma among transparency, leverage, and security without sacrificing verifiability?`,
    ctxZh: `本章将这一三元张力明确列为定义下一代市场结构的未解难题：2025年 Hyperliquid 的三起策略性攻击表明完全透明反而使精确的清算狙击成为可能，而书中仅指出选择性不透明是潜在解决路径，其机制设计与实际效果尚待检验。`,
    ctxEn: `The chapter explicitly lists this trilemma as an open problem that will define the next generation of market structure: three strategic attacks on Hyperliquid in 2025 showed that full transparency enables precise liquidation sniping, and the book identifies selective opacity only as a potential path whose mechanism design and effectiveness remain untested.`,
  },
  {
    part: 3,
    chapter: "09",
    titleZh: `第三篇:微观结构`,
    titleEn: `Part III: Microstructure`,
    qZh: `Hyperliquid 式流动性飞轮是否存在一个 TVL 或交易量的临界阈值，一旦跌破该阈值，其正反馈循环便会转入不可逆的自我瓦解？`,
    qEn: `Does the Hyperliquid-style liquidity flywheel possess a critical threshold of TVL or trading volume below which its positive feedback loop tips into irreversible self-unraveling?`,
    ctxZh: `本章指出正反馈循环天然具有自强化与自瓦解的对称性：JELLY 事件后金库 AUM 回撤约15%又逐步恢复，表明飞轮仍运行于临界质量之上，但安全边际难以先验确定，该阈值是否存在被书中明确列为尚待检验的重要问题。`,
    ctxEn: `The chapter shows that positive feedback loops are inherently symmetric between self-reinforcement and self-unraveling: the roughly 15% vault AUM drawdown and subsequent recovery after the JELLY incident suggest the flywheel still runs above critical mass, yet the safety margin cannot be determined a priori, and the book explicitly leaves the existence of such a threshold as an important question awaiting empirical testing.`,
  },
  {
    part: 4,
    chapter: "12",
    titleZh: `第四篇:定价机制`,
    titleEn: `Part IV: Pricing Mechanisms`,
    qZh: `以“去中心化”与“代码即法律”为核心叙事的衍生品协议，在面对足以摧毁自身的蓄意攻击时是否应当设置紧急的中心化“断路器”，而该断路器又应由谁掌握、依何种条件触发、如何防止被滥用？`,
    qEn: `Should a derivatives protocol whose core narrative rests on decentralization and “code is law” possess an emergency centralized “circuit breaker” against attacks capable of destroying it—and if so, who should hold it, under what trigger conditions, and how can its abuse be prevented?`,
    ctxZh: `JELLY 事件表明任何事先设计的规则体系都无法穷尽恶意攻击向量，系统最终依赖拥有裁量权的“最终担保人”；POPCAT 事件进一步证明基于经济理性假设的修补无法根除这一脆弱性。书中明确指出此类治理问题无法用代码解决，只能用制度来约束。`,
    ctxEn: `The JELLY incident demonstrated that no pre-designed rule system can exhaust all malicious attack vectors, so the system ultimately relies on a discretionary guarantor of last resort; the POPCAT incident further proved that fixes premised on economic rationality cannot eliminate this fragility. The book states that such governance questions cannot be solved by code, only constrained by institutions.`,
  },
  {
    part: 5,
    chapter: "15",
    titleZh: `第五篇:信息与效率`,
    titleEn: `Part V: Information & Efficiency`,
    qZh: `随着2024年下半年以来链上永续合约交易量的爆发式增长，加密市场价格发现的主导权是否正在从中心化交易所向去中心化永续合约平台转移，即 CEX 与 DEX 之间的信息流方向是否已经发生逆转？`,
    qEn: `With the explosive growth of on-chain perpetual futures volume since the second half of 2024, is the leadership of price discovery in crypto markets shifting from centralized exchanges to decentralized perpetual futures venues—that is, has the direction of information flow between CEXs and DEXs begun to reverse?`,
    ctxZh: `本章指出，CEX 主导价格发现的实证结论主要基于 DEX 永续合约尚未规模化的时期，而链上与链下平台在预言机更新频率与清算效率上的结构性差异又创造了新的套利空间。书中将这一问题明确列为制度化时代永续合约市场效率研究的前沿课题。`,
    ctxEn: `The chapter notes that empirical findings of CEX-dominated price discovery rest mainly on the period before DEX perpetual futures reached scale, while structural differences between on-chain and off-chain venues in oracle update frequency and liquidation efficiency create new arbitrage room. The book explicitly flags this question as a frontier topic for market-efficiency research in the regulated era.`,
  },
  {
    part: 6,
    chapter: "18",
    titleZh: `第六篇:套利与异象`,
    titleEn: `Part VI: Arbitrage & Anomalies`,
    qZh: `在监管框架、交易时段、结算货币与结算周期的制度性分割下，CME/ETF 体系与离岸永续合约体系之间的“双轨定价”将如何演化，跨体系套利在多大程度上能够收敛这一定价分裂？`,
    qEn: `How will the “dual-track pricing” between the regulated CME/ETF complex and the offshore perpetual futures system evolve under the institutional segmentation of regulatory frameworks, trading sessions, settlement currencies, and settlement cycles, and to what extent can cross-system arbitrage close this pricing divide?`,
    ctxZh: `本书指出，2024年比特币现货 ETF 获批后，两个体系在监管、交易时段与结算安排上的根本差异构成阻碍跨体系套利的制度性障碍，使同一标的经常出现不一致的定价信号；书中明言这一2024年之前并不存在的新裂隙，其演化将成为未来数年市场结构研究的核心课题。`,
    ctxEn: `The book shows that after U.S. spot Bitcoin ETFs were approved in 2024, fundamental differences in regulation, trading hours, and settlement arrangements between the two systems form an institutional obstacle to cross-system arbitrage, so the same underlying asset frequently receives inconsistent pricing signals; it explicitly flags the evolution of this fissure, which did not exist before 2024, as a core topic of market-structure research in the coming years.`,
  },
  {
    part: 7,
    chapter: "21",
    titleZh: `第七篇:流动性`,
    titleEn: `Part VII: Liquidity`,
    qZh: `协议金库提供的“底线流动性”能否通过吸收集中抛压、降低独立做市商的单边库存风险，从而在极端行情中促使后者选择留守，并在宏观层面提升市场微观结构的整体稳定性？`,
    qEn: `Can the “floor liquidity” provided by protocol vaults absorb concentrated selling pressure and reduce independent market makers’ one-sided inventory risk, thereby inducing them to stay in the market during extreme conditions and enhancing the stability of the overall market microstructure at the macro level?`,
    ctxZh: `本章的单主体损益模拟只能证明独立做市商在极端危机中倾向于撤退；而金库底线流动性改善做市商生存环境、促使其留守的正向互动仍是尚未被证明的理论推断，其检验需要纳入金库与独立做市商交互的多主体仿真或经验数据。`,
    ctxEn: `The chapter’s single-agent profit-and-loss simulation can only establish that independent market makers tend to retreat in an extreme crisis; the positive interaction whereby vault floor liquidity improves makers’ survival environment and induces them to stay remains an unproven theoretical inference, whose testing would require multi-agent simulations or empirical data that incorporate the interaction between vaults and independent market makers.`,
  },
  {
    part: 8,
    chapter: "24",
    titleZh: `第八篇:波动性`,
    titleEn: `Part VIII: Volatility`,
    qZh: `当市场参与者的波动率预测模型与风控触发条件高度同质化时，能否设计出既保持个体风险管理有效性、又能在结构上打破“模型预警—同步撤退—流动性枯竭—波动率飙升”正反馈循环的异质化机制？`,
    qEn: `When market participants’ volatility-forecasting models and risk-control triggers are highly homogeneous, can heterogenization mechanisms be designed that preserve the effectiveness of individual risk management while structurally breaking the positive feedback loop of “model warning — synchronized withdrawal — liquidity dry-up — volatility spike”?`,
    ctxZh: `本章提出个体、市场与协议三个层面的缓解路径（如异步化的强平触发机制），但承认这些措施无法完全消除模型同质性风险；书中以2025年10月约36小时内产生约190亿美元名义强平的级联事件为实证警示，并指出基于相似架构与训练数据的 AI 代理普及后，“算法单一文化”可能使同步性风险进入前所未有的量级。`,
    ctxEn: `The chapter proposes mitigation at the individual, market, and protocol levels (such as asynchronous liquidation triggers) but concedes these measures cannot fully eliminate model-homogeneity risk; it cites the October 2025 cascade of roughly $19 billion in notional liquidations within about 36 hours as an empirical warning, and notes that as AI agents built on similar architectures and training data proliferate, an “algorithmic monoculture” could push synchronization risk to an unprecedented magnitude.`,
  },
  {
    part: 9,
    chapter: "30",
    titleZh: `第九篇:工程`,
    titleEn: `Part IX: Engineering`,
    qZh: `在全球金融监管机构普遍缺乏智能合约审计能力的条件下，从“审计机构行为”到“审计系统架构”的监管范式转型应如何构建认证审计标准与审计问责机制，以防嵌入式合规退化为另一种“合规剧场”？`,
    qEn: `Given that financial regulators worldwide currently lack the technical capacity to audit smart-contract code, how should the paradigm shift from auditing institutional behavior to auditing system architecture be underpinned by certified auditing standards and auditor-accountability mechanisms, so that embedded compliance does not degenerate into another form of “compliance theater”?`,
    ctxZh: `本书指出，嵌入式合规的前提是监管者能够独立验证合约代码确实实现了其声称的合规约束，而这一能力在当前全球金融监管体系中几乎不存在；书中将认证的智能合约审计标准与审计机构的分级认证与责任追究机制列为尚待建设的两项基础设施。`,
    ctxEn: `The book argues that embedded compliance presupposes regulators who can independently verify that contract code truly implements the compliance constraints it claims — a capacity that at present barely exists anywhere in the global regulatory system; it lists certified smart-contract auditing standards and a tiered certification and accountability mechanism for auditing firms as two pieces of infrastructure yet to be built.`,
  },
  {
    part: 10,
    chapter: "33",
    titleZh: `第十篇:未来`,
    titleEn: `Part X: The Future`,
    qZh: `在缺乏主权信用兜底的无需许可链上金融网络中，当极端事件击穿系统内全部清算机制、破产缺口无法弥补时，最终的恢复与处置防线应如何设计——是最优的自动减仓机制、系统债务代币，还是某种尚未被发明的社会化损失分摊协议？`,
    qEn: `In a permissionless on-chain financial network without a sovereign-credit backstop, how should the final recovery and resolution line of defense be designed when an extreme event breaches all clearing mechanisms within the system and the bankruptcy shortfall cannot be covered — an optimal auto-deleveraging mechanism, a system debt token, or some yet-to-be-invented socialized loss-mutualization protocol?`,
    ctxZh: `本书将这一问题列为金融工程与系统设计层面最紧迫的未解难题之一：传统中央对手方清算体系的最终兜底来自中央银行或主权国家的外部公共信用，而追求去中心化与无需许可的链上体系不存在这种外部兜底，违约瀑布之外的终极风险缓冲方案仍属空白。`,
    ctxEn: `The book ranks this among the most pressing unsolved problems in financial engineering and system design: in traditional central-counterparty clearing the ultimate backstop is external public credit from the central bank or the sovereign state, whereas a decentralized, permissionless on-chain system has no such external backstop, leaving the ultimate risk buffer beyond the default waterfall an open gap.`,
  },
];
