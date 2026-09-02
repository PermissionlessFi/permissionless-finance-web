"use client";

import { useState, useEffect, type ReactNode } from "react";
import { COMMUNITY_LINKS } from "@/lib/external";
import { chapterHref } from "@/lib/keywords";
import { TopNav } from "./TopNav";
import { LogoLockup } from "./BrandLogo";
import { XIcon, GitHubIcon, BookIcon, GlobeIcon, HeartIcon } from "./BrandIcons";
import { Lang } from "@/lib/types";

/**
 * "Support the book." A free, CC BY 4.0 work sustained by attention and
 * contribution rather than a paywall — this page lays out the concrete ways to
 * help it reach further and keep going.
 */
export function SupportView() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "zh" || q === "en") setLang(q);
  }, []);

  const zh = lang === "zh";

  const ways: { icon: ReactNode; title: string; desc: string; cta: string; href: string; external?: boolean }[] = [
    {
      icon: <BookIcon size={24} />,
      title: zh ? "阅读与分享" : "Read & share",
      desc: zh
        ? "最朴素也最有力的支持:认真读它,把它转给可能需要的人,在你的写作里引用它。"
        : "The plainest and strongest support: read it closely, pass it to someone who needs it, and cite it in your own work.",
      cta: zh ? "开始阅读" : "Start reading",
      href: chapterHref(lang, "01"),
    },
    {
      icon: <XIcon size={22} />,
      title: zh ? "帮它传播" : "Spread the word",
      desc: zh
        ? "在 X 上关注并转发。一条真诚的推荐,比任何广告都更能让这本书遇到对的读者。"
        : "Follow and repost on X. One honest recommendation carries this book to the right readers better than any ad.",
      cta: zh ? "关注 @PermlessFi" : "Follow @PermlessFi",
      href: COMMUNITY_LINKS.x,
      external: true,
    },
    {
      icon: <GitHubIcon size={22} />,
      title: zh ? "参与共建" : "Contribute",
      desc: zh
        ? "发现一处错误、一个更准的术语、一段可改进的模拟器代码——都从 GitHub 的 issue 或 PR 开始。"
        : "A wrong number, a sharper term, a fix to a simulator — every improvement starts as a GitHub issue or PR.",
      cta: zh ? "前往 GitHub" : "Open GitHub",
      href: COMMUNITY_LINKS.github,
      external: true,
    },
    {
      icon: <GlobeIcon size={24} />,
      title: zh ? "翻译它" : "Translate it",
      desc: zh
        ? "让这本书说更多语言。认领一种语言,从前言和第一篇开始;译者将署名为该版本的作者。"
        : "Help the book speak more languages. Claim one, start with the preface and Part I — translators are credited as their edition's authors.",
      cta: zh ? "了解如何翻译" : "How to translate",
      href: COMMUNITY_LINKS.github,
      external: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-20 flex items-center justify-between h-[72px] px-4 backdrop-blur-sm"
        style={{ backgroundColor: "var(--theme-header-bg)", transition: "background-color 0.3s ease" }}
      >
        <LogoLockup markWidth={44} className="ml-2" />
        <TopNav lang={lang} onLangChange={setLang} />
      </header>

      <main className="flex-1 px-6 pb-24" style={{ color: "var(--theme-text)" }}>
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <h1
            className="text-4xl md:text-5xl font-bold mt-8 mb-4 leading-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
          >
            {zh ? "支持这本书" : "Support the book"}
          </h1>
          <p
            className="text-[1.02rem] leading-relaxed mb-3"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {zh
              ? "《无需许可的金融》是免费的,以 CC BY 4.0 开放许可发布——没有付费墙,没有广告。支撑它的不是订阅费,而是读者的注意力与共建。"
              : "Permissionless Finance is free, released under CC BY 4.0 — no paywall, no ads. What sustains it isn't a subscription fee, but readers' attention and contribution."}
          </p>
          <p
            className="text-[1.02rem] leading-relaxed mb-12"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {zh
              ? "如果它对你有价值,下面是几种让它走得更远的方式——每一种都真的有用。"
              : "If it's been worth your time, here are a few ways to help it travel further — each of them genuinely helps."}
          </p>

          {/* Ways to help */}
          <div className="grid sm:grid-cols-2 gap-4 mb-14">
            {ways.map((w) => (
              <div
                key={w.title}
                className="rounded-lg border p-6 flex flex-col"
                style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}
              >
                <div style={{ color: "var(--theme-heading)" }}>{w.icon}</div>
                <div
                  className="text-lg font-bold mt-3 mb-2"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
                >
                  {w.title}
                </div>
                <p
                  className="text-[0.9rem] leading-relaxed flex-1 mb-4"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                >
                  {w.desc}
                </p>
                <a
                  href={w.href}
                  {...(w.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="text-sm font-medium inline-flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
                >
                  {w.cta} <span aria-hidden="true">→</span>
                </a>
              </div>
            ))}
          </div>

          {/* Fund the work */}
          <section
            className="rounded-xl border p-7 mb-14"
            style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-1" style={{ color: "#a34a33" }}>
                <HeartIcon size={28} />
              </div>
              <div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
                >
                  {zh ? "赞助这项工作" : "Fund the work"}
                </h2>
                <p
                  className="text-[0.92rem] leading-relaxed mb-4"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                >
                  {zh
                    ? "写作、翻译、维护这个阅读器与背后的模拟器,都需要时间。如果你或你的机构愿意赞助它的持续,我们非常感激——它会直接转化为更多章节、更多语言、更好的工具。"
                    : "Writing, translating, and maintaining this reader and its simulators takes time. If you or your organization would like to sponsor its continuation, we're grateful — it turns directly into more chapters, more languages, and better tools."}
                </p>
                <a
                  href={COMMUNITY_LINKS.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm px-5 py-2.5 rounded-md transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-heading)", backgroundColor: "var(--theme-button-bg)", color: "var(--theme-button-text)" }}
                >
                  {zh ? "在 X 上联系我们" : "Reach out on X"}
                </a>
              </div>
            </div>
          </section>

          {/* Stay in the loop → Community owns subscribe */}
          <p
            className="text-[0.92rem] leading-relaxed"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {zh ? "想在新章节、新译本发布时收到通知?" : "Want a note when new chapters and translations ship? "}
            <a href={`/community?lang=${lang}`} className="underline" style={{ color: "var(--theme-heading)" }}>
              {zh ? "到社区订阅邮件更新" : "subscribe on the community page"}
            </a>
            {zh ? "。" : "."}
          </p>

          {/* Closing */}
          <p
            className="text-center text-sm mt-16 italic"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}
          >
            {zh
              ? "从许可到无需许可——知识也应如此。谢谢你成为其中的一份子。"
              : "From permission to permissionless — knowledge should be too. Thank you for being part of it."}
          </p>
        </div>
      </main>
    </div>
  );
}
