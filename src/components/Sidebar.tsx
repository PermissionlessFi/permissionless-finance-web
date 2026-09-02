"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { PARTS } from "@/lib/toc";
import { Lang } from "@/lib/types";
import { chapterHref } from "@/lib/keywords";
import { useTheme, THEMES, ThemeId } from "@/lib/theme";

const NUM_WORDS_ZH = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十",
  "三十一", "三十二", "三十三"];

const NUM_WORDS_EN = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
  "Twenty-One", "Twenty-Two", "Twenty-Three", "Twenty-Four", "Twenty-Five", "Twenty-Six", "Twenty-Seven", "Twenty-Eight", "Twenty-Nine", "Thirty",
  "Thirty-One", "Thirty-Two", "Thirty-Three"];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  currentChapter?: string;
}

export function Sidebar({ open, onClose, lang, currentChapter }: SidebarProps) {
  const { theme, themeId, setThemeId } = useTheme();
  const otherLang = lang === "zh" ? "en" : "zh";
  const asideRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // A11y: dialog semantics — move focus in on open, trap Tab, Escape to close,
  // restore focus to the trigger on close. The sidebar mounts on open and
  // unmounts on close, so this mount/unmount effect maps cleanly to open/close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const aside = asideRef.current;

    const getFocusable = () =>
      aside
        ? Array.from(
            aside.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null)
        : [];

    getFocusable()[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab") {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <aside
      ref={asideRef}
      role="dialog"
      aria-modal="true"
      aria-label={lang === "zh" ? "目录" : "Table of contents"}
      className="fixed z-40 top-0 left-0 h-full w-[380px] max-w-[90vw] flex flex-col shadow-lg"
      style={{ backgroundColor: theme.sidebarBg, transition: "background-color 0.3s ease" }}
    >
      {/* Close button */}
      <div className="p-5">
        <button
          onClick={onClose}
          className="p-2 rounded-md transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="w-6 h-6" style={{ color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="text-center px-8 mb-2">
        <h2
          className="text-xs tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--font-sans)", color: theme.textSecondary }}
        >
          {lang === "zh" ? "目 录" : "TABLE OF CONTENTS"}
        </h2>
        <div className="w-12 h-px mx-auto mt-6" style={{ backgroundColor: theme.border }} />
      </div>

      {/* Chapter list */}
      <nav className="flex-1 overflow-y-auto px-8 py-6">
        {PARTS.map((part) => (
          <div key={part.index}>
            {part.chapters.map((ch) => {
              const num = parseInt(ch.num);
              const isActive = ch.num === currentChapter;
              return (
                <Link
                  key={ch.num}
                  href={chapterHref(lang, ch.num)}
                  onClick={onClose}
                  className={`block text-center py-5 transition-colors ${
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {Number.isFinite(num) && (
                    <span
                      className="block text-xs tracking-[0.15em] mb-1"
                      style={{ fontFamily: "var(--font-heading)", color: theme.textMuted }}
                    >
                      {lang === "zh" ? `第${NUM_WORDS_ZH[num]}章` : `Chapter ${NUM_WORDS_EN[num]}`}
                    </span>
                  )}
                  <span
                    className="block text-base leading-snug"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? theme.text : theme.textSecondary,
                    }}
                  >
                    {ch.title[lang]}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Language + Theme — one row */}
      <div className="px-6 py-5 flex items-center justify-center gap-4">
        <Link
          href={chapterHref(otherLang, currentChapter || "01")}
          className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span style={{ color: lang === "zh" ? theme.text : theme.textMuted, fontWeight: lang === "zh" ? 700 : 400 }}>ZH</span>
          <span style={{ color: theme.border }}>|</span>
          <span style={{ color: lang === "en" ? theme.text : theme.textMuted, fontWeight: lang === "en" ? 700 : 400 }}>EN</span>
        </Link>

        <span style={{ color: theme.border }}>·</span>

        <div className="flex items-center gap-2">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const t = THEMES[id];
            const active = themeId === id;
            return (
              <button
                key={id}
                onClick={() => setThemeId(id)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${active ? "scale-110" : "opacity-50 hover:opacity-100"}`}
                style={{
                  backgroundColor: t.bg,
                  borderColor: active ? t.accent : t.border,
                }}
                title={lang === "zh" ? t.label.zh : t.label.en}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}
