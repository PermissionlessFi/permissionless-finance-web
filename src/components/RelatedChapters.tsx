import Link from "next/link";
import { relatedChapters, chapterHref } from "@/lib/keywords";
import { getChapterMeta } from "@/lib/toc";
import { Lang } from "@/lib/types";

/** Chapter-end "Related chapters" — topically nearest chapters by shared
 *  glossary terms. Keyword-rich internal links (anchor text = chapter title).
 *  Numbered chapters only; renders nothing when there is no overlap. */
export function RelatedChapters({ lang, num }: { lang: Lang; num: string }) {
  const related = relatedChapters(num);
  if (!related.length) return null;

  return (
    <nav
      className="mt-16 pt-8 border-t"
      style={{ borderColor: "var(--theme-border)" }}
      aria-label={lang === "zh" ? "相关章节" : "Related chapters"}
    >
      <h2
        className="text-xs tracking-[0.18em] uppercase mb-4"
        style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
      >
        {lang === "zh" ? "相关章节" : "Related chapters"}
      </h2>
      <ul className="space-y-2.5">
        {related.map((n) => {
          const meta = getChapterMeta(n, lang);
          if (!meta) return null;
          return (
            <li key={n}>
              <Link
                href={chapterHref(lang, n)}
                className="text-[0.95rem] leading-snug hover:opacity-70 transition-opacity"
                style={{ fontFamily: "var(--font-serif)", color: "var(--theme-accent)" }}
              >
                <span style={{ color: "var(--theme-text-muted)" }}>
                  {lang === "zh" ? `第 ${parseInt(n)} 章 · ` : `Chapter ${parseInt(n)} · `}
                </span>
                {meta.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
