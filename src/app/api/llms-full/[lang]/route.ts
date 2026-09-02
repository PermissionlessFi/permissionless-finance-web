import { buildLlmsFull } from "@/lib/llms";
import { Lang } from "@/lib/types";

// Whole-book plain text, prerendered per language at build. Served at
// /llms-full-en.txt and /llms-full-zh.txt via the rewrite in next.config.ts.
export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  if (lang !== "en" && lang !== "zh") {
    return new Response("Not found", { status: 404 });
  }
  return new Response(buildLlmsFull(lang as Lang), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
