"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Lang } from "@/lib/types";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
  lang: Lang;
}

export function TableOfContents({ headings, lang }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // Restore the pinned preference (persisted) after mount.
  useEffect(() => {
    setPinned(localStorage.getItem("toc-pinned") === "1");
  }, []);

  const togglePin = () => {
    setPinned((p) => {
      const next = !p;
      try {
        localStorage.setItem("toc-pinned", next ? "1" : "0");
      } catch {}
      return next;
    });
  };
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the portal target after mount
  useEffect(() => {
    const el = document.getElementById("toc-portal");
    if (el) setPortalTarget(el);
  }, []);

  // Track active heading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0 || !portalTarget) return null;

  const tocContent = (
    <div
      ref={containerRef}
      className="h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="sticky top-20 pl-6">
        <nav
          className="toc-scroll max-h-[calc(100vh-8rem)] overflow-y-auto transition-opacity duration-300 ease-in-out"
          style={{ opacity: hovered || pinned ? 1 : 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4
              className="text-xs tracking-[0.15em] text-gray-400 uppercase"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {lang === "zh" ? "本章目录" : "On this page"}
            </h4>
            <button
              onClick={togglePin}
              aria-label={pinned ? "Unpin table of contents" : "Pin table of contents"}
              aria-pressed={pinned}
              title={pinned ? "Unpin" : "Pin"}
              className={`shrink-0 ml-2 transition-colors ${pinned ? "text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill={pinned ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="17" x2="12" y2="22" />
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
              </svg>
            </button>
          </div>
          <ul className="space-y-1.5 pb-6">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={`
                    block text-sm py-0.5 transition-colors
                    ${heading.level === 3 ? "pl-3" : ""}
                    ${activeId === heading.id ? "text-gray-800 font-medium" : "text-gray-500 hover:text-gray-700"}
                  `}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );

  return createPortal(tocContent, portalTarget);
}
