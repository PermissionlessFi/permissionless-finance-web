/**
 * Liquidation-cascade teaching model v2 (ch11/12/14/20). Deterministic,
 * BTC-scale defaults, no live data. Simplifications are documented on the
 * lab page (model-honesty requirement).
 *
 * Mechanics: long open interest sits in leverage × entry-price micro-buckets
 * (entries spread over a band around P0, so liquidation prices form a smooth
 * density — the familiar "liquidation heatmap"). A price shock hits both the
 * spot index and the perp; liquidations trigger on a configurable reference:
 *   - "mark"  (real venues, ch14): index-anchored mark price — venue-local
 *     wicks are dampened, only the index-coupled part of the impact feeds back
 *   - "last"  (scam-wick mode): the perp's own last price — the full forced-
 *     selling impact feeds straight back into the trigger
 * Forced sells walk the perp book; the index follows partially (arbitrage
 * transmission, γ). With endogenous depth on (ch20), market makers withdraw
 * as the cascade intensifies — the liquidity spiral. The insurance fund
 * absorbs overshoot loss; when it runs out, remaining liquidations flag ADL.
 */

export interface CascadeParams {
  /** initial exogenous shock, % of price (positive number = down move) */
  shockPct: number;
  /** average market leverage 5–50; shifts OI weight across buckets */
  avgLeverage: number;
  /** order-book depth: $M notional absorbed per 1% of price move */
  depthMPerPct: number;
  /** insurance fund size, $M */
  insuranceM: number;
  /** your position */
  userLeverage: number;
  /** your entry offset vs P0, % (0 = entered at start price) */
  userEntryOffsetPct: number;
  /** liquidation trigger reference (default "mark" — how real venues work) */
  trigger?: "mark" | "last";
  /** systemic = the shock hits spot and perp alike; venue = a perp-only wick
   *  (fat finger / manipulation) while the index holds — ch14's motivating case */
  shockType?: "systemic" | "venue";
  /** ch20: depth withdraws as the cascade intensifies (default off) */
  endogenousDepth?: boolean;
}

export interface CascadeRound {
  round: number;
  /** perp last price at the start / end of the round (P0 = 100) */
  priceBefore: number;
  priceAfter: number;
  /** index-anchored mark price after the round */
  markAfter: number;
  /** effective book depth used this round ($M per 1%) */
  depthUsed: number;
  /** notional liquidated this round, $M */
  liquidatedM: number;
  /** leverages hit this round (unique, for the tooltip) */
  leveragesHit: number[];
  /** insurance fund remaining after this round, $M */
  insuranceLeftM: number;
  adl: boolean;
}

/** One cell of the liquidation-density band ("heatmap"). */
export interface LiqBucket {
  liqPrice: number;
  notionalM: number;
  /** round in which it was consumed; null = survived the day */
  consumedInRound: number | null;
}

export interface CascadeResult {
  rounds: CascadeRound[];
  finalPrice: number;
  finalMark: number;
  totalLiquidatedM: number;
  insuranceLeftM: number;
  adlTriggered: boolean;
  /** liquidation-density band, sorted by liqPrice descending */
  density: LiqBucket[];
  /** user outcome */
  userLiqPrice: number;
  /** round in which the user's long dies; null = survives */
  userDiesInRound: number | null;
}

const P0 = 100;
const MMR = 0.005; // maintenance margin ratio
const TOTAL_OI_M = 800; // teaching scale
const BUCKETS = [5, 10, 20, 33, 50];
/** entry-price band: survivors only — anyone whose liquidation sat above
 *  today's open was already liquidated on the way here, so entries spread
 *  below P0, with more weight on recent (near-P0) entries */
const ENTRY_OFFSETS = [-6, -5, -4, -3, -2, -1, 0];
/** fraction of a forced fill's notional lost to overshoot, charged to the fund */
const OVERSHOOT_LOSS = 0.05;
/** how much of the perp impact the spot index absorbs (arbitrage transmission) */
const INDEX_COUPLING = 0.45;
/** mark = index + MARK_BETA · basis (index-anchored EMA, teaching form) */
const MARK_BETA = 0.2;
/** endogenous depth floor and withdrawal slope (ch20) */
const DEPTH_FLOOR = 0.3;
const DEPTH_WITHDRAWAL = 0.9;

/** Weight OI across leverage buckets so the weighted mean ≈ avgLeverage. */
export function bucketWeights(avgLeverage: number): number[] {
  // softmax-style tilt: weight ∝ exp(−|L − avg| / T). Deterministic, smooth.
  const T = 6;
  const raw = BUCKETS.map((L) => Math.exp(-Math.abs(L - avgLeverage) / T));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((r) => r / sum);
}

function entryWeights(): number[] {
  const raw = ENTRY_OFFSETS.map((o) => 7 + o); // 1..7, recent entries heavier
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((r) => r / sum);
}

export function liqPrice(entry: number, leverage: number): number {
  return entry * (1 - 1 / leverage + MMR);
}

