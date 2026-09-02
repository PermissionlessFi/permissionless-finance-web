/**
 * External community assets + book downloads — single switchboard.
 * Empty string = asset not live yet → pages render a "coming soon" state.
 * When an asset goes live (Discord invite, X handle, newsletter, GitHub,
 * GitHub Releases file URLs), fill the value here and rebuild: every entry
 * point across the site activates at once. No other file needs editing.
 */

export const COMMUNITY_LINKS = {
  /** X (Twitter) profile URL — the public broadcast channel */
  x: "https://x.com/PermlessFi",
  /** GitHub — the project's home (repos, issues, contributions) */
  github: "https://github.com/PermissionlessFi",
};

export interface DownloadFile {
  /** empty href = not yet available → "in production" state */
  href: string;
  size: string;
  updated: string; // YYYY-MM
}

/** Served from /public/downloads (interim; move to GitHub Releases at launch
 *  by swapping hrefs — see tasks checklist P3). Rebuild the EPUBs with
 *  build_pdf/latex_to_epub_md.py + pandoc when the manuscript changes. */
export const DOWNLOADS: Record<"pdf" | "epub", Record<"zh" | "en", DownloadFile>> = {
  pdf: {
    en: { href: "/downloads/permissionless-finance-en.pdf", size: "35 MB", updated: "2026-07" },
    zh: { href: "/downloads/permissionless-finance-zh.pdf", size: "33 MB", updated: "2026-07" },
  },
  epub: {
    en: { href: "/downloads/permissionless-finance-en.epub", size: "29 MB", updated: "2026-07" },
    zh: { href: "/downloads/permissionless-finance-zh.epub", size: "27 MB", updated: "2026-07" },
  },
};
