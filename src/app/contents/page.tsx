import type { Metadata } from "next";
import { ALL_CHAPTERS, getChapterMeta } from "@/lib/toc";
import { SITE_URL, SITE_NAME, BOOK_TITLE } from "@/lib/site";
import { chapterHref } from "@/lib/keywords";
import { ContentsView } from "@/components/ContentsView";

export const metadata: Metadata = {
  title: "Contents · 目录 — Permissionless Finance",
  description:
    "The full table of contents — thirty-three chapters on the market microstructure of perpetual futures, across ten parts, each with a one-line summary.",
  alternates: { canonical: "/contents" },
  openGraph: {
    type: "website",
    title: "Contents — Permissionless Finance",
    description: "All 33 chapters on perpetual-futures market microstructure.",
    url: "/contents",
    siteName: SITE_NAME.en,
  },
};

// ItemList of every chapter — an explicit, crawlable book outline for engines.
function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Contents — ${BOOK_TITLE.en}`,
    url: `${SITE_URL}/contents`,
    numberOfItems: ALL_CHAPTERS.filter((c) => /^\d+$/.test(c.num)).length,
    itemListElement: ALL_CHAPTERS.filter((c) => /^\d+$/.test(c.num)).map((c) => ({
      "@type": "ListItem",
      position: parseInt(c.num, 10),
      name: getChapterMeta(c.num, "en")!.title,
      url: `${SITE_URL}${chapterHref("en", c.num)}`,
    })),
  };
}

export default function ContentsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <ContentsView />
    </>
  );
}
