"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { LogoLockup } from "./BrandLogo";
import { AiPanel } from "./AiPanel";
import { ProactiveCard } from "./ProactiveCard";
import { ResizablePanels } from "./ResizablePanels";
import { TopNav } from "./TopNav";
import { chapterHref } from "@/lib/keywords";
import { Lang } from "@/lib/types";
import { useTheme } from "@/lib/theme";

interface LayoutShellProps {
  children: React.ReactNode;
  lang?: Lang;
  currentChapter?: string;
  chapterTitle?: string;
}

export function LayoutShell({
  children,
  lang = "zh",
  currentChapter,
  chapterTitle,
}: LayoutShellProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  // Language switch on a chapter page = navigate to the other-language route.
  const handleLangChange = useCallback(
    (l: Lang) => router.push(chapterHref(l, currentChapter || "01")),
    [router, currentChapter]
  );

  const handleAskQuestion = useCallback((question: string) => {
    setPendingQuestion(question);
    setAiPanelOpen(true);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const toggleAiPanel = useCallback(() => {
    // Remove hash from URL to prevent browser auto-scrolling to anchor on layout change
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setAiPanelOpen((o) => !o);
  }, []);

  const contentPanel = (
    <div className="flex justify-center">
      <div className="max-w-[764px] w-full px-6 py-8 shrink-0">{children}</div>
      <div id="toc-portal" className={`w-64 shrink-0 py-8 ${aiPanelOpen ? "hidden" : "hidden xl:block"}`} />
    </div>
  );

  const aiPanelContent = (
    <AiPanel
      open={aiPanelOpen}
      onClose={() => setAiPanelOpen(false)}
      lang={lang}
      chapterNum={currentChapter}
      chapterTitle={chapterTitle}
      pendingQuestion={pendingQuestion}
      onPendingQuestionHandled={() => setPendingQuestion(null)}
    />
  );

  return (
    <div className="h-screen flex">
      {/* Left spine — full height */}
        <div
          className="hidden md:flex flex-col items-center w-24 shrink-0 border-r h-full"
          style={{ backgroundColor: "var(--theme-spine-bg)", borderColor: "var(--theme-border)", transition: "background-color 0.3s ease, border-color 0.3s ease" }}
        >
          <button
            onClick={toggleSidebar}
            className="p-4 transition-colors w-full flex justify-center"
            style={{ color: theme.textMuted }}
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div
            className="flex-1 flex items-center justify-center cursor-pointer transition-colors"
            onClick={toggleSidebar}
          >
            <div
              className="flex flex-row items-center gap-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span
                className="text-sm tracking-[0.25em] font-bold"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed", color: "var(--theme-spine-text)" }}
              >
                {lang === "zh" ? "无需许可的金融" : "Permissionless Finance"}
              </span>
              <span
                className="text-sm tracking-[0.2em]"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed", color: "var(--theme-spine-text-secondary)" }}
              >
                {lang === "zh" ? "从永续合约到链上全球市场" : "From Perpetual Futures to the On-Chain Global Market"}
              </span>
            </div>
          </div>
        </div>

      {/* Right section: header + content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between h-[72px] px-4 backdrop-blur-sm"
          style={{ backgroundColor: "var(--theme-header-bg)", transition: "background-color 0.3s ease" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md transition-colors md:hidden"
              style={{ color: theme.text }}
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <LogoLockup markWidth={44} className="ml-2" />
          </div>

          <div className="flex items-center gap-0.5">
            <TopNav lang={lang} onLangChange={handleLangChange} />
            <button
              onClick={toggleAiPanel}
              className="p-2 rounded-md transition-colors"
              aria-label={lang === "zh" ? "AI 面板" : "AI panel"}
            >
              <svg className="w-5 h-5" style={{ color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Resizable content + AI panels */}
        <ResizablePanels
          contentPanel={contentPanel}
          aiPanel={aiPanelContent}
          aiOpen={aiPanelOpen}
          onClose={() => setAiPanelOpen(false)}
        />
      </div>

      {/* Left Sidebar — overlay */}
      {sidebarOpen && (
        <Sidebar open={true} onClose={() => setSidebarOpen(false)} lang={lang} currentChapter={currentChapter} />
      )}

      {/* Backdrop — only for sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Proactive AI suggestion card */}
      {currentChapter && !aiPanelOpen && (
        <ProactiveCard
          chapterNum={currentChapter}
          lang={lang}
          onAskQuestion={handleAskQuestion}
        />
      )}
    </div>
  );
}
