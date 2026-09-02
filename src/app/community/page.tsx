import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { CommunityView } from "@/components/CommunityView";

export const metadata: Metadata = {
  title: "Community · 社区 — Permissionless Finance",
  description:
    "Join the community around Permissionless Finance — follow on X, contribute and translate on GitHub, and subscribe to the newsletter or RSS for every update to the open book.",
  alternates: { canonical: "/community" },
  openGraph: {
    type: "website",
    title: "Community — Permissionless Finance",
    description: "X · GitHub · newsletter — the community around the book.",
    url: "/community",
    siteName: SITE_NAME.en,
  },
};

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Community — Permissionless Finance",
    url: `${SITE_URL}/community`,
    description:
      "The community entry point for Permissionless Finance: distribution and discussion on X, open-source contribution and translation on GitHub, updates via newsletter and RSS.",
  };
}

export default function CommunityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <CommunityView />
    </>
  );
}
