"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LEARNING_PATHS } from "@/lib/paths";
import { getChapterMeta } from "@/lib/toc";
import { chapterHref } from "@/lib/keywords";
import { TopNav } from "./TopNav";
import { LogoLockup } from "./BrandLogo";
import { Lang } from "@/lib/types";

/**
 * Learning paths — the site's core engine. Three identity-first tracks;
 * each stage links straight into the book. The quant track forks into two
 * specializations at the end. Language-aware like contents/glossary.
 */
export function PathsView() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "zh" || q === "en") setLang(q);
  }, []);

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
            {lang === "zh" ? "学习路径" : "Learning Paths"}
          </h1>
          <p
            className="text-[0.95rem] leading-relaxed mb-10"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {lang === "zh"
              ? "同一本书,三条走法。选择你的身份,按阶段读——每一阶段都说明它为什么值得读。"
              : "One book, three ways through it. Pick your identity and read by stage — each stage says why it earns its place."}
          </p>

          {/* Track selector cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-16">
            {LEARNING_PATHS.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="block rounded-lg border p-5 hover:opacity-85 transition-opacity"
                style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}
              >
                <div
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "var(--font-heading)", color: p.color }}
                >
                  {p[lang]}
                </div>
                <p
                  className="text-[0.85rem] leading-relaxed"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                >
                  {lang === "zh" ? p.whoZh : p.whoEn}
                </p>
              </a>
            ))}
          </div>

          {/* Tracks */}
          <div className="space-y-20">
            {LEARNING_PATHS.map((p) => {
              const mainStages = p.stages.filter((s) => !s.branch);
              const branches = p.stages.filter((s) => s.branch);
              return (
                <section key={p.id} id={p.id} className="scroll-mt-24">
                  <h2
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-heading)", color: p.color }}
                  >
                    {p[lang]}
                  </h2>
                  <p
                    className="text-[0.9rem] leading-relaxed mb-8"
                    style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                  >
                    {lang === "zh" ? p.whoZh : p.whoEn}
                  </p>

                  <ol className="space-y-8 border-l pl-6" style={{ borderColor: "var(--theme-border)" }}>
                    {mainStages.map((s, i) => (
                      <li key={s.en}>
                        <div style={{ fontFamily: "var(--font-heading)" }}>
                          <span className="text-xs mr-2" style={{ color: "var(--theme-text-muted)" }}>
                            {lang === "zh" ? `第 ${i + 1} 阶` : `Stage ${i + 1}`}
                          </span>
                          <span className="text-lg font-bold" style={{ color: "var(--theme-heading)" }}>
                            {s[lang]}
                          </span>
                        </div>
                        <p
                          className="text-[0.875rem] leading-relaxed mt-1 mb-3"
                          style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                        >
                          {lang === "zh" ? s.whyZh : s.whyEn}
                        </p>
                        <ul className="space-y-1.5">
                          {s.chapters.map((num) => {
                            const meta = getChapterMeta(num, lang);
                            if (!meta) return null;
                            return (
                              <li key={num}>
                                <Link
                                  href={chapterHref(lang, num)}
                                  className="text-[0.9rem] hover:opacity-70 transition-opacity"
                                  style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text)" }}
                                >
                                  <span className="mr-2" style={{ color: "var(--theme-text-muted)" }}>
                                    {lang === "zh" ? `第 ${parseInt(num)} 章` : `Ch. ${parseInt(num)}`}
                                  </span>
                                  {meta.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    ))}
                  </ol>

                  {branches.length > 0 && (
                    <div className="mt-10">
                      <p
                        className="text-xs tracking-[0.18em] uppercase mb-4"
                        style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
                      >
                        {lang === "zh" ? "选择你的专精" : "Choose your specialization"}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {branches.map((s) => (
                          <div
                            key={s.en}
                            className="rounded-lg border p-5"
                            style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}
                          >
                            <div
                              className="text-base font-bold mb-1"
                              style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
                            >
                              {s[lang]}
                            </div>
                            <p
                              className="text-[0.85rem] leading-relaxed mb-3"
                              style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                            >
                              {lang === "zh" ? s.whyZh : s.whyEn}
                            </p>
                            <ul className="space-y-1.5">
                              {s.chapters.map((num) => {
                                const meta = getChapterMeta(num, lang);
                                if (!meta) return null;
                                return (
                                  <li key={num}>
                                    <Link
                                      href={chapterHref(lang, num)}
                                      className="text-[0.875rem] hover:opacity-70 transition-opacity"
                                      style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text)" }}
                                    >
                                      <span className="mr-2" style={{ color: "var(--theme-text-muted)" }}>
                                        {lang === "zh" ? `第 ${parseInt(num)} 章` : `Ch. ${parseInt(num)}`}
                                      </span>
                                      {meta.title}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
