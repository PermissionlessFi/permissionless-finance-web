export interface GlossaryTerm {
  /** Stable slug — the anchor id on /glossary and the deep-link target from
   *  each chapter's "Key terms" (/glossary#<id>). Never change once linked. */
  id: string;
  en: string;
  zh: string;
  defEn: string;
  defZh: string;
  /** Chapters where the term is used/developed. Drives each chapter's
   *  "Key terms" list; the first entry is the canonical "see" link. */
  chapters: string[];
}

/**
 * ONE book-wide glossary (single source of truth) — a DRAFT reference layer for
 * author review. Each chapter shows a "Key terms" chip that deep-links here
 * rather than duplicating definitions. Rendered at /glossary and emitted as
 * schema.org DefinedTermSet (a strong "this book DEFINES these terms" entity
 * signal). Definition-first, faithful to the book. Seed set — expand after sign-off.
 */
export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "perpetual-futures", en: "Perpetual futures", zh: "永续合约", chapters: ["02", "06", "27", "32"],
    defEn: "A derivatives contract that tracks an underlying asset's price with no expiry or physical delivery, kept close to spot by a periodic funding-rate payment between long and short holders.",
    defZh: "一种追踪标的资产价格、没有到期日与实物交割的衍生品合约，通过多空之间周期性的资金费率支付使其价格贴近现货。",
  },
  {
    id: "funding-rate", en: "Funding rate", zh: "资金费率", chapters: ["10", "16", "02", "27"],
    defEn: "The periodic payment exchanged between long and short holders of a perpetual future that anchors its price to spot; positive when the perpetual trades above spot (long holders pay short holders) and negative when it trades below.",
    defZh: "永续合约多空持有者之间周期性交换的支付，用以将合约价格锚定于现货；当永续高于现货时为正（多头付空头），低于时为负。",
  },
  {
    id: "basis", en: "Basis", zh: "基差", chapters: ["10", "16", "13", "15", "17", "18"],
    defEn: "The difference between a derivative's price and the spot price of its underlying; for perpetuals, the basis is the deviation that the funding rate acts to close.",
    defZh: "衍生品价格与其标的现货价格之间的差额；对永续合约而言，基差正是资金费率所要消除的偏离。",
  },
  {
    id: "open-interest", en: "Open interest", zh: "未平仓合约", chapters: ["10", "11"],
    defEn: "The total number of derivative contracts outstanding at a given time; rising open interest alongside a rising funding rate indicates leverage accumulating on one side of the market.",
    defZh: "某一时刻未平仓的衍生品合约总量；未平仓量随资金费率同步上升，意味着市场一侧的杠杆正在累积。",
  },
  {
    id: "leverage", en: "Leverage", zh: "杠杆", chapters: ["11", "10", "02", "23", "04", "31"],
    defEn: "The use of borrowed capital to increase position size relative to posted margin, amplifying both returns and a position's sensitivity to liquidation.",
    defZh: "利用借入资金相对于所投保证金放大头寸规模，既放大收益，也放大头寸对强制平仓的敏感性。",
  },
  {
    id: "liquidation", en: "Liquidation", zh: "强制平仓", chapters: ["11", "12", "14", "09", "07", "28"],
    defEn: "The forced closing of a leveraged position when its margin falls below the maintenance requirement, executed by the exchange or protocol to prevent the account from entering deficit.",
    defZh: "当杠杆头寸的保证金低于维持保证金要求时，由交易所或协议强制平掉该头寸，以防止账户出现亏空。",
  },
  {
    id: "liquidation-cascade", en: "Liquidation cascade", zh: "清算级联", chapters: ["11", "20", "14", "02", "23", "01", "22", "24", "31", "03", "26", "30"],
    defEn: "A self-reinforcing spiral in which forced liquidations drive the price further against remaining leveraged positions, triggering further liquidations — a core source of endogenous crash risk.",
    defZh: "一种自我强化的螺旋：强制平仓将价格进一步推向不利于剩余杠杆头寸的方向，从而触发更多平仓——内生崩溃风险的核心来源。",
  },
  {
    id: "insurance-fund", en: "Insurance fund", zh: "保险基金", chapters: ["12", "29", "05"],
    defEn: "A capital buffer that absorbs the shortfall when a liquidation closes below the bankruptcy price, protecting solvent counterparties before auto-deleveraging is invoked.",
    defZh: "一笔资本缓冲，用以吸收强平价低于破产价时产生的缺口，在动用自动减仓之前保护有偿付能力的对手方。",
  },
  {
    id: "auto-deleveraging", en: "Auto-deleveraging (ADL)", zh: "自动减仓", chapters: ["12", "29"],
    defEn: "A backstop that closes profitable opposing positions when the insurance fund is exhausted, socializing the loss rather than allowing the exchange to enter deficit.",
    defZh: "一种兜底机制：当保险基金耗尽时，强制平掉盈利的反向头寸，将损失社会化，以避免交易所出现亏空。",
  },
  {
    id: "mark-price", en: "Mark price", zh: "标记价格", chapters: ["14", "11", "13"],
    defEn: "A smoothed reference price, typically derived from an index of spot venues, used to compute unrealized profit and loss and to trigger liquidations — deliberately distinct from the last traded price to resist manipulation.",
    defZh: "一个经过平滑的参考价格，通常由多个现货来源的指数推导而来，用于计算未实现盈亏并触发强平；它刻意区别于最新成交价，以抵御操纵。",
  },
  {
    id: "index-price", en: "Index price", zh: "指数价格", chapters: ["14"],
    defEn: "A composite of spot prices across multiple venues that serves as the external anchor for a perpetual's mark price and funding calculation.",
    defZh: "综合多家交易所现货价格而成的价格，充当永续合约标记价格与资金费率计算的外部锚。",
  },
  {
    id: "oracle", en: "Oracle", zh: "预言机", chapters: ["14", "27", "29", "30", "32", "26"],
    defEn: "A system that delivers external price data on-chain; in perpetual DEXs it feeds the index and mark price, making its integrity a core security and governance concern.",
    defZh: "将外部价格数据引入链上的系统；在永续 DEX 中它提供指数与标记价格，其完整性因而成为核心的安全与治理问题。",
  },
  {
    id: "price-discovery", en: "Price discovery", zh: "价格发现", chapters: ["13", "27", "09", "16", "06", "15", "01", "25"],
    defEn: "The process by which markets incorporate information into prices; in crypto, perpetual futures frequently lead spot, making them the primary venue of price discovery.",
    defZh: "市场将信息融入价格的过程；在加密市场中，永续合约常常领先现货，成为价格发现的主要场所。",
  },
  {
    id: "market-microstructure", en: "Market microstructure", zh: "市场微观结构", chapters: ["08", "09", "13", "23", "06", "04", "33"],
    defEn: "The study of how trading rules, order flow, and market design determine prices, spreads, liquidity, and volatility at the finest level of market operation.",
    defZh: "研究交易规则、订单流与市场设计如何在市场运作的最细粒度上决定价格、价差、流动性与波动性的学科。",
  },
  {
    id: "limit-order-book", en: "Limit order book", zh: "限价订单簿", chapters: ["07", "08", "09"],
    defEn: "The ordered record of outstanding buy and sell limit orders at each price level; its shape determines depth, spread, and the price impact of incoming trades.",
    defZh: "按价格层级排列的未成交买卖限价单记录；其形态决定了市场深度、价差以及新成交单的价格冲击。",
  },
  {
    id: "bid-ask-spread", en: "Bid-ask spread", zh: "买卖价差", chapters: ["08", "09", "19", "07"],
    defEn: "The gap between the best available buy price and the best available sell price — a primary measure of a market's liquidity and transaction cost.",
    defZh: "最优买价与最优卖价之间的差距——衡量市场流动性与交易成本的首要指标。",
  },
  {
    id: "market-maker", en: "Market maker", zh: "做市商", chapters: ["08", "09", "19", "06", "20", "21", "31", "04", "05"],
    defEn: "A participant that continuously quotes both bid and ask prices to supply liquidity, earning the spread while managing inventory and adverse-selection risk.",
    defZh: "持续报出买价与卖价以提供流动性的参与者，赚取价差，同时管理库存与逆向选择风险。",
  },
  {
    id: "volatility-clustering", en: "Volatility clustering", zh: "波动率聚集", chapters: ["23", "22", "24"],
    defEn: "The empirical tendency of large price changes to be followed by large changes and of calm to follow calm, arising from microstructural feedback in order flow and leverage.",
    defZh: "大幅价格变动倾向于紧随大幅变动、平静紧随平静的经验规律，源自订单流与杠杆中的微观结构反馈。",
  },
  {
    id: "market-depth", en: "Market depth", zh: "市场深度", chapters: ["08", "11", "19", "20", "23", "25"],
    defEn: "The quantity of resting limit orders available at each price level; it determines how large a trade a market can absorb before the price moves materially, and its collapse under stress is a core driver of liquidation cascades.",
    defZh: "订单簿在每个价格层级上挂单的数量；它决定市场在价格显著变动前能吸收多大的成交量，其在压力下的崩塌是清算级联的核心推手。",
  },
  {
    id: "adverse-selection", en: "Adverse selection", zh: "逆向选择", chapters: ["08", "09", "19", "07", "04"],
    defEn: "The loss a market maker incurs when a better-informed trader executes against a stale quote before it can be updated; it is a primary component of the bid-ask spread.",
    defZh: "做市商在报价被更新之前、被信息更充分的交易者成交所承受的损失；它是买卖价差的主要构成部分。",
  },
  {
    id: "bankruptcy-price", en: "Bankruptcy price", zh: "破产价格", chapters: ["12", "11"],
    defEn: "The price at which a leveraged position's equity reaches zero; it is the reference at which auto-deleveraging force-closes selected profitable positions.",
    defZh: "杠杆头寸权益归零时的价格；自动减仓即以此价格强制平掉被选中的盈利头寸。",
  },
  {
    id: "socialized-loss", en: "Socialized loss", zh: "损失社会化", chapters: ["12", "29", "01"],
    defEn: "The ex-post allocation of an uncovered shortfall across profitable accounts once the insurance fund is exhausted, typically executed through auto-deleveraging.",
    defZh: "当保险基金耗尽时，将无法覆盖的亏空按比例分摊给盈利账户的事后分配，通常通过自动减仓执行。",
  },
  {
    id: "funding-rate-arbitrage", en: "Funding rate arbitrage", zh: "资金费率套利", chapters: ["16", "10", "15", "17", "21", "18"],
    defEn: "A delta-neutral strategy that shorts the higher-funding-rate venue and goes long the lower-rate one to capture persistent cross-exchange rate differences, smoothing the global funding structure.",
    defZh: "一种 delta 中性策略：在资金费率较高的场所做空、在较低的场所做多，以捕获跨交易所持续的费率差，平滑全球资金费率结构。",
  },
  {
    id: "cash-and-carry", en: "Cash-and-carry (basis trade)", zh: "现货—永续基差套利", chapters: ["16", "17"],
    defEn: "Spot-perpetual basis arbitrage — buying spot while shorting an equivalent perpetual — that earns the funding rate and basis convergence while remaining delta-neutral, anchoring the perpetual price to spot.",
    defZh: "现货—永续基差套利：买入现货同时做空等量永续，在保持 delta 中性的同时赚取资金费率与基差收敛，将永续价格锚定于现货。",
  },
  {
    id: "price-benchmark", en: "Price benchmark", zh: "价格基准", chapters: ["14"],
    defEn: "An engineered fair-value price — the index price, the smoothed mark price, or the on-chain oracle price — established as the authoritative reference for margin computation, liquidation, and settlement.",
    defZh: "经过工程化构造的公允价格——指数价格、平滑后的标记价格、或链上预言机价格——作为保证金计算、清算与结算的权威参照。",
  },
  {
    id: "limits-to-arbitrage", en: "Limits to arbitrage", zh: "套利限制", chapters: ["17", "16", "18", "26"],
    defEn: "The structural frictions — capital and margin constraints, execution risk, counterparty exposure, and uncertain convergence — that stop arbitrageurs from fully eliminating mispricing, so persistent spreads represent compensation for risk rather than inefficiency.",
    defZh: "阻止套利者彻底消除错误定价的结构性摩擦——资金与保证金约束、执行风险、对手方风险与不确定的收敛——因此持续存在的价差是风险补偿而非无效率的残余。",
  },
  {
    id: "informational-efficiency", en: "Informational efficiency", zh: "信息效率", chapters: ["15", "13", "18", "33"],
    defEn: "The degree to which asset prices fully and rapidly reflect all available relevant information, such that no participant can systematically earn excess returns; best treated as a continuous, multidimensional spectrum rather than a binary property.",
    defZh: "资产价格充分且迅速反映一切可得相关信息、以致无人能系统性获取超额收益的程度；宜视为连续的多维谱系，而非非黑即白的属性。",
  },
  {
    id: "liquidity-fragility", en: "Liquidity fragility", zh: "流动性脆弱性", chapters: ["20", "19", "21", "32", "25"],
    defEn: "The structural propensity of market liquidity to contract abruptly and countercyclically under stress, evaporating at the moment demand for it is greatest.",
    defZh: "市场流动性在压力下骤然、逆周期收缩的结构性倾向——在对其需求最迫切的时刻反而消失。",
  },
  {
    id: "ghost-liquidity", en: "Ghost liquidity", zh: "幽灵流动性", chapters: ["20", "08"],
    defEn: "Order-book depth that is visible but conditional — high-frequency quotes withdrawn within milliseconds once volatility rises or toxic order flow is detected — so displayed depth overstates what can actually be executed under stress.",
    defZh: "可见却有条件的订单簿深度——一旦波动上升或检测到有毒订单流便在毫秒内撤单的高频报价——因此显示的深度高估了压力下真正可成交的量。",
  },
  {
    id: "toxic-flow", en: "Toxic flow", zh: "有毒订单流", chapters: ["19", "20", "04", "31"],
    defEn: "Order flow that inflicts systematic losses on a market maker — from informed trading, arbitrage extraction, liquidation cascades, or MEV attacks — driving it to widen spreads or withdraw liquidity.",
    defZh: "使做市商系统性亏损的订单流——来自知情交易、套利抽取、清算级联或 MEV 攻击——迫使其扩大价差或撤出流动性。",
  },
  {
    id: "maximal-extractable-value", en: "Maximal extractable value (MEV)", zh: "最大可提取价值", chapters: ["06", "09", "19", "01", "05", "28", "03", "30"],
    defEn: "Value extracted from the ability to order, insert, or censor transactions within a block — via front-running, sandwiching, or reordering — a form of toxicity that on-chain market makers must actively defend against.",
    defZh: "通过在区块内排序、插入或审查交易而提取的价值——经由抢跑、三明治或重排——是链上做市商必须主动防御的一种有毒行为。",
  },
  {
    id: "realized-volatility", en: "Realized volatility", zh: "已实现波动率", chapters: ["23", "24", "33", "22"],
    defEn: "Return variability computed directly from high-frequency (e.g. intraday) returns rather than inferred from a model; the slowly decaying autocorrelation of its series is the direct empirical signature of volatility clustering.",
    defZh: "直接由高频（如日内）收益计算、而非由模型推断的收益波动；其序列缓慢衰减的自相关正是波动率聚集的直接经验特征。",
  },
  {
    id: "tokenization", en: "Tokenization", zh: "代币化", chapters: ["03", "01"],
    defEn: "The cryptographic mapping of an asset's ownership and rights onto a blockchain token, standardizing a non-standard, illiquid asset into one that is divisible, composable, and globally tradable.",
    defZh: "将资产的所有权与相关权利以密码学方式映射为区块链上的代币，把非标准、非流动的资产标准化为可分割、可组合、可全球交易的资产。",
  },
  {
    id: "trust-tax", en: "Trust tax", zh: "信任税", chapters: ["01", "03"],
    defEn: "All direct and indirect costs paid in a financial transaction solely to establish and maintain trust—intermediary fees, compliance costs, the opportunity cost of settlement delay, and the information-asymmetry premium—which digital assets compress rather than eliminate.",
    defZh: "在金融交易中仅为建立和维持信任而付出的一切直接与间接成本——中介费、合规成本、结算延迟的机会成本、信息不对称溢价——数字资产压缩而非消除这笔成本。",
  },
  {
    id: "atomic-settlement", en: "Atomic settlement", zh: "原子结算", chapters: ["01", "03"],
    defEn: "A cryptographically guaranteed settlement in which the delivery of an asset and the payment of funds occur simultaneously within a single indivisible on-chain transaction, eliminating counterparty risk during the settlement window.",
    defZh: "一种由密码学保证的结算：资产交付与资金支付在单笔不可分割的链上交易中同时发生，消除结算窗口内的对手方风险。",
  },
  {
    id: "composability", en: "Composability", zh: "可组合性", chapters: ["01"],
    defEn: "The property by which the output of one on-chain protocol serves directly as the input or collateral of another, so financial operations combine like building blocks—generating novel primitives but also transmitting failure across protocols at block speed.",
    defZh: "一个链上协议的输出可直接作为另一个协议的输入或抵押品，使金融操作像积木一样组合——既催生新原语，也让风险以区块速度在协议间传导。",
  },
  {
    id: "central-counterparty", en: "Central counterparty (CCP)", zh: "中央对手方", chapters: ["29", "05"],
    defEn: "An institution that, through novation, becomes buyer to every seller and seller to every buyer to absorb bilateral counterparty risk; its authority rests on proprietary capital, legal recourse, and regulation rather than on public recomputability.",
    defZh: "通过更替（novation）成为所有卖方的买方、所有买方的卖方，以吸收双边对手方风险的机构；其权威来自自有资本、法律追索与监管，而非公开可重算性。",
  },
  {
    id: "maker-taker", en: "Maker-taker fees", zh: "Maker-Taker 费率", chapters: ["07"],
    defEn: "The exchange fee model that charges liquidity-consuming takers a higher fee and rewards liquidity-providing makers with a lower fee or rebate, structuring the economics of order-type choice.",
    defZh: "交易所的费率模型：向消耗流动性的 taker 收取较高费用、向提供流动性的 maker 给予较低费用或返佣，从而塑造订单类型选择的经济学。",
  },
  {
    id: "liquidity-incentives", en: "Liquidity incentives", zh: "流动性激励", chapters: ["21"],
    defEn: "The protocol- or exchange-level rewards—maker rebates, fee shares, and token programs—used to induce continuous liquidity provision; their central limitation is that they attract market makers in calm markets but cannot retain them through an extreme crisis.",
    defZh: "协议或交易所层面用以诱导持续提供流动性的奖励——maker 返佣、手续费分成、代币计划；其核心局限在于能在平静市场吸引做市商，却无法在极端危机中留住它们。",
  },
  {
    id: "excess-volatility", en: "Excess volatility", zh: "超额波动", chapters: ["22"],
    defEn: "The systematic excess of a perpetual future's realized volatility over the volatility its shared-information spot benchmark would support, driven chiefly by mechanism-induced and liquidity frictions rather than by fundamentals.",
    defZh: "永续合约的已实现波动率系统性地超出其同源信息现货基准所能支持的水平，主要由机制诱发与流动性摩擦、而非基本面所驱动。",
  },
  {
    id: "implied-volatility", en: "Implied volatility", zh: "隐含波动率", chapters: ["24"],
    defEn: "The market's forward-looking consensus expectation of an asset's future price fluctuation, extracted from option prices (the VIX being the canonical index); its structural absence in most crypto perpetual markets forces reliance on realized-volatility signals.",
    defZh: "市场对资产未来价格波动的前瞻性共识预期，由期权价格反推（VIX 为典型指数）；它在多数加密永续市场中的结构性缺失，迫使参与者转而依赖已实现波动信号。",
  },
  {
    id: "market-quality", en: "Market quality", zh: "市场质量", chapters: ["25"],
    defEn: "The degree to which a trading venue satisfies its participants' fundamental demands, measured as departure from the frictionless perfect-market benchmark and decomposed into transaction costs, price discovery, resilience, fairness, and accessibility.",
    defZh: "交易场所满足参与者根本需求的程度，以偏离无摩擦完美市场基准来度量，并分解为交易成本、价格发现、韧性、公平性与可及性五个维度。",
  },
  {
    id: "regulatory-arbitrage", en: "Regulatory arbitrage", zh: "监管套利", chapters: ["26"],
    defEn: "The relocation of exchange domicile, trading activity, or capital to jurisdictions or protocols with the lowest compliance costs, exploiting inconsistencies in cross-jurisdictional rules—the central constraint on the effectiveness of any unilateral crypto-derivatives regulation.",
    defZh: "将交易所注册地、交易活动或资金迁往合规成本最低的司法辖区或协议，利用跨辖区规则的不一致——这是任何单边加密衍生品监管有效性的核心约束。",
  },
  {
    id: "synthetic-exposure", en: "Synthetic exposure", zh: "合成敞口", chapters: ["27", "32", "33"],
    defEn: "Price exposure to an underlying asset replicated without holding it physically—obtained by posting margin against a contract rather than through purchase, custody, and delivery—the concept underlying the claim that funding-rate anchoring is a general-purpose, asset-agnostic pricing mechanism.",
    defZh: "无需实际持有标的资产即复制其价格敞口——通过为合约缴纳保证金、而非买入、托管与交割获得——这一概念支撑了“资金费率锚定是通用、与资产无关的定价机制”之论断。",
  },
  {
    id: "matching-engine", en: "Matching engine", zh: "撮合引擎", chapters: ["28"],
    defEn: "The component of a trading system that pairs buy and sell orders under price-time priority, transforming resting and incoming orders into executed trades—centralized and microsecond-fast in a monolithic exchange, yet constrained by after-the-fact cryptographic verifiability in a layered one.",
    defZh: "交易系统中按价格-时间优先撮合买卖订单、把挂单与来单转化为成交的组件——在单体交易所中中心化且达微秒级，在分层架构中则受事后密码学可验证性约束。",
  },
  {
    id: "app-chain", en: "Application chain (app-chain)", zh: "应用链", chapters: ["28", "09"],
    defEn: "An independent blockchain customized for a single application, whose consensus, state machine, and network parameters are optimized around one use case such as derivatives trading, maintaining its own validator set rather than inheriting a general-purpose chain's security.",
    defZh: "为单一应用定制的独立区块链，其共识、状态机与网络参数围绕衍生品交易等单一用途优化，维护自有验证者集合，而非继承通用链的安全性。",
  },
  {
    id: "default-waterfall", en: "Default waterfall", zh: "违约瀑布", chapters: ["29", "12"],
    defEn: "The ordered sequence of capital layers absorbing a defaulter's uncovered shortfall—from the defaulter's own margin through intermediate buffers to the socialization of residual loss—arranged so non-defaulting parties are reached as late and as little as possible.",
    defZh: "吸收违约方未覆盖亏空的资本层级有序序列——从违约方自身保证金、经中间缓冲层、到残余损失社会化——其排序使非违约方尽可能被最晚、最少地触及。",
  },
  {
    id: "settlement-finality", en: "Settlement finality", zh: "结算最终性", chapters: ["29"],
    defEn: "The constructed, rule-defined point at which a settled state becomes irrevocable—carried in traditional finance by statute and on-chain by consensus finality, which may be probabilistic (near-certainty) or Byzantine-fault-tolerant (deterministic certainty).",
    defZh: "由规则界定、结算状态就此不可撤销的构造性时点——传统金融由成文法承载，链上由共识最终性承载，后者可为概率式（接近确定）或拜占庭容错式（确定性确定）。",
  },
  {
    id: "clearing-and-settlement", en: "Clearing and settlement", zh: "清结算", chapters: ["29", "28"],
    defEn: "The two-stage post-trade process: clearing recomputes each account's netted obligations after novation (who owes what), and settlement irrevocably commits that state through final transfer of value—distinct from liquidation, the forced closing of an undercollateralized position.",
    defZh: "两阶段的交易后处理：清算在更替之后重算各账户的净额义务（谁欠谁），结算则通过最终的价值转移不可撤销地落定该状态——区别于强制平仓（对抵押不足头寸的强制关闭）。",
  },
  {
    id: "embedded-compliance", en: "Embedded compliance", zh: "嵌入式合规", chapters: ["30"],
    defEn: "The paradigm of compiling regulatory and governance rules directly into smart-contract execution logic, converting behavioral constraints (institutions must not violate) into architectural constraints (institutions cannot violate).",
    defZh: "将监管与治理规则直接编译进智能合约执行逻辑的范式，把行为约束（机构不得违反）转化为架构约束（机构无法违反）。",
  },
  {
    id: "cross-margining", en: "Cross-margining", zh: "跨品种保证金", chapters: ["32", "11"],
    defEn: "A clearing arrangement in which a single pooled margin balance backs positions across multiple assets, so offsetting correlations lower aggregate margin requirements but transmit one position's liquidation to all others across the network.",
    defZh: "以单一共享保证金余额支撑跨多资产头寸的清算安排：对冲相关性降低了总体保证金需求，却使某一头寸的强平在全网向所有其他头寸传导。",
  },
  {
    id: "trust-stack", en: "Trust stack", zh: "信任栈", chapters: ["28", "33"],
    defEn: "The decomposition of a financial transaction into five independently configurable layers—asset custody, matching and execution, clearing and settlement, data feeds, and governance—each optimizing its own trust-minimization/performance trade-off.",
    defZh: "将一笔金融交易分解为五个可独立配置的层——资产托管、撮合执行、清结算、数据馈送、治理——每层各自优化其信任最小化与性能的权衡。",
  },
];

/** The glossary terms relevant to a given chapter (for its "Key terms" chip). */
export function keyTermsForChapter(num: string): GlossaryTerm[] {
  return GLOSSARY.filter((t) => t.chapters.includes(num));
}
