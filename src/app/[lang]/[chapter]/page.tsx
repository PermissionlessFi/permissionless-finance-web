import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { LayoutShell } from "@/components/LayoutShell";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterNav } from "@/components/ChapterNav";
import { TableOfContents } from "@/components/TableOfContents";
import { KeyboardNav } from "@/components/KeyboardNav";
import { ChapterChips } from "@/components/ChapterChips";
import { ChapterFaq } from "@/components/ChapterFaq";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedChapters } from "@/components/RelatedChapters";
import { CiteChapter } from "@/components/CiteChapter";
import { getChapterContent, getChapterDescription, getContentDate, extractHeadings } from "@/lib/chapters";
import { getChapterMeta, ALL_CHAPTERS } from "@/lib/toc";
import { SEO_TITLES, chapterPath, chapterHref, resolveChapterParam } from "@/lib/keywords";
import { chapterKeywords } from "@/lib/chapter-keywords";
import { CHAPTER_ABSTRACTS } from "@/lib/chapter-abstracts";
import { chapterJsonLd } from "@/lib/seo-jsonld";
import { citationMeta } from "@/lib/citation";
import { SITE_NAME, SITE_DESCRIPTION, AUTHOR_NAME } from "@/lib/site";
import { Lang } from "@/lib/types";

const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function formatUpdated(d: Date | null, lang: Lang): string | null {
  if (!d) return null;
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  return lang === "zh" ? `${y} 年 ${m + 1} 月` : `${MONTHS_EN[m]} ${y}`;
}

/** Trim text to a meta-description length at a word boundary. */
function clampMeta(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return (at > max * 0.6 ? cut.slice(0, at) : cut).trimEnd() + "…";
}

interface PageProps {
  params: Promise<{ lang: string; chapter: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: langParam, chapter } = await params;
  if (langParam !== "zh" && langParam !== "en") return {};
  const lang = langParam as Lang;

  const num = resolveChapterParam(chapter);
  if (!num || chapter !== chapterPath(num)) return {}; // 404s and redirecting legacy URLs need no metadata

  const meta = getChapterMeta(num, lang);
  if (!meta) return {};

  // SEO title layer: EN titles may front-load the target keyword
  // (tasks/keyword_chapter_map_2026-07.md); H1 keeps the book's own title.
  const baseTitle = lang === "en" && SEO_TITLES[num] ? SEO_TITLES[num] : meta.title;
  const title = `${baseTitle} — ${SITE_NAME[lang]}`;
  // Prefer the authored, definition-first abstract as the meta description
  // (keyword-front-loaded); fall back to the auto-extracted opening paragraph.
  const abstract = CHAPTER_ABSTRACTS[num]?.[lang];
  const description = abstract
    ? clampMeta(abstract)
    : getChapterDescription(lang, num) || SITE_DESCRIPTION[lang];
  const path = chapterHref(lang, num);
  const modified = getContentDate(num);

  const kw = chapterKeywords(num, lang);

  return {
    title,
    description,
    ...(kw.length ? { keywords: kw } : {}),
    // Highwire citation_* tags — Google Scholar / Zotero / Mendeley recognition
    ...(/^\d+$/.test(num) ? { other: citationMeta(num, lang) } : {}),
    alternates: {
      canonical: path,
      languages: {
        "zh-Hans": chapterHref("zh", num),
        en: chapterHref("en", num),
        "x-default": chapterHref("en", num),
      },
      // Machine-readable Markdown mirror (agents fetch this for the clean source)
      types: { "text/markdown": `${path}.md` },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: path,
      siteName: SITE_NAME[lang],
      locale: lang === "zh" ? "zh_CN" : "en_US",
      ...(modified ? { modifiedTime: modified.toISOString() } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { lang: langParam, chapter } = await params;

  if (langParam !== "zh" && langParam !== "en") notFound();
  const lang = langParam as Lang;

  const num = resolveChapterParam(chapter);
  if (!num) notFound();

  // Legacy /en/10 and stale-slug URLs 308 to the canonical keyword-slug URL.
  const canonical = chapterPath(num);
  if (chapter !== canonical) permanentRedirect(`/${lang}/${canonical}`);

  const meta = getChapterMeta(num, lang);
  if (!meta) notFound();

  let content: string;
  try {
    content = getChapterContent(lang, num);
  } catch {
    notFound();
  }

  const headings = extractHeadings(content);
  const updated = getContentDate(num);
  const jsonLd = chapterJsonLd({
    lang,
    num,
    title: meta.title,
    partTitle: meta.partTitle,
    modified: updated,
    description: getChapterDescription(lang, num),
  });
  const byline = formatUpdated(updated, lang);

  return (
    <LayoutShell lang={lang} currentChapter={num} chapterTitle={meta.title}>
      {/* Structured data (static, first-party content only) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <TableOfContents headings={headings} lang={lang} />
      <KeyboardNav lang={lang} prevChapter={meta.prevChapter} nextChapter={meta.nextChapter} />

      {/* Breadcrumb: site › part (mirrors BreadcrumbList JSON-LD) */}
      <Breadcrumb lang={lang} partTitle={meta.partTitle} />

      {/* Chapter label — numbered chapters only; front matter (preface, etc.) has none */}
      {/^\d+$/.test(num) && (
        <p className="text-lg mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-chapter-label, #6b7280)" }}>
          {lang === "zh" ? `第${parseInt(num)}章` : `Chapter ${parseInt(num)}`}
        </p>
      )}

      {/* Chapter title */}
      <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading, #5C3D2E)" }}>
        {meta.title}
      </h1>

      {/* Byline — visible E-E-A-T signal echoing the author/date schema */}
      {/^\d+$/.test(num) && (
        <p className="text-sm mb-8" style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}>
          {lang === "zh" ? "作者 " : "By "}{AUTHOR_NAME}
          {byline ? ` · ${lang === "zh" ? "更新于 " : "Updated "}${byline}` : ""}
        </p>
      )}

      {/* Non-intrusive apparatus: Abstract + Key-terms chips side by side under
          the title, panels expand full-width. Renders nothing when a chapter
          has neither. */}
      <ChapterChips lang={lang} num={num} />

      {/* Chapter content */}
      <ChapterContent content={content} lang={lang} />

      {/* Chapter FAQ (renders only for chapters with approved Q&A) */}
      <ChapterFaq lang={lang} num={num} />

      {/* Cite this chapter — APA + BibTeX (numbered chapters) */}
      <CiteChapter lang={lang} num={num} />

      {/* Related chapters — keyword-anchor internal links by shared key-terms */}
      <RelatedChapters lang={lang} num={num} />

      {/* Prev/Next navigation */}
      <ChapterNav lang={lang} chapterNum={num} />
    </LayoutShell>
  );
}

export function generateStaticParams() {
  const params: { lang: string; chapter: string }[] = [];
  for (const ch of ALL_CHAPTERS) {
    params.push({ lang: "zh", chapter: chapterPath(ch.num) });
    params.push({ lang: "en", chapter: chapterPath(ch.num) });
  }
  return params;
}
