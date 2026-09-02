import { CHAPTER_FAQ } from "@/lib/faq";
import { Reveal } from "./Reveal";
import { Lang } from "@/lib/types";

/** Collapsed "FAQ" chip after the chapter body; expands to the Q&A with a
 *  fade/scale animation. Also emitted as FAQPage JSON-LD (seo-jsonld.ts), so
 *  the signal reaches Google/AI regardless of the collapsed state. Renders
 *  nothing until a chapter has author-approved Q&A. */
export function ChapterFaq({ lang, num }: { lang: Lang; num: string }) {
  const items = CHAPTER_FAQ[num]?.[lang];
  if (!items?.length) return null;

  return (
    <div className="mt-20 pt-10 border-t" style={{ borderColor: "var(--theme-border)" }}>
      <Reveal label={lang === "zh" ? "常见问题" : "FAQ"}>
        <dl className="mt-4 space-y-6">
          {items.map((it, i) => (
            <div key={i}>
              <dt
                className="font-semibold mb-1.5"
                style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text)" }}
              >
                {it.q}
              </dt>
              <dd
                className="text-[0.95rem] leading-relaxed"
                style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
              >
                {it.a}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  );
}
