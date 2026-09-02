import type { Metadata } from "next";
import Link from "next/link";
import { CHANGELOG } from "@/lib/changelog";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Changelog · 更新日志 — Permissionless Finance",
  description:
    "What's new in Permissionless Finance — new chapters, translations, and changes to the reading site.",
  alternates: { canonical: "/changelog" },
  openGraph: {
    type: "website",
    title: "Changelog — Permissionless Finance",
    description: "Updates to the book and the reading site.",
    url: "/changelog",
    siteName: SITE_NAME.en,
  },
};

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Changelog — Permissionless Finance",
    isPartOf: { "@id": `${SITE_URL}/#book` },
    url: `${SITE_URL}/changelog`,
    dateModified: CHANGELOG[0]?.date,
  };
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen px-6 py-16" style={{ color: "var(--theme-text)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
        >
          ← {SITE_NAME.en}
        </Link>

        <h1
          className="text-4xl font-bold mt-6 mb-2"
          style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
        >
          Changelog
        </h1>
        <p
          className="text-sm mb-14"
          style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
        >
          更新日志 — what's new in the book and on the site.
        </p>

        <div className="space-y-14">
          {CHANGELOG.map((e) => (
            <article
              key={e.date}
              className="border-l-2 pl-6"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <time
                dateTime={e.date}
                className="block text-xs tracking-widest mb-3"
                style={{ fontFamily: "var(--font-heading)", color: "var(--theme-accent)" }}
              >
                {e.date}
              </time>
              <h2
                className="text-xl font-bold mb-1"
                style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text)" }}
              >
                {e.en}
              </h2>
              <p className="text-sm mb-4" style={{ color: "var(--theme-text-secondary)" }}>
                {e.zh}
              </p>
              {e.details && (
                <ul className="space-y-2">
                  {e.details.map((d, i) => (
                    <li
                      key={i}
                      className="text-sm leading-relaxed"
                      style={{ fontFamily: "var(--font-serif)", color: "var(--theme-text-secondary)" }}
                    >
                      <span style={{ color: "var(--theme-text)" }}>{d.en}</span>
                      <span className="block text-xs mt-0.5" style={{ color: "var(--theme-text-muted)" }}>
                        {d.zh}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
