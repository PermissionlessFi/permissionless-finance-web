import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { PUBLISHED_LABS } from "@/lib/labs";
import { LabsView } from "@/components/labs/LabsView";

export const metadata: Metadata = {
  title: "Labs · 实验室 — Permissionless Finance",
  description:
    "Interactive simulators of the book's mechanisms — trigger a liquidation cascade, play the funding-rate game, walk a market order through the book. Sixty seconds each to one 'so that's why'.",
  alternates: { canonical: "/labs" },
  openGraph: {
    type: "website",
    title: "Labs — Permissionless Finance",
    description: "Interactive simulators: liquidation cascades, funding rates, order-book slippage.",
    url: "/labs",
    siteName: SITE_NAME.en,
    locale: "en_US",
    alternateLocale: "zh_CN",
  },
};

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Labs — Permissionless Finance",
    url: `${SITE_URL}/labs`,
    numberOfItems: PUBLISHED_LABS.length,
    itemListElement: PUBLISHED_LABS.map((lab, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LearningResource",
        name: `${lab.en} — interactive simulator`,
        description: lab.learnEn,
        learningResourceType: "Simulation",
        url: `${SITE_URL}/labs/${lab.slug}`,
        isAccessibleForFree: true,
      },
    })),
  };
}

export default function LabsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <LabsView />
    </>
  );
}
