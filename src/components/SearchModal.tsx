"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Meilisearch } from "meilisearch";
import { useTheme } from "@/lib/theme";
import { PILLARS, type Group } from "@/lib/sections";
import { Lang } from "@/lib/types";

const HOST = process.env.NEXT_PUBLIC_MEILI_HOST;
const KEY = process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY;
const INDEX = process.env.NEXT_PUBLIC_MEILI_INDEX || "permissionless-finance";
const client = HOST && KEY ? new Meilisearch({ host: HOST, apiKey: KEY }) : null;

interface Hit {
  id: string; url: string; chapterTitle: string; sectionTitle: string;
  _formatted?: { content?: string; sectionTitle?: string };
}

/** Meili highlight sentinels -> escaped React <mark> nodes. */
function HL({ text }: { text: string }) {
  const parts = text.split(/(\[\[HL\]\]|\[\[\/HL\]\])/g);
  let on = false;
  return (
    <>
      {parts.map((p, i) => {
        if (p === "[[HL]]") { on = true; return null; }
        if (p === "[[/HL]]") { on = false; return null; }
        if (!p) return null;
        return on ? <mark key={i} className="meili-hl">{p}</mark> : <span key={i}>{p}</span>;
      })}
    </>
  );
}

const PILLAR_ICON: Record<string, React.ReactNode> = {
  learn: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  community: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />,
  research: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />,
  about: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />,
};

function Kbd({ children, border, color }: { children: React.ReactNode; border: string; color: string }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded border text-[11px] font-sans leading-none"
      style={{ borderColor: border, color }}>{children}</kbd>
  );
}

type TabKey = Group;

