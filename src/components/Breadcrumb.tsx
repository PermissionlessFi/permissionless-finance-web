import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { Lang } from "@/lib/types";

/** Visible breadcrumb above the chapter title, mirroring the BreadcrumbList
 *  JSON-LD: [site] › [part]. Gives an internal link home and reinforces the
 *  book's part→chapter structure for crawlers and readers. */
export function Breadcrumb({ lang, partTitle }: { lang: Lang; partTitle: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 text-xs"
      style={{ fontFamily: "var(--font-heading)", color: "var(--theme-text-muted)" }}
    >
      <Link href="/" className="hover:opacity-70 transition-opacity">
        {SITE_NAME[lang]}
      </Link>
      <span className="mx-1.5" aria-hidden="true">›</span>
      <span>{partTitle}</span>
    </nav>
  );
}
