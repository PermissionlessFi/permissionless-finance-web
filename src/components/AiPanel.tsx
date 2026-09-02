"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/lib/theme";

const TABS = [
  { id: "discussion", label: "讨论", labelEn: "Discussion" },
  { id: "qa", label: "问答", labelEn: "Q&A" },
  { id: "quiz", label: "测验", labelEn: "Quiz" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const EXPERT_ROLES = [
  { id: "M1", zh: "市场微观结构", en: "Market Microstructure" },
  { id: "M2", zh: "衍生品/永续合约", en: "Derivatives/Perpetuals" },
  { id: "M3", zh: "金融风险", en: "Financial Risk" },
  { id: "M4", zh: "系统性风险", en: "Systemic Risk" },
  { id: "M5", zh: "DEX 专家", en: "DEX Expert" },
  { id: "M6", zh: "交易所架构", en: "Exchange Architect" },
  { id: "E1", zh: "宏观金融", en: "Macro Finance" },
  { id: "E2", zh: "行为金融", en: "Behavioral Finance" },
  { id: "E3", zh: "合规/法律", en: "Compliance/Legal" },
  { id: "E4", zh: "安全/运营风险", en: "Security/OpRisk" },
  { id: "E5", zh: "交易台负责人", en: "Trading Desk Lead" },
];

const EXPERT_COLORS: Record<string, string> = {
  M1: "#6366f1", M2: "#8b5cf6", M3: "#ec4899", M4: "#ef4444",
  M5: "#f59e0b", M6: "#10b981", E1: "#3b82f6", E2: "#14b8a6",
  E3: "#f97316", E4: "#64748b", E5: "#a855f7",
};

// Notion-style avatar mapping for each expert
const EXPERT_AVATARS: Record<string, string> = {
  M1: "/avatars/notion_1.png",
  M2: "/avatars/notion_2.png",
  M3: "/avatars/notion_3.png",
  M4: "/avatars/notion_4.png",
  M5: "/avatars/notion_5.png",
  M6: "/avatars/notion_6.png",
  E1: "/avatars/notion_7.png",
  E2: "/avatars/notion_8.png",
  E3: "/avatars/notion_9.png",
  E4: "/avatars/notion_10.png",
  E5: "/avatars/notion_11.png",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiPanelProps {
  open: boolean;
  onClose: () => void;
  lang?: "zh" | "en";
  chapterNum?: string;
  chapterTitle?: string;
  pendingQuestion?: string | null;
  onPendingQuestionHandled?: () => void;
}

/* ─── Quiz helpers ─── */
interface QuizChoice {
  letter: string;
  text: string;
}

function parseQuizChoices(content: string): QuizChoice[] | null {
  // Match lines like "A) ...", "B) ...", etc. or "A. ...", "B. ..."
  const pattern = /^([A-D])[).]\s+(.+)$/gm;
  const choices: QuizChoice[] = [];
  let m;
  while ((m = pattern.exec(content)) !== null) {
    choices.push({ letter: m[1], text: m[2] });
  }
  return choices.length >= 3 ? choices : null;
}

/* ─── Discussion helpers ─── */
interface ExpertSegment {
  expertId: string | null;
  expertName: string;
  color: string;
  content: string;
}

function parseExpertSegments(content: string): ExpertSegment[] {
  // Try both 【Expert Name】: and [Expert Name]: patterns regardless of lang
  const matches: { index: number; name: string }[] = [];
  let m;

  const zhPattern = /【([^】]+)】[：:]/g;
  while ((m = zhPattern.exec(content)) !== null) {
    matches.push({ index: m.index, name: m[1] });
  }

  if (matches.length === 0) {
    const enPattern = /\[([^\]]+)\][：:]/g;
    while ((m = enPattern.exec(content)) !== null) {
      matches.push({ index: m.index, name: m[1] });
    }
  }

  if (matches.length === 0) return [];

  const segments: ExpertSegment[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const name = matches[i].name;

    // Find matching expert role
    const expert = EXPERT_ROLES.find(
      (r) => r.zh === name || r.en === name || name.includes(r.zh) || name.includes(r.en)
    );

    // Extract content after the "【Name】:" prefix
    const rawSegment = content.slice(start, end);
    const colonIdx = rawSegment.indexOf("：") !== -1 ? rawSegment.indexOf("：") : rawSegment.indexOf(":");
    const segContent = rawSegment.slice(colonIdx + 1).trim();

    segments.push({
      expertId: expert?.id || null,
      expertName: name,
      color: expert ? EXPERT_COLORS[expert.id] || "#6b7280" : "#6b7280",
      content: segContent,
    });
  }

  return segments;
}

/* ─── Cache helpers ─── */
function getCacheKey(chapterNum?: string) {
  return `ai-classroom-${chapterNum || "default"}`;
}

interface CachedState {
  messages: Record<TabId, Message[]>;
  quizAnswered: [number, string][];
  selectedRoles: string[];
  activeTab: TabId;
}

function loadCache(chapterNum?: string): CachedState | null {
  try {
    const raw = localStorage.getItem(getCacheKey(chapterNum));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCache(chapterNum: string | undefined, state: CachedState) {
  try {
    localStorage.setItem(getCacheKey(chapterNum), JSON.stringify(state));
  } catch { /* quota exceeded, ignore */ }
}

/* ─── Main component ─── */
export function AiPanel({ open, onClose, lang = "zh", chapterNum, chapterTitle, pendingQuestion, onPendingQuestionHandled }: AiPanelProps) {
  const { theme } = useTheme();
  const cached = useRef<CachedState | null>(null);
  if (cached.current === null) {
    cached.current = loadCache(chapterNum);
  }
  const c = cached.current;

  const [activeTab, setActiveTab] = useState<TabId>(c?.activeTab || "qa");
  const [messages, setMessages] = useState<Record<TabId, Message[]>>(c?.messages || {
    discussion: [],
    qa: [],
    quiz: [],
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(c?.selectedRoles || ["M1", "M2", "E3"]);
  const [quizAnswered, setQuizAnswered] = useState<Map<number, string>>(new Map(c?.quizAnswered || []));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Overlay (mobile drawer) vs. side-by-side desktop pane. Dialog semantics —
  // aria-modal + Tab focus-trap — apply only when the panel is a modal overlay;
  // on desktop it's a persistent side pane and must not trap keyboard focus.
  const [isOverlay, setIsOverlay] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const update = () => setIsOverlay(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Persist state to localStorage on changes
  useEffect(() => {
    if (isStreaming) return; // don't save mid-stream
    saveCache(chapterNum, {
      messages,
      quizAnswered: Array.from(quizAnswered.entries()),
      selectedRoles,
      activeTab,
    });
  }, [messages, quizAnswered, selectedRoles, activeTab, chapterNum, isStreaming]);

  const currentMessages = messages[activeTab];

  // Auto-scroll to bottom — only if user is near the bottom (not scrolled up reading)
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      userScrolledUp.current = scrollHeight - scrollTop - clientHeight > 100;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!userScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, activeTab]);

  // A11y: dialog semantics — Escape to close, focus trap, restore focus on close.
  // Runs after the input-focus effect above, so if an input was auto-focused the
  // fallback below is a no-op; otherwise focus falls back to the close button so
  // focus always enters the dialog.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    if (panel && !panel.contains(document.activeElement)) {
      closeButtonRef.current?.focus();
    }

    const getFocusable = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null)
        : [];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && isOverlay) {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, isOverlay]);

  // Handle pending question from ProactiveCard
  const pendingQuestionRef = useRef<string | null>(null);
  const sendPendingRef = useRef<((q: string) => void) | null>(null);

  const sendMessage = useCallback(async (content?: string) => {
    const text = content || input.trim();
    if (!text || isStreaming) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages[activeTab], userMessage];

    setMessages((prev) => ({ ...prev, [activeTab]: newMessages }));
    setInput("");
    setIsStreaming(true);

    // Add empty assistant message for streaming
    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages((prev) => ({
      ...prev,
      [activeTab]: [...newMessages, assistantMessage],
    }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          chapterNum,
          lang,
          mode: activeTab,
          roles: activeTab === "discussion" ? selectedRoles : undefined,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const current = accumulated;
          setMessages((prev) => {
            const tabMsgs = [...prev[activeTab]];
            tabMsgs[tabMsgs.length - 1] = { role: "assistant", content: current };
            return { ...prev, [activeTab]: tabMsgs };
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const tabMsgs = [...prev[activeTab]];
        tabMsgs[tabMsgs.length - 1] = {
          role: "assistant",
          content:
            lang === "zh"
              ? "抱歉，发生了错误。请重试。"
              : "Sorry, an error occurred. Please try again.",
        };
        return { ...prev, [activeTab]: tabMsgs };
      });
    }

    setIsStreaming(false);
  }, [input, isStreaming, messages, activeTab, chapterNum, lang, selectedRoles]);

  // Keep a stable ref to sendMessage for the pending question effect
  sendPendingRef.current = sendMessage;

  useEffect(() => {
    if (pendingQuestion && open && !isStreaming && pendingQuestion !== pendingQuestionRef.current) {
      pendingQuestionRef.current = pendingQuestion;
      setActiveTab("qa");
      const timer = setTimeout(() => {
        sendPendingRef.current?.(pendingQuestion);
        onPendingQuestionHandled?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pendingQuestion, open, isStreaming, onPendingQuestionHandled]);

  // Discussion auto-continue: after each expert speaks, trigger the next
  const discussionRoundsRef = useRef(0);
  const [discussionPaused, setDiscussionPaused] = useState(false);

  useEffect(() => {
    if (activeTab !== "discussion" || isStreaming || discussionPaused) return;

    const msgs = messages.discussion;
    if (msgs.length === 0) return;

    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role !== "assistant" || lastMsg.content === "") return;

    // Count consecutive assistant messages at the end
    let consecutiveAssistant = 0;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "assistant") consecutiveAssistant++;
      else break;
    }

    // Auto-continue if we haven't reached the number of selected roles
    const maxRounds = selectedRoles.length;
    if (consecutiveAssistant < maxRounds && consecutiveAssistant > 0) {
      const timer = setTimeout(() => {
        // Send a hidden "continue" prompt
        const continueMsg: Message = { role: "user", content: "[继续讨论]" };
        const newMsgs = [...msgs, continueMsg];
        setMessages(prev => ({ ...prev, discussion: newMsgs }));

        // Trigger next response
        setIsStreaming(true);
        const assistantMsg: Message = { role: "assistant", content: "" };
        setMessages(prev => ({ ...prev, discussion: [...newMsgs, assistantMsg] }));

        fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
            chapterNum,
            lang,
            mode: "discussion",
            roles: selectedRoles,
          }),
        }).then(async res => {
          if (!res.ok) throw new Error("API error");
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          if (reader) {
            let accumulated = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              accumulated += decoder.decode(value, { stream: true });
              const current = accumulated;
              setMessages(prev => {
                const tabMsgs = [...prev.discussion];
                tabMsgs[tabMsgs.length - 1] = { role: "assistant", content: current };
                return { ...prev, discussion: tabMsgs };
              });
            }
          }
          setIsStreaming(false);
        }).catch(() => {
          setIsStreaming(false);
        });
      }, 800); // Small delay before next expert speaks

      return () => clearTimeout(timer);
    }
  }, [messages.discussion, activeTab, isStreaming, selectedRoles, chapterNum, lang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuizChoice = useCallback((msgIndex: number, letter: string) => {
    if (quizAnswered.has(msgIndex)) return;
    setQuizAnswered((prev) => new Map(prev).set(msgIndex, letter));
    sendMessage(letter);
  }, [quizAnswered, sendMessage]);

  /* ─── Message renderers ─── */

  const renderAssistantMessage = useCallback((msg: Message, msgIndex: number) => {
    // Discussion mode: parse expert segments as chat bubbles
    if (activeTab === "discussion") {
      const segments = parseExpertSegments(msg.content);
      if (segments.length > 0) {
        return (
          <div className="space-y-4">
            {segments.map((seg, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`flex gap-2.5 ${isEven ? "" : "flex-row-reverse"}`}>
                  {/* Avatar */}
                  <div
                    className="w-6 h-6 rounded-full shrink-0 overflow-hidden"
                    style={{ border: `1px solid ${seg.color}` }}
                  >
                    <img
                      src={EXPERT_AVATARS[seg.expertId || "M1"] || "/avatars/notion_1.png"}
                      alt={seg.expertName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Bubble */}
                  <div className={`max-w-[80%] ${isEven ? "" : "text-right"}`}>
                    <div
                      className="text-[11px] font-semibold mb-1 flex items-center gap-1"
                      style={{ color: seg.color, fontFamily: "var(--font-heading)" }}
                    >
                      {seg.expertName}
                    </div>
                    <div
                      className="prose-ai text-sm leading-relaxed text-gray-700 rounded-lg px-3 py-2"
                      style={{ fontFamily: "var(--font-serif)", backgroundColor: seg.color + "12", borderLeft: `2px solid ${seg.color}`, textAlign: "left" }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{seg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
    }

    // Quiz mode: detect choices and render as buttons
    if (activeTab === "quiz" && !isStreaming) {
      const choices = parseQuizChoices(msg.content);
      if (choices) {
        const firstChoiceMatch = msg.content.match(/^[A-D][).]\s/m);
        const preChoiceContent = firstChoiceMatch
          ? msg.content.slice(0, msg.content.indexOf(firstChoiceMatch[0]))
          : msg.content;

        const selectedLetter = quizAnswered.get(msgIndex);
        const answered = selectedLetter !== undefined;
        // Check the next assistant message to determine if answer was correct
        let isCorrect = false;
        let correctLetter: string | null = null;
        if (answered) {
          for (let j = msgIndex + 1; j < currentMessages.length; j++) {
            if (currentMessages[j].role === "assistant" && currentMessages[j].content.length > 0) {
              const explanation = currentMessages[j].content;
              // Check for explicit wrong indicators
              const hasWrong = /不正确|❌|Incorrect|Wrong|不对|答错|遗憾|错误/i.test(explanation);
              // Check for explicit correct indicators. Note the next regex matches
              // the phrase "the correct answer is", which signals the user was WRONG.
              const hasCorrectAnswer = /正确答案[是为：:\s]*([A-D])/i.exec(explanation);
              const hasRight = /^(?:.*(?:正确|🎉|✅|Correct|Great|Right|很好|答对))/i.test(explanation) && !hasWrong;

              if (hasWrong) {
                isCorrect = false;
                // Extract correct answer
                if (hasCorrectAnswer) {
                  correctLetter = hasCorrectAnswer[1];
                } else {
                  const altMatch = explanation.match(/(?:answer is|应该[是选]|correct[^A-D]*)\s*([A-D])/i);
                  if (altMatch) correctLetter = altMatch[1];
                }
              } else if (hasRight) {
                isCorrect = true;
              }
              break;
            }
          }
        }

        return (
          <div className="prose-ai text-sm leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{preChoiceContent}</ReactMarkdown>
            <div className="space-y-2 mt-3">
              {choices.map((choice) => {
                let borderColor = "border-gray-200";
                let bgColor = "";
                if (answered) {
                  if (choice.letter === selectedLetter) {
                    borderColor = isCorrect ? "border-green-400" : "border-red-400";
                    bgColor = isCorrect ? "bg-green-50" : "bg-red-50";
                  } else if (!isCorrect && correctLetter && choice.letter === correctLetter) {
                    borderColor = "border-green-400";
                    bgColor = "bg-green-50";
                  }
                }
                return (
                  <button
                    key={choice.letter}
                    onClick={() => !answered && handleQuizChoice(msgIndex, choice.letter)}
                    disabled={answered}
                    className={`w-full text-left px-3 py-2 rounded-lg border ${borderColor} ${bgColor} ${
                      !answered ? "hover:border-gray-400 hover:bg-gray-50 cursor-pointer" : "cursor-default"
                    } transition-colors text-sm`}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    <span className="font-semibold mr-2">{choice.letter})</span>
                    {choice.text}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
    }

    // Quiz mode: after grading, show "next question" button
    if (activeTab === "quiz" && !isStreaming && msg.role === "assistant" && msg.content.length > 0) {
      const isGrading = /正确|不正确|🎉|❌|Correct|Incorrect/i.test(msg.content);
      if (isGrading) {
        return (
          <div className="prose-ai text-sm leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            <button
              onClick={() => sendMessage(lang === "zh" ? "继续出题" : "Next question")}
              className="mt-3 px-4 py-1.5 text-xs rounded-md transition-colors"
              style={{ fontFamily: "var(--font-heading)", backgroundColor: theme.buttonBg, color: theme.buttonText }}
            >
              {lang === "zh" ? "继续出题" : "Next Question"}
            </button>
          </div>
        );
      }
    }

    // Default: render with ReactMarkdown
    return (
      <div className="prose-ai text-sm leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
        {msg.content === "" && isStreaming && (
          <span className="inline-block w-1.5 h-4 animate-pulse ml-0.5" style={{ backgroundColor: theme.textMuted }} />
        )}
      </div>
    );
  }, [activeTab, isStreaming, lang, quizAnswered, handleQuizChoice, sendMessage]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role={isOverlay ? "dialog" : undefined}
      aria-modal={isOverlay ? "true" : undefined}
      aria-label={lang === "zh" ? "AI 课堂" : "AI Classroom"}
      className="flex flex-col h-full"
      style={{ backgroundColor: theme.bg, color: theme.text, transition: "background-color 0.3s ease, color 0.3s ease" }}
    >
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h2
            className="text-xs tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-heading)", color: theme.textMuted }}
          >
            AI Classroom
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 hover:opacity-60 transition-opacity"
            aria-label="Close"
          >
            <svg
              className="w-4 h-4"
              style={{ color: theme.textMuted }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {chapterNum && (
          <p
            className="text-xs mb-4"
            style={{ fontFamily: "var(--font-heading)", color: theme.textMuted }}
          >
            {/^\d+$/.test(chapterNum)
              ? `${lang === "zh" ? `第${parseInt(chapterNum)}章` : `Chapter ${parseInt(chapterNum)}`}${chapterTitle ? ` · ${chapterTitle}` : ""}`
              : chapterTitle}
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-6 border-b" style={{ borderColor: theme.border }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="pb-2 text-sm transition-colors relative"
              style={{
                fontFamily: "var(--font-heading)",
                color: activeTab === tab.id ? theme.text : theme.textMuted,
              }}
            >
              {lang === "zh" ? tab.label : tab.labelEn}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-px" style={{ backgroundColor: theme.text }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
        {currentMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {activeTab === "discussion" ? (
              <div className="w-full max-w-sm">
                <p className="text-sm mb-4" style={{ fontFamily: "var(--font-serif)", color: theme.textMuted }}>
                  {lang === "zh" ? "选择参与讨论的专家（2-4位）" : "Select experts for discussion (2-4)"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {EXPERT_ROLES.map((role) => {
                    const selected = selectedRoles.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          setSelectedRoles(prev => {
                            if (selected) {
                              return prev.length > 1 ? prev.filter(r => r !== role.id) : prev;
                            } else {
                              return prev.length < 4 ? [...prev, role.id] : prev;
                            }
                          });
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors"
                        style={{
                          fontFamily: "var(--font-heading)",
                          backgroundColor: selected ? theme.buttonBg : theme.bgSecondary,
                          color: selected ? theme.buttonText : theme.textMuted,
                        }}
                      >
                        <img src={EXPERT_AVATARS[role.id]} alt="" className="w-4 h-4 rounded-full" />
                        {lang === "zh" ? role.zh : role.en}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => sendMessage(lang === "zh" ? `请围绕本章核心内容展开讨论` : `Please discuss the core concepts of this chapter`)}
                  className="mt-4 px-5 py-2 text-sm rounded-md transition-colors"
                  style={{ fontFamily: "var(--font-heading)", backgroundColor: theme.buttonBg, color: theme.buttonText }}
                >
                  {lang === "zh" ? "开始讨论" : "Start Discussion"}
                </button>
              </div>
            ) : activeTab === "quiz" ? (
              <div className="w-full max-w-sm">
                <p className="text-sm mb-4" style={{ fontFamily: "var(--font-serif)", color: theme.textMuted }}>
                  {lang === "zh" ? "AI 将根据本章内容生成选择题" : "AI will generate quiz questions based on this chapter"}
                </p>
                <button
                  onClick={() => sendMessage(lang === "zh" ? "出题" : "Quiz me")}
                  className="px-5 py-2 text-sm rounded-md transition-colors"
                  style={{ fontFamily: "var(--font-heading)", backgroundColor: theme.buttonBg, color: theme.buttonText }}
                >
                  {lang === "zh" ? "开始测验" : "Start Quiz"}
                </button>
              </div>
            ) : (
              <p className="text-sm max-w-xs leading-relaxed" style={{ fontFamily: "var(--font-serif)", color: theme.textMuted }}>
                {activeTab === "qa" && (lang === "zh" ? "输入关于本章内容的问题" : "Ask a question about this chapter")}
              </p>
            )}
          </div>
        )}

        {currentMessages.map((msg, i) => {
          // Hide auto-continue messages in discussion mode
          if (msg.role === "user" && msg.content === "[继续讨论]") return null;

          return (
            <div key={i} className={`${msg.role === "user" ? "flex justify-end" : ""}`}>
              {msg.role === "user" ? (
                <div
                  className="rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[85%]"
                  style={{ fontFamily: "var(--font-serif)", backgroundColor: theme.bgSecondary, color: theme.text }}
                >
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[95%]">
                  {renderAssistantMessage(msg, i)}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Discussion pause/resume */}
      {activeTab === "discussion" && currentMessages.length > 0 && (
        <div className="shrink-0 px-5 pt-2 flex justify-center">
          <button
            onClick={() => setDiscussionPaused(p => !p)}
            className="text-xs px-3 py-1 border rounded-md transition-colors"
            style={{ fontFamily: "var(--font-heading)", borderColor: theme.border, color: theme.textSecondary }}
          >
            {discussionPaused
              ? (lang === "zh" ? "▶ 继续讨论" : "▶ Resume")
              : (lang === "zh" ? "⏸ 暂停讨论" : "⏸ Pause")}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-5 pb-5 pt-3">
        <div className="flex gap-2 items-center border rounded-md px-3 py-2" style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === "zh" ? "输入你的问题..." : "Ask a question..."}
            className="flex-1 text-sm bg-transparent focus:outline-none"
            style={{ fontFamily: "var(--font-serif)", color: theme.text }}
            disabled={isStreaming}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isStreaming || !input.trim()}
            className="transition-colors disabled:opacity-30"
            style={{ color: theme.textMuted }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