export function SearchModal({ lang, isOpen, onClose }: { lang: Lang; isOpen: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<TabKey>("book");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const divider = `color-mix(in srgb, ${theme.border} 50%, transparent)`;

  const TABS: { key: TabKey; label: string; color: string }[] = [
    { key: "book",  label: lang === "zh" ? "书籍" : "Book",  color: "#b0703b" },
    { key: "other", label: lang === "zh" ? "其他" : "Other", color: "#8a7c69" },
  ];

  const quickItems = useMemo(
    () => PILLARS.flatMap((p) => p.items.map((it) => ({ pillar: p, it }))).filter((x) => x.it.group === tab),
    [tab]
  );

  const searching = q.trim().length > 0;
  const rows: { href?: string }[] = searching
    ? hits.map((h) => ({ href: h.url }))
    : quickItems.map((x) => ({ href: x.it.href?.(lang) }));

  useEffect(() => {
    if (isOpen) { setQ(""); setHits([]); setActive(0); setTab("book"); setTimeout(() => inputRef.current?.focus(), 10); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !searching || !client) { setHits([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await client.index(INDEX).search(q, {
          limit: 12, filter: `lang = "${lang}"`,
          attributesToHighlight: ["content", "sectionTitle"],
          highlightPreTag: "[[HL]]", highlightPostTag: "[[/HL]]",
          attributesToCrop: ["content"], cropLength: 28,
        });
        setHits(res.hits as Hit[]); setActive(0);
      } catch { setHits([]); }
    }, 150);
    return () => clearTimeout(t);
  }, [q, isOpen, lang, searching]);

  const go = useCallback((href?: string) => { if (!href) return; onClose(); router.push(href); }, [onClose, router]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, rows.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); go(rows[active]?.href); }
      else if (e.key === "Tab") {
        e.preventDefault();
        setTab((cur) => (cur === "book" ? "other" : "book"));
        setActive(0);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, rows, active, go]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-[fadeIn_0.14s_ease-out]"
        style={{ backgroundColor: theme.bg, borderColor: theme.border }}>

        {/* input */}
        <div className="flex items-center gap-2.5 px-4 h-12">
          <svg className="w-4.5 h-4.5 shrink-0" width={18} height={18} style={{ color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "zh" ? "搜索本书…" : "Search…"}
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: theme.text, fontFamily: "var(--font-heading)" }} />
          <Kbd border={divider} color={theme.textMuted}>esc</Kbd>
        </div>

        {/* tabs */}
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <button key={t.key} onClick={() => { setTab(t.key); setActive(0); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm whitespace-nowrap transition-colors"
                style={{ backgroundColor: on ? theme.bgSecondary : "transparent", color: on ? theme.text : theme.textMuted, fontFamily: "var(--font-heading)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: on ? t.color : theme.textMuted, opacity: on ? 1 : 0.5 }} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* body */}
        <div className="max-h-[46vh] overflow-y-auto toc-scroll py-1.5">
          {searching ? (
            hits.length === 0 ? (
              <div className="px-4 py-5 text-sm text-center" style={{ color: theme.textMuted }}>
                {lang === "zh" ? "没有找到结果" : "No results"}
              </div>
            ) : (
              hits.map((h, i) => (
                <button key={h.id} onClick={() => go(h.url)} onMouseEnter={() => setActive(i)}
                  className="flex items-start w-full text-left gap-3 px-4 py-2 transition-colors"
                  style={{ backgroundColor: i === active ? theme.bgSecondary : "transparent" }}>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate" style={{ color: theme.text, fontFamily: "var(--font-heading)" }}>
                      <HL text={h._formatted?.sectionTitle || h.sectionTitle} />
                    </div>
                    {h._formatted?.content && (
                      <div className="text-xs mt-0.5 line-clamp-1" style={{ color: theme.textMuted }}>
                        <HL text={h._formatted.content} />
                      </div>
                    )}
                    <div className="text-[11px] mt-0.5" style={{ color: theme.textMuted, opacity: 0.8 }}>{h.chapterTitle}</div>
                  </div>
                  <span className="text-sm mt-0.5" style={{ color: theme.textMuted }}>→</span>
                </button>
              ))
            )
          ) : (
            <>
              <div className="px-4 pt-1.5 pb-1 text-[11px] tracking-[0.16em] uppercase" style={{ color: theme.textMuted, fontFamily: "var(--font-heading)" }}>
                {lang === "zh" ? "快速导航" : "Quick navigation"}
              </div>
              {quickItems.map((x, i) => {
                const soon = !x.it.href;
                const label = lang === "zh" ? x.it.zh : x.it.en;
                const desc = lang === "zh" ? x.it.descZh : x.it.descEn;
                const href = x.it.href?.(lang);
                return (
                  <button key={x.pillar.key + x.it.key} disabled={soon}
                    onClick={() => go(href)} onMouseEnter={() => setActive(i)}
                    className="flex items-center w-full text-left gap-3 px-4 py-2 transition-colors disabled:cursor-default"
                    style={{ backgroundColor: i === active && !soon ? theme.bgSecondary : "transparent" }}>
                    <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{ borderColor: divider, color: x.pillar.color }}>
                      <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">{PILLAR_ICON[x.pillar.key]}</svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: soon ? theme.textMuted : theme.text, fontFamily: "var(--font-heading)" }}>{label}</span>
                        {soon && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${divider}`, color: theme.textMuted }}>{lang === "zh" ? "即将" : "Soon"}</span>}
                      </span>
                      <span className="block text-xs mt-0.5" style={{ color: theme.textMuted }}>{desc}</span>
                    </span>
                    {!soon && <span className="text-sm" style={{ color: theme.textMuted }}>→</span>}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center gap-4 px-4 h-9 border-t text-xs" style={{ borderColor: divider, color: theme.textMuted }}>
          <span className="flex items-center gap-1.5"><Kbd border={divider} color={theme.textMuted}>↑↓</Kbd>{lang === "zh" ? "导航" : "navigate"}</span>
          <span className="flex items-center gap-1.5"><Kbd border={divider} color={theme.textMuted}>↵</Kbd>{lang === "zh" ? "打开" : "open"}</span>
          <span className="flex items-center gap-1.5"><Kbd border={divider} color={theme.textMuted}>tab</Kbd>{lang === "zh" ? "切换" : "switch"}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
