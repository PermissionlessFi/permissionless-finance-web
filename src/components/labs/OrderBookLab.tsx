"use client";

import { useMemo } from "react";
import { LABS } from "@/lib/labs";
import { BOOK_TEMPLATES, buildAskSide, walkBook, ORDERBOOK_DEFAULTS } from "@/lib/sim/orderbook";
import { runMaker, makerFrontier, flowScript, MAKER_DEFAULT_OFFSET, ADVERSE_WINDOW } from "@/lib/sim/maker";
import {
  LabShell, useLabParams, CopyLinkButton, ShareCardButton, ParamSlider,
  TryThis, TryThisItem, Seg, Cockpit, PanelSection, StatChip,
} from "./LabShell";

const LAB = LABS.find((l) => l.slug === "order-book")!;
const LONG = "var(--logo-long)";
const SHORT = "var(--logo-short)";

const ASSUMPTIONS_ZH = [
  "吃单模式:只模拟卖侧(你在买入);簿为静态快照,吃单期间无新挂单、无撤单;滑点只计成交价偏离,未含手续费。",
  "挂单模式:订单流为每个盘口模板固定的确定性脚本(30 笔,含 6 笔知情单,方向配平故无市场 beta);知情单规模更大、成交后按其方向拖动中间价;你的挂单不改价、不撤——「免费期权」的完整体验。",
  "逆向选择按成交后 " + ADVERSE_WINDOW + " 笔事件的窗口计量,隔离长程漂移;前沿曲线为 5 条确定性脚本的平均。",
  "档位规模按平滑曲线生成——真实簿是离散、跳跃且策略性的(冰山、诱单见第 7 章)。",
  "数值为教学量级,不对应任何真实交易所。",
];
const ASSUMPTIONS_EN = [
  "Taker mode: only the ask side is simulated (you are buying); the book is a static snapshot — no replenishment or cancellation while you fill; slippage excludes fees.",
  "Maker mode: order flow is a fixed deterministic script per book template (30 orders, 6 informed with alternating sides — no market beta); informed orders trade bigger and drag the mid in their direction after filling; your resting bid is never repriced or pulled — the full 'free option' experience.",
  `Adverse selection is measured over the ${ADVERSE_WINDOW} events after your fill, isolating it from long-horizon drift; the frontier curve averages 5 deterministic scripts.`,
  "Level sizes follow a smooth profile — real books are discrete, jumpy, and strategic (icebergs and spoofing: Ch. 7).",
  "Teaching-scale figures; no real venue is represented.",
];

const EXPERIMENTS: TryThisItem[] = [
  {
    zh: "同一笔单,换浅盘",
    en: "Same order, thin book",
    observeZh: "$2M 的单从深盘换到浅盘——滑点差几倍?深度才是真实的交易成本(第 8 章)。",
    observeEn: "The same $2M moved from the deep book to the thin one — how many times the slippage? Depth is the real cost of trading (Ch. 8).",
    params: { mode: "taker", template: "thin", sizeK: 2000 },
  },
  {
    zh: "Maker:贴得太近",
    en: "Maker: quoting too tight",
    observeZh: "6bp 的报价很快成交——但看「成交后漂移」:你的成交本身就是坏消息(第 8 章,Glosten-Milgrom)。",
    observeEn: "A 6bp quote fills fast — now look at the post-fill drift: your fill itself is bad news (Ch. 8, Glosten-Milgrom).",
    params: { mode: "maker", offsetBp: 6, template: "deep" },
  },
  {
    zh: "Maker:挂得太远",
    en: "Maker: quoting too wide",
    observeZh: "56bp 的报价几乎永不成交,净收益归零——价差收益与成交概率的权衡,最优点在前沿曲线的峰上。",
    observeEn: "A 56bp quote almost never trades and the net goes to zero — the spread-vs-fill trade-off peaks in the middle of the frontier.",
    params: { mode: "maker", offsetBp: 56, template: "deep" },
  },
];

