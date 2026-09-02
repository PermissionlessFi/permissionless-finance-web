"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PUBLISHED_LABS, LABS_ROADMAP } from "@/lib/labs";
import { LabThumb } from "./LabThumb";
import { getChapterMeta } from "@/lib/toc";
import { TopNav } from "../TopNav";
import { LogoLockup } from "../BrandLogo";
import { Lang } from "@/lib/types";

/** Labs hub — three simulators, each a 60-second aha; roadmap teasers keep
 *  the product line visibly alive (and leave co-ownership slots for seeds). */
export function LabsView() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "zh" || q === "en") setLang(q);
  }, []);
  const zh = lang === "zh";
  const games = PUBLISHED_LABS.filter((l) => l.kind === "game");
  const simulators = PUBLISHED_LABS.filter((l) => l.kind !== "game");

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-20 flex items-center justify-between h-[72px] px-4 backdrop-blur-sm"
        style={{ backgroundColor: "var(--theme-header-bg)", transition: "background-color 0.3s ease" }}
      >
        <LogoLockup markWidth={44} className="ml-2" />
        <TopNav lang={lang} onLangChange={setLang} />
      </header>

      <main className="flex-1 px-6 pb-20" style={{ color: "var(--theme-text)" }}>
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-4xl font-bold mt-6 mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
          >
            {zh ? "实验室" : "Labs"}
          </h1>
          <p
            className="text-[0.95rem] leading-relaxed mb-12"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {zh
              ? "书里的机制,亲手触发一次。每个模拟器 60 秒给你一个「原来如此」——拖动参数,看市场如何反应,然后顺着链接读懂为什么。"
              : "The book's mechanisms, triggered by your own hand. Each simulator delivers one “so that's why” in sixty seconds — drag a parameter, watch the market react, then follow the link to understand why."}
          </p>

          {/* Games — daily & versus, arcade tier. Hidden while none are published. */}
          {games.length > 0 && (
          <>
          <h2 className="text-xs tracking-[0.18em] uppercase mb-4 pb-2 border-b"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)", borderColor: "var(--theme-border)" }}>
            {zh ? "每日挑战 · 对战" : "Daily & Versus"}
          </h2>
          <div className="space-y-5 mb-14">
            {games.map((lab) => (
              <Link key={lab.slug} href={`/labs/${lab.slug}?lang=${lang}`}
                className="block rounded-lg border p-6 hover:opacity-90 transition-opacity"
                style={{ borderColor: lab.color, backgroundColor: "#0d1526", color: "#e2e8f0" }}>
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <span className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "#f1f5f9" }}>
                    {lab[lang]}
                  </span>
                  <span className="text-[0.7rem] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border shrink-0"
                    style={{ fontFamily: "var(--font-heading)", borderColor: lab.color, color: lab.color }}>
                    {lab.slug === "survivor" ? (zh ? "每日" : "Daily") : zh ? "对战" : "PvP"}
                  </span>
                </div>
                <p className="text-[0.85rem] mb-3" style={{ fontFamily: "var(--font-heading)", color: lab.color }}>
                  {zh ? lab.storyZh : lab.storyEn}
                </p>
                <p className="text-[0.9rem] leading-relaxed" style={{ fontFamily: "var(--font-serif)", color: "#94a3b8" }}>
                  {zh ? lab.learnZh : lab.learnEn}
                </p>
              </Link>
            ))}
          </div>
          </>
          )}

          {games.length > 0 && (
            <h2 className="text-xs tracking-[0.18em] uppercase mb-4 pb-2 border-b"
              style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)", borderColor: "var(--theme-border)" }}>
              {zh ? "机制模拟器" : "Simulators"}
            </h2>
          )}
          <div className="space-y-5 mb-16">
            {simulators.map((lab) => (
              <Link
                key={lab.slug}
                href={`/labs/${lab.slug}?lang=${lang}`}
                className="flex flex-col sm:flex-row gap-5 rounded-lg border p-6 hover:opacity-85 transition-opacity"
                style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}
              >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <span
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
                  >
                    {lab[lang]}
                  </span>
                  {lab.flagship && (
                    <span
                      className="text-[0.7rem] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border shrink-0"
                      style={{ fontFamily: "var(--font-heading)", borderColor: lab.color, color: lab.color }}
                    >
                      {zh ? "旗舰" : "Flagship"}
                    </span>
                  )}
                </div>
                <p
                  className="text-[0.85rem] mb-3"
                  style={{ fontFamily: "var(--font-heading)", color: lab.color }}
                >
                  {zh ? lab.storyZh : lab.storyEn}
                </p>
                <p
                  className="text-[0.9rem] leading-relaxed mb-3"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                >
                  {zh ? lab.learnZh : lab.learnEn}
                </p>
                <p className="text-xs" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
                  {lab.chapters
                    .map((num) => (zh ? `第 ${parseInt(num)} 章` : `Ch. ${parseInt(num)}`) + " · " + (getChapterMeta(num, lang)?.title ?? ""))
                    .join("  /  ")}
                </p>
              </div>
              {/* live miniature from the simulator's own engine */}
              <div
                className="w-full sm:w-[190px] shrink-0 self-center rounded-md border overflow-hidden"
                style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-bg-secondary)" }}
                aria-hidden
              >
                <LabThumb slug={lab.slug} />
              </div>
              </Link>
            ))}
          </div>

          {/* Roadmap */}
          <section>
            <h2
              className="text-xs tracking-[0.18em] uppercase mb-4 pb-2 border-b"
              style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)", borderColor: "var(--theme-border)" }}
            >
              {zh ? "路线图 · 与社区共建" : "Roadmap · built with the community"}
            </h2>
            <ul className="space-y-2">
              {LABS_ROADMAP.map((r) => (
                <li
                  key={r.en}
                  className="text-[0.9rem]"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
                >
                  {zh ? r.zh : r.en}
                  <span className="ml-2 text-xs">
                    ({zh ? `第 ${r.chapters.map((c) => parseInt(c)).join("、")} 章` : `Ch. ${r.chapters.map((c) => parseInt(c)).join(", ")}`})
                  </span>
                </li>
              ))}
            </ul>
            <p
              className="text-[0.85rem] mt-4"
              style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}
            >
              {zh
                ? "想认领一个模拟器,或提交一个值得复现的情景?社区开放后欢迎来共建。"
                : "Want to own a simulator, or submit a scenario worth reproducing? Come build with us once the community opens."}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
