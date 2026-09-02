"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DOWNLOADS } from "@/lib/external";
import { TopNav } from "./TopNav";
import { LogoLockup } from "./BrandLogo";
import { Lang } from "@/lib/types";

/**
 * Download the book — PDF and EPUB, both languages. Slots read from
 * external.ts: an empty href renders the "in production" state. License is
 * CC BY 4.0; the page links the license and changelog rather than repeating
 * them.
 */
export function DownloadView() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "zh" || q === "en") setLang(q);
  }, []);

  const zh = lang === "zh";

  // Edition names follow the interface language — never mix scripts in one list.
  const editionName: Record<Lang, string> = zh
    ? { en: "英文版", zh: "中文版" }
    : { en: "English", zh: "Chinese" };

  const slots: { format: "PDF" | "EPUB"; edition: Lang; label: string }[] = (
    [
      ["PDF", "en"],
      ["PDF", "zh"],
      ["EPUB", "en"],
      ["EPUB", "zh"],
    ] as const
  ).map(([format, edition]) => ({
    format,
    edition,
    label: `${editionName[edition]} · ${format}`,
  }));

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
            {zh ? "下载全书" : "Download the Book"}
          </h1>
          <p
            className="text-[0.95rem] leading-relaxed mb-10"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {zh
              ? "全书三十三章,免费下载,开放许可(CC BY 4.0)。在线阅读始终是最新版本;离线版本随更新日志同步。"
              : "All thirty-three chapters, free to download under CC BY 4.0. The web version is always current; offline editions track the changelog."}
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {slots.map((s) => {
              const file = DOWNLOADS[s.format.toLowerCase() as "pdf" | "epub"][s.edition];
              const live = file.href !== "";
              return (
                <div
                  key={s.label}
                  className="rounded-lg border p-5 flex items-center justify-between gap-4"
                  style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}
                >
                  <div>
                    <div
                      className="text-base font-bold"
                      style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
                    >
                      {s.label}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
                    >
                      {live
                        ? `${file.size} · ${zh ? "更新于" : "Updated"} ${file.updated}`
                        : zh
                          ? "制作中"
                          : "In production"}
                    </div>
                  </div>
                  {live ? (
                    <a
                      href={file.href}
                      download
                      className="shrink-0 text-sm px-4 py-2 rounded-md transition-colors"
                      style={{
                        fontFamily: "var(--font-heading)",
                        backgroundColor: "var(--theme-button-bg)",
                        color: "var(--theme-button-text)",
                      }}
                    >
                      {zh ? "下载" : "Download"}
                    </a>
                  ) : (
                    <span
                      className="shrink-0 text-sm px-4 py-2 rounded-md border"
                      style={{
                        fontFamily: "var(--font-heading)",
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-text-muted)",
                      }}
                    >
                      {zh ? "即将上线" : "Soon"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="text-[0.875rem] leading-relaxed space-y-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            <p>
              {zh ? "许可与引用方式见" : "License and citation guidance: "}
              <Link
                href={`/${lang}/license`}
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                {zh ? "「许可」页" : "the License page"}
              </Link>
              {zh ? ";版本历史见" : "; version history: "}
              <Link
                href="/changelog"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                {zh ? "更新日志" : "the changelog"}
              </Link>
              。
            </p>
            <p>
              {zh
                ? "各电子书平台(Apple Books、Kobo 等)的发行版本正在准备中。"
                : "Editions for ebook platforms (Apple Books, Kobo, and others) are in preparation."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
