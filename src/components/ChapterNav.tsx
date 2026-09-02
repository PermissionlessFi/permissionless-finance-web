"use client";

import Link from "next/link";
import { Lang } from "@/lib/types";
import { getChapterMeta, ALL_CHAPTERS } from "@/lib/toc";
import { useTheme } from "@/lib/theme";
import { chapterHref } from "@/lib/keywords";

interface ChapterNavProps {
  lang: Lang;
  chapterNum: string;
}

export function ChapterNav({ lang, chapterNum }: ChapterNavProps) {
  const { theme } = useTheme();
  const meta = getChapterMeta(chapterNum, lang);
  if (!meta) return null;

  const prevMeta = meta.prevChapter ? getChapterMeta(meta.prevChapter, lang) : null;
  const nextMeta = meta.nextChapter ? getChapterMeta(meta.nextChapter, lang) : null;

  return (
    <nav className="flex items-stretch justify-between mt-24 mb-16 pt-10 border-t gap-8" style={{ borderColor: theme.border }}>
      {prevMeta ? (
        <Link
          href={chapterHref(lang, prevMeta.num)}
          className="group flex items-start gap-3 text-left max-w-[45%] hover:opacity-80 transition-opacity"
        >
          <svg className="w-5 h-5 mt-1 shrink-0 transition-transform group-hover:-translate-x-0.5" style={{ color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <div>
            <span className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", color: theme.textMuted }}>
              {lang === "zh" ? "上一章" : "Previous"}
            </span>
            <span className="block text-base" style={{ fontFamily: "var(--font-heading)", color: theme.textSecondary }}>
              {prevMeta.title}
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {nextMeta ? (
        <Link
          href={chapterHref(lang, nextMeta.num)}
          className="group flex items-start gap-3 text-right max-w-[45%] ml-auto hover:opacity-80 transition-opacity"
        >
          <div>
            <span className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", color: theme.textMuted }}>
              {lang === "zh" ? "下一章" : "Next"}
            </span>
            <span className="block text-base" style={{ fontFamily: "var(--font-heading)", color: theme.textSecondary }}>
              {nextMeta.title}
            </span>
          </div>
          <svg className="w-5 h-5 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
