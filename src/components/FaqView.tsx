"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { chapterHref } from "@/lib/keywords";
import { SITE_NAME } from "@/lib/site";
import type { FaqSection } from "@/lib/beginner-faq";
import { TopNav } from "./TopNav";
import { LogoLockup } from "./BrandLogo";
import { Lang } from "@/lib/types";

/**
 * Beginner FAQ reading view (/faq). The data is resolved on the server from
 * faq.ts and glossary.ts and passed in as props, so only the curated subset
 * ships to the client. English by default; `?lang=zh` (or the settings toggle)
 * shows the Chinese source text where it exists. Every answer links to the
 * chapter it comes from.
 */
const noopSubscribe = () => () => {};

export function FaqView({ sections }: { sections: FaqSection[] }) {
  // ?lang=zh is read without a setState-in-effect: the server snapshot is
  // English (static HTML), the client snapshot reads the query string.
  const langParam = useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get("lang"),
    () => null
  );
  const [override, setLang] = useState<Lang | null>(null);
  const lang: Lang = override ?? (langParam === "zh" ? "zh" : "en");
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
          <Link
            href="/"
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
          >
            ← {SITE_NAME[lang]}
          </Link>

          <h1
            className="text-4xl font-bold mt-6 mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
          >
            {zh ? `${sections[0]?.titleZh ?? ""} FAQ` : "Perpetual Futures FAQ"}
          </h1>
          {!zh && (
            <p
              className="text-[0.95rem] leading-relaxed mb-8"
              style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
            >
              Short answers to the most common beginner questions about perpetual futures, taken from the
              book&apos;s chapters and glossary. Each answer links to the chapter that develops it in depth.
            </p>
          )}

          <nav aria-label="FAQ topics" className="mb-12">
            <ul className="flex flex-wrap gap-2 text-sm" style={{ fontFamily: "var(--font-heading)" }}>
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-block px-3 py-1 rounded-full border hover:opacity-70"
                    style={{ borderColor: "var(--theme-border)", color: "var(--theme-text-secondary)" }}
                  >
                    {zh ? s.titleZh : s.titleEn}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href={`/glossary${zh ? "?lang=zh" : ""}`}
                  className="inline-block px-3 py-1 rounded-full border hover:opacity-70"
                  style={{ borderColor: "var(--theme-border)", color: "var(--theme-accent)" }}
                >
                  {zh ? "Glossary" : "Full glossary"} →
                </Link>
              </li>
            </ul>
          </nav>

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="mb-14 scroll-mt-24">
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
              >
                {zh ? s.titleZh : s.titleEn}
              </h2>
              <div className="space-y-8">
                {s.items
                  .filter((it) => !zh || (it.qZh && it.aZh))
                  .map((it) => (
                    <div
                      key={it.anchor}
                      id={it.anchor}
                      className="border-l-2 pl-5 scroll-mt-24"
                      style={{ borderColor: "var(--theme-border)" }}
                    >
                      <div className="mb-1.5">
                        <h3
                          className="text-lg font-semibold"
                          style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text)" }}
                        >
                          {zh ? it.qZh : it.qEn}
                        </h3>
                      </div>
                      <div
                        className="text-[0.95rem] leading-relaxed"
                        style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                      >
                        <p>{zh ? it.aZh : it.aEn}</p>
                        <p className="mt-2 text-xs" style={{ fontFamily: "var(--font-heading)" }}>
                          <Link
                            href={chapterHref(lang, it.chapter)}
                            className="hover:opacity-70"
                            style={{ color: "var(--theme-accent)" }}
                          >
                            {zh
                              ? `${parseInt(it.chapter)}. ${it.chapterTitleZh}`
                              : `Chapter ${parseInt(it.chapter)}: ${it.chapterTitleEn}`}{" "}
                            →
                          </Link>
                          {it.termId && (
                            <Link
                              href={`/glossary${zh ? "?lang=zh" : ""}#${it.termId}`}
                              className="ml-3 hover:opacity-70"
                              style={{ color: "var(--theme-text-muted)" }}
                            >
                              Glossary →
                            </Link>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
