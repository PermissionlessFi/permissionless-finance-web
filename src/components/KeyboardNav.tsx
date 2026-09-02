"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lang } from "@/lib/types";
import { chapterHref } from "@/lib/keywords";

interface KeyboardNavProps {
  lang: Lang;
  prevChapter: string | null;
  nextChapter: string | null;
}

export function KeyboardNav({ lang, prevChapter, nextChapter }: KeyboardNavProps) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (e.key === "ArrowLeft" && prevChapter) {
        router.push(chapterHref(lang, prevChapter));
      } else if (e.key === "ArrowRight" && nextChapter) {
        router.push(chapterHref(lang, nextChapter));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lang, prevChapter, nextChapter, router]);

  return null;
}
