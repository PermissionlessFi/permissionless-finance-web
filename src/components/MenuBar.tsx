"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { PILLARS } from "@/lib/sections";
import { Lang } from "@/lib/types";

/**
 * Persistent top-right menu bar. Four pillars as level-1 entries; hovering one
 * opens its dropdown (level-2 items with title + description); moving the mouse
 * away auto-closes it. Fade + slide animation, Codex-style.
 */
export function MenuBar({ lang }: { lang: Lang }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  return (
    <div className="flex items-center">
      {PILLARS.map((p) => {
        const isOpen = open === p.key;
        return (
          <div
            key={p.key}
            className="relative"
            onMouseEnter={() => openMenu(p.key)}
            onMouseLeave={scheduleClose}
          >
            <button
              onClick={() => (isOpen ? setOpen(null) : openMenu(p.key))}
              className="nav-hover flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                fontFamily: "var(--font-heading)",
                color: isOpen ? theme.text : theme.textSecondary,
                backgroundColor: isOpen ? theme.bgSecondary : "transparent",
              }}
              aria-haspopup="menu"
              aria-expanded={isOpen}
            >
              {lang === "zh" ? p.zh : p.en}
              <svg
                className="w-3 h-3 transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(180deg)" : "none", color: theme.textMuted }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* dropdown — always mounted for enter/exit animation; top-full+pt bridges the hover gap */}
            <div
              role="menu"
              aria-hidden={!isOpen}
              className="absolute right-0 top-full pt-2 transition-all duration-200 ease-out"
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? "translateY(0)" : "translateY(-6px)",
                pointerEvents: isOpen ? "auto" : "none",
              }}
            >
              <div
                className="w-72 rounded-2xl border shadow-xl overflow-hidden py-1.5"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                {p.items.map((it) => {
                  const label = lang === "zh" ? it.zh : it.en;
                  const desc = lang === "zh" ? it.descZh : it.descEn;
                  const soon = !it.href;
                  const body = (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: soon ? theme.textMuted : theme.text, fontFamily: "var(--font-heading)" }}>
                          {label}
                        </span>
                        {soon && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ border: `1px solid ${theme.border}`, color: theme.textMuted }}>
                            {lang === "zh" ? "即将" : "Soon"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5 leading-snug" style={{ color: theme.textMuted }}>{desc}</div>
                    </>
                  );
                  return soon ? (
                    <div key={it.key} className="px-4 py-2 cursor-default select-none">{body}</div>
                  ) : (
                    <Link key={it.key} href={it.href!(lang)} onClick={() => setOpen(null)} className="nav-hover block px-4 py-2">
                      {body}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
