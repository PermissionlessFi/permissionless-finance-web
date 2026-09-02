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

    // Opacity only — deliberately no transform. The reading shell is exactly
    // `h-screen`, so the document has no scrollbar at rest; translating it
    // downward would add its offset to the document's *scrollable overflow*
    // (transforms don't affect layout, but they do extend the scroll area),
    // spawning a scrollbar for the length of the animation and snapping the
    // centered column sideways when it disappears.
    const anim = el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
    );
    return () => anim.cancel();
  }, []);

  return <div ref={ref}>{children}</div>;
}
