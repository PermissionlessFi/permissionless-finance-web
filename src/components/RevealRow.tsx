"use client";

import { useState, ReactNode } from "react";

interface RevealItem {
  key: string;
  label: string;
  content: ReactNode;
}

/**
 * A row of collapsed chips (side by side) whose panels expand FULL-WIDTH below
 * the row — so putting the triggers on one line saves vertical space without
 * squeezing the panels into narrow columns. Each chip toggles independently.
 * Content stays in the DOM when collapsed (grid-rows 0fr, not display:none),
 * so crawlers read it regardless of state.
 */
export function RevealRow({ items }: { items: RevealItem[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={() => toggle(it.key)}
            aria-expanded={!!open[it.key]}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.7rem] tracking-[0.18em] transition-opacity hover:opacity-80"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--theme-accent)",
              borderColor: "var(--theme-border)",
              background: "var(--theme-card-bg)",
            }}
          >
            {it.label}
            <svg
              className="w-3 h-3 transition-transform duration-300 ease-out"
              style={{ transform: open[it.key] ? "rotate(180deg)" : "none" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" />
            </svg>
          </button>
        ))}
      </div>

      {items.map((it) => (
        <div
          key={it.key}
          className="grid transition-all duration-300 ease-out"
          style={{ gridTemplateRows: open[it.key] ? "1fr" : "0fr", opacity: open[it.key] ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <div
              className="transition-transform duration-300 ease-out"
              style={{ transform: open[it.key] ? "scale(1)" : "scale(0.97)", transformOrigin: "top" }}
            >
              {it.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
