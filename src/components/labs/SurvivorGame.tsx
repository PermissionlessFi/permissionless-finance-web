"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LABS } from "@/lib/labs";
import {
  dayNumberOf,
  msToNextUtcDay,
  generateDay,
  cluesOf,
  simulateDay,
  scorePlayer,
  simulatePopulation,
  percentileBeaten,
  emojiGrid,
  PlayerChoice,
} from "@/lib/sim/survivor";
import { LabShell, useLabParams, ParamSlider, ShareCardButton } from "./LabShell";

const LAB = LABS.find((l) => l.slug === "survivor")!;
const UP = "var(--arcade-up)";
const DOWN = "var(--arcade-down)";

const ASSUMPTIONS_ZH = [
  "当日行情由日期种子确定性生成:方向、冲击、杠杆分布、深度与保险基金对全球玩家一致。",
  "拥挤一侧被强平的概率更高(反身性的教学化),但不是必然——线索给的是胜率,不是答案。",
  "级联机制与「清算级联模拟器」同一引擎及其全部简化;「模拟人群」是同种子生成的策略分布,不是真实玩家。",
  "净值计分只是游戏,不构成任何交易建议;数值不对应任何真实交易所。",
];
const ASSUMPTIONS_EN = [
  "Each day's market is generated deterministically from the date: direction, shock, leverage distribution, depth and fund are identical worldwide.",
  "The crowded side is more likely — not certain — to be the one liquidated (reflexivity, gamified). Clues give you an edge, not the answer.",
  "The cascade uses the Liquidation Cascade simulator's engine and all its simplifications; the “simulated crowd” is a seeded strategy population, not real players.",
  "Equity scoring is a game, not trading advice; no real venue is represented.",
];

interface Stored {
  streak: number;
  lastDay: number;
  played: Record<string, { pnl: number; died: boolean; round: number | null; side: number; lev: number; size: number }>;
}
const KEY = "pf_survivor_v1";
function loadStore(): Stored {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "") as Stored;
  } catch {
    return { streak: 0, lastDay: 0, played: {} };
  }
}

