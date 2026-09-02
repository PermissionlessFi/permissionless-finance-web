import { buildLlmsTxt } from "@/lib/llms";

// Built at build time (reads content/ symlinks locally). Served at /llms.txt
// via the rewrite in next.config.ts.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
