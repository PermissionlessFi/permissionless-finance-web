"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme, THEMES, ThemeId } from "@/lib/theme";
import { Lang } from "@/lib/types";

/**
 * Gear button in the top nav. Opens a small panel to choose language and theme.
 * Language is caller-controlled (homepage toggles state; chapter pages navigate
 * to the other-language route); theme is global via ThemeProvider.
 */
export function SettingsButton({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  const { theme, themeId, setThemeId } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-md transition-colors"
        aria-label={lang === "zh" ? "设置" : "Settings"}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg className="w-5 h-5" style={{ color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7 7 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a7 7 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a7 7 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a7 7 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className="absolute right-0 top-full pt-2 transition-all duration-200 ease-out"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-6px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div
          className="w-52 rounded-2xl border shadow-xl p-4"
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
          {/* Language */}
          <div
            className="text-[10px] tracking-[0.15em] uppercase mb-2"
            style={{ fontFamily: "var(--font-heading)", color: theme.textMuted }}
          >
            {lang === "zh" ? "语言" : "Language"}
          </div>
          <div className="flex gap-2 mb-4">
            {(["en", "zh"] as Lang[]).map((l) => {
              const active = lang === l;
              return (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  className="flex-1 px-3 py-1.5 rounded-md text-sm transition-colors"
                  style={{
                    fontFamily: "var(--font-heading)",
                    backgroundColor: active ? theme.bgSecondary : "transparent",
                    color: active ? theme.text : theme.textMuted,
                    border: `1px solid ${active ? theme.border : "transparent"}`,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {l === "en" ? "English" : "中文"}
                </button>
              );
            })}
          </div>

          {/* Theme */}
          <div
            className="text-[10px] tracking-[0.15em] uppercase mb-2"
            style={{ fontFamily: "var(--font-heading)", color: theme.textMuted }}
          >
            {lang === "zh" ? "主题" : "Theme"}
          </div>
          <div className="flex items-center gap-3">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => {
              const t = THEMES[id];
              const active = themeId === id;
              return (
                <button
                  key={id}
                  onClick={() => setThemeId(id)}
                  title={lang === "zh" ? t.label.zh : t.label.en}
                  aria-label={lang === "zh" ? t.label.zh : t.label.en}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${active ? "scale-110" : "opacity-50 hover:opacity-100"}`}
                  style={{ backgroundColor: t.bg, borderColor: active ? t.accent : t.border }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
