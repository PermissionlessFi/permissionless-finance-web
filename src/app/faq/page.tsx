import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, LICENSE_URL } from "@/lib/site";
import { chapterHref } from "@/lib/keywords";
import { beginnerFaq, beginnerFaqItems, beginnerFaqTerms } from "@/lib/beginner-faq";
import { FaqView } from "@/components/FaqView";

const TITLE = "Perpetual Futures FAQ: Funding Rate, Mark Price, Liquidation, ADL";
const DESCRIPTION =
  "Beginner answers on perpetual futures: what the funding rate is, mark price vs index price, liquidation and liquidation cascades, ADL, and funding-rate arbitrage.";

export const metadata: Metadata = {
  title: `${TITLE} — ${SITE_NAME.en}`,
  description: DESCRIPTION,
  keywords: [
    "perpetual futures FAQ", "what is funding rate", "funding rate explained", "mark price vs index price",
    "what is ADL", "auto-deleveraging", "liquidation cascade", "insurance fund", "funding rate arbitrage",
  ],
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "/faq",
    siteName: SITE_NAME.en,
    locale: "en_US",
    alternateLocale: "zh_CN",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/** WebPage + FAQPage + the glossary terms this page covers (same @ids as
 *  /glossary, so they merge into the one site-wide DefinedTermSet). */
function jsonLd() {
  const pageUrl = `${SITE_URL}/faq`;
  const setId = `${SITE_URL}/glossary#set`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#book` },
        author: { "@id": `${SITE_URL}/#author` },
        publisher: { "@id": `${SITE_URL}/#org` },
        license: LICENSE_URL,
        isAccessibleForFree: true,
        mainEntity: { "@id": `${pageUrl}#faq` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE_NAME.en, item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "FAQ", item: pageUrl },
          ],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        url: pageUrl,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: beginnerFaqItems().map((it) => ({
          "@type": "Question",
          "@id": `${pageUrl}#${it.anchor}`,
          name: it.qEn,
          acceptedAnswer: {
            "@type": "Answer",
            text: it.aEn,
            url: `${SITE_URL}${chapterHref("en", it.chapter)}`,
          },
        })),
      },
      {
        "@type": "DefinedTermSet",
        "@id": setId,
        name: "Glossary — Permissionless Finance",
        url: `${SITE_URL}/glossary`,
        hasDefinedTerm: beginnerFaqTerms().map((t) => ({
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

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <FaqView sections={beginnerFaq()} />
    </>
  );
}
