/**
 * Maker-seat teaching model (ch08, Glosten-Milgrom in spirit). You rest a bid
 * some bps below the mid and leave it alone; a deterministic script of market
 * orders arrives — a mix of informed flow (price keeps moving in the order's
 * direction afterwards) and uninformed noise. Your fill happens exactly when
 * an aggressive sell is large enough to eat through the book above your
 * price. The decomposition afterwards IS the lesson:
 *
 *   net edge = spread earned at fill  +  post-fill drift (adverse selection)
 *
 * Quote too tight and you are systematically filled by informed sellers right
 * before the mid falls further; quote too wide and you never trade. The
 * PnL(offset) frontier has an interior optimum — that optimum is what a
 * competitive spread compensates.
 */

import { BOOK_TEMPLATES, BookTemplate, buildAskSide } from "./orderbook";

/* deterministic PRNG (mulberry32) — fixed seeds, same script every run */
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

export interface FlowEvent {
  /** aggressive order side */
  side: "buy" | "sell";
  sizeK: number;
  informed: boolean;
  /** mid move applied after the event, bp (signed) */
  driftBp: number;
}

const N_EVENTS = 30;
/** informed arrivals sit at fixed slots with alternating sides, so the
 *  script carries no market beta — what remains is pure selection: your bid
 *  only ever trades against the sell half of that flow */
const INFORMED_SLOTS = [3, 7, 12, 17, 22, 27];
const SEEDS: Record<string, number> = { deep: 1101, thin: 2202, fled: 3303 };
/** adverse selection is measured over this many events after your fill */
export const ADVERSE_WINDOW = 6;

/** A fixed, deterministic order-flow script per template (and variant). */
export function flowScript(t: BookTemplate, variant = 0): FlowEvent[] {
  const r = rng((SEEDS[t.id] ?? 4404) + variant * 97);
  const events: FlowEvent[] = [];
  for (let i = 0; i < N_EVENTS; i++) {
    const slot = INFORMED_SLOTS.indexOf(i);
    const informed = slot >= 0;
    // informed sides alternate (balanced flow); uninformed sides are noise
    const side: "buy" | "sell" = informed ? (slot % 2 === 0 ? "sell" : "buy") : r() < 0.5 ? "buy" : "sell";
    // informed traders trade size; noise traders don't
    const sizeK = informed
      ? t.touchK * (1.2 + 2.8 * r())
      : t.touchK * (0.2 + 1.3 * Math.pow(r(), 2));
    const driftBp = informed
      ? (side === "sell" ? -1 : 1) * (14 + 20 * r())
      : (r() - 0.5) * 6;
    events.push({ side, sizeK, informed, driftBp });
  }
  return events;
}

/** Book notional resting between the mid and a price `gapBp` below it.
 *  Mirrors the ask-side ladder onto the bid side (symmetric book). */
function shieldK(t: BookTemplate, gapBp: number): number {
  if (gapBp <= 0) return 0;
  return buildAskSide(t)
    .filter((l) => l.offsetPct * 100 <= gapBp)
    .reduce((a, l) => a + l.sizeK, 0);
}

export interface MakerResult {
  filled: boolean;
  /** index of the filling event (into the script) */
  fillEvent: number | null;
  filledByInformed: boolean;
  /** mid (bp vs start) immediately before the filling order hit */
  midAtFill: number;
  /** decomposition, all in bp on your fill price */
  earnedBp: number;
  adverseBp: number;
  netBp: number;
  /** mid path, bp vs start, one point per event (after its drift) */
  midPath: number[];
}

export function runMaker(t: BookTemplate, offsetBp: number, variant = 0): MakerResult {
  const script = flowScript(t, variant);
  const quote = -offsetBp; // your resting bid, bp below the starting mid
  let mid = 0;
  let filled = false;
  let fillEvent: number | null = null;
  let filledByInformed = false;
  let midAtFill = 0;
  const midPath: number[] = [];

  for (let i = 0; i < script.length; i++) {
    const e = script[i];
    if (!filled && e.side === "sell") {
      const gap = mid - quote; // bp between current mid and your bid
      if (gap <= 0 || e.sizeK > shieldK(t, gap)) {
        filled = true;
        fillEvent = i;
        filledByInformed = e.informed;
        midAtFill = mid;
      }
    }
    mid += e.driftBp;
    midPath.push(mid);
  }

  // adverse selection = the short-horizon drift right after your fill —
  // windowed so long-horizon market beta doesn't pollute the signal
  const windowEnd =
    fillEvent === null ? 0 : midPath[Math.min(midPath.length - 1, fillEvent + ADVERSE_WINDOW)];
  const earnedBp = filled ? midAtFill - quote : 0;
  const adverseBp = filled ? windowEnd - midAtFill : 0;
  return {
    filled,
    fillEvent,
    filledByInformed,
    midAtFill,
    earnedBp,
    adverseBp,
    netBp: filled ? earnedBp + adverseBp : 0,
    midPath,
  };
}

/** The PnL(offset) frontier — averaged over five deterministic scripts so
 *  the interior optimum reads through the single-path noise. */
export function makerFrontier(t: BookTemplate): { offsetBp: number; netBp: number }[] {
  const out: { offsetBp: number; netBp: number }[] = [];
  for (let o = 2; o <= 60; o += 2) {
    let sum = 0;
    for (let v = 0; v < 5; v++) sum += runMaker(t, o, v).netBp;
    out.push({ offsetBp: o, netBp: sum / 5 });
  }
  return out;
}

export { BOOK_TEMPLATES };
export const MAKER_DEFAULT_OFFSET = 14;
