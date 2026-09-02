/**
 * Funding-rate teaching model v2 (ch10/16). Deterministic toy: the funding
 * rate carries a premium component proportional to long/short skew plus the
 * basis, clamped like real venues. The reflexive loop is endogenous: once
 * the basis (or the rate itself) makes carry attractive, arbitrageurs short
 * the perp — which is exactly a fall in the long share — so skew, basis and
 * the rate are pressed back together. The rate is the price that recruits
 * the arbitrageurs who kill it. 8-hour settlement periods.
 */

export interface FundingParams {
  /** long share of open interest, 0.5–0.9 (0.5 = balanced) */
  longShare: number;
  /** initial perp-vs-spot basis, % (positive = perp rich) */
  basisPct: number;
  /** your position, $ notional (teaching scale) */
  userNotional: number;
  /** your side */
  userSide: "long" | "short";
  /** holding period, days */
  holdDays: number;
}

export interface FundingPeriod {
  period: number; // 0-based 8h period
  day: number;
  basisPct: number;
  /** long share of open interest at this period (endogenous, ch16) */
  longShare: number;
  /** funding rate for this 8h period, % */
  ratePct: number;
  /** cumulative funding paid (+) or received (−) by the user, $ */
  userCumulative: number;
  /** arbitrageurs active this period (basis above their entry threshold) */
  arbActive: boolean;
}

export interface FundingResult {
  periods: FundingPeriod[];
  totalUser: number;
  /** annualized cost/yield at the average rate, % */
  annualizedPct: number;
  avgRatePct: number;
}

const INTEREST_8H = 0.01 / 3; // the conventional 0.01%/8h interest component
const RATE_CLAMP = 0.3; // ±0.3% per 8h, exchange-style clamp
const ARB_THRESHOLD = 0.35; // basis % beyond which arbitrage flow leans in
/** basis decay per period: faster when arbitrage is active */
const DECAY_CALM = 0.97;
const DECAY_ARB = 0.90;
/** skew (long-share) reversion toward balance: arbitrage shorting IS the skew falling */
const SKEW_DECAY_CALM = 0.998;
const SKEW_DECAY_ARB = 0.955;

export function runFunding(p: FundingParams): FundingResult {
  const nPeriods = Math.round(p.holdDays * 3);
  const periods: FundingPeriod[] = [];
  let longShare = p.longShare; // endogenous from here on
  let basis = p.basisPct;
  let cum = 0;
  let rateSum = 0;

  for (let i = 0; i < nPeriods; i++) {
    // premium tracks skew and basis; clamp like venues do
    const skew = (longShare - 0.5) * 2;
    const premium = 0.05 * skew * 10 + 0.25 * basis;
    const rate = Math.max(-RATE_CLAMP, Math.min(RATE_CLAMP, INTEREST_8H + premium / 10));

    // carry becomes attractive → arbitrageurs short the perp, which IS a
    // falling long share; both basis and skew are pressed back (ch16)
    const arbActive = Math.abs(basis) > ARB_THRESHOLD || Math.abs(rate) > 0.06;
    basis = basis * (arbActive ? DECAY_ARB : DECAY_CALM);
    longShare = 0.5 + (longShare - 0.5) * (arbActive ? SKEW_DECAY_ARB : SKEW_DECAY_CALM);

    // longs pay when rate > 0
    const userPays = p.userSide === "long" ? rate : -rate;
    cum += (p.userNotional * userPays) / 100;
    rateSum += rate;

    periods.push({
      period: i,
      day: Math.floor(i / 3),
      basisPct: basis,
      longShare,
      ratePct: rate,
      userCumulative: cum,
      arbActive,
    });
  }

  const avg = nPeriods ? rateSum / nPeriods : 0;
  return {
    periods,
    totalUser: cum,
    avgRatePct: avg,
    annualizedPct: avg * 3 * 365,
  };
}

export const FUNDING_DEFAULTS: FundingParams = {
  longShare: 0.72,
  basisPct: 0.8,
  userNotional: 10_000,
  userSide: "long",
  holdDays: 7,
};

export interface FundingScenario {
  id: string;
  zh: string;
  en: string;
  noteZh: string;
  noteEn: string;
  params: Pick<FundingParams, "longShare" | "basisPct" | "holdDays">;
}

export const FUNDING_SCENARIOS: FundingScenario[] = [
  {
    id: "euphoria",
    zh: "牛市顶部",
    en: "Euphoric top",
    noteZh: "人人做多、基差高企:拿着多单不动,一周就是一笔可观的账单。",
    noteEn: "Everyone is long and the basis is rich: just holding a long for a week runs up a real bill.",
    params: { longShare: 0.86, basisPct: 2.2, holdDays: 7 },
  },
  {
    id: "bear",
    zh: "熊市负费率",
    en: "Bear-market negative funding",
    noteZh: "基差转负、空头拥挤:此时做多反而按周期收钱——费率是逆向者的补贴。",
    noteEn: "Basis flips negative and shorts crowd in: longs get paid each period — funding subsidizes the contrarian.",
    params: { longShare: 0.5, basisPct: -1.6, holdDays: 7 },
  },
  {
    id: "calm",
    zh: "平静市场",
    en: "Calm regime",
    noteZh: "轻微偏斜、基差贴合:费率退化为利率项,持仓成本几乎可以忽略。",
    noteEn: "Mild skew, basis pinned: the rate degenerates to the interest component and carry is nearly free.",
    params: { longShare: 0.52, basisPct: 0.1, holdDays: 7 },
  },
];
