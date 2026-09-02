import { getRawChapter } from "@/lib/chapters";
import { ALL_CHAPTERS } from "@/lib/toc";
import { resolveChapterParam, chapterHref, chapterPath } from "@/lib/keywords";
import { SITE_URL, SITE_NAME, BOOK_TITLE, AUTHOR_NAME, LICENSE_URL } from "@/lib/site";
import { Lang } from "@/lib/types";

// Prerender every chapter's raw Markdown at BUILD time. This is required, not
// just an optimization: content/ is a tree of symlinks that Vercel's runtime
// file tracing would not follow, so a dynamic handler reading fs would 404 in
// production. force-static reads at build (local fs, symlinks resolve) and
// serves a static asset at runtime. Reached via the rewrite in next.config.ts:
//   /:lang/:slug.md  →  /api/md/:lang/:slug
export const dynamic = "force-static";

export function generateStaticParams() {
  const out: { lang: string; slug: string }[] = [];
  for (const c of ALL_CHAPTERS) {
    out.push({ lang: "en", slug: chapterPath(c.num) });
    out.push({ lang: "zh", slug: chapterPath(c.num) });
  }
  return out;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string; slug: string }> }
) {
  const { lang: langParam, slug } = await params;
  if (langParam !== "en" && langParam !== "zh") {
    return new Response("Not found", { status: 404 });
  }
  const lang = langParam as Lang;
  const num = resolveChapterParam(slug.replace(/\.md$/, ""));
  if (!num) return new Response("Not found", { status: 404 });

  const raw = getRawChapter(lang, num);
  if (!raw) return new Response("Not found", { status: 404 });

  const canonical = `${SITE_URL}${chapterHref(lang, num)}`;
  const header =
    `> **Source:** ${canonical}\n` +
    `> From *${SITE_NAME[lang]}* (${BOOK_TITLE[lang]}) by ${AUTHOR_NAME}. ` +
    `Licensed under CC BY 4.0 (${LICENSE_URL}).\n\n`;

  return new Response(header + raw, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
