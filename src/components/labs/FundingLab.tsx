"use client";

import { useMemo } from "react";
import { LABS } from "@/lib/labs";
import { runFunding, FUNDING_DEFAULTS, FUNDING_SCENARIOS, FundingParams } from "@/lib/sim/funding";
import {
  LabShell, useLabParams, CopyLinkButton, ShareCardButton, ParamSlider,
  TryThis, TryThisItem, Cockpit, PanelSection, StatChip,
} from "./LabShell";

const LAB = LABS.find((l) => l.slug === "funding-rate")!;
const LONG = "var(--logo-long)";
const SHORT = "var(--logo-short)";

const ASSUMPTIONS_ZH = [
  "费率 = 利率项 + 溢价项(随多空偏斜与基差),并按交易所惯例钳制在 ±0.3%/8h。",
  "基差按固定速率均值回归;当基差超过阈值时套利者进场,回归加速——现实中该阈值由套利成本决定(第 16/17 章)。",
  "偏斜是内生的:一旦基差或费率使 carry 具备吸引力,套利者做空永续——多头占比、基差与费率被一同压回(第 16 章);你的仓位不影响市场。",
  "数值为教学量级,不对应任何真实交易所。",
];
const ASSUMPTIONS_EN = [
  "Rate = interest component + premium (driven by skew and basis), clamped at ±0.3%/8h as venues do.",
  "Basis mean-reverts at a fixed rate; past a threshold arbitrageurs lean in and reversion accelerates — in reality that threshold is set by the costs of arbitrage (Ch. 16/17).",
  "Skew is endogenous: once basis or the rate makes carry attractive, arbitrageurs short the perp — long share, basis and the rate are pressed back together (Ch. 16); your position does not move the market.",
  "Teaching-scale figures; no real venue is represented.",
];

const EXPERIMENTS: TryThisItem[] = [
  {
    zh: "看套利者进场",
    en: "Watch the arbs arrive",
    observeZh: "偏斜推满 + 基差拉高:头两天费率触顶,然后看灰色偏斜线——套利者做空永续,把偏斜、基差、费率一起压回(第 16 章)。",
    observeEn: "Max the skew, stretch the basis: the rate pins at the cap for a day or two — then watch the grey skew line as arbitrageurs short the perp and press skew, basis and rate back down (Ch. 16).",
    params: { longShare: 0.9, basisPct: 2.5, holdDays: 21 },
  },
  {
    zh: "换到收钱的一边",
    en: "Switch to the paid side",
    observeZh: "同一个市场,只换方向——你从付费方变成收费方。费率不是成本,是转移支付。",
    observeEn: "Same market, opposite side — you go from paying to collecting. Funding is not a fee; it is a transfer.",
    params: { userSide: "short" },
  },
  {
    zh: "费率的地板",
    en: "The rate's floor",
    observeZh: "偏斜归零、基差贴合:费率退化到利率项附近——这就是平静市场里费率的「地板」。",
    observeEn: "Zero skew, pinned basis: the rate degenerates to roughly the interest component — the floor a calm market pays.",
    params: { longShare: 0.5, basisPct: 0, holdDays: 7 },
  },
];

