import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { OPEN_PROBLEMS } from "@/lib/problems";
import { chapterHref } from "@/lib/keywords";
import { ProblemsView } from "@/components/ProblemsView";

export const metadata: Metadata = {
  title: "Open Problems · 开放问题 — Permissionless Finance",
  description:
    "Ten open research questions in perpetual futures market microstructure — one from each part of the book: liquidity thresholds, liquidation-cascade reflexivity, benchmark governance, decentralized clearing and settlement, and more.",
  alternates: { canonical: "/problems" },
  openGraph: {
    type: "website",
    title: "Open Problems — Permissionless Finance",
    description: "The ten questions the book leaves open — the starting line for the next round of research.",
    url: "/problems",
    siteName: SITE_NAME.en,
  },
};

// ItemList of the ten open questions, each pointing to its source chapter.
function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Open Problems — Permissionless Finance",
    url: `${SITE_URL}/problems`,
    numberOfItems: OPEN_PROBLEMS.length,
    itemListElement: OPEN_PROBLEMS.map((p) => ({
      "@type": "ListItem",
      position: p.part,
      name: p.qEn,
      url: `${SITE_URL}${chapterHref("en", p.chapter)}`,
    })),
  };
}

export default function ProblemsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <ProblemsView />
    </>
  );
}
