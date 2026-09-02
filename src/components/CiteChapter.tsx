import { chapterCitation } from "@/lib/citation";
import { Reveal } from "./Reveal";
import { Lang } from "@/lib/types";

/** Collapsed "Cite this chapter" chip at the chapter end — APA + BibTeX for the
 *  chapter. Numbered chapters only. Pairs with citation_* meta so scholars can
 *  one-click import into Zotero/Mendeley. */
export function CiteChapter({ lang, num }: { lang: Lang; num: string }) {
  if (!/^\d+$/.test(num)) return null;
  const { apa, bibtex } = chapterCitation(num, lang);

  return (
    <div className="mt-12">
      <Reveal label={lang === "zh" ? "引用本章" : "CITE THIS CHAPTER"}>
        <div className="mt-3 space-y-4">
          <div>
            <div
              className="text-[10px] tracking-[0.15em] uppercase mb-1.5"
              style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
            >
              APA
            </div>
            <p
              className="text-[0.9rem] leading-relaxed"
              style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
            >
              {apa}
            </p>
          </div>
          <div>
            <div
              className="text-[10px] tracking-[0.15em] uppercase mb-1.5"
              style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
            >
              BibTeX
            </div>
            <pre
              className="text-xs overflow-x-auto rounded-md p-3 leading-relaxed"
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                background: "var(--theme-bg-secondary)",
                border: "1px solid var(--theme-border)",
                color: "var(--theme-text-secondary)",
              }}
            >
              {bibtex}
            </pre>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
