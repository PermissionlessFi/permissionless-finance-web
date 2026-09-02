import { CHANGELOG } from "@/lib/changelog";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

// RSS 2.0 feed from the changelog — a discovery + freshness channel for
// aggregators and crawlers. Served at /feed.xml via a rewrite in next.config.ts.
export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = CHANGELOG.map((e) => {
    const detail = e.details?.map((d) => d.en).join(" ") ?? "";
    const pub = new Date(e.date).toUTCString();
    return [
      "    <item>",
      `      <title>${esc(e.en)}</title>`,
      `      <link>${SITE_URL}/changelog</link>`,
      `      <guid isPermaLink="false">changelog-${e.date}</guid>`,
      `      <pubDate>${pub}</pubDate>`,
      `      <description>${esc(detail)}</description>`,
      "    </item>",
    ].join("\n");
  }).join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${esc(SITE_NAME.en)}</title>\n` +
    `    <link>${SITE_URL}</link>\n` +
    `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>\n` +
    `    <description>${esc(SITE_DESCRIPTION.en)}</description>\n` +
    `    <language>en</language>\n` +
    items +
    `\n  </channel>\n</rss>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
