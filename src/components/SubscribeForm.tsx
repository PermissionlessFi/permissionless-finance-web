"use client";

import { useState } from "react";
import { MailIcon } from "./BrandIcons";

type State = "idle" | "loading" | "ok" | "pending" | "error";

/* Email capture. Posts to /api/subscribe; renders a confirmation on success and
 * a graceful RSS fallback if no newsletter destination is configured yet. */
export function SubscribeForm({ lang }: { lang: "zh" | "en" }) {
  const zh = lang === "zh";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMsg("");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.ok) {
        setState("ok");
      } else if (data.error === "not_configured") {
        setState("pending");
      } else if (data.error === "invalid_email") {
        setState("error");
        setMsg(zh ? "邮箱格式不正确。" : "That doesn't look like a valid email.");
      } else {
        setState("error");
        setMsg(zh ? "提交失败，请稍后再试。" : "Something went wrong — please try again.");
      }
    } catch {
      setState("error");
      setMsg(zh ? "网络错误，请稍后再试。" : "Network error — please try again.");
    }
  }

  if (state === "ok") {
    return (
      <div
        className="flex items-center gap-2 text-sm rounded-md border px-4 py-3"
        style={{ fontFamily: "var(--font-heading)", borderColor: "var(--theme-border)", color: "var(--theme-heading)" }}
      >
        <MailIcon size={18} />
        {zh ? "已订阅 — 新章节与更新会寄到你的邮箱。" : "You're in — new chapters and updates will land in your inbox."}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 max-w-md">
        <div
          className="flex items-center gap-2 flex-1 rounded-md border px-3"
          style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-input-bg)" }}
        >
          <MailIcon size={18} className="opacity-50 shrink-0" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={zh ? "你的邮箱地址" : "you@email.com"}
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text)" }}
            aria-label={zh ? "邮箱地址" : "Email address"}
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="text-sm px-5 py-2.5 rounded-md transition-opacity disabled:opacity-60 whitespace-nowrap"
          style={{ fontFamily: "var(--font-heading)", backgroundColor: "var(--theme-button-bg)", color: "var(--theme-button-text)" }}
        >
          {state === "loading" ? (zh ? "订阅中…" : "Subscribing…") : zh ? "订阅" : "Subscribe"}
        </button>
      </form>

      {state === "error" && (
        <p className="text-sm mt-2" style={{ fontFamily: "var(--font-serif)", color: "#a34a33" }}>
          {msg}
        </p>
      )}
      {state === "pending" && (
        <p className="text-sm mt-2 flex flex-wrap items-center gap-1" style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}>
          {zh ? "邮件订阅即将开通；在此之前，" : "The newsletter is coming online; in the meantime, "}
          <a href="/feed.xml" className="underline" style={{ color: "var(--theme-heading)" }}>
            {zh ? "先订阅 RSS" : "subscribe via RSS"}
          </a>
          {zh ? "。" : "."}
        </p>
      )}
    </div>
  );
}
