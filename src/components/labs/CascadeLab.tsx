"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { LABS } from "@/lib/labs";
import {
  runCascade,
  CASCADE_SCENARIOS,
  CASCADE_DEFAULTS,
  CascadeParams,
} from "@/lib/sim/cascade";
import {
  LabShell, useLabParams, CopyLinkButton, ShareCardButton, ParamSlider,
  TryThis, TryThisItem, Seg, Cockpit, PanelSection, StatChip,
} from "./LabShell";
import { Button } from "../ui/button";

const LAB = LABS.find((l) => l.slug === "liquidation-cascade")!;
const LONG = "var(--logo-long)";
const SHORT = "var(--logo-short)";

const ASSUMPTIONS_ZH = [
  "多头未平仓量分布在杠杆 × 入场价微桶上;入场价取 −6%~0(越近期权重越高)——贴着强平价的仓位已在此前的行情中出清(幸存者调整),由此形成图下方的强平密度带。",
  "标记价 = 指数 + 0.2 × 基差(教学式锚定,近似真实交易所的指数锚 EMA);系统性冲击同时打击指数与永续,场内插针只打永续;指数按 0.45 系数部分跟随永续冲击(套利传导)。",
  "强平单一次性市价卖出、无拆单与冰山;单轮价格冲击上限 25%(近似熔断/单边簿的现实约束);超调损失按固定 5% 计入保险基金。",
  "「内生深度」开启时,做市商随累计强平量按线性规则撤单(下限 30%)——第 20 章流动性螺旋的教学化;关闭时深度为常数。",
  "无做市商回补、无抄底资金进场;级联在无新强平时停止;所有数值为教学量级,不对应任何真实交易所。",
];
const ASSUMPTIONS_EN = [
  "Long open interest sits on leverage × entry-price micro-buckets; entries span −6%–0 with recent entries weighted heavier — positions whose liquidation sat above today's open were already cleared on the way here (a survivorship adjustment). This produces the liquidation-density band under the chart.",
  "Mark = index + 0.2 × basis (a teaching-form index anchor, approximating real venues' index-anchored EMA). A systemic shock hits index and perp alike; a venue wick hits the perp only; the index follows perp impact with coupling 0.45 (arbitrage transmission).",
  "Forced liquidations sell at market in one shot (no slicing); per-round impact is capped at 25% (a stand-in for halts and one-sided books); overshoot loss charges the fund at a flat 5%.",
  "With endogenous depth on, market makers withdraw linearly in cumulative forced flow (floor 30%) — Chapter 20's liquidity spiral, gamified; off = constant depth.",
  "No maker replenishment, no dip buyers; the cascade halts when no new tier triggers. Teaching-scale figures; no real venue is represented.",
];

const EXPERIMENTS: TryThisItem[] = [
  {
    zh: "插针防御测试",
    en: "The wick defense test",
    observeZh: "−12% 的场内插针在标记价模式下几乎无人被强平——切到「最新价」再放一次,看看没有指数锚的世界(第 14 章)。",
    observeEn: "A −12% venue wick barely liquidates anyone under mark-price triggering — now switch to Last and replay to see the world without the index anchor (Ch. 14).",
    params: { stype: "venue", trigger: "mark", shockPct: 12 },
  },
  {
    zh: "深度砍半",
    en: "Halve the depth",
    observeZh: "冲击不变,只把深度从 60 砍到 30——看级联轮数与总回撤:深度才是缓冲垫(第 20 章)。",
    observeEn: "Same shock, depth cut from 60 to 30 — watch rounds and total drawdown: depth is the cushion (Ch. 20).",
    params: { stype: "systemic", trigger: "mark", depthMPerPct: 30 },
  },
  {
    zh: "流动性螺旋",
    en: "The liquidity spiral",
    observeZh: "打开内生深度:强平越多,做市商撤得越狠,同样的冲击走得更深(第 20 章)。",
    observeEn: "Endogenous depth on: the more is liquidated, the harder makers pull, and the same shock travels further (Ch. 20).",
    params: { endo: 1, avgLeverage: 28 },
  },
];

