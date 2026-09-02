import type { Metadata } from "next";
import { GLOSSARY } from "@/lib/glossary";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { GlossaryView } from "@/components/GlossaryView";

export const metadata: Metadata = {
  title: "Glossary · 术语表 — Permissionless Finance",
  description:
    "Definitions of the core terms of perpetual-futures market microstructure — funding rate, liquidation cascade, mark price, order book, and more.",
  keywords: [
    "perpetual futures glossary", "market microstructure terms", "funding rate definition",
    "liquidation cascade", "crypto derivatives glossary", "永续合约术语", "市场微观结构术语",
  ],
  alternates: { canonical: "/glossary" },
  openGraph: {
    type: "website",
    title: "Glossary — Permissionless Finance",
    description: "The defined vocabulary of perpetual-futures market microstructure.",
    url: "/glossary",
    siteName: SITE_NAME.en,
  },
};

// Bilingual DefinedTermSet — machine-readable, independent of the display
// language toggle (name = English, alternateName = Chinese).
function jsonLd() {
  const setId = `${SITE_URL}/glossary#set`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTermSet",
        "@id": setId,
        name: "Glossary — Permissionless Finance",
        url: `${SITE_URL}/glossary`,
        inLanguage: ["en", "zh-Hans"],
        hasDefinedTerm: GLOSSARY.map((t) => ({
          "@type": "DefinedTerm",
          "@id": `${SITE_URL}/glossary#${t.id}`,
          name: t.en,
          alternateName: t.zh,
          description: t.defEn,
          inDefinedTermSet: { "@id": setId },
          url: `${SITE_URL}/glossary#${t.id}`,
        })),
      },
    ],
  };
}

export default function GlossaryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <GlossaryView />
    </>
  );
}
