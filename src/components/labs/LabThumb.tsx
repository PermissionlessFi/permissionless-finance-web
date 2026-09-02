"use client";

import { useMemo } from "react";
import { runCascade, CASCADE_DEFAULTS } from "@/lib/sim/cascade";
import { runFunding, FUNDING_DEFAULTS } from "@/lib/sim/funding";
import { BOOK_TEMPLATES, buildAskSide, walkBook } from "@/lib/sim/orderbook";

/**
 * Hub thumbnails — each is a miniature of the simulator's real output,
 * rendered from the same deterministic engine with its default parameters.
 * No image assets, theme-aware, and guaranteed never to drift from what the
 * simulator actually shows.
 */

const LONG = "var(--logo-long)";
const SHORT = "var(--logo-short)";
const W = 220;
const H = 110;

function CascadeThumb() {
  const r = useMemo(() => runCascade(CASCADE_DEFAULTS), []);
  const yMin = r.finalPrice - 4;
  const x = (i: number) => 8 + (i / Math.max(1, r.rounds.length - 1)) * (W - 16);
  const y = (v: number) => 8 + ((102 - v) / (102 - yMin)) * (H - 34);
  const maxLiq = Math.max(1, ...r.rounds.map((q) => q.liquidatedM));
  const maxBin = Math.max(1, ...r.density.map((d) => d.notionalM));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden>
      <path
        d={`M${x(0)},${y(100)} ` + r.rounds.map((q, i) => `L${x(i)},${y(q.priceAfter)}`).join(" ")}
        fill="none" stroke="var(--theme-heading)" strokeWidth={2} strokeLinejoin="round"
      />
      {r.rounds.filter((q) => q.liquidatedM > 0).map((q, i) => (
        <circle key={i} cx={x(r.rounds.indexOf(q))} cy={y(q.priceAfter)}
          r={2 + 5 * Math.sqrt(q.liquidatedM / maxLiq)} fill={SHORT} opacity={0.75} />
      ))}
      {/* liquidation heat strip */}
      {r.density.filter((_, i) => i % 3 === 0).map((d, i) => {
        const px = 8 + ((Math.max(yMin, Math.min(102, d.liqPrice)) - yMin) / (102 - yMin)) * (W - 16);
        return (
          <rect key={i} x={px} y={H - 18} width={2.4} height={4 + 10 * (d.notionalM / maxBin)}
            fill={SHORT} opacity={d.consumedInRound !== null ? 0.2 : 0.55} transform={`translate(0 ${-(4 + 10 * (d.notionalM / maxBin))})`} />
        );
      })}
    </svg>
  );
}

function FundingThumb() {
  const r = useMemo(() => runFunding({ ...FUNDING_DEFAULTS, holdDays: 10 }), []);
  const maxRate = Math.max(0.02, ...r.periods.map((q) => Math.abs(q.ratePct)));
  const x = (i: number) => 8 + (i / (r.periods.length - 1)) * (W - 16);
  const y0 = H / 2 + 8;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden>
      {r.periods.map((q, i) => (
        <rect key={i}
          x={x(i) - 2.2} width={4.4}
          y={q.ratePct >= 0 ? y0 - (q.ratePct / maxRate) * 34 : y0}
          height={Math.max(1.5, (Math.abs(q.ratePct) / maxRate) * 34)}
          fill={q.ratePct >= 0 ? LONG : SHORT} opacity={q.arbActive ? 0.9 : 0.45}
        />
      ))}
      <path
        d={r.periods.map((q, i) => `${i === 0 ? "M" : "L"}${x(i)},${y0 - 30 - (q.longShare - 0.5) * 55}`).join(" ")}
        fill="none" stroke="var(--theme-text-muted)" strokeWidth={1.2} strokeDasharray="2 3"
      />
    </svg>
  );
}

function OrderBookThumb() {
  const t = BOOK_TEMPLATES[0];
  const asks = useMemo(() => buildAskSide(t), [t]);
  const r = useMemo(() => walkBook(t, 2600), [t]);
  const maxSize = Math.max(...asks.map((a) => a.sizeK));
  const rows = asks.slice(0, 9);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden>
      {rows.map((a, i) => {
        const filled = r.fills[i] ?? 0;
        const yy = 8 + i * ((H - 16) / rows.length);
        return (
          <g key={i}>
            <rect x={8} y={yy} width={(a.sizeK / maxSize) * (W - 16)} height={7} rx={1.5} fill={SHORT} opacity={0.2} />
            <rect x={8} y={yy} width={(filled / maxSize) * (W - 16)} height={7} rx={1.5} fill={SHORT} opacity={0.85} />
          </g>
        );
      })}
    </svg>
  );
}

export function LabThumb({ slug }: { slug: string }) {
  if (slug === "liquidation-cascade") return <CascadeThumb />;
  if (slug === "funding-rate") return <FundingThumb />;
  if (slug === "order-book") return <OrderBookThumb />;
  return null;
}
