"use client";

import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";
import { chapterHref } from "@/lib/keywords";
import { hubHref } from "@/lib/hub-pages";
import { SITE_NAME } from "@/lib/site";
import { TopNav } from "./TopNav";
import { LogoLockup } from "./BrandLogo";
import { Lang } from "@/lib/types";
import { useHubLang } from "./useHubLang";

/**
 * Glossary reading view (/glossary and /zh/glossary). Shows ONE language at a
 * time, never both. `initialLang` comes from the route so the first HTML paint
 * is already in the right language. Old `?lang=zh` deep-links from chapter
 * "Key terms" are replaced with /zh/glossary, hash preserved. The DefinedTermSet
 * JSON-LD lives in the server page.
 */
export function GlossaryView({ initialLang = "en" }: { initialLang?: Lang }) {
  const { lang, onLangChange } = useHubLang(initialLang, "/glossary", "/zh/glossary");

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-20 flex items-center justify-between h-[72px] px-4 backdrop-blur-sm"
        style={{ backgroundColor: "var(--theme-header-bg)", transition: "background-color 0.3s ease" }}
      >
        <LogoLockup markWidth={44} className="ml-2" />
        <TopNav lang={lang} onLangChange={onLangChange} />
      </header>

      <main className="flex-1 px-6 pb-16" style={{ color: "var(--theme-text)" }}>
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
          >
            ← {SITE_NAME[lang]}
          </Link>

          <h1
            className="text-4xl font-bold mt-6 mb-2"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
          >
            {lang === "zh" ? "术语表" : "Glossary"}
          </h1>
          <p
            className="text-sm mb-14"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
          >
            {lang === "zh"
              ? "永续合约市场微观结构的核心术语。"
              : "The core vocabulary of perpetual-futures market microstructure."}
          </p>
          <p className="text-sm -mt-10 mb-14" style={{ fontFamily: "var(--font-heading)" }}>
            <Link href={hubHref(lang, "faq")} className="hover:opacity-70" style={{ color: "var(--theme-accent)" }}>
              {lang === "zh" ? "常见问题" : "FAQ"} →
            </Link>
          </p>

          <dl className="space-y-9">
            {GLOSSARY.map((t) => (
              <div key={t.id} id={t.id} className="border-l-2 pl-5 scroll-mt-24" style={{ borderColor: "var(--theme-border)" }}>
                <dt className="mb-1.5">
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text)" }}
                  >
                    {lang === "zh" ? t.zh : t.en}
                  </span>
                  {t.chapters[0] && (
                    <Link
                      href={chapterHref(lang, t.chapters[0])}
                      className="ml-2 text-xs align-middle hover:opacity-70"
                      style={{ color: "var(--theme-accent)" }}
                    >
                      {lang === "zh" ? `第 ${parseInt(t.chapters[0])} 章` : `ch.${parseInt(t.chapters[0])}`}&nbsp;→
                    </Link>
                  )}
                </dt>
                <dd
                  className="text-[0.95rem] leading-relaxed"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                >
                  {lang === "zh" ? t.defZh : t.defEn}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
    </div>
  );
}
