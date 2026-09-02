"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PARTS } from "@/lib/toc";
import { chapterHref } from "@/lib/keywords";
import { CHAPTER_ABSTRACTS } from "@/lib/chapter-abstracts";
import { SITE_NAME } from "@/lib/site";
import { TopNav } from "./TopNav";
import { LogoLockup } from "./BrandLogo";
import { Lang } from "@/lib/types";

function firstSentence(t: string): string {
  const m = t.match(/^.*?[.。](?=\s|$)/);
  return (m ? m[0] : t).trim();
}

/** Full table of contents — every chapter grouped by part with a one-line
 *  definition summary. Puts all 33 chapters two hops from home (a strong
 *  internal-linking / crawl-depth signal). Language-aware like the glossary. */
export function ContentsView() {
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

      <main className="flex-1 px-6 pb-16" style={{ color: "var(--theme-text)" }}>
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
          >
            ← {SITE_NAME.en}
          </Link>

          <h1
            className="text-4xl font-bold mt-6 mb-2"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
          >
            {lang === "zh" ? "目录" : "Contents"}
          </h1>
          <p
            className="text-sm mb-14"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
          >
            {lang === "zh" ? "全书三十三章，十个篇章。" : "Thirty-three chapters across ten parts."}
          </p>

          <div className="space-y-12">
            {PARTS.map((part) => (
              <section key={part.index}>
                <h2
                  className="text-xs tracking-[0.18em] uppercase mb-5 pb-2 border-b"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)", borderColor: "var(--theme-border)" }}
                >
                  {part.title[lang]}
                </h2>
                <ul className="space-y-5">
                  {part.chapters.map((ch) => {
                    const abs = CHAPTER_ABSTRACTS[ch.num]?.[lang];
                    const blurb = abs ? firstSentence(abs) : "";
                    const isNumbered = /^\d+$/.test(ch.num);
                    return (
                      <li key={ch.num}>
                        <Link href={chapterHref(lang, ch.num)} className="group block hover:opacity-80 transition-opacity">
                          <div style={{ fontFamily: "var(--font-heading)" }}>
                            {isNumbered && (
                              <span className="text-sm mr-2" style={{ color: "var(--theme-text-muted)" }}>
                                {lang === "zh" ? `第 ${parseInt(ch.num)} 章` : `Ch. ${parseInt(ch.num)}`}
                              </span>
                            )}
                            <span className="text-[1.05rem]" style={{ color: "var(--theme-text)" }}>
                              {ch.title[lang]}
                            </span>
                          </div>
                          {blurb && (
                            <p
                              className="text-[0.9rem] leading-relaxed mt-1"
                              style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                            >
                              {blurb}
                            </p>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
