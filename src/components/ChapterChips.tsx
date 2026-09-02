import { ReactNode } from "react";
import Link from "next/link";
import { CHAPTER_ABSTRACTS } from "@/lib/chapter-abstracts";
import { keyTermsForChapter } from "@/lib/glossary";
import { RevealRow } from "./RevealRow";
import { Lang } from "@/lib/types";

/** The under-title apparatus: Abstract + Key-terms chips, side by side, with
 *  full-width expanding panels. Server-rendered (content stays in the SSR HTML
 *  for crawlers); renders nothing when a chapter has neither. */
export function ChapterChips({ lang, num }: { lang: Lang; num: string }) {
  const abstract = CHAPTER_ABSTRACTS[num]?.[lang];
  const terms = keyTermsForChapter(num);

  const items: { key: string; label: string; content: ReactNode }[] = [];

  if (abstract) {
    items.push({
      key: "abstract",
      label: lang === "zh" ? "摘要" : "ABSTRACT",
      content: (
        <div
          className="mt-3 rounded-lg border px-5 py-4"
          style={{ borderColor: "var(--theme-border)", background: "var(--theme-card-bg)" }}
        >
          <p
            className="text-[0.95rem] leading-relaxed"
            style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
          >
            {abstract}
          </p>
        </div>
      ),
    });
  }

  if (terms.length) {
    items.push({
      key: "terms",
      label: lang === "zh" ? "本章术语" : "KEY TERMS",
      content: (
        <div className="mt-3 flex flex-wrap gap-2">
          {terms.map((t) => (
            <Link
              key={t.id}
              href={`/glossary?lang=${lang}#${t.id}`}
              className="rounded-md border px-2.5 py-1 text-sm transition-opacity hover:opacity-80"
              style={{ borderColor: "var(--theme-border)", color: "var(--theme-text-secondary)" }}
            >
              {lang === "zh" ? t.zh : t.en}
            </Link>
          ))}
        </div>
      ),
    });
  }

  if (!items.length) return null;

  return (
    <div className="mb-8">
      <RevealRow items={items} />
    </div>
  );
}
