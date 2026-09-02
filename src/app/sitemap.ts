import type { MetadataRoute } from "next";
import { ALL_CHAPTERS } from "@/lib/toc";
import { SITE_URL } from "@/lib/site";
import { chapterHref } from "@/lib/keywords";
import { getContentMtime, getChapterImages } from "@/lib/chapters";
import { CHANGELOG } from "@/lib/changelog";
import { PUBLISHED_LABS } from "@/lib/labs";
import contentDates from "@/lib/content-dates.json";

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

  const changelogModified = CHANGELOG.length ? new Date(CHANGELOG[0].date) : newest;

  return [
    { url: SITE_URL, lastModified: newest, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/contents`, lastModified: newest, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/paths`, lastModified: newest, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/labs`, lastModified: newest, changeFrequency: "monthly", priority: 0.7 },
    ...PUBLISHED_LABS.map((lab) => ({
      url: `${SITE_URL}/labs/${lab.slug}`,
      lastModified: newest,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/download`, lastModified: newest, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/problems`, lastModified: newest, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/glossary`, lastModified: newest, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/community`, lastModified: newest, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/support`, lastModified: newest, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/changelog`, lastModified: changelogModified, changeFrequency: "weekly", priority: 0.4 },
    ...entries,
  ];
}
