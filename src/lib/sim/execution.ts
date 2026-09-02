/**
 * Execution Duel — asynchronous PvP on execution quality (ch07/08 as play).
 * A fixed thin-book problem: fill $3M in 1–4 equal slices; between slices
 * you wait for the book to replenish, but waiting lets the market drift
 * away. Fully deterministic → a plan encodes to a URL and any opponent
 * replays the identical problem, so the duel is fair by construction.
 */

import { BOOK_TEMPLATES, buildAskSide, BookLevel } from "./orderbook";

export const DUEL_TOTAL_K = 3000;
export const DUEL_TEMPLATE = BOOK_TEMPLATES.find((t) => t.id === "thin")!;

export type WaitKind = "s" | "l";

/** wait tuning: replenish share of consumed size vs drift cost (bp) */
const WAITS: Record<WaitKind, { replenish: number; driftBp: number }> = {
  s: { replenish: 0.5, driftBp: 8 },
  l: { replenish: 0.9, driftBp: 30 },
};

export interface DuelPlan {
  slices: 1 | 2 | 3 | 4;
  /** gap decisions, length = slices − 1 */
  waits: WaitKind[];
}

export interface SliceOutcome {
  filledK: number;
  avgOffsetPct: number;
  driftBpAtFill: number;
  deepestLevel: number;
}

export interface DuelResult {
  sliceOutcomes: SliceOutcome[];
  /** volume-weighted slippage vs the original mid, in bp (drift included) */
  totalBps: number;
  exhausted: boolean;
}

export function runPlan(plan: DuelPlan): DuelResult {
  const levels: (BookLevel & { left: number })[] = buildAskSide(DUEL_TEMPLATE).map((l) => ({
    ...l,
    left: l.sizeK,
  }));
  const per = DUEL_TOTAL_K / plan.slices;
  const sliceOutcomes: SliceOutcome[] = [];
  let driftBp = 0;
  let cost = 0;
  let filledTotal = 0;
  let exhausted = false;

  for (let sIdx = 0; sIdx < plan.slices; sIdx++) {
    if (sIdx > 0) {
      const w = WAITS[plan.waits[sIdx - 1] ?? "s"];
      driftBp += w.driftBp;
      for (const l of levels) l.left = Math.min(l.sizeK, l.left + (l.sizeK - l.left) * w.replenish);
    }
    let remaining = per;
    let sliceCost = 0;
    let deepest = -1;
    for (let i = 0; i < levels.length && remaining > 0; i++) {
      const take = Math.min(remaining, levels[i].left);
      if (take <= 0) continue;
      levels[i].left -= take;
      const effOffset = levels[i].offsetPct + driftBp / 100; // drift shifts the whole ladder
      sliceCost += effOffset * take;
      remaining -= take;
      deepest = i;
    }
    const filled = per - remaining;
    if (remaining > 0) exhausted = true;
    filledTotal += filled;
    cost += sliceCost;
    sliceOutcomes.push({
      filledK: filled,
      avgOffsetPct: filled > 0 ? sliceCost / filled : 0,
      driftBpAtFill: driftBp,
      deepestLevel: deepest,
    });
  }

  return {
    sliceOutcomes,
    totalBps: filledTotal > 0 ? (cost / filledTotal) * 100 : 0,
    exhausted,
  };
}

/** plan ⇄ URL codec: "3-sl" = 3 slices, gaps short+long */
export function encodePlan(p: DuelPlan): string {
  return `${p.slices}${p.waits.length ? "-" + p.waits.join("") : ""}`;
}
export function decodePlan(s: string | null): DuelPlan | null {
  if (!s) return null;
  const m = s.match(/^([1-4])(?:-([sl]{0,3}))?$/);
  if (!m) return null;
  const slices = Number(m[1]) as DuelPlan["slices"];
  const waits = (m[2] ?? "").split("").filter((c): c is WaitKind => c === "s" || c === "l");
  if (waits.length !== slices - 1) return null;
  return { slices, waits };
}

export function allPlans(): DuelPlan[] {
  const out: DuelPlan[] = [];
  for (const slices of [1, 2, 3, 4] as const) {
    const gaps = slices - 1;
    for (let mask = 0; mask < Math.pow(2, gaps); mask++) {
      const waits: WaitKind[] = [];
      for (let g = 0; g < gaps; g++) waits.push(mask & (1 << g) ? "l" : "s");
      out.push({ slices, waits });
    }
  }
  return out;
}