export function FundingLab() {
  const [p, update, lang, setLang] = useLabParams<Record<string, number | string>>({
    longShare: FUNDING_DEFAULTS.longShare,
    basisPct: FUNDING_DEFAULTS.basisPct,
    holdDays: FUNDING_DEFAULTS.holdDays,
    userSide: FUNDING_DEFAULTS.userSide,
  });
  const zh = lang === "zh";
  const side = p.userSide === "short" ? "short" : "long";

  const result = useMemo(
    () =>
      runFunding({
        ...FUNDING_DEFAULTS,
        longShare: Number(p.longShare),
        basisPct: Number(p.basisPct),
        holdDays: Number(p.holdDays),
        userSide: side,
      } as FundingParams),
    [p, side]
  );

  const youPay = result.totalUser > 0;
  const maxAbsRate = Math.max(0.02, ...result.periods.map((x) => Math.abs(x.ratePct)));

  const W = 640, H = 210, PAD = { l: 44, r: 12, t: 14, b: 22 };
  const xOf = (i: number) => PAD.l + (i / Math.max(1, result.periods.length - 1)) * (W - PAD.l - PAD.r);
  const y0 = PAD.t + (H - PAD.t - PAD.b) / 2;
  const yOfRate = (r: number) => y0 - (r / maxAbsRate) * ((H - PAD.t - PAD.b) / 2);
  const maxAbsCum = Math.max(1, ...result.periods.map((x) => Math.abs(x.userCumulative)));
  const cumPath = result.periods
    .map((x, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${(y0 - (x.userCumulative / maxAbsCum) * ((H - PAD.t - PAD.b) / 2) * 0.9).toFixed(1)}`)
    .join(" ");

  const scenarioOf = FUNDING_SCENARIOS.find(
    (s) => s.params.longShare === Number(p.longShare) && s.params.basisPct === Number(p.basisPct) && s.params.holdDays === Number(p.holdDays)
  );

  const billText = zh
    ? `持有 ${p.holdDays} 天,你${youPay ? "支付" : "收取"} $${Math.abs(result.totalUser).toFixed(2)}(名义 $10,000)`
    : `Over ${p.holdDays} days you ${youPay ? "pay" : "receive"} $${Math.abs(result.totalUser).toFixed(2)} on $10,000 notional`;

  const controls = (
    <>
      <PanelSection first title={zh ? "情景" : "Scenario"}>
        <div className="flex flex-wrap gap-1.5">
          {FUNDING_SCENARIOS.map((s) => {
            const active = scenarioOf?.id === s.id;
            return (
              <button key={s.id} onClick={() => update({ ...s.params })} title={zh ? s.noteZh : s.noteEn}
                className="text-[0.72rem] px-2.5 py-1 rounded-full border transition-colors hover:opacity-80"
                style={{
                  fontFamily: "var(--font-heading)",
                  borderColor: active ? "var(--theme-accent)" : "var(--theme-border)",
                  color: active ? "var(--theme-heading)" : "var(--theme-text-secondary)",
                  backgroundColor: active ? "var(--theme-bg-secondary)" : "transparent",
                }}>
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

      <PanelSection title={zh ? "市场" : "Market"}>
        <div className="space-y-3">
          <ParamSlider
            label={zh ? "初始多头占比(此后内生演化)" : "Initial long share (endogenous after)"}
            value={Number(p.longShare)} display={`${Math.round(Number(p.longShare) * 100)}% ${zh ? "多" : "long"}`}
            min={0.5} max={0.9} step={0.01} onChange={(v) => update({ longShare: v })}
          />
          <ParamSlider
            label={zh ? "初始基差(永续 − 现货)" : "Initial basis (perp − spot)"}
            value={Number(p.basisPct)} display={`${Number(p.basisPct).toFixed(1)}%`}
            min={-2} max={3} step={0.1} onChange={(v) => update({ basisPct: v })}
          />
        </div>
      </PanelSection>

      <PanelSection accent title={zh ? "⭐ 你的仓位($10,000 名义)" : "⭐ Your position ($10,000)"}>
        <div className="flex gap-2 mb-3">
          {(["long", "short"] as const).map((s) => (
            <button key={s} onClick={() => update({ userSide: s })}
              className="flex-1 text-sm px-3 py-2 rounded-md border transition-colors"
              style={{
                fontFamily: "var(--font-heading)",
                borderColor: side === s ? (s === "long" ? LONG : SHORT) : "var(--theme-border)",
                color: side === s ? (s === "long" ? LONG : SHORT) : "var(--theme-text-muted)",
                fontWeight: side === s ? 700 : 400,
              }}>
              {s === "long" ? (zh ? "做多" : "Long") : zh ? "做空" : "Short"}
            </button>
          ))}
        </div>
        <ParamSlider
          label={zh ? "你的持有时长" : "Your holding period"}
          value={Number(p.holdDays)} display={zh ? `${p.holdDays} 天` : `${p.holdDays} days`}
          min={1} max={30} step={1} onChange={(v) => update({ holdDays: v })}
        />
      </PanelSection>
    </>
  );

  return (
    <LabShell lab={LAB} lang={lang} onLangChange={setLang} assumptionsZh={ASSUMPTIONS_ZH} assumptionsEn={ASSUMPTIONS_EN}>
      <Cockpit controls={controls}>
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}>
          <div className="flex flex-wrap items-center gap-2 px-4 pt-3.5 pb-1">
            <span className="text-[0.72rem] px-2 py-0.5 rounded-full border" style={{ fontFamily: "var(--font-heading)", borderColor: "var(--theme-border)", color: "var(--theme-text-muted)" }}>
              {result.avgRatePct >= 0 ? (zh ? "多头 → 空头" : "longs → shorts") : (zh ? "空头 → 多头" : "shorts → longs")}
            </span>
            <div className="flex-1" />
            <StatChip label={zh ? "平均" : "avg"} value={`${result.avgRatePct.toFixed(3)}%/8h`} />
            <StatChip label={zh ? "年化" : "APR"} value={`${result.annualizedPct.toFixed(1)}%`} />
            <StatChip label={zh ? "偏斜终值" : "end skew"} value={`${Math.round(result.periods[result.periods.length - 1].longShare * 100)}%`} />
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" role="img" aria-label={zh ? "资金费率、累计成本与偏斜" : "Funding rate, cumulative cost and skew"}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y0} y2={y0} stroke="var(--theme-border)" strokeWidth={0.7} />
            <text x={PAD.l - 6} y={y0 + 3} textAnchor="end" fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">0</text>
            {result.periods.map((x, i) => (
              <rect key={i}
                x={xOf(i) - Math.max(0.8, (W - PAD.l - PAD.r) / result.periods.length / 2 - 0.6)}
                y={Math.min(y0, yOfRate(x.ratePct))}
                width={Math.max(1.6, (W - PAD.l - PAD.r) / result.periods.length - 1.2)}
                height={Math.abs(yOfRate(x.ratePct) - y0)}
                fill={x.ratePct >= 0 ? LONG : SHORT}
                opacity={x.arbActive ? 0.9 : 0.45}>
                <title>{zh
                  ? `第 ${x.day + 1} 天 · 费率 ${x.ratePct.toFixed(3)}%/8h · 基差 ${x.basisPct.toFixed(2)}% · 多头 ${Math.round(x.longShare * 100)}%${x.arbActive ? " · 套利进场" : ""}`
                  : `Day ${x.day + 1} · rate ${x.ratePct.toFixed(3)}%/8h · basis ${x.basisPct.toFixed(2)}% · ${Math.round(x.longShare * 100)}% long${x.arbActive ? " · arb active" : ""}`}</title>
              </rect>
            ))}
            <path d={cumPath} fill="none" stroke="var(--theme-heading)" strokeWidth={2} strokeLinejoin="round" />
            <path
              d={result.periods
                .map((x, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${(PAD.t + (1 - (x.longShare - 0.5) / 0.4) * (H - PAD.t - PAD.b) * 0.92).toFixed(1)}`)
                .join(" ")}
              fill="none" stroke="var(--theme-text-muted)" strokeWidth={1.3} strokeDasharray="2 3" strokeLinejoin="round"
            />
            <text x={W - PAD.r} y={PAD.t + 8} textAnchor="end" fontSize={11.5} fill="var(--theme-heading)" fontFamily="var(--font-sans)">
              {zh ? "你的累计资金费(实线)" : "your cumulative funding (solid)"}
            </text>
            <text x={W - PAD.r} y={PAD.t + 20} textAnchor="end" fontSize={11.5} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">
              {zh ? "多头占比(虚线,50–90%)" : "long share (dotted, 50–90%)"}
            </text>
            <text x={PAD.l} y={H - 6} fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">
              {zh ? "8 小时周期 →(深色柱 = 套利者进场)" : "8h periods → (darker bars = arb active)"}
            </text>
          </svg>

          <div className="border-t px-4 py-3.5" style={{ borderColor: "var(--theme-border)" }}>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[1.02rem] font-bold leading-snug" style={{ fontFamily: "var(--font-heading)", color: youPay ? SHORT : LONG }}>
                  {billText}
                </p>
                <p className="text-[0.82rem] mt-0.5" style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}>
                  {zh
                    ? `平均 ${result.avgRatePct.toFixed(3)}%/8h ≈ 年化 ${result.annualizedPct.toFixed(1)}%;费率是转移支付,不是手续费。`
                    : `Avg ${result.avgRatePct.toFixed(3)}%/8h ≈ ${result.annualizedPct.toFixed(1)}% annualized; funding is a transfer, not a fee.`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end md:max-w-[46%]">
                <CopyLinkButton lang={lang} />
                <ShareCardButton
                  lang={lang}
                  filename="permissionless-labs-funding.png"
                  getData={() => ({
                    title: LAB[lang],
                    outcome: zh
                      ? `持有 ${p.holdDays} 天,${youPay ? "支付" : "收取"} $${Math.abs(result.totalUser).toFixed(2)} 资金费`
                      : `Over ${p.holdDays} days: ${youPay ? "paid" : "received"} $${Math.abs(result.totalUser).toFixed(2)} in funding`,
                    facts: zh
                      ? [`名义 $10,000`, `初始 ${Math.round(Number(p.longShare) * 100)}% 多头`, `平均 ${result.avgRatePct.toFixed(3)}%/8h`, `年化 ${result.annualizedPct.toFixed(1)}%`]
                      : [`$10,000 notional`, `${Math.round(Number(p.longShare) * 100)}% long start`, `avg ${result.avgRatePct.toFixed(3)}%/8h`, `${result.annualizedPct.toFixed(1)}% APR`],
                    url: window.location.href,
                    accent: "#b0703b",
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <TryThis lang={lang} items={EXPERIMENTS} onApply={(prms) => update(prms)} />
        </div>
      </Cockpit>
    </LabShell>
  );
}
