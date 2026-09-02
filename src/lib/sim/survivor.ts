/**
 * Cascade Survivor — the daily game (ch11/12 as play). One hidden market day
 * per UTC date, identical for every player worldwide; you make one decision
 * (side × leverage × size) and the day plays out. The clue system IS the
 * lesson: the crowded side is the one more likely to be liquidated
 * (reflexivity). A deterministic simulated-trader population provides a
 * zero-backend percentile.
 */

import { runCascade, CascadeRound } from "./cascade";

/* deterministic PRNG (mulberry32) */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EPOCH_UTC = Date.UTC(2026, 6, 6); // #1 = 2026-07-06

export function dayNumberOf(now: Date): number {
  return Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - EPOCH_UTC) / 86400000) + 1;
}

export function msToNextUtcDay(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
}

export interface DayMarket {
  dayNum: number;
  /** −1 = the market moves down (longs cascade), +1 = up (shorts cascade) */
  direction: -1 | 1;
  shockPct: number;
  avgLeverage: number;
  depthMPerPct: number;
  insuranceM: number;
  /** long share of open interest — the crowding clue */
  longShare: number;
}

export interface DayClues {
  /** 0..2 index into the descriptor scales below (shown to the player) */
  crowding: number; // which side + how crowded
  crowdedSide: "long" | "short";
  leverageRegime: number;
  depthRegime: number;
  fundRegime: number;
}

export function generateDay(dayNum: number): DayMarket {
  const r = rng(dayNum * 2654435761);
  const longShare = 0.3 + r() * 0.55; // 0.30–0.85
  const crowdLong = longShare >= 0.5;
  const crowdIntensity = Math.abs(longShare - 0.5) / 0.35; // 0..1
  // Reflexivity: the crowded side is more likely to be the one that cascades.
  const pCrowdedSideDies = 0.5 + 0.32 * crowdIntensity;
  const crowdedDies = r() < pCrowdedSideDies;
  const direction: -1 | 1 = crowdLong === crowdedDies ? -1 : 1;
  return {
    dayNum,
    direction,
    shockPct: Math.round(4 + r() * 12),
    avgLeverage: Math.round(10 + r() * 30),
    depthMPerPct: Math.round(15 + r() * 105),
    insuranceM: Math.round(10 + r() * 90),
    longShare,
  };
}

export function cluesOf(m: DayMarket): DayClues {
  const intensity = Math.abs(m.longShare - 0.5) / 0.35;
  return {
    crowding: intensity < 0.33 ? 0 : intensity < 0.66 ? 1 : 2,
    crowdedSide: m.longShare >= 0.5 ? "long" : "short",
    leverageRegime: m.avgLeverage < 20 ? 0 : m.avgLeverage < 32 ? 1 : 2,
    depthRegime: m.depthMPerPct < 50 ? 0 : m.depthMPerPct < 90 ? 1 : 2,
    fundRegime: m.insuranceM < 40 ? 0 : m.insuranceM < 75 ? 1 : 2,
  };
}

export interface PlayerChoice {
  /** 1 = long, −1 = short */
  side: -1 | 1;
  leverage: number;
  /** % of bankroll posted as margin, 10–100 */
  sizePct: number;
}

export interface DayPath {
  rounds: CascadeRound[];
  /** engine-space final price (down-cascade space, P0 = 100) */
  finalEnginePrice: number;
  /** display-space final price (mirrored on up days) */
  finalPrice: number;
}

/** The day's cascade path — independent of any player (engine's user params
 *  are dummies; the market path they return is what we keep). */
export function simulateDay(m: DayMarket): DayPath {
  const res = runCascade({
    shockPct: m.shockPct,
    avgLeverage: m.avgLeverage,
    depthMPerPct: m.depthMPerPct,
    insuranceM: m.insuranceM,
    userLeverage: 2,
    userEntryOffsetPct: 0,
  });
  const finalEnginePrice = res.finalPrice;
  return {
    rounds: res.rounds,
    finalEnginePrice,
    finalPrice: m.direction === -1 ? finalEnginePrice : 200 - finalEnginePrice,
  };
}

export interface PlayerOutcome {
  died: boolean;
  /** round of death (0 = the initial shock), null if survived */
  diedInRound: number | null;
  /** bankroll change in points (bankroll starts at 100) */
  pnl: number;
  /** display-space liquidation price */
  liqPrice: number;
}

const MMR = 0.005;

/** Score one player against the day's path. Wrong-siders die when the
 *  engine-space price reaches their (mirrored) liquidation level. */
export function scorePlayer(m: DayMarket, path: DayPath, c: PlayerChoice): PlayerOutcome {
  const margin = c.sizePct; // bankroll = 100
  const notional = margin * c.leverage;
  const onLosingSide = c.side !== m.direction;

  // In engine space the price falls from 100; a losing-side player's
  // liquidation sits at 100·(1 − 1/L + mmr) in that space.
  const engineLiq = 100 * (1 - 1 / c.leverage + MMR);
  let diedInRound: number | null = null;
  if (onLosingSide) {
    for (const r of path.rounds) {
      if (engineLiq >= r.priceAfter) {
        diedInRound = r.round;
        break;
      }
    }
  }

  const displayLiq = m.direction === -1
    ? (c.side === 1 ? engineLiq : 200 - engineLiq)
    : (c.side === -1 ? 200 - engineLiq : engineLiq);

  if (diedInRound !== null) {
    return { died: true, diedInRound, pnl: -margin, liqPrice: displayLiq };
  }
  // survivors mark to the final price
  const move = (path.finalPrice - 100) / 100; // signed, display space
  const pnl = notional * move * c.side;
  return { died: false, diedInRound: null, pnl, liqPrice: displayLiq };
}

/** Deterministic simulated-trader population for the zero-backend
 *  percentile. Sides follow the day's crowding (that's what makes beating
 *  them meaningful); leverage is bottom-heavy with a reckless tail. */
export function simulatePopulation(m: DayMarket, path: DayPath, n = 400): number[] {
  const r = rng(m.dayNum * 940573 + 17);
  const scores: number[] = [];
  for (let i = 0; i < n; i++) {
    const side: -1 | 1 = r() < m.longShare ? 1 : -1;
    const leverage = Math.max(2, Math.round(2 + Math.pow(r(), 2.2) * 48));
    const sizePct = Math.round(20 + r() * 80);
    scores.push(scorePlayer(m, path, { side, leverage, sizePct }).pnl);
  }
  return scores.sort((a, b) => a - b);
}

export function percentileBeaten(sorted: number[], pnl: number): number {
  let lo = 0;
  while (lo < sorted.length && sorted[lo] < pnl) lo++;
  return Math.round((lo / sorted.length) * 100);
}

/** Wordle-style share grid: one cell per cascade round after the shock. */
export function emojiGrid(path: DayPath, out: PlayerOutcome): string {
  const cells = path.rounds.map((r) =>
    out.diedInRound !== null && r.round >= out.diedInRound ? "🟥" : "🟩"
  );
  return cells.slice(0, 7).join("");
}