export function CascadeLab() {
  const [p, update, lang, setLang] = useLabParams<Record<string, number | string>>({
    shockPct: CASCADE_DEFAULTS.shockPct,
    avgLeverage: CASCADE_DEFAULTS.avgLeverage,
    depthMPerPct: CASCADE_DEFAULTS.depthMPerPct,
    insuranceM: CASCADE_DEFAULTS.insuranceM,
    userLeverage: CASCADE_DEFAULTS.userLeverage,
    userEntryOffsetPct: CASCADE_DEFAULTS.userEntryOffsetPct,
    trigger: "mark",
    stype: "systemic",
    endo: 0,
  });
  const zh = lang === "zh";

  const params: CascadeParams = {
    shockPct: Number(p.shockPct),
    avgLeverage: Number(p.avgLeverage),
    depthMPerPct: Number(p.depthMPerPct),
    insuranceM: Number(p.insuranceM),
    userLeverage: Number(p.userLeverage),
    userEntryOffsetPct: Number(p.userEntryOffsetPct),
    trigger: p.trigger === "last" ? "last" : "mark",
    shockType: p.stype === "venue" ? "venue" : "systemic",
    endogenousDepth: Number(p.endo) === 1,
  };
  const result = useMemo(() => runCascade(params), [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sequential round reveal; reduced-motion shows all at once.
  const [revealed, setRevealed] = useState(0);
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  useEffect(() => {
    if (reduced.current) {
      setRevealed(result.rounds.length);
      return;
    }
    setRevealed(1);
    const t = setInterval(() => {
      setRevealed((r) => {
        if (r >= result.rounds.length) {
          clearInterval(t);
          return r;
        }
        return r + 1;
      });
    }, 450);
    return () => clearInterval(t);
  }, [result]);

  const shown = result.rounds.slice(0, revealed);
  const done = revealed >= result.rounds.length;
  const userDead = result.userDiesInRound !== null && result.userDiesInRound < revealed;

  // ---- stage geometry (chart + heat band + round bars share one width) ----
  const W = 640, H = 230, PAD = { l: 42, r: 12, t: 10, b: 8 };
  const yMin = Math.min(result.finalPrice, result.userLiqPrice) - 3;
  const yMax = 102;
  const xOf = (i: number) => PAD.l + (i / Math.max(1, result.rounds.length - 1)) * (W - PAD.l - PAD.r);
  const yOf = (price: number) => PAD.t + ((yMax - price) / (yMax - yMin)) * (H - PAD.t - PAD.b);
  const line = (get: (r: (typeof shown)[number]) => number) =>
    shown.map((r, i) => `${i === 0 ? "M" : "L"}${xOf(r.round).toFixed(1)},${yOf(get(r)).toFixed(1)}`).join(" ");
  const maxLiq = Math.max(1, ...result.rounds.map((r) => r.liquidatedM));

  const BINS = 44;
  const heat = useMemo(() => {
    const lo = yMin, hi = yMax;
    const bins = Array.from({ length: BINS }, () => ({ total: 0, round: null as number | null }));
    for (const c of result.density) {
      if (c.liqPrice < lo || c.liqPrice > hi) continue;
      const bi = Math.min(BINS - 1, Math.floor(((c.liqPrice - lo) / (hi - lo)) * BINS));
      bins[bi].total += c.notionalM;
      if (c.consumedInRound !== null)
        bins[bi].round = bins[bi].round === null ? c.consumedInRound : Math.min(bins[bi].round!, c.consumedInRound);
    }
    return bins;
  }, [result, yMin, yMax]);
  const maxBin = Math.max(1, ...heat.map((b) => b.total));

  const scenarioOf = CASCADE_SCENARIOS.find(
    (s) =>
      s.params.shockPct === params.shockPct &&
      s.params.avgLeverage === params.avgLeverage &&
      s.params.depthMPerPct === params.depthMPerPct &&
      s.params.insuranceM === params.insuranceM
  );

  const modeLine = `${params.shockType === "venue" ? (zh ? "场内插针" : "venue wick") : zh ? "系统性冲击" : "systemic shock"} · ${
    params.trigger === "mark" ? (zh ? "标记价触发" : "mark trigger") : zh ? "最新价触发" : "last trigger"
  }${params.endogenousDepth ? (zh ? " · 内生深度" : " · endogenous depth") : ""}`;

  const outcomeText =
    result.userDiesInRound === null
      ? (zh ? `存活 ✓ 触发价未及你的强平价 ${result.userLiqPrice.toFixed(1)}` : `Survived ✓ The trigger never reached your liquidation at ${result.userLiqPrice.toFixed(1)}`)
      : result.userDiesInRound === 0
        ? (zh ? `你的 ${params.userLeverage}x 多单死于初始冲击——级联还没开始,你已经出局` : `Your ${params.userLeverage}x long died in the initial shock — out before the cascade even began`)
        : (zh ? `你的 ${params.userLeverage}x 多单在第 ${result.userDiesInRound} 轮被强平` : `Your ${params.userLeverage}x long was liquidated in round ${result.userDiesInRound}`);
  const shareFacts = zh
    ? [`冲击 −${params.shockPct}%`, modeLine, `${result.rounds.length - 1} 轮`, `清掉 $${result.totalLiquidatedM.toFixed(0)}M`, result.adlTriggered ? "ADL 触发" : "基金撑住了"]
    : [`−${params.shockPct}% shock`, modeLine, `${result.rounds.length - 1} rounds`, `$${result.totalLiquidatedM.toFixed(0)}M liquidated`, result.adlTriggered ? "ADL" : "fund held"];

  const fundLeft = shown.length ? shown[shown.length - 1].insuranceLeftM : Number(p.insuranceM);

  /* ─────────────────────────── controls panel ─────────────────────────── */
  const controls = (
    <>
      <PanelSection first title={zh ? "情景" : "Scenario"}>
        <div className="flex flex-wrap gap-1.5">
          {CASCADE_SCENARIOS.map((s) => {
            const active = scenarioOf?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() =>
                  update({
                    shockPct: s.params.shockPct,
                    avgLeverage: s.params.avgLeverage,
                    depthMPerPct: s.params.depthMPerPct,
                    insuranceM: s.params.insuranceM,
                    endo: s.params.endogenousDepth ? 1 : 0,
                    trigger: s.params.trigger ?? "mark",
                    stype: s.params.shockType ?? "systemic",
                  })
                }
                title={zh ? s.noteZh : s.noteEn}
                className="text-[0.72rem] px-2.5 py-1 rounded-full border transition-colors hover:opacity-80"
                style={{
                  fontFamily: "var(--font-heading)",
                  borderColor: active ? "var(--theme-accent)" : "var(--theme-border)",
                  color: active ? "var(--theme-heading)" : "var(--theme-text-secondary)",
                  backgroundColor: active ? "var(--theme-bg-secondary)" : "transparent",
                }}
              >
                {zh ? s.zh : s.en}
              </button>
            );
          })}
        </div>
        {scenarioOf && (
          <p className="text-[0.78rem] mt-2 leading-relaxed" style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}>
            {zh ? scenarioOf.noteZh : scenarioOf.noteEn}
          </p>
        )}
      </PanelSection>

      <PanelSection title={zh ? "机制" : "Mechanism"}>
        <div className="space-y-2.5">
          <Seg
            label={zh ? "冲击类型" : "Shock type"}
            value={String(p.stype)}
            onChange={(v) => update({ stype: v })}
            options={[
              { v: "systemic", text: zh ? "系统性" : "Systemic" },
              { v: "venue", text: zh ? "场内插针" : "Venue wick" },
            ]}
          />
          <Seg
            label={zh ? "强平触发基准(第 14 章)" : "Liquidation trigger (Ch. 14)"}
            value={String(p.trigger)}
            onChange={(v) => update({ trigger: v })}
            options={[
              { v: "mark", text: zh ? "标记价" : "Mark" },
              { v: "last", text: zh ? "最新价" : "Last" },
            ]}
          />
          <Seg
            label={zh ? "订单簿深度(第 20 章)" : "Book depth (Ch. 20)"}
            value={String(p.endo)}
            onChange={(v) => update({ endo: Number(v) })}
            options={[
              { v: "0", text: zh ? "外生恒定" : "Exogenous" },
              { v: "1", text: zh ? "内生撤离" : "Endogenous" },
            ]}
          />
        </div>
      </PanelSection>

      <PanelSection title={zh ? "市场" : "Market"}>
        <div className="space-y-3">
          <ParamSlider label={zh ? "初始价格冲击" : "Initial price shock"} value={Number(p.shockPct)} display={`−${p.shockPct}%`} min={2} max={30} step={1} onChange={(v) => update({ shockPct: v })} accent={SHORT} />
          <ParamSlider label={zh ? "市场平均杠杆" : "Average market leverage"} value={Number(p.avgLeverage)} display={`${p.avgLeverage}x`} min={5} max={50} step={1} onChange={(v) => update({ avgLeverage: v })} />
          <ParamSlider label={zh ? "订单簿深度(每 1% 吸收)" : "Book depth (per 1%)"} value={Number(p.depthMPerPct)} display={`$${p.depthMPerPct}M`} min={10} max={200} step={5} onChange={(v) => update({ depthMPerPct: v })} />
          <ParamSlider label={zh ? "保险基金规模" : "Insurance fund"} value={Number(p.insuranceM)} display={`$${p.insuranceM}M`} min={0} max={150} step={5} onChange={(v) => update({ insuranceM: v })} accent={LONG} />
        </div>
      </PanelSection>

      <PanelSection accent title={zh ? "⭐ 你的多单" : "⭐ Your long"}>
        <div className="space-y-3">
          <ParamSlider label={zh ? "你的杠杆" : "Your leverage"} value={Number(p.userLeverage)} display={`${p.userLeverage}x`} min={2} max={50} step={1} onChange={(v) => update({ userLeverage: v })} />
          <ParamSlider label={zh ? "你的入场价(相对起点)" : "Your entry (vs start)"} value={Number(p.userEntryOffsetPct)} display={`${Number(p.userEntryOffsetPct) > 0 ? "+" : ""}${p.userEntryOffsetPct}%`} min={-10} max={10} step={1} onChange={(v) => update({ userEntryOffsetPct: v })} />
        </div>
        <p className="text-[0.78rem] mt-2 tabular-nums" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-secondary)" }}>
          {zh ? "你的强平价:" : "Your liquidation:"} <b>{result.userLiqPrice.toFixed(1)}</b>{zh ? "(开盘 100)" : " (open = 100)"}
        </p>
      </PanelSection>
    </>
  );

  /* ────────────────────────────── stage ────────────────────────────── */
  return (
    <LabShell lab={LAB} lang={lang} onLangChange={setLang} assumptionsZh={ASSUMPTIONS_ZH} assumptionsEn={ASSUMPTIONS_EN}>
      <Cockpit controls={controls}>
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}>
          {/* stage header: mode + status chips */}
          <div className="flex flex-wrap items-center gap-2 px-4 pt-3.5 pb-1">
            <span className="text-[0.72rem] px-2 py-0.5 rounded-full border" style={{ fontFamily: "var(--font-heading)", borderColor: "var(--theme-border)", color: "var(--theme-text-muted)" }}>
              {modeLine}
            </span>
            <div className="flex-1" />
            <StatChip label={zh ? "轮数" : "rounds"} value={String(result.rounds.length - 1)} />
            <StatChip label={zh ? "清掉" : "liquidated"} value={`$${result.totalLiquidatedM.toFixed(0)}M`} tone="down" />
            <StatChip label={zh ? "基金" : "fund"} value={done && result.adlTriggered ? "ADL!" : `$${fundLeft.toFixed(0)}M`} tone={result.adlTriggered && done ? "down" : "up"} />
          </div>

          {/* hero: price chart */}
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" role="img" aria-label={zh ? "级联价格路径(最新价与标记价)" : "Cascade price paths (last and mark)"}>
            {[100, 95, 90, 85, 80, 75, 70, 65, 60].filter((v) => v > yMin && v <= yMax).map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={yOf(v)} y2={yOf(v)} stroke="var(--theme-border)" strokeWidth={0.5} strokeDasharray="3 4" />
                <text x={PAD.l - 6} y={yOf(v) + 3} textAnchor="end" fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">{v}</text>
              </g>
            ))}
            <line x1={PAD.l} x2={W - PAD.r} y1={yOf(result.userLiqPrice)} y2={yOf(result.userLiqPrice)} stroke={SHORT} strokeWidth={1} strokeDasharray="6 4" opacity={0.8} />
            <text x={W - PAD.r} y={yOf(result.userLiqPrice) - 4} textAnchor="end" fontSize={11.5} fill={SHORT} fontFamily="var(--font-sans)">
              {zh ? `你的强平价 ${result.userLiqPrice.toFixed(1)}` : `your liq. ${result.userLiqPrice.toFixed(1)}`}
            </text>
            {shown.length > 0 && (
              <>
                <path d={`M${xOf(0).toFixed(1)},${yOf(100).toFixed(1)} ${line((r) => r.priceAfter)}`} fill="none" stroke="var(--theme-heading)" strokeWidth={2} strokeLinejoin="round" />
                <path d={`M${xOf(0).toFixed(1)},${yOf(100).toFixed(1)} ${line((r) => r.markAfter)}`} fill="none" stroke="var(--theme-accent)" strokeWidth={1.4} strokeDasharray="5 4" strokeLinejoin="round" />
              </>
            )}
            <text x={PAD.l + 4} y={PAD.t + 10} fontSize={11.5} fill="var(--theme-heading)" fontFamily="var(--font-sans)">{zh ? "— 最新价" : "— last"}</text>
            <text x={PAD.l + 60} y={PAD.t + 10} fontSize={11.5} fill="var(--theme-accent)" fontFamily="var(--font-sans)">{zh ? "┅ 标记价" : "┅ mark"}</text>
            {shown.filter((r) => r.liquidatedM > 0).map((r) => (
              <circle key={r.round} cx={xOf(r.round)} cy={yOf(r.priceAfter)} r={2 + 7 * Math.sqrt(r.liquidatedM / maxLiq)} fill={SHORT} opacity={0.75}>
                <title>{zh
                  ? `第 ${r.round} 轮:强平 $${r.liquidatedM.toFixed(0)}M(${r.leveragesHit.map((l) => l + "x").join("/")}),深度 $${r.depthUsed.toFixed(0)}M/1%,最新价 ${r.priceBefore.toFixed(1)}→${r.priceAfter.toFixed(1)},标记价 ${r.markAfter.toFixed(1)}`
                  : `Round ${r.round}: $${r.liquidatedM.toFixed(0)}M liquidated (${r.leveragesHit.map((l) => l + "x").join("/")}), depth $${r.depthUsed.toFixed(0)}M/1%, last ${r.priceBefore.toFixed(1)}→${r.priceAfter.toFixed(1)}, mark ${r.markAfter.toFixed(1)}`}</title>
              </circle>
            ))}
            {shown.filter((r) => r.adl).map((r) => (
              <text key={`adl-${r.round}`} x={xOf(r.round)} y={yOf(r.priceAfter) - 12} textAnchor="middle" fontSize={12} fontWeight={700} fill={SHORT} fontFamily="var(--font-sans)">ADL</text>
            ))}
          </svg>

          {/* heat band, attached directly beneath the chart (price axis) */}
          <svg viewBox={`0 0 ${W} 44`} className="w-full block" role="img" aria-label={zh ? "强平密度带" : "Liquidation density band"}>
            {heat.map((b, i) => {
              if (b.total <= 0) return null;
              const price = yMin + ((i + 0.5) / BINS) * (yMax - yMin);
              const x = PAD.l + ((price - yMin) / (yMax - yMin)) * (W - PAD.l - PAD.r);
              const h = 4 + 24 * (b.total / maxBin);
              const burned = b.round !== null && b.round < revealed;
              return (
                <rect key={i} x={x - (W - PAD.l - PAD.r) / BINS / 2 + 0.5} width={(W - PAD.l - PAD.r) / BINS - 1}
                  y={32 - h} height={h} rx={1}
                  fill={SHORT} opacity={burned ? 0.14 : 0.32 + 0.5 * (b.total / maxBin)}>
                  <title>{zh
                    ? `强平价 ≈ ${price.toFixed(1)}:$${b.total.toFixed(0)}M${burned ? "(已强平)" : ""}`
                    : `liq ≈ ${price.toFixed(1)}: $${b.total.toFixed(0)}M${burned ? " (consumed)" : ""}`}</title>
                </rect>
              );
            })}
            {shown.length > 0 && (() => {
              const lastR = shown[shown.length - 1];
              const ref = params.trigger === "mark" ? lastR.markAfter : lastR.priceAfter;
              const x = PAD.l + ((Math.max(yMin, ref) - yMin) / (yMax - yMin)) * (W - PAD.l - PAD.r);
              return <line x1={x} x2={x} y1={2} y2={34} stroke="var(--theme-heading)" strokeWidth={1.4} />;
            })()}
            <text x={PAD.l} y={42} fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">{yMin.toFixed(0)}</text>
            <text x={W - PAD.r} y={42} textAnchor="end" fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">{yMax.toFixed(0)}</text>
            <text x={(PAD.l + W - PAD.r) / 2} y={42} textAnchor="middle" fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">
              {zh ? "强平密度带(价格轴)· 变暗 = 已被本轮级联吃掉 · 竖线 = 当前触发价" : "liquidation density (price axis) · dimmed = consumed · cursor = current trigger"}
            </text>
          </svg>

          {/* round bars, x-aligned with the chart's rounds */}
          <svg viewBox={`0 0 ${W} 52`} className="w-full block" role="img" aria-label={zh ? "每轮强平名义额" : "Liquidated per round"}>
            {result.rounds.slice(1).map((r) => {
              const bw = Math.min(26, ((W - PAD.l - PAD.r) / Math.max(2, result.rounds.length)) * 0.55);
              const h = Math.max(2, (r.liquidatedM / maxLiq) * 32);
              return (
                <rect key={r.round} x={xOf(r.round) - bw / 2} y={38 - h} width={bw} height={h} rx={2}
                  fill={SHORT} opacity={r.round < revealed ? 0.8 : 0.12}>
                  <title>{`R${r.round}: $${r.liquidatedM.toFixed(0)}M`}</title>
                </rect>
              );
            })}
            <text x={PAD.l} y={50} fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">
              {zh ? "每轮强平名义额(与上图轮次对齐)" : "liquidated per round (aligned with the rounds above)"}
            </text>
            {result.rounds.length <= 1 && (
              <text x={(PAD.l + W - PAD.r) / 2} y={26} textAnchor="middle" fontSize={12} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">
                {zh ? "无级联——冲击被吸收(或被标记价挡下)" : "No cascade — absorbed (or the mark price held the line)"}
              </text>
            )}
          </svg>

          {/* verdict banner */}
          <div className="border-t px-4 py-3.5" style={{ borderColor: "var(--theme-border)" }}>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[1.02rem] font-bold leading-snug" style={{ fontFamily: "var(--font-heading)", color: result.userDiesInRound !== null ? SHORT : LONG }}>
                  {result.userDiesInRound !== null && !userDead ? "…" : outcomeText}
                </p>
                <p className="text-[0.82rem] mt-0.5" style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}>
                  {zh
                    ? `−${params.shockPct}% × 平均 ${params.avgLeverage}x → ${result.rounds.length - 1} 轮;最新价终于 ${result.finalPrice.toFixed(1)},标记价 ${result.finalMark.toFixed(1)}。`
                    : `−${params.shockPct}% at ${params.avgLeverage}x average → ${result.rounds.length - 1} rounds; last ends ${result.finalPrice.toFixed(1)}, mark ${result.finalMark.toFixed(1)}.`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end md:max-w-[46%]">
                <Button size="sm" onClick={() => update({})} style={{ fontFamily: "var(--font-heading)" }}>
                  {zh ? "重播" : "Replay"}
                </Button>
                <CopyLinkButton lang={lang} />
                <ShareCardButton
                  lang={lang}
                  filename="permissionless-labs-cascade.png"
                  getData={() => ({
                    title: LAB[lang],
                    outcome: outcomeText,
                    facts: shareFacts,
                    url: window.location.href,
                    accent: "#a34a33",
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* next steps, after you've seen a run */}
        <div className="mt-6">
          <TryThis lang={lang} items={EXPERIMENTS} onApply={(prms) => update(prms)} />
        </div>
      </Cockpit>
    </LabShell>
  );
}
