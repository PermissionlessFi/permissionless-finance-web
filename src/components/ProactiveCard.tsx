"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme";

interface ProactiveCardProps {
  chapterNum: string;
  lang: "zh" | "en";
  onAskQuestion: (question: string) => void;
}

export function ProactiveCard({
  chapterNum,
  lang,
  onAskQuestion,
}: ProactiveCardProps) {
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterNum,
          lang,
          sectionText:
            document.querySelector(".prose-book")?.textContent?.slice(0, 2000) ||
            "",
        }),
      });
      const data = await res.json();
      if (data.questions?.length > 0) {
        setQuestions(data.questions.slice(0, 3));
        setLoaded(true);
      }
    } catch {
      /* ignore */
    }
  }, [chapterNum, lang]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 10000);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  if (dismissed || !loaded) return null;

  return (
    <div className="fixed bottom-6 right-6 z-20 animate-[fadeIn_0.5s_ease-in]">
      {expanded ? (
        <div className="border rounded-xl shadow-lg p-4 max-w-sm" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-heading)", color: theme.textMuted }}
            >
              {lang === "zh" ? "思考问题" : "Think About"}
            </span>
            <button
              onClick={() => setDismissed(true)}
              className="transition-colors"
              style={{ color: theme.textMuted }}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => onAskQuestion(q)}
                className="w-full text-left text-sm py-1.5 px-2 rounded transition-colors leading-relaxed"
                style={{ fontFamily: "var(--font-serif)", color: theme.textSecondary }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="w-10 h-10 border rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow text-lg"
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
          title={lang === "zh" ? "思考问题" : "Discussion prompts"}
        >
          💡
        </button>
      )}
    </div>
  );
}
