"use client";

import { useState, ReactNode } from "react";

/**
 * Collapsed-by-default disclosure with a fade + unfold + scale animation.
 *
 * The content is ALWAYS in the DOM (collapsed via grid-rows 0fr + overflow,
 * never display:none), so search engines and AI crawlers read it regardless of
 * the open/closed state — the visual collapse is purely to keep the article
 * non-intrusive. The machine-readable signal also lives in JSON-LD, so nothing
 * is lost by defaulting to closed.
 */
export function Reveal({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.7rem] tracking-[0.18em] transition-opacity hover:opacity-80"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--theme-accent)",
          borderColor: "var(--theme-border)",
          background: "var(--theme-card-bg)",
        }}
      >
        {label}
        <svg
          className="w-3 h-3 transition-transform duration-300 ease-out"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div
            className="transition-transform duration-300 ease-out"
            style={{ transform: open ? "scale(1)" : "scale(0.97)", transformOrigin: "top" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