export function OrderBookLab() {
  const [p, update, lang, setLang] = useLabParams<Record<string, string | number>>({
    mode: "taker",
    template: ORDERBOOK_DEFAULTS.templateId,
    sizeK: ORDERBOOK_DEFAULTS.sizeK,
    offsetBp: MAKER_DEFAULT_OFFSET,
  });
  const zh = lang === "zh";
  const maker = p.mode === "maker";

  const template = BOOK_TEMPLATES.find((t) => t.id === p.template) ?? BOOK_TEMPLATES[0];
  const asks = useMemo(() => buildAskSide(template), [template]);
  const takerResult = useMemo(() => walkBook(template, Number(p.sizeK)), [template, p.sizeK]);
  const makerResult = useMemo(() => runMaker(template, Number(p.offsetBp)), [template, p.offsetBp]);
  const frontier = useMemo(() => makerFrontier(template), [template]);
  const script = useMemo(() => flowScript(template), [template]);

  const maxSize = Math.max(...asks.map((a) => a.sizeK));
  const shownLevels = 16;

  // maker timeline geometry
  const TW = 640, TH = 190, TP = { l: 42, r: 12, t: 12, b: 20 };
  const midLo = Math.min(-Number(p.offsetBp) - 8, ...makerResult.midPath) - 4;
  const midHi = Math.max(8, ...makerResult.midPath) + 4;
  const txOf = (i: number) => TP.l + (i / (script.length - 1)) * (TW - TP.l - TP.r);
  const tyOf = (bp: number) => TP.t + ((midHi - bp) / (midHi - midLo)) * (TH - TP.t - TP.b);

  // frontier geometry
  const FW = 640, FH = 130, FP = { l: 42, r: 12, t: 10, b: 20 };
  const fLo = Math.min(0, ...frontier.map((f) => f.netBp)) - 3;
  const fHi = Math.max(4, ...frontier.map((f) => f.netBp)) + 3;
  const fxOf = (o: number) => FP.l + ((o - 2) / 58) * (FW - FP.l - FP.r);
  const fyOf = (v: number) => FP.t + ((fHi - v) / (fHi - fLo)) * (FH - FP.t - FP.b);

  const takerVerdict = takerResult.exhausted
    ? (zh ? `簿被吃穿:仅成交 $${(takerResult.filledK / 1000).toFixed(1)}M,均价偏离 ${takerResult.slippageBps.toFixed(1)} bp` : `Book exhausted: only $${(takerResult.filledK / 1000).toFixed(1)}M filled, ${takerResult.slippageBps.toFixed(1)} bp off mid`)
    : (zh ? `均价偏离中间价 ${takerResult.slippageBps.toFixed(1)} bp,吃到第 ${takerResult.deepestLevel + 1} 档` : `Filled ${takerResult.slippageBps.toFixed(1)} bp off mid, walking ${takerResult.deepestLevel + 1} levels`);
  const makerVerdict = makerResult.filled
    ? (zh ? `第 ${makerResult.fillEvent! + 1} 笔${makerResult.filledByInformed ? "知情" : "不知情"}卖单打到你,净 ${makerResult.netBp >= 0 ? "+" : ""}${makerResult.netBp.toFixed(1)}bp` : `Hit by ${makerResult.filledByInformed ? "informed" : "uninformed"} flow (order #${makerResult.fillEvent! + 1}), net ${makerResult.netBp >= 0 ? "+" : ""}${makerResult.netBp.toFixed(1)}bp`)
    : (zh ? "整段订单流走完,你的挂单没等到成交——净 0" : "The whole flow passed and your quote never filled — net 0");

  /* ─────────────────────────── controls panel ─────────────────────────── */
  const controls = (
    <>
      <PanelSection first title={zh ? "座位与盘口" : "Seat & book"}>
        <div className="space-y-2.5">
          <Seg
            label={zh ? "你的座位" : "Your seat"}
            value={String(p.mode)}
            onChange={(v) => update({ mode: v })}
            options={[
              { v: "taker", text: zh ? "吃单 Taker" : "Taker" },
              { v: "maker", text: zh ? "挂单 Maker" : "Maker" },
            ]}
          />
          <div>
            <p className="text-[0.7rem] mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
              {zh ? "盘口模板" : "Book template"}
            </p>
            <div className="flex flex-col gap-1.5">
              {BOOK_TEMPLATES.map((t) => {
                const active = template.id === t.id;
                return (
                  <button key={t.id} onClick={() => update({ template: t.id })} title={zh ? t.noteZh : t.noteEn}
                    className="text-left text-[0.78rem] px-2.5 py-1.5 rounded-md border transition-colors hover:opacity-80"
                    style={{
                      fontFamily: "var(--font-heading)",
                      borderColor: active ? "var(--theme-accent)" : "var(--theme-border)",
                      color: active ? "var(--theme-heading)" : "var(--theme-text-secondary)",
                      backgroundColor: active ? "var(--theme-bg-secondary)" : "transparent",
                    }}>
                    {(zh ? t.zh : t.en)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <p className="text-[0.78rem] mt-2 leading-relaxed" style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}>
          {zh ? template.noteZh : template.noteEn}
        </p>
      </PanelSection>

      <PanelSection accent title={maker ? (zh ? "⭐ 你的挂单" : "⭐ Your resting bid") : (zh ? "⭐ 你的市价单" : "⭐ Your market order")}>
        {maker ? (
          <ParamSlider
            label={zh ? "挂在中间价下方" : "Distance below mid"}
            value={Number(p.offsetBp)} display={`−${p.offsetBp} bp`}
            min={2} max={60} step={2}
            onChange={(v) => update({ offsetBp: v })}
          />
        ) : (
          <ParamSlider
            label={zh ? "买入市价单规模" : "Market buy size"}
            value={Number(p.sizeK)} display={`$${(Number(p.sizeK) / 1000).toFixed(1)}M`}
            min={50} max={8000} step={50}
            onChange={(v) => update({ sizeK: v })}
          />
        )}
      </PanelSection>
    </>
  );

  /* ────────────────────────────── stage ────────────────────────────── */
  return (
    <LabShell lab={LAB} lang={lang} onLangChange={setLang} assumptionsZh={ASSUMPTIONS_ZH} assumptionsEn={ASSUMPTIONS_EN}>
      <Cockpit controls={controls}>
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}>
          {/* stage header */}
          <div className="flex flex-wrap items-center gap-2 px-4 pt-3.5 pb-2">
            <span className="text-[0.72rem] px-2 py-0.5 rounded-full border" style={{ fontFamily: "var(--font-heading)", borderColor: "var(--theme-border)", color: "var(--theme-text-muted)" }}>
              {maker ? (zh ? "挂单方视角" : "maker seat") : zh ? "吃单方视角" : "taker seat"} · {(zh ? template.zh : template.en).split("(")[0]}
            </span>
            <div className="flex-1" />
            {maker ? (
              <>
                <StatChip label={zh ? "价差" : "spread"} value={`${makerResult.earnedBp.toFixed(1)}bp`} />
                <StatChip label={zh ? "漂移" : "drift"} value={`${makerResult.adverseBp >= 0 ? "+" : ""}${makerResult.adverseBp.toFixed(1)}bp`} tone={makerResult.adverseBp >= 0 ? "up" : "down"} />
                <StatChip label={zh ? "净" : "net"} value={makerResult.filled ? `${makerResult.netBp >= 0 ? "+" : ""}${makerResult.netBp.toFixed(1)}bp` : "0"} tone={makerResult.filled ? (makerResult.netBp >= 0 ? "up" : "down") : undefined} />
              </>
            ) : (
              <>
                <StatChip label={zh ? "滑点" : "slippage"} value={`${takerResult.slippageBps.toFixed(1)}bp`} tone={takerResult.slippageBps > 20 ? "down" : undefined} />
                <StatChip label={zh ? "深度" : "levels"} value={String(takerResult.deepestLevel + 1)} />
                <StatChip label={zh ? "成本" : "cost"} value={`$${((takerResult.slippageBps / 10000) * takerResult.filledK * 1000).toFixed(0)}`} tone="down" />
              </>
            )}
          </div>

          {!maker && (
            /* hero: the ladder */
            <div className="px-4 pb-3">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-xs" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
                  {zh ? "卖盘(距中间价 %)——你的单吃到哪一档" : "Ask side (offset from mid, %) — how deep your order eats"}
                </p>
                <p className="text-xs" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
                  {zh ? "档位量($K)" : "level size ($K)"}
                </p>
              </div>
              <div className="space-y-[3px]">
                {asks.slice(0, shownLevels).map((a, i) => {
                  const filled = takerResult.fills[i] ?? 0;
                  const fillRatio = a.sizeK > 0 ? filled / a.sizeK : 0;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-14 text-right text-[0.75rem] tabular-nums shrink-0"
                        style={{ fontFamily: "var(--font-sans)", color: fillRatio > 0 ? "var(--theme-heading)" : "var(--theme-text-muted)" }}>
                        +{a.offsetPct.toFixed(2)}%
                      </span>
                      <div className="flex-1 h-4 rounded-sm overflow-hidden relative" style={{ backgroundColor: "var(--theme-bg-secondary)" }}>
                        <div className="absolute inset-y-0 left-0 rounded-sm"
                          style={{ width: `${(a.sizeK / maxSize) * 100}%`, backgroundColor: SHORT, opacity: 0.22 }} />
                        <div className="absolute inset-y-0 left-0 rounded-sm transition-all duration-300"
                          style={{ width: `${(filled / maxSize) * 100}%`, backgroundColor: SHORT, opacity: 0.85 }} />
                      </div>
                      <span className="w-16 text-[0.72rem] tabular-nums shrink-0"
                        style={{ fontFamily: "var(--font-sans)", color: "var(--theme-text-muted)" }}>
                        {filled > 0 ? `${Math.round(filled)}/${Math.round(a.sizeK)}` : Math.round(a.sizeK)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {maker && (
            <>
              {/* hero: flow timeline */}
              <svg viewBox={`0 0 ${TW} ${TH}`} className="w-full block" role="img"
                aria-label={zh ? "订单流时间线与你的挂单" : "Order-flow timeline and your resting quote"}>
                <line x1={TP.l} x2={TW - TP.r} y1={tyOf(0)} y2={tyOf(0)} stroke="var(--theme-border)" strokeWidth={0.6} strokeDasharray="3 4" />
                <text x={TP.l - 6} y={tyOf(0) + 3} textAnchor="end" fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">0</text>
                <line x1={TP.l} x2={TW - TP.r} y1={tyOf(-Number(p.offsetBp))} y2={tyOf(-Number(p.offsetBp))}
                  stroke={LONG} strokeWidth={1.2} strokeDasharray="6 4" />
                <text x={TW - TP.r} y={tyOf(-Number(p.offsetBp)) - 4} textAnchor="end" fontSize={11.5} fill={LONG} fontFamily="var(--font-sans)">
                  {zh ? `你的买单 −${p.offsetBp}bp` : `your bid −${p.offsetBp}bp`}
                </text>
                <path d={makerResult.midPath.map((m, i) => `${i === 0 ? "M" : "L"}${txOf(i).toFixed(1)},${tyOf(m).toFixed(1)}`).join(" ")}
                  fill="none" stroke="var(--theme-heading)" strokeWidth={1.8} strokeLinejoin="round" />
                {script.map((e, i) => (
                  <circle key={i} cx={txOf(i)} cy={tyOf(makerResult.midPath[i])}
                    r={e.informed ? 4 : 2.2}
                    fill={e.side === "sell" ? SHORT : LONG}
                    opacity={e.informed ? 0.95 : 0.45}
                    stroke={e.informed ? "var(--theme-heading)" : "none"} strokeWidth={e.informed ? 0.8 : 0}>
                    <title>{zh
                      ? `#${i + 1} ${e.side === "sell" ? "卖" : "买"}${e.informed ? "(知情)" : ""} $${e.sizeK.toFixed(0)}K,漂移 ${e.driftBp.toFixed(1)}bp`
                      : `#${i + 1} ${e.side}${e.informed ? " (informed)" : ""} $${e.sizeK.toFixed(0)}K, drift ${e.driftBp.toFixed(1)}bp`}</title>
                  </circle>
                ))}
                {makerResult.filled && makerResult.fillEvent !== null && (
                  <g>
                    <line x1={txOf(makerResult.fillEvent)} x2={txOf(makerResult.fillEvent)} y1={TP.t} y2={TH - TP.b}
                      stroke={SHORT} strokeWidth={1} strokeDasharray="3 3" />
                    <text x={txOf(makerResult.fillEvent)} y={TP.t + 9} textAnchor="middle" fontSize={11.5} fontWeight={700}
                      fill={SHORT} fontFamily="var(--font-sans)">
                      {zh ? "成交" : "FILL"}
                    </text>
                  </g>
                )}
                <text x={TP.l} y={TH - 5} fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">
                  {zh ? "订单流(大圆 = 知情单)→" : "order flow (large = informed) →"}
                </text>
              </svg>

              {/* frontier, attached below the timeline */}
              <div className="px-4 pt-1">
                <p className="text-xs" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
                  {zh ? "净收益 vs 报价距离(5 条脚本平均)——最优点既不贴也不远" : "Net edge vs quote distance (avg of 5 scripts) — the optimum is neither tight nor wide"}
                </p>
              </div>
              <svg viewBox={`0 0 ${FW} ${FH}`} className="w-full block" role="img" aria-label={zh ? "报价前沿曲线" : "Quoting frontier"}>
                <line x1={FP.l} x2={FW - FP.r} y1={fyOf(0)} y2={fyOf(0)} stroke="var(--theme-border)" strokeWidth={0.6} strokeDasharray="3 4" />
                <text x={FP.l - 6} y={fyOf(0) + 3} textAnchor="end" fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">0</text>
                <path d={frontier.map((f, i) => `${i === 0 ? "M" : "L"}${fxOf(f.offsetBp).toFixed(1)},${fyOf(f.netBp).toFixed(1)}`).join(" ")}
                  fill="none" stroke="var(--theme-accent)" strokeWidth={1.8} strokeLinejoin="round" />
                <circle cx={fxOf(Number(p.offsetBp))} cy={fyOf(frontier.find((f) => f.offsetBp === Number(p.offsetBp))?.netBp ?? 0)}
                  r={4.5} fill="var(--theme-heading)" />
                <text x={FP.l} y={FH - 5} fontSize={11} fill="var(--theme-text-muted)" fontFamily="var(--font-sans)">
                  {zh ? "报价距离(bp)→ 圆点 = 你的位置" : "quote distance (bp) → dot = you"}
                </text>
              </svg>
            </>
          )}

          {/* verdict banner */}
          <div className="border-t px-4 py-3.5" style={{ borderColor: "var(--theme-border)" }}>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[1.02rem] font-bold leading-snug"
                  style={{ fontFamily: "var(--font-heading)", color: maker ? (makerResult.filled ? (makerResult.netBp >= 0 ? LONG : SHORT) : "var(--theme-text-muted)") : (takerResult.exhausted || takerResult.slippageBps > 20 ? SHORT : LONG) }}>
                  {maker ? makerVerdict : takerVerdict}
                </p>
                <p className="text-[0.82rem] mt-0.5" style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}>
                  {maker
                    ? (zh ? "你的买单只会被卖方打中,而卖方里藏着知情者——成交本身就是坏消息;价差是这份风险的补偿(第 8 章)。" : "Your bid only trades against sellers, and sellers include the informed — the fill itself is bad news; the spread is the compensation (Ch. 8).")
                    : (zh ? "你的滑点,正是挂单方承担逆向选择风险换来的补偿——切到 Maker 座位,亲自去承担一次。" : "Your slippage compensates the resting maker's adverse-selection risk — switch seats and carry it yourself.")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end md:max-w-[46%]">
                <CopyLinkButton lang={lang} />
                <ShareCardButton
                  lang={lang}
                  filename="permissionless-labs-orderbook.png"
                  getData={() => ({
                    title: LAB[lang],
                    outcome: maker ? makerVerdict : takerVerdict,
                    facts: maker
                      ? (zh ? [(zh ? template.zh : template.en).split("(")[0], `价差 ${makerResult.earnedBp.toFixed(1)}bp`, `漂移 ${makerResult.adverseBp.toFixed(1)}bp`] : [template.en.split("(")[0], `spread ${makerResult.earnedBp.toFixed(1)}bp`, `drift ${makerResult.adverseBp.toFixed(1)}bp`])
                      : (zh ? [template.zh.split("(")[0], `$${(Number(p.sizeK) / 1000).toFixed(1)}M 市价单`, `成本 ≈ $${((takerResult.slippageBps / 10000) * takerResult.filledK * 1000).toFixed(0)}`] : [template.en.split("(")[0], `$${(Number(p.sizeK) / 1000).toFixed(1)}M market order`, `cost ≈ $${((takerResult.slippageBps / 10000) * takerResult.filledK * 1000).toFixed(0)}`]),
                    url: window.location.href,
                    accent: "#3f6cb3",
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
