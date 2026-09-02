/**
 * Labs registry — single source of truth for the hub page, nav, sitemap and
 * JSON-LD. Each lab is a deterministic, client-only simulator of one of the
 * book's mechanisms; `chapters` powers the book-loop links.
 */

export interface Lab {
  slug: string;
  zh: string;
  en: string;
  /** the one-line story the simulator tells */
  storyZh: string;
  storyEn: string;
  /** "in 60 seconds you will learn…" */
  learnZh: string;
  learnEn: string;
  chapters: string[];
  color: string;
  /** flagship labs carry scenarios + summary card */
  flagship?: boolean;
  /** games render in the arcade skin and lead the hub */
  kind?: "game";
  /** withheld from the hub, routing, sitemap and OG — code stays, page 404s.
   *  Flip to false (or delete) to publish; nothing else needs editing. */
  draft?: boolean;
}

export const LABS: Lab[] = [
  {
    slug: "survivor",
    zh: "清算幸存者",
    en: "Cascade Survivor",
    storyZh: "今天你被强平了吗?每日一局,全球同题",
    storyEn: "Did you get liquidated today? One market a day, same for everyone",
    learnZh: "每天一个隐藏行情:读线索、下一个决策(方向×杠杆×仓位),活过级联。拥挤的一侧更容易被强平——第 11 章的反身性,变成你的求生技巧。",
    learnEn: "One hidden market a day: read the clues, make one decision (side × leverage × size), survive the cascade. The crowded side is the one that gets liquidated — Chapter 11's reflexivity, as a survival skill.",
    chapters: ["11", "12"],
    color: "#ef4444",
    kind: "game",
    flagship: true,
    draft: true,
  },
  {
    slug: "execution-duel",
    zh: "执行对决",
    en: "Execution Duel",
    storyZh: "同一张浅盘,比谁的滑点低——发战书给朋友",
    storyEn: "Same thin book, lowest slippage wins — send the gauntlet",
    learnZh: "$3M 拆几刀?刀间等不等盘口回补?等太久市场就跑了。打出你的 bp,把战书链接发给对手——同题复现,输赢无可抵赖。",
    learnEn: "How do you slice $3M? Wait for the book to refill, and the market drifts away. Post your bps, send the challenge link — identical problem, undeniable verdict.",
    chapters: ["07", "08"],
    color: "#38bdf8",
    kind: "game",
    draft: true,
  },
  {
    slug: "liquidation-cascade",
    zh: "清算级联模拟器",
    en: "Liquidation Cascade",
    storyZh: "一次下跌如何自我强化",
    storyEn: "How one drop feeds on itself",
    learnZh: "60 秒看懂:为什么你的强平单会把价格砸得更低、害死下一批仓位——以及保险基金耗尽后 ADL 如何找上盈利的你。",
    learnEn: "In 60 seconds: why your liquidation order pushes price lower and kills the next tier — and how ADL comes for the profitable once the insurance fund runs dry.",
    chapters: ["11", "12"],
    color: "#a34a33",
    flagship: true,
  },
  {
    slug: "funding-rate",
    zh: "资金费率博弈",
    en: "The Funding Rate Game",
    storyZh: "多空失衡的价格,由谁买单",
    storyEn: "Who pays for the imbalance",
    learnZh: "60 秒看懂:资金费率如何把永续价格拴回现货——以及「拿着多单不动」在牛市顶部一周要花掉你多少钱。",
    learnEn: "In 60 seconds: how funding tethers the perpetual to spot — and what simply holding a long through a euphoric week actually costs you.",
    chapters: ["10"],
    color: "#b0703b",
  },
  {
    slug: "order-book",
    zh: "订单簿与滑点",
    en: "Order Book & Slippage",
    storyZh: "你的市价单到底成交在哪",
    storyEn: "Where your market order really fills",
    learnZh: "60 秒看懂:市价单如何逐档吃掉深度——同样一笔单,在深盘和浅盘里的成本差多少。",
    learnEn: "In 60 seconds: how a market order walks the book — and what the same size costs you in a deep book versus a thin one.",
    chapters: ["07", "08"],
    color: "#3f6cb3",
  },
];

/** The only list the site should render, route, or advertise. `LABS` keeps
 *  every entry so draft simulators still resolve their own metadata. */
export const PUBLISHED_LABS: Lab[] = LABS.filter((l) => !l.draft);

/** Roadmap teasers shown on the hub — labs the community can co-own later. */
export const LABS_ROADMAP: { zh: string; en: string; chapters: string[] }[] = [
  { zh: "做市商库存博弈", en: "Market-Maker Inventory", chapters: ["19"] },
  { zh: "波动率聚集", en: "Volatility Clustering", chapters: ["23"] },
];
