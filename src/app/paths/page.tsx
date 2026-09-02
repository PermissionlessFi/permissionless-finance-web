import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { LEARNING_PATHS } from "@/lib/paths";
import { getChapterMeta } from "@/lib/toc";
import { chapterHref } from "@/lib/keywords";
import { PathsView } from "@/components/PathsView";

export const metadata: Metadata = {
  title: "Learning Paths · 学习路径 — Permissionless Finance",
  description:
    "Three curated tracks through the book — trader, quant researcher, and builder — each staged through the 33 chapters on perpetual futures market microstructure, with arbitrage and market-making specializations.",
  alternates: { canonical: "/paths" },
  openGraph: {
    type: "website",
    title: "Learning Paths — Permissionless Finance",
    description: "Trader · quant · builder tracks through 33 chapters of perpetual-futures market microstructure.",
    url: "/paths",
    siteName: SITE_NAME.en,
  },
};

// One ItemList per track: an explicit curriculum graph for engines.
function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Learning Paths — Permissionless Finance",
    url: `${SITE_URL}/paths`,
    numberOfItems: LEARNING_PATHS.length,
    itemListElement: LEARNING_PATHS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "ItemList",
        name: `${p.en} track`,
        description: p.whoEn,
        itemListElement: p.stages.flatMap((s) => s.chapters).map((num, j) => ({
          "@type": "ListItem",
          position: j + 1,
          name: getChapterMeta(num, "en")!.title,
          url: `${SITE_URL}${chapterHref("en", num)}`,
        })),
      },
    })),
  };
}

export default function PathsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <PathsView />
    </>
  );
}
