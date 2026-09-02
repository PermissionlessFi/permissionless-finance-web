import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { SupportView } from "@/components/SupportView";

export const metadata: Metadata = {
  title: "Support · 支持我们 — Permissionless Finance",
  description:
    "Permissionless Finance is a free, CC BY 4.0 book. Support it by reading and sharing, contributing on GitHub, translating it, sponsoring the work, or subscribing for updates.",
  alternates: { canonical: "/support" },
  openGraph: {
    type: "website",
    title: "Support — Permissionless Finance",
    description: "Read & share, contribute, translate, sponsor, or subscribe — how to support the free, open book.",
    url: "/support",
    siteName: SITE_NAME.en,
  },
};

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Support — Permissionless Finance",
    url: `${SITE_URL}/support`,
    description:
      "Ways to support Permissionless Finance, a free and open (CC BY 4.0) book: reading and sharing, contributing and translating on GitHub, sponsorship, and the newsletter.",
  };
}

export default function SupportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <SupportView />
    </>
  );
}
