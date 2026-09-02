"use client";

import { useState, useEffect, type ReactNode } from "react";
import { COMMUNITY_LINKS } from "@/lib/external";
import { TopNav } from "./TopNav";
import { LogoLockup } from "./BrandLogo";
import { XIcon, GitHubIcon } from "./BrandIcons";
import { SubscribeForm } from "./SubscribeForm";
import { Lang } from "@/lib/types";

/**
 * Community front door. Real-time discussion lives off-site (Discord home,
 * X as distribution); this page is the canonical entry. Every card reads its
 * URL from external.ts — an empty URL renders the "coming soon" state, so
 * filling in one constant activates the entry point site-wide.
 */
export function CommunityView() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "zh" || q === "en") setLang(q);
  }, []);

  const zh = lang === "zh";

  const channels: {
    key: string;
    name: string;
    icon: ReactNode;
    desc: string;
    href: string;
    cta: string;
  }[] = [
    {
      key: "x",
      name: "X",
      icon: <XIcon size={26} />,
      desc: zh
        ? "作者与社区的公开广播:新章节、勘误、研究笔记与讨论精华。"
        : "The public broadcast: new material, errata, research notes, and the best of the discussion.",
      href: COMMUNITY_LINKS.x,
      cta: zh ? "关注 @PermlessFi" : "Follow @PermlessFi",
    },
    {
      key: "github",
      name: "GitHub",
      icon: <GitHubIcon size={26} />,
      desc: zh
        ? "项目的开源之家。勘误、议题、翻译与贡献都从这里开始。"
        : "The project's open-source home. Errata, issues, translations, and contributions start here.",
      href: COMMUNITY_LINKS.github,
      cta: zh ? "前往 GitHub" : "Open GitHub",
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

      <main className="flex-1 px-6 pb-20" style={{ color: "var(--theme-text)" }}>
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-4xl font-bold mt-6 mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
          >
            {zh ? "社区" : "Community"}
          </h1>
          <p
            className="text-[0.95rem] leading-relaxed mb-12"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {zh
              ? "这本书是免费且开放的;围绕它的社区也是。无论你走交易、量化还是构建这条路,这里是同路人聚集的地方。"
              : "The book is free and open; so is the community around it. Whether your path is trading, quant research, or building, this is where fellow travelers gather."}
          </p>

          {/* Channels */}
          <div className="grid sm:grid-cols-2 gap-4 mb-16">
            {channels.map((c) => {
              const live = c.href !== "";
              return (
                <div
                  key={c.key}
                  className="rounded-lg border p-5 flex flex-col"
                  style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}
                >
                  <div
                    className="flex items-center gap-2.5 text-lg font-bold mb-2"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
                  >
                    <span style={{ color: "var(--theme-heading)" }}>{c.icon}</span>
                    {c.name}
                  </div>
                  <p
                    className="text-[0.85rem] leading-relaxed flex-1 mb-4"
                    style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                  >
                    {c.desc}
                  </p>
                  {live ? (
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-center text-sm px-4 py-2 rounded-md transition-colors"
                      style={{
                        fontFamily: "var(--font-heading)",
                        backgroundColor: "var(--theme-button-bg)",
                        color: "var(--theme-button-text)",
                      }}
                    >
                      {c.cta}
                    </a>
                  ) : (
                    <span
                      className="inline-block text-center text-sm px-4 py-2 rounded-md border"
                      style={{
                        fontFamily: "var(--font-heading)",
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-text-muted)",
                      }}
                    >
                      {zh ? "筹备中" : "Coming soon"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Newsletter */}
          <section id="newsletter" className="mb-16 scroll-mt-24">
            <h2
              className="text-xl font-bold mb-2"
              style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
            >
              {zh ? "订阅更新" : "Stay updated"}
            </h2>
            <p
              className="text-[0.9rem] leading-relaxed mb-4"
              style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
            >
              {zh
                ? "留下邮箱,新章节、勘误与研究笔记会寄给你。偏好自动化?RSS 也一直可用。"
                : "Leave your email and new chapters, errata, and research notes come to you. Prefer automation? RSS is always live too."}
            </p>
            <SubscribeForm lang={lang} />
            <p className="text-xs mt-3" style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}>
              {zh ? "或 " : "Or "}
              <a href="/feed.xml" className="underline" style={{ color: "var(--theme-text-secondary)" }}>
                {zh ? "订阅 RSS" : "subscribe via RSS"}
              </a>
              {zh ? "。绝不发垃圾邮件,随时可退订。" : ". No spam, unsubscribe anytime."}
            </p>
          </section>

          {/* Want to help? → Support */}
          <section
            className="rounded-lg border p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between"
            style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}
          >
            <div>
              <div
                className="text-base font-bold mb-1"
                style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
              >
                {zh ? "想为这本书出一份力?" : "Want to help the book?"}
              </div>
              <p
                className="text-[0.9rem] leading-relaxed"
                style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
              >
                {zh
                  ? "分享、勘误、翻译、赞助——所有支持方式都在支持页。"
                  : "Share it, fix errata, translate it, sponsor it — every way to help lives on the Support page."}
              </p>
            </div>
            <a
              href={`/support?lang=${lang}`}
              className="shrink-0 inline-block text-center text-sm px-5 py-2.5 rounded-md transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ fontFamily: "var(--font-heading)", backgroundColor: "var(--theme-button-bg)", color: "var(--theme-button-text)" }}
            >
              {zh ? "支持我们 →" : "Support the book →"}
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
