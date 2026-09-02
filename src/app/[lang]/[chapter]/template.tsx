"use client";

import { useEffect, useRef } from "react";

/* Page-enter transition for the reading pages. A template (not a layout)
 * re-mounts on every navigation into a chapter — including the homepage's
 * "Start Reading" jump and chapter-to-chapter flips — so this enter animation
 * plays each time the reader arrives at a page. Self-contained via the Web
 * Animations API: no global CSS, no dependency, and reverting is just deleting
 * this file. Honors prefers-reduced-motion. */
export default function ChapterTemplate({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const anim = el.animate(
      [
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
    );
    return () => anim.cancel();
  }, []);

  return <div ref={ref}>{children}</div>;
}