export function SurvivorGame() {
  const [p, update, lang, setLang] = useLabParams<Record<string, number>>({
    side: 1,
    lev: 10,
    size: 50,
  });
  const zh = lang === "zh";

  // Day is client-time; render day-dependent UI only after mount.
  const [mounted, setMounted] = useState(false);
  const [dayNum, setDayNum] = useState(1);
  const [phase, setPhase] = useState<"brief" | "play" | "result">("brief");
  const [practice, setPractice] = useState(false);
  const [store, setStore] = useState<Stored>({ streak: 0, lastDay: 0, played: {} });
  const [countdown, setCountdown] = useState("");
  const [revealed, setRevealed] = useState(0);
  const [shaking, setShaking] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setDayNum(dayNumberOf(new Date()));
    const s = loadStore();
    setStore(s);
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const ms = msToNextUtcDay(new Date());
      const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), sec = Math.floor((ms % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const market = useMemo(() => generateDay(dayNum), [dayNum]);
  const clues = useMemo(() => cluesOf(market), [market]);
  const path = useMemo(() => simulateDay(market), [market]);

  const choice: PlayerChoice = { side: p.side === -1 ? -1 : 1, leverage: p.lev, sizePct: p.size };
  const outcome = useMemo(() => scorePlayer(market, path, choice), [market, path, choice]);
  const pop = useMemo(() => simulatePopulation(market, path), [market, path]);
  const beaten = percentileBeaten(pop, outcome.pnl);

  const alreadyPlayed = mounted && store.played[String(dayNum)] !== undefined;
  const official = alreadyPlayed ? store.played[String(dayNum)] : null;

  // display-space rounds for the chart
  const dispRounds = path.rounds.map((r) => ({
    round: r.round,
    after: market.direction === -1 ? r.priceAfter : 200 - r.priceAfter,
    liquidatedM: r.liquidatedM,
    adl: r.adl,
  }));

  function start() {
    setPractice(alreadyPlayed);
    setPhase("play");
    setRevealed(reduced.current ? path.rounds.length : 1);
    if (!reduced.current) {
      let i = 1;
      const t = setInterval(() => {
        i++;
        setRevealed(i);
        const deathNow = outcome.diedInRound !== null && outcome.diedInRound === i - 1;
        if (deathNow) {
          setShaking(true);
          setTimeout(() => setShaking(false), 500);
        }
        if (i >= path.rounds.length) {
          clearInterval(t);
          setTimeout(() => finish(), 700);
        }
      }, 700);
    } else {
      setTimeout(() => finish(), 300);
    }
  }

  function finish() {
    setPhase("result");
    if (!alreadyPlayed) {
      const s = loadStore();
      const streak = s.lastDay === dayNum - 1 ? s.streak + 1 : 1;
      const next: Stored = {
        streak,
        lastDay: dayNum,
        played: { ...s.played, [String(dayNum)]: { pnl: outcome.pnl, died: outcome.died, round: outcome.diedInRound, side: choice.side, lev: choice.leverage, size: choice.sizePct } },
      };
      localStorage.setItem(KEY, JSON.stringify(next));
      setStore(next);
    }
  }

  const dirEmoji = market.direction === -1 ? "📉" : "📈";
  const shareText = () => {
    const grid = emojiGrid(path, outcome);
    const sideTxt = choice.side === 1 ? (zh ? "多" : "long") : zh ? "空" : "short";
    const fate = outcome.died
      ? zh ? `第${outcome.diedInRound}轮阵亡` : `died R${outcome.diedInRound}`
      : zh ? "存活" : "survived";
    const streakTxt = !practice && store.streak > 1 ? ` · 🔥${store.streak}` : "";
    return `${zh ? "清算幸存者" : "Cascade Survivor"} #${dayNum} ${dirEmoji}\n${grid} ${choice.leverage}x ${sideTxt} · ${fate} · ${outcome.pnl >= 0 ? "+" : ""}${outcome.pnl.toFixed(0)}\n${zh ? "跑赢" : "beat"} ${beaten}% ${zh ? "模拟人群" : "of the sim crowd"}${streakTxt}\nhttps://permissionless.fi/labs/survivor`;
  };
  const [copiedText, setCopiedText] = useState(false);

  const CLUE = (label: string, level: number, scale: string[]) => (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}>
      <div className="text-[0.7rem] mb-0.5" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>{label}</div>
      <div className="text-[0.85rem] font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text)" }}>{scale[level]}</div>
    </div>
  );

  // chart geometry (display space)
  const W = 640, H = 220, PAD = { l: 42, r: 12, t: 12, b: 20 };
  const prices = dispRounds.map((r) => r.after).concat([100, outcome.liqPrice]);
  const yMin = Math.min(...prices) - 3, yMax = Math.max(...prices) + 3;
  const xOf = (i: number) => PAD.l + (i / Math.max(1, path.rounds.length - 1)) * (W - PAD.l - PAD.r);
  const yOf = (v: number) => PAD.t + ((yMax - v) / (yMax - yMin)) * (H - PAD.t - PAD.b);
  const shownDisp = dispRounds.slice(0, revealed);
  const maxLiq = Math.max(1, ...dispRounds.map((r) => r.liquidatedM));

  return (
    <div className={`arcade ${shaking ? "arcade-shake" : ""}`}>
      <LabShell lab={LAB} lang={lang} onLangChange={setLang} assumptionsZh={ASSUMPTIONS_ZH} assumptionsEn={ASSUMPTIONS_EN}>
        {!mounted ? (
          <div className="h-64" />
        ) : (
          <>
            {/* Day header */}
            <div className="flex items-baseline justify-between mb-6">
              <p className="text-sm num" style={{ color: "var(--theme-text-muted)" }}>
                #{dayNum} · {zh ? "每日同题" : "same market for everyone"} · {zh ? "下一局" : "next"} {countdown}
              </p>
              {store.streak > 0 && (
                <p className="text-sm num" style={{ color: "var(--theme-accent)" }}>🔥 {store.streak} {zh ? "连胜天数" : "day streak"}</p>
              )}
            </div>

            {phase === "brief" && (
              <>
                {/* Clues */}
                <p className="text-xs tracking-[0.18em] uppercase mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)" }}>
                  {zh ? "盘前线索(方向未知)" : "Pre-open clues (direction unknown)"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
                  {CLUE(
                    zh ? "持仓拥挤" : "Crowding",
                    clues.crowding,
                    zh
                      ? [`${clues.crowdedSide === "long" ? "略偏多" : "略偏空"}`, `${clues.crowdedSide === "long" ? "多头拥挤" : "空头拥挤"}`, `${clues.crowdedSide === "long" ? "极度多头拥挤" : "极度空头拥挤"}`]
                      : [`slightly ${clues.crowdedSide}`, `crowded ${clues.crowdedSide}`, `extremely crowded ${clues.crowdedSide}`]
                  )}
                  {CLUE(zh ? "市场杠杆" : "Leverage", clues.leverageRegime, zh ? ["低", "中", "高危"] : ["low", "medium", "reckless"])}
                  {CLUE(zh ? "订单簿深度" : "Depth", clues.depthRegime, zh ? ["薄", "中等", "厚"] : ["thin", "medium", "thick"])}
                  {CLUE(zh ? "保险基金" : "Fund", clues.fundRegime, zh ? ["单薄", "一般", "充足"] : ["light", "okay", "stocked"])}
                </div>

                {/* Choice */}
                <div className="rounded-lg border p-4 mb-6" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}>
                  <p className="text-xs tracking-[0.18em] uppercase mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)" }}>
                    {zh ? "你的唯一决策" : "Your one decision"}
                  </p>
                  <div className="flex gap-2 mb-4">
                    {([1, -1] as const).map((s) => (
                      <button key={s} onClick={() => update({ side: s })}
                        className="flex-1 text-sm px-3 py-2.5 rounded-md border transition-colors font-bold"
                        style={{
                          fontFamily: "var(--font-heading)",
                          borderColor: p.side === s ? (s === 1 ? UP : DOWN) : "var(--theme-border)",
                          color: p.side === s ? (s === 1 ? UP : DOWN) : "var(--theme-text-muted)",
                        }}>
                        {s === 1 ? (zh ? "做多" : "Long") : zh ? "做空" : "Short"}
                      </button>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                    <ParamSlider label={zh ? "杠杆" : "Leverage"} value={p.lev} display={`${p.lev}x`} min={2} max={50} step={1} onChange={(v) => update({ lev: v })} />
                    <ParamSlider label={zh ? "仓位(占本金)" : "Size (of bankroll)"} value={p.size} display={`${p.size}%`} min={10} max={100} step={5} onChange={(v) => update({ size: v })} />
                  </div>
                  <p className="text-[0.8rem] mt-3 num" style={{ color: "var(--theme-text-muted)" }}>
                    {zh ? "你的强平价:" : "Your liquidation:"} {outcome.liqPrice.toFixed(1)} ({zh ? "开盘价 100" : "open = 100"})
                  </p>
                </div>

                <button onClick={start}
                  className="w-full sm:w-auto text-base px-10 py-3 rounded-md font-bold transition-transform hover:scale-[1.02]"
                  style={{ fontFamily: "var(--font-heading)", backgroundColor: alreadyPlayed ? "var(--theme-bg-secondary)" : "var(--theme-button-bg)", color: alreadyPlayed ? "var(--theme-text-secondary)" : "var(--theme-button-text)", border: alreadyPlayed ? "1px solid var(--theme-border)" : "none" }}>
                  {alreadyPlayed ? (zh ? "练习模式 · 再开一局" : "Practice run") : zh ? "开盘 →" : "Open the market →"}
                </button>
                {alreadyPlayed && official && (
                  <p className="text-[0.8rem] mt-2" style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}>
                    {zh ? `今日正式成绩已锁定:${official.died ? "阵亡" : "存活"} ${official.pnl >= 0 ? "+" : ""}${official.pnl.toFixed(0)}` : `Today's official run is locked: ${official.died ? "died" : "survived"} ${official.pnl >= 0 ? "+" : ""}${official.pnl.toFixed(0)}`}
                  </p>
                )}
              </>
            )}

            {(phase === "play" || phase === "result") && (
              <>
                {/* Price playback */}
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full mb-3" role="img" aria-label={zh ? "当日行情" : "The day's market"}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={yOf(100)} y2={yOf(100)} stroke="var(--theme-border)" strokeWidth={0.7} strokeDasharray="3 4" />
                  <text x={PAD.l - 6} y={yOf(100) + 3} textAnchor="end" fontSize={9} fill="var(--theme-text-muted)">100</text>
                  <line x1={PAD.l} x2={W - PAD.r} y1={yOf(outcome.liqPrice)} y2={yOf(outcome.liqPrice)} stroke={DOWN} strokeWidth={1} strokeDasharray="6 4" opacity={0.9} />
                  <text x={W - PAD.r} y={yOf(outcome.liqPrice) - 4} textAnchor="end" fontSize={9.5} fill={DOWN}>
                    {zh ? `你的强平价 ${outcome.liqPrice.toFixed(1)}` : `your liq. ${outcome.liqPrice.toFixed(1)}`}
                  </text>
                  {shownDisp.length > 0 && (
                    <path
                      d={`M${xOf(0)},${yOf(100)} ` + shownDisp.map((r, i) => `L${xOf(i).toFixed(1)},${yOf(r.after).toFixed(1)}`).join(" ")}
                      fill="none" stroke={market.direction === -1 ? DOWN : UP} strokeWidth={2.5} strokeLinejoin="round" />
                  )}
                  {shownDisp.filter((r) => r.liquidatedM > 0).map((r, i) => (
                    <circle key={r.round} cx={xOf(dispRounds.indexOf(r))} cy={yOf(r.after)} r={2 + 7 * Math.sqrt(r.liquidatedM / maxLiq)} fill={DOWN} opacity={0.8} />
                  ))}
                </svg>

                {phase === "result" && (
                  <>
                    {/* result card */}
                    <div className="relative rounded-lg border p-5 mb-6 overflow-hidden"
                      style={{ borderColor: outcome.died ? DOWN : UP, backgroundColor: "var(--theme-card-bg)" }}>
                      {!outcome.died && !reduced.current && (
                        <div className="absolute inset-x-0 bottom-0 pointer-events-none" aria-hidden>
                          {Array.from({ length: 18 }).map((_, i) => (
                            <span key={i} className="confetti absolute text-sm" style={{ left: `${(i * 53) % 100}%`, bottom: 0, animationDelay: `${(i % 6) * 0.12}s` }}>
                              {["🟩", "💚", "✦"][i % 3]}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs tracking-[0.18em] uppercase mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
                        {practice ? (zh ? "练习成绩(不计入)" : "Practice (not recorded)") : zh ? "今日成绩" : "Today's result"}
                      </p>
                      <p className={`text-2xl font-bold mb-1 num ${outcome.died ? "arcade-glow-down" : "arcade-glow-up"}`}
                        style={{ fontFamily: "var(--font-heading)", color: outcome.died ? DOWN : UP }}>
                        {outcome.died
                          ? outcome.diedInRound === 0
                            ? (zh ? "死于开盘冲击" : "Dead on the open")
                            : (zh ? `第 ${outcome.diedInRound} 轮阵亡` : `Liquidated in round ${outcome.diedInRound}`)
                          : zh ? "存活" : "Survived"}
                        <span className="ml-3">{outcome.pnl >= 0 ? "+" : ""}{outcome.pnl.toFixed(0)}</span>
                      </p>
                      <p className="text-[0.95rem] mb-2 num" style={{ color: "var(--theme-text-secondary)" }}>
                        {emojiGrid(path, outcome)} · {zh ? "跑赢" : "beat"} {beaten}% {zh ? "模拟人群" : "of the sim crowd"}
                      </p>
                      <p className="text-[0.85rem]" style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}>
                        {outcome.died
                          ? (zh ? "恭喜,你活成了保险基金的分母。想知道为什么?看下面第 11 章。" : "Congratulations — you are now a line item in the insurance fund. Chapter 11 below explains why.")
                          : market.direction === (choice.side === 1 ? 1 : -1)
                            ? (zh ? "站对了方向。但想想:线索里哪一条救了你?" : "Right side of the move. Which clue saved you, though?")
                            : (zh ? "方向错了但没死——仓位控制就是第二条命。" : "Wrong side, still standing — sizing is a second life.")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(shareText()).then(() => { setCopiedText(true); setTimeout(() => setCopiedText(false), 1600); })}
                        className="text-sm px-4 py-2 rounded-md font-bold transition-colors"
                        style={{ fontFamily: "var(--font-heading)", backgroundColor: "var(--theme-button-bg)", color: "var(--theme-button-text)" }}>
                        {copiedText ? (zh ? "已复制,去晒吧" : "Copied — go post it") : zh ? "复制战绩方块" : "Copy result blocks"}
                      </button>
                      <ShareCardButton
                        lang={lang}
                        filename={`survivor-day-${dayNum}.png`}
                        getData={() => ({
                          title: `${LAB[lang]} #${dayNum}`,
                          outcome: outcome.died
                            ? (zh ? `${p.lev}x ${choice.side === 1 ? "多" : "空"}单第 ${outcome.diedInRound} 轮阵亡` : `${p.lev}x ${choice.side === 1 ? "long" : "short"} died in round ${outcome.diedInRound}`)
                            : (zh ? `${p.lev}x ${choice.side === 1 ? "多" : "空"}单存活,净值 ${outcome.pnl >= 0 ? "+" : ""}${outcome.pnl.toFixed(0)}` : `${p.lev}x ${choice.side === 1 ? "long" : "short"} survived, ${outcome.pnl >= 0 ? "+" : ""}${outcome.pnl.toFixed(0)}`),
                          facts: [emojiGrid(path, outcome), `${zh ? "跑赢" : "beat"} ${beaten}%`, `${dirEmoji} ${zh ? "当日" : "day"} #${dayNum}`],
                          url: "https://permissionless.fi/labs/survivor",
                          accent: outcome.died ? "#ef4444" : "#22c55e",
                        })}
                      />
                      <button onClick={() => { setPhase("brief"); }}
                        className="text-sm px-4 py-2 rounded-md border transition-colors hover:opacity-80"
                        style={{ fontFamily: "var(--font-heading)", borderColor: "var(--theme-border)", color: "var(--theme-text-secondary)" }}>
                        {zh ? "练习:换个打法" : "Practice another line"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </LabShell>
    </div>
  );
}
