import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, BOOK_TITLE, AUTHOR_NAME } from "@/lib/site";
import { DOWNLOADS } from "@/lib/external";
import { DownloadView } from "@/components/DownloadView";

export const metadata: Metadata = {
  title: "Download · 下载全书 — Permissionless Finance",
  description:
    "Download Permissionless Finance free as PDF or EPUB, in English and Chinese, under a CC BY 4.0 open license — all 33 chapters on the market microstructure of perpetual futures.",
  alternates: { canonical: "/download" },
  openGraph: {
    type: "website",
    title: "Download the Book — Permissionless Finance",
    description: "Free PDF and EPUB, English and Chinese, CC BY 4.0.",
    url: "/download",
    siteName: SITE_NAME.en,
  },
};

// Book with digital editions as workExample; live files get contentUrl.
function jsonLd() {
  const editions = (["en", "zh"] as const).flatMap((lang) =>
    (["pdf", "epub"] as const)
      .filter((f) => DOWNLOADS[f][lang].href !== "")
      .map((f) => ({
        "@type": "Book",
        bookFormat: "https://schema.org/EBook",
        inLanguage: lang === "zh" ? "zh-CN" : "en",
        name: BOOK_TITLE[lang],
        fileFormat: f === "pdf" ? "application/pdf" : "application/epub+zip",
        contentUrl: `${SITE_URL}${DOWNLOADS[f][lang].href}`,
        isAccessibleForFree: true,
        license: "https://creativecommons.org/licenses/by/4.0/",
      }))
  );
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: BOOK_TITLE.en,
    author: { "@type": "Person", name: AUTHOR_NAME },
    url: `${SITE_URL}/download`,
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    workExample: editions,
  };
}

export default function DownloadPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <DownloadView />
    </>
  );
}
