"use client";

import { useMemo, useState } from "react";
import { LABS } from "@/lib/labs";
import { runPlan, encodePlan, decodePlan, DuelPlan, WaitKind, DUEL_TOTAL_K } from "@/lib/sim/execution";
import { LabShell, useLabParams, ShareCardButton } from "./LabShell";

const LAB = LABS.find((l) => l.slug === "execution-duel")!;
const UP = "var(--arcade-up)";
const DOWN = "var(--arcade-down)";
const NAIVE_BPS = 159.2; // the 1-shot baseline

const ASSUMPTIONS_ZH = [
  "固定题:$3M 买单打进同一张浅盘;等分切片;短等回补 50%/漂移 +8bp,长等回补 90%/漂移 +30bp。",
  "漂移作用于其后全部成交(市场跑了就不回来);簿与回补完全确定性——因此战书双方面对严格同题。",
  "沿用订单簿模拟器的全部简化(静态快照、平滑档位、不计手续费)。",
  "滑点计分只是游戏,不构成任何执行建议;数值不对应任何真实交易所。",
];
const ASSUMPTIONS_EN = [
  "A fixed problem: a $3M buy into the same thin book; equal slices; short wait = 50% replenish / +8bp drift, long wait = 90% / +30bp.",
  "Drift applies to every later fill (the market does not come back); book and replenishment are fully deterministic — both sides of a duel face the identical problem.",
  "All simplifications of the Order Book simulator carry over (static snapshot, smooth levels, no fees).",
  "Slippage scoring is a game, not execution advice; no real venue is represented.",
];

