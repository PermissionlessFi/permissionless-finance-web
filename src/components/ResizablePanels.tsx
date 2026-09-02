"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "@/lib/theme";

interface ResizablePanelsProps {
  contentPanel: React.ReactNode;
  aiPanel: React.ReactNode;
  aiOpen: boolean;
  onClose: () => void;
}

export function ResizablePanels({ contentPanel, aiPanel, aiOpen, onClose }: ResizablePanelsProps) {
  const { theme } = useTheme();
  const [aiWidth, setAiWidth] = useState(480);
  // Below the `md` breakpoint (768px) the resizable split would collapse the
  // reading pane, so we render the AI panel as a full-width overlay drawer and
  // disable drag-to-resize.
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = rect.right - e.clientX;

      if (newWidth < 50) {
        onClose();
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        return;
      }
      setAiWidth(Math.min(rect.width - 100, Math.max(300, newWidth)));
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onClose]);

  const handleDoubleClick = useCallback(() => {
    setAiWidth(480);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden">
      {/* Content panel — ALWAYS full width, just shifts left when AI opens on desktop */}
      <div
        className={`absolute inset-0 overflow-y-auto transition-[right] duration-200 ease-out ${aiOpen && !isMobile ? "no-scrollbar" : ""}`}
        style={{ right: aiOpen && !isMobile ? `${aiWidth}px` : "0px" }}
      >
        {contentPanel}
      </div>

      {aiOpen && (
        isMobile ? (
          /* Mobile: full-width overlay drawer — no divider, no drag, content not shrunk */
          <div
            className="fixed inset-0 z-40 flex flex-col"
            style={{ backgroundColor: theme.bg, transition: "background-color 0.3s ease" }}
          >
            {aiPanel}
          </div>
        ) : (
          /* Desktop: slides in from the right, resizable fixed width */
          <>
            {/* Drag divider */}
            <div
              className="absolute top-0 bottom-0 z-10 w-px cursor-col-resize transition-colors group"
              style={{ right: `${aiWidth}px`, backgroundColor: theme.border }}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
            >
              <div className="absolute inset-y-0 -left-2 -right-2" />
              <div className="sticky top-1/2 flex justify-center" style={{ height: 0 }}>
                <div className="w-1 h-8 -mt-4 rounded-full transition-colors" style={{ backgroundColor: theme.textMuted }} />
              </div>
            </div>

            {/* AI panel */}
            <div
              className="absolute top-0 bottom-0 right-0 flex flex-col border-l"
              style={{ width: `${aiWidth}px`, backgroundColor: theme.bg, borderColor: theme.border, transition: "background-color 0.3s ease, border-color 0.3s ease" }}
            >
              {aiPanel}
            </div>
          </>
        )
      )}
    </div>
  );
}
