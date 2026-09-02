"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OPEN_PROBLEMS } from "@/lib/problems";
import { getChapterMeta } from "@/lib/toc";
import { chapterHref } from "@/lib/keywords";
import { TopNav } from "./TopNav";
import { LogoLockup } from "./BrandLogo";
import { Lang } from "@/lib/types";

/**
 * Open problems — the question each part of the book leaves open. Ten parts,
 * ten questions, each linking back to the chapter it is distilled from.
 * The research pillar's hook for researchers and builders.
 */
export function ProblemsView() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "zh" || q === "en") setLang(q);
  }, []);

  const zh = lang === "zh";

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
            {zh ? "开放问题" : "Open Problems"}
          </h1>
          <p
            className="text-[0.95rem] leading-relaxed mb-14"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {zh
              ? "十个篇章,各留下一个未解的问题。它们是这本书的边界,也是下一批研究与工程的起点——如果其中一个正好是你的问题,欢迎来做那个回答它的人。"
              : "Each of the ten parts leaves one question unresolved. These mark the book's boundary — and the starting line for the next round of research and engineering. If one of them is your question, come be the person who answers it."}
          </p>

          <ol className="space-y-12">
            {OPEN_PROBLEMS.map((p) => {
              const meta = getChapterMeta(p.chapter, lang);
              return (
                <li key={p.part}>
                  <div
                    className="text-xs tracking-[0.18em] uppercase mb-2"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)" }}
                  >
                    {zh ? p.titleZh : p.titleEn}
                  </div>
                  <p
                    className="text-[1.1rem] leading-relaxed font-bold mb-2"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
                  >
                    {zh ? p.qZh : p.qEn}
                  </p>
                  <p
                    className="text-[0.9rem] leading-relaxed mb-2"
                    style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                  >
                    {zh ? p.ctxZh : p.ctxEn}
                  </p>
                  {meta && (
                    <Link
                      href={chapterHref(lang, p.chapter)}
                      className="text-sm hover:opacity-70 transition-opacity"
                      style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
                    >
                      {zh
                        ? `源自第 ${parseInt(p.chapter)} 章 · ${meta.title} →`
                        : `From Ch. ${parseInt(p.chapter)} · ${meta.title} →`}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </main>
    </div>
  );
}