export function ExecutionDuel() {
  const [p, update, lang, setLang] = useLabParams<Record<string, string | number>>({
    plan: "2-s",
    cb: 0, // challenger bps ×10 (0 = no challenge)
  });
  const zh = lang === "zh";

  const plan: DuelPlan = decodePlan(String(p.plan)) ?? { slices: 2, waits: ["s"] };
  const challengerBps = Number(p.cb) > 0 ? Number(p.cb) / 10 : null;

  const [executed, setExecuted] = useState(false);
  const result = useMemo(() => runPlan(plan), [plan]);
  const saved = NAIVE_BPS - result.totalBps;
  const won = challengerBps !== null && result.totalBps < challengerBps;

  function setSlices(n: 1 | 2 | 3 | 4) {
    const waits: WaitKind[] = Array.from({ length: n - 1 }, (_, i) => plan.waits[i] ?? "s");
    update({ plan: encodePlan({ slices: n, waits }) });
    setExecuted(false);
  }
  function toggleWait(i: number) {
    const waits = [...plan.waits];
    waits[i] = waits[i] === "s" ? "l" : "s";
    update({ plan: encodePlan({ slices: plan.slices, waits }) });
    setExecuted(false);
  }

  const gauntletUrl = () => {
    const q = new URLSearchParams();
    q.set("plan", encodePlan(plan));
    q.set("cb", String(Math.round(result.totalBps * 10)));
    q.set("lang", lang);
    return `https://permissionless.fi/labs/execution-duel?${q}`;
  };
  const [copied, setCopied] = useState(false);

  return (
    <div className="arcade">
      <LabShell lab={LAB} lang={lang} onLangChange={setLang} assumptionsZh={ASSUMPTIONS_ZH} assumptionsEn={ASSUMPTIONS_EN}>
        {/* Challenge banner */}
        {challengerBps !== null && (
          <div className="rounded-lg border p-4 mb-6" style={{ borderColor: "var(--theme-accent)", backgroundColor: "var(--theme-card-bg)" }}>
            <p className="text-[0.95rem] font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)" }}>
              ⚔️ {zh ? `有人向你发起对决:同一张盘,对手打出 ${challengerBps.toFixed(1)} bp。打得更低就算你赢。` : `You've been challenged: same book, opponent filled at ${challengerBps.toFixed(1)} bp. Beat it.`}
            </p>
          </div>
        )}

        {/* Problem statement */}
        <p className="text-[0.95rem] mb-6 num" style={{ color: "var(--theme-text-secondary)" }}>
          {zh
            ? `题目:$${DUEL_TOTAL_K / 1000}M 买单 × 浅盘。拆几刀?刀间怎么等?裸单成本 ${NAIVE_BPS.toFixed(1)} bp——看你能省下多少。`
            : `The problem: a $${DUEL_TOTAL_K / 1000}M buy into a thin book. How many slices, and how do you wait? The naive one-shot costs ${NAIVE_BPS.toFixed(1)} bp — see what you can save.`}
        </p>

        {/* Plan builder */}
        <div className="rounded-lg border p-4 mb-6" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}>
          <p className="text-xs tracking-[0.18em] uppercase mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)" }}>
            {zh ? "你的执行方案" : "Your execution plan"}
          </p>
          <div className="flex gap-2 mb-4">
            {([1, 2, 3, 4] as const).map((n) => (
              <button key={n} onClick={() => setSlices(n)}
                className="flex-1 text-sm px-3 py-2 rounded-md border font-bold transition-colors"
                style={{
                  fontFamily: "var(--font-heading)",
                  borderColor: plan.slices === n ? "var(--theme-accent)" : "var(--theme-border)",
                  color: plan.slices === n ? "var(--theme-accent)" : "var(--theme-text-muted)",
                }}>
                {n} {zh ? "刀" : n === 1 ? "slice" : "slices"}
              </button>
            ))}
          </div>
          {plan.slices > 1 && (
            <div className="space-y-2">
              {plan.waits.map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[0.8rem] num w-24" style={{ color: "var(--theme-text-muted)" }}>
                    {zh ? `第 ${i + 1}→${i + 2} 刀间` : `gap ${i + 1}→${i + 2}`}
                  </span>
                  <button onClick={() => toggleWait(i)}
                    className="text-[0.8rem] px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                      fontFamily: "var(--font-heading)",
                      borderColor: "var(--theme-accent)",
                      color: "var(--theme-text)",
                      backgroundColor: "var(--theme-bg-secondary)",
                    }}>
                    {w === "s"
                      ? (zh ? "短等 · 回补50% · 漂移+8bp" : "short wait · 50% refill · +8bp drift")
                      : (zh ? "长等 · 回补90% · 漂移+30bp" : "long wait · 90% refill · +30bp drift")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setExecuted(true)}
          className="w-full sm:w-auto text-base px-10 py-3 rounded-md font-bold mb-8 transition-transform hover:scale-[1.02]"
          style={{ fontFamily: "var(--font-heading)", backgroundColor: "var(--theme-button-bg)", color: "var(--theme-button-text)" }}>
          {zh ? "执行 →" : "Execute →"}
        </button>

        {executed && (
          <>
            {/* Per-slice outcomes */}
            <div className="grid sm:grid-cols-4 gap-2 mb-4">
              {result.sliceOutcomes.map((s, i) => (
                <div key={i} className="rounded-lg border p-3" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}>
                  <div className="text-[0.7rem] mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
                    {zh ? `第 ${i + 1} 刀` : `Slice ${i + 1}`}{s.driftBpAtFill > 0 ? ` · ${zh ? "漂移" : "drift"} +${s.driftBpAtFill.toFixed(0)}bp` : ""}
                  </div>
                  <div className="text-[0.95rem] font-bold num" style={{ color: "var(--theme-text)" }}>
                    {(s.avgOffsetPct * 100).toFixed(1)} bp
                  </div>
                  <div className="text-[0.7rem] num" style={{ color: "var(--theme-text-muted)" }}>
                    {zh ? `吃到第 ${s.deepestLevel + 1} 档` : `${s.deepestLevel + 1} levels deep`}
                  </div>
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div className="rounded-lg border p-5 mb-6"
              style={{ borderColor: challengerBps !== null ? (won ? UP : DOWN) : "var(--theme-accent)", backgroundColor: "var(--theme-card-bg)" }}>
              <p className="text-2xl font-bold num mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text)" }}>
                {result.totalBps.toFixed(1)} bp
                <span className="text-sm ml-3" style={{ color: saved > 0 ? UP : DOWN }}>
                  {zh ? `比裸单省 ${saved.toFixed(1)} bp(≈ $${((saved / 10000) * DUEL_TOTAL_K * 1000).toFixed(0)})` : `${saved.toFixed(1)} bp better than the naive one-shot (≈ $${((saved / 10000) * DUEL_TOTAL_K * 1000).toFixed(0)})`}
                </span>
              </p>
              {challengerBps !== null && (
                <p className={`text-[1.05rem] font-bold ${won ? "arcade-glow-up" : "arcade-glow-down"}`}
                  style={{ fontFamily: "var(--font-heading)", color: won ? UP : DOWN }}>
                  {won
                    ? (zh ? `胜 ⚔️ 低于对手 ${(challengerBps - result.totalBps).toFixed(1)} bp` : `Victory ⚔️ ${(challengerBps - result.totalBps).toFixed(1)} bp under your opponent`)
                    : (zh ? `负 — 对手仍领先 ${(result.totalBps - challengerBps).toFixed(1)} bp,调整方案再来` : `Lost — opponent leads by ${(result.totalBps - challengerBps).toFixed(1)} bp. Adjust and retry.`)}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(gauntletUrl()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); })}
                className="text-sm px-4 py-2 rounded-md font-bold transition-colors"
                style={{ fontFamily: "var(--font-heading)", backgroundColor: "var(--theme-button-bg)", color: "var(--theme-button-text)" }}>
                {copied ? (zh ? "战书已复制" : "Gauntlet copied") : zh ? "复制战书链接 ⚔️" : "Copy challenge link ⚔️"}
              </button>
              <ShareCardButton
                lang={lang}
                filename="execution-duel.png"
                getData={() => ({
                  title: LAB[lang],
                  outcome: zh ? `$3M 浅盘,${result.totalBps.toFixed(1)} bp 成交` : `$3M in a thin book, filled at ${result.totalBps.toFixed(1)} bp`,
                  facts: zh
                    ? [`${plan.slices} 刀`, `省 ${saved.toFixed(1)} bp`, challengerBps !== null ? (won ? "对决:胜 ⚔️" : "对决:负") : "敢来试试?"]
                    : [`${plan.slices} slices`, `saved ${saved.toFixed(1)} bp`, challengerBps !== null ? (won ? "duel: won ⚔️" : "duel: lost") : "think you can beat it?"],
                  url: gauntletUrl(),
                  accent: "#38bdf8",
                })}
              />
            </div>
          </>
        )}
      </LabShell>
    </div>
  );
}
