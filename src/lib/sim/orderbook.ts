/**
 * Order-book / slippage teaching model (ch07/08). A static book is generated
 * from a depth template; a market order walks it level by level. Average
 * fill vs mid = slippage. Deterministic (no randomness — level sizes follow
 * a smooth profile so the same template always yields the same book).
 */

export interface BookLevel {
  /** price offset from mid, % (positive = above mid on the ask side) */
  offsetPct: number;
  /** notional available at this level, $K */
  sizeK: number;
}

export interface BookTemplate {
  id: string;
  zh: string;
  en: string;
  noteZh: string;
  noteEn: string;
  /** spread, % of mid */
  spreadPct: number;
  /** notional at the touch, $K */
  touchK: number;
  /** how fast size grows deeper in the book (per level multiplier) */
  growth: number;
  /** price step between levels, % */
  stepPct: number;
}

export const BOOK_TEMPLATES: BookTemplate[] = [
  {
    id: "deep",
    zh: "深盘(BTC 主流市场)",
    en: "Deep book (BTC-style major)",
    noteZh: "点差窄、每档厚——大单也只是轻微滑动。",
    noteEn: "Tight spread, thick levels — even size slides only slightly.",
    spreadPct: 0.01,
    touchK: 800,
    growth: 1.18,
    stepPct: 0.02,
  },
  {
    id: "thin",
    zh: "浅盘(长尾山寨币)",
    en: "Thin book (long-tail altcoin)",
    noteZh: "点差宽、档位薄——同一笔单要走深得多。",
    noteEn: "Wide spread, shallow levels — the same order walks much deeper.",
    spreadPct: 0.15,
    touchK: 60,
    growth: 1.08,
    stepPct: 0.12,
  },
  {
    id: "fled",
    zh: "深度撤离瞬间(闪崩前夜)",
    en: "Depth just fled (pre-flash-crash)",
    noteZh: "做市商撤单后的簿:表面有价,实际无量。",
    noteEn: "The book after market makers pull: prices on screen, no size behind them.",
    spreadPct: 0.08,
    touchK: 25,
    growth: 1.03,
    stepPct: 0.10,
  },
];

const N_LEVELS = 24;

export function buildAskSide(t: BookTemplate): BookLevel[] {
  const levels: BookLevel[] = [];
  for (let i = 0; i < N_LEVELS; i++) {
    levels.push({
      offsetPct: t.spreadPct / 2 + i * t.stepPct,
      sizeK: t.touchK * Math.pow(t.growth, i),
    });
  }
  return levels;
}

export interface WalkResult {
  /** filled per level, $K (same order as the ask side) */
  fills: number[];
  /** volume-weighted average fill offset vs mid, % */
  avgOffsetPct: number;
  /** slippage vs mid, basis points */
  slippageBps: number;
  /** worst (deepest) level touched, index into the ask side; −1 if nothing filled */
  deepestLevel: number;
  /** true if the order exhausted the visible book */
  exhausted: boolean;
  filledK: number;
}

/** Walk a buy market order of `sizeK` up the ask side. */
export function walkBook(t: BookTemplate, sizeK: number): WalkResult {
  const asks = buildAskSide(t);
  const fills = new Array(asks.length).fill(0);
  let remaining = sizeK;
  let cost = 0; // Σ offset·qty
  let deepest = -1;

  for (let i = 0; i < asks.length && remaining > 0; i++) {
    const take = Math.min(remaining, asks[i].sizeK);
    fills[i] = take;
    cost += asks[i].offsetPct * take;
    remaining -= take;
    if (take > 0) deepest = i;
  }

  const filled = sizeK - remaining;
  const avgOffset = filled > 0 ? cost / filled : 0;
  return {
    fills,
    avgOffsetPct: avgOffset,
    slippageBps: avgOffset * 100,
    deepestLevel: deepest,
    exhausted: remaining > 0,
    filledK: filled,
  };
}

export const ORDERBOOK_DEFAULTS = { templateId: "deep", sizeK: 2000 };
