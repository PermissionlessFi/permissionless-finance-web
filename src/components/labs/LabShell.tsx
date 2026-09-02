"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Lab } from "@/lib/labs";
import { getChapterMeta } from "@/lib/toc";
import { chapterHref } from "@/lib/keywords";
import { TopNav } from "../TopNav";
import { LogoLockup } from "../BrandLogo";
import { Lang } from "@/lib/types";
import { Slider } from "../ui/slider";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

/**
 * Shared chrome for every lab page: header, title/story, book-loop chapter
 * links, copy-shareable-link button, and the model-honesty accordion.
 * The simulator itself renders as children.
 */

/** Read initial params from the URL once; push updates back debounced so a
 *  copied URL reproduces the exact state (share mechanism #3). */
export function useLabParams<T extends Record<string, string | number>>(
  defaults: T
): [T, (patch: Partial<T>) => void, Lang, (l: Lang) => void] {
  const [params, setParams] = useState<T>(defaults);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const l = q.get("lang");
    if (l === "zh" || l === "en") setLang(l);
    const next: Record<string, string | number> = { ...defaults };
    let touched = false;
    for (const key of Object.keys(defaults)) {
      const v = q.get(key);
      if (v === null) continue;
      touched = true;
      next[key] = typeof defaults[key] === "number" ? Number(v) : v;
    }
    if (touched) setParams(next as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (patch: Partial<T>) => {
      setParams((prev) => {
        const next = { ...prev, ...patch };
        const q = new URLSearchParams(window.location.search);
        for (const [k, v] of Object.entries(next)) q.set(k, String(v));
        history.replaceState(null, "", `${window.location.pathname}?${q}`);
        return next;
      });
    },
    []
  );

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    const q = new URLSearchParams(window.location.search);
    q.set("lang", l);
    history.replaceState(null, "", `${window.location.pathname}?${q}`);
  }, []);

  return [params, update, lang, changeLang];
}

export function CopyLinkButton({ lang }: { lang: Lang }) {
  const [copied, setCopied] = useState(false);
  const zh = lang === "zh";
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      style={{ fontFamily: "var(--font-heading)", color: copied ? "var(--theme-accent)" : "var(--theme-text-secondary)" }}
    >
      {copied ? (zh ? "已复制,发给朋友吧" : "Copied — send it to someone") : zh ? "复制当前参数链接" : "Copy link to this setup"}
    </Button>
  );
}

