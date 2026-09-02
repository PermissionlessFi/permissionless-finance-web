"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme";
import { SearchModal } from "./SearchModal";
import { Lang } from "@/lib/types";

/** Search icon in the top bar — opens the full command-palette modal (⌘K). */
export function SearchBox({ lang }: { lang: Lang }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="nav-hover p-2 rounded-md transition-colors"
        style={{ color: theme.textMuted }}
        aria-label={lang === "zh" ? "搜索 (⌘K)" : "Search (⌘K)"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
      </button>
      <SearchModal lang={lang} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