export function runCascade(p: CascadeParams): CascadeResult {
  const trigger = p.trigger ?? "mark";
  const lWeights = bucketWeights(p.avgLeverage);
  const eWeights = entryWeights();

  // leverage × entry micro-buckets → a liquidation-price density
  const cells = BUCKETS.flatMap((L, li) =>
    ENTRY_OFFSETS.map((off, ei) => ({
      L,
      notionalM: TOTAL_OI_M * lWeights[li] * eWeights[ei],
      liqPrice: liqPrice(P0 * (1 + off / 100), L),
      consumedInRound: null as number | null,
    }))
  );

  const userEntry = P0 * (1 + p.userEntryOffsetPct / 100);
  const userLiq = liqPrice(userEntry, p.userLeverage);
  let userDiesInRound: number | null = null;

  // systemic: the shock hits spot and perp alike; venue wick: perp only
  const systemic = (p.shockType ?? "systemic") === "systemic";
  let last = P0 * (1 - p.shockPct / 100);
  let index = systemic ? P0 * (1 - p.shockPct / 100) : P0;
  const markOf = () => index + MARK_BETA * (last - index);
  const refOf = () => (trigger === "mark" ? markOf() : last);

  let insurance = p.insuranceM;
  let adlTriggered = false;
  let totalLiq = 0;

  const rounds: CascadeRound[] = [
    {
      round: 0,
      priceBefore: P0,
      priceAfter: last,
      markAfter: markOf(),
      depthUsed: p.depthMPerPct,
      liquidatedM: 0,
      leveragesHit: [],
      insuranceLeftM: insurance,
      adl: false,
    },
  ];
  if (userLiq >= refOf()) userDiesInRound = 0;

  for (let r = 1; r <= 40; r++) {
    const ref = refOf();
    const hit = cells.filter((c) => c.consumedInRound === null && c.liqPrice >= ref);
    if (hit.length === 0) break;

    const liquidatedM = hit.reduce((a, c) => a + c.notionalM, 0);
    hit.forEach((c) => (c.consumedInRound = r));

    // ch20: makers withdraw as cumulative forced flow grows
    const depthUsed = p.endogenousDepth
      ? p.depthMPerPct * Math.max(DEPTH_FLOOR, 1 - DEPTH_WITHDRAWAL * (totalLiq / TOTAL_OI_M))
      : p.depthMPerPct;

    // forced sells walk the perp book; impact capped — beyond this, halts /
    // one-sided books stop a clean walk of the ladder
    const impactPct = Math.min(25, liquidatedM / depthUsed);
    const priceBefore = last;
    last = last * (1 - impactPct / 100);
    // arbitrage transmits part of the move to the spot index
    index = index * (1 - (INDEX_COUPLING * impactPct) / 100);

    // fund absorbs overshoot loss; ADL once depleted
    const loss = liquidatedM * OVERSHOOT_LOSS;
    let adl = false;
    if (insurance >= loss) {
      insurance -= loss;
    } else {
      insurance = 0;
      adl = true;
      adlTriggered = true;
    }

    totalLiq += liquidatedM;
    rounds.push({
      round: r,
      priceBefore,
      priceAfter: last,
      markAfter: markOf(),
      depthUsed,
      liquidatedM,
      leveragesHit: [...new Set(hit.map((c) => c.L))].sort((a, b) => a - b),
      insuranceLeftM: insurance,
      adl,
    });
    if (userLiq >= refOf() && userDiesInRound === null) userDiesInRound = r;
  }

  return {
    rounds,
    finalPrice: last,
    finalMark: markOf(),
    totalLiquidatedM: totalLiq,
    insuranceLeftM: insurance,
    adlTriggered,
    density: [...cells]
      .sort((a, b) => b.liqPrice - a.liqPrice)
      .map(({ liqPrice, notionalM, consumedInRound }) => ({ liqPrice, notionalM, consumedInRound })),
    userLiqPrice: userLiq,
    userDiesInRound,
  };
}

export interface CascadeScenario {
  id: string;
  zh: string;
  en: string;
  noteZh: string;
  noteEn: string;
  params: Omit<CascadeParams, "userLeverage" | "userEntryOffsetPct">;
}

export const CASCADE_SCENARIOS: CascadeScenario[] = [
  {
    id: "may19",
    zh: "2021-05-19 式大级联",
    en: "A 2021-05-19-style cascade",
    noteZh: "高杠杆拥挤 + 深度撤离:一次中等冲击引爆连环强平。",
    noteEn: "Crowded leverage plus fleeing depth: a moderate shock detonates chained liquidations.",
    params: { shockPct: 8, avgLeverage: 28, depthMPerPct: 60, insuranceM: 40 },
  },
  {
    id: "ftx",
    zh: "FTX 崩盘周式",
    en: "An FTX-week regime",
    noteZh: "信心崩塌下深度极薄,保险基金杯水车薪,ADL 早早到来。",
    noteEn: "Depth evaporates as confidence breaks; the fund is a rounding error and ADL arrives early.",
    params: { shockPct: 12, avgLeverage: 22, depthMPerPct: 25, insuranceM: 15, endogenousDepth: true },
  },
  {
    id: "altcoin",
    zh: "低流动性山寨币",
    en: "A thin altcoin market",
    noteZh: "同样的冲击,在浅盘里走得远得多——深度才是缓冲垫。",
    noteEn: "The same shock travels much further in a thin book — depth is the cushion.",
    params: { shockPct: 6, avgLeverage: 20, depthMPerPct: 12, insuranceM: 8 },
  },
  {
    id: "fortress",
    zh: "高防御市场",
    en: "A fortified market",
    noteZh: "低杠杆 + 厚深度 + 充足保险基金:同样的冲击几乎无级联。",
    noteEn: "Low leverage, thick depth, a well-funded backstop: the same shock barely cascades.",
    params: { shockPct: 8, avgLeverage: 12, depthMPerPct: 150, insuranceM: 120 },
  },
];

export const CASCADE_DEFAULTS: CascadeParams = {
  shockPct: 8,
  avgLeverage: 20,
  depthMPerPct: 60,
  insuranceM: 40,
  userLeverage: 10,
  userEntryOffsetPct: 0,
  trigger: "mark",
  endogenousDepth: false,
};