export function LabShell({
  lab,
  lang,
  onLangChange,
  assumptionsZh,
  assumptionsEn,
  children,
}: {
  lab: Lab;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  /** model-honesty bullet list */
  assumptionsZh: string[];
  assumptionsEn: string[];
  children: React.ReactNode;
}) {
  const zh = lang === "zh";
  const assumptions = zh ? assumptionsZh : assumptionsEn;

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-20 flex items-center justify-between h-[72px] px-4 backdrop-blur-sm"
        style={{ backgroundColor: "var(--theme-header-bg)", transition: "background-color 0.3s ease" }}
      >
        <LogoLockup markWidth={44} className="ml-2" />
        <TopNav lang={lang} onLangChange={onLangChange} />
      </header>

      <main className="flex-1 px-4 sm:px-6 pb-20" style={{ color: "var(--theme-text)" }}>
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/labs?lang=${lang}`}
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
          >
            ← {zh ? "实验室" : "Labs"}
          </Link>

          <h1
            className="text-3xl sm:text-4xl font-bold mt-5 mb-1"
            style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
          >
            {lab[lang]}
          </h1>
          <p
            className="text-[0.95rem] mb-8"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {zh ? lab.storyZh : lab.storyEn}
          </p>

          {children}

          {/* Book loop */}
          <div className="mt-12 pt-6 border-t max-w-3xl" style={{ borderColor: "var(--theme-border)" }}>
            <p
              className="text-xs tracking-[0.18em] uppercase mb-3"
              style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
            >
              {zh ? "想知道为什么?机制原文:" : "Want the why? The mechanism, in full:"}
            </p>
            <ul className="space-y-1.5 mb-6">
              {lab.chapters.map((num) => {
                const meta = getChapterMeta(num, lang);
                if (!meta) return null;
                return (
                  <li key={num}>
                    <Link
                      href={chapterHref(lang, num)}
                      className="text-[0.9rem] hover:opacity-70 transition-opacity"
                      style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text)" }}
                    >
                      <span className="mr-2" style={{ color: "var(--theme-text-muted)" }}>
                        {zh ? `第 ${parseInt(num)} 章` : `Ch. ${parseInt(num)}`}
                      </span>
                      {meta.title} →
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Model honesty */}
            <Accordion type="single" collapsible>
              <AccordionItem value="assumptions" className="border-none">
                <AccordionTrigger
                  className="py-1 text-sm font-normal hover:no-underline hover:opacity-70"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
                >
                  {zh ? "模型假设与简化(这是教学玩具,不是回测)" : "Model assumptions & simplifications (a teaching toy, not a backtest)"}
                </AccordionTrigger>
                <AccordionContent>
                  <ul
                    className="mt-1 space-y-1.5 text-[0.85rem] leading-relaxed list-disc pl-5"
                    style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                  >
                    {assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Shared slider row — shadcn Slider under our label/readout API. Radix
 *  gives keyboard/touch a11y; per-slider accent rebinds --primary locally. */
export function ParamSlider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span
          className="text-[0.8rem]"
          style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-secondary)" }}
        >
          {label}
        </span>
        <span
          className="text-[0.85rem] font-bold tabular-nums"
          style={{ fontFamily: "var(--font-heading)", color: accent ?? "var(--theme-heading)" }}
        >
          {display}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        aria-label={label}
        style={accent ? ({ "--primary": accent } as React.CSSProperties) : undefined}
      />
    </div>
  );
}

/** "Download share card" — renders the current outcome to a PNG (and tries
 *  the clipboard), so a striking result travels to X with the URL on it. */
export function ShareCardButton({
  lang,
  getData,
  filename,
}: {
  lang: Lang;
  getData: () => Omit<import("./shareCard").ShareCardData, "zh">;
  filename: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const zh = lang === "zh";
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        setState("busy");
        try {
          const { downloadShareCard } = await import("./shareCard");
          await downloadShareCard({ ...getData(), zh }, filename);
          setState("done");
          setTimeout(() => setState("idle"), 1800);
        } catch {
          setState("idle");
        }
      }}
      disabled={state === "busy"}
      style={{ fontFamily: "var(--font-heading)", color: state === "done" ? "var(--theme-accent)" : "var(--theme-text-secondary)" }}
    >
      {state === "done"
        ? zh ? "已保存(也在剪贴板)" : "Saved (and on your clipboard)"
        : state === "busy"
          ? zh ? "生成中…" : "Rendering…"
          : zh ? "下载分享图" : "Download share card"}
    </Button>
  );
}

/** Guided micro-experiments — one click sets the parameters, then tells the
 *  player what to watch for (and which chapter explains it). Converts free
 *  play into directed learning. */
export interface TryThisItem {
  zh: string;
  en: string;
  observeZh: string;
  observeEn: string;
  params: Record<string, string | number>;
}

export function TryThis({
  lang,
  items,
  onApply,
}: {
  lang: Lang;
  items: TryThisItem[];
  onApply: (params: Record<string, string | number>) => void;
}) {
  const zh = lang === "zh";
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="mb-8">
      <p
        className="text-xs tracking-[0.18em] uppercase mb-2"
        style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
      >
        {zh ? "接下来试试" : "Try next"}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => {
              onApply(it.params);
              setActive(i);
            }}
            className="text-[0.8rem] px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
            style={{
              fontFamily: "var(--font-heading)",
              borderColor: active === i ? "var(--theme-accent)" : "var(--theme-border)",
              color: active === i ? "var(--theme-heading)" : "var(--theme-text-secondary)",
              backgroundColor: active === i ? "var(--theme-bg-secondary)" : "transparent",
            }}
          >
            {zh ? it.zh : it.en}
          </button>
        ))}
      </div>
      {active !== null && (
        <p
          className="text-[0.85rem] mt-2"
          style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-muted)" }}
        >
          👁 {zh ? items[active].observeZh : items[active].observeEn}
        </p>
      )}
    </div>
  );
}

/** Segmented control — shadcn ToggleGroup under the same API. */
export function Seg({
  label, options, value, onChange,
}: {
  label: string;
  options: { v: string; text: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[0.7rem] mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
        {label}
      </p>
      <ToggleGroup
        type="single"
        variant="outline"
        value={value}
        onValueChange={(v) => v && onChange(v)}
        className="w-full"
      >
        {options.map((o) => (
          <ToggleGroupItem
            key={o.v}
            value={o.v}
            className="flex-1 h-8 text-[0.78rem] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {o.text}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

/**
 * Cockpit layout — the shared shape of every simulator page. Controls live
 * in a sticky left panel grouped by intent (scenario / mechanism / market /
 * you); everything visual composes into one stage on the right; the verdict
 * is a single banner inside the stage. Kills the "stacked modules" reading.
 */
export function Cockpit({ controls, children }: { controls: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-6 lg:items-start mb-8">
      <aside
        className="lg:sticky lg:top-20 rounded-lg border mb-6 lg:mb-0 overflow-hidden"
        style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card-bg)" }}
      >
        {controls}
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** A labeled group inside the cockpit's control panel. */
export function PanelSection({
  title,
  accent,
  first,
  children,
}: {
  title: string;
  /** highlight this section (the "you" block) */
  accent?: boolean;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`px-4 py-3.5 ${first ? "" : "border-t"}`}
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: accent ? "var(--theme-bg-secondary)" : "transparent",
      }}
    >
      <p
        className="text-[0.68rem] tracking-[0.18em] uppercase mb-2.5"
        style={{ fontFamily: "var(--font-heading)", color: accent ? "var(--theme-accent)" : "var(--theme-text-muted)" }}
      >
        {title}
      </p>
      {children}
    </section>
  );
}

/** One compact status chip in the stage's status row. */
export function StatChip({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <Badge variant="outline" className="px-2.5 py-1.5 gap-1.5 font-normal">
      <span className="text-[0.68rem]" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
        {label}
      </span>
      <span
        className="text-[0.82rem] font-bold tabular-nums"
        style={{
          fontFamily: "var(--font-heading)",
          color: tone === "down" ? "var(--logo-short)" : tone === "up" ? "var(--logo-long)" : "var(--theme-text)",
        }}
      >
        {value}
      </span>
    </Badge>
  );
}
