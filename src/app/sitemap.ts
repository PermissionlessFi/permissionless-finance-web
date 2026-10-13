import type { MetadataRoute } from "next";
import { ALL_CHAPTERS } from "@/lib/toc";
import { SITE_URL } from "@/lib/site";
import { chapterHref } from "@/lib/keywords";
import { getContentMtime, getChapterImages } from "@/lib/chapters";
import { CHANGELOG } from "@/lib/changelog";
import { PUBLISHED_LABS } from "@/lib/labs";
import contentDates from "@/lib/content-dates.json";
import pageDates from "@/lib/page-dates.json";

/**
 * Sitemap for all chapter pages in both languages, with hreflang alternates
 * (so zh/en read as translations, not duplicates) and figure images per page.
 *
 * lastModified comes from content-dates.json — a committed snapshot of each
 * chapter's last change (git commit date / mtime). NOT the live file mtime,
 * which on Vercel equals the build time and would make every deploy report the
 * whole book as "just updated", eroding lastmod trust. Regenerate before
 * deploy: `node scripts/gen-content-dates.mjs`.
 */
const DATES = contentDates as Record<string, string>;
/** Non-chapter routes: per-route git date snapshot (scripts/gen-page-dates.mjs). */
const PAGE_DATES = pageDates as Record<string, string>;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  let newest = new Date(0);

  for (const ch of ALL_CHAPTERS) {
    const zhUrl = `${SITE_URL}${chapterHref("zh", ch.num)}`;
    const enUrl = `${SITE_URL}${chapterHref("en", ch.num)}`;
    const languages = { "zh-Hans": zhUrl, en: enUrl };
    const dated = DATES[ch.num]
      ? new Date(DATES[ch.num])
      : getContentMtime("en", ch.num) ?? new Date();
    if (dated > newest) newest = dated;

    for (const lang of ["zh", "en"] as const) {
      const images = getChapterImages(lang, ch.num).map((b) => `${SITE_URL}/images/${b}`);
      entries.push({
        url: lang === "zh" ? zhUrl : enUrl,
        lastModified: dated,
        changeFrequency: "monthly",
        priority: /^\d+$/.test(ch.num) ? 0.8 : 0.5,
        alternates: { languages },
        ...(images.length ? { images } : {}),
      });
    }
  }

  // Per-route real modification date; falls back to newest chapter date.
  const pd = (route: string) => (PAGE_DATES[route] ? new Date(PAGE_DATES[route]) : newest);
  // Homepage/contents list every chapter, so they change when any chapter does.
  const later = (a: Date, b: Date) => (a > b ? a : b);

  const changelogModified = CHANGELOG.length ? new Date(CHANGELOG[0].date) : newest;

  return [
    { url: SITE_URL, lastModified: later(pd("/"), newest), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/contents`, lastModified: later(pd("/contents"), newest), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/paths`, lastModified: pd("/paths"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/labs`, lastModified: pd("/labs"), changeFrequency: "monthly", priority: 0.7 },
    ...PUBLISHED_LABS.map((lab) => ({
      url: `${SITE_URL}/labs/${lab.slug}`,
      lastModified: pd(`/labs/${lab.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/download`, lastModified: pd("/download"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/problems`, lastModified: pd("/problems"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/glossary`, lastModified: pd("/glossary"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/community`, lastModified: pd("/community"), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/support`, lastModified: pd("/support"), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/changelog`, lastModified: changelogModified, changeFrequency: "weekly", priority: 0.4 },
    ...entries,
  ];
}
