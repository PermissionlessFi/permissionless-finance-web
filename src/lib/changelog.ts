export interface ChangelogEntry {
  /** ISO date, YYYY-MM-DD. Newest first. */
  date: string;
  en: string;
  zh: string;
  details?: { en: string; zh: string }[];
}

/**
 * Human-readable record of what changed, and an honest freshness signal for
 * search/AI engines (drives /changelog's lastModified). Add a new entry at the
 * top whenever chapters or the site meaningfully change — do NOT pad it.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-07-04",
    en: "English edition and open-access launch",
    zh: "英文版与开放获取上线",
    details: [
      {
        en: "All 33 chapters and the front matter published in English and Chinese.",
        zh: "全书 33 章及卷首内容以中英双语出版。",
      },
      {
        en: "Released under CC BY 4.0 with a dedicated License page; added full-text site search.",
        zh: "以 CC BY 4.0 开放许可发布，新增独立许可页；上线全文站内搜索。",
      },
      {
        en: "Machine-readable Markdown mirrors (append .md to any chapter URL) and an llms.txt index for AI engines.",
        zh: "面向 AI 引擎的 Markdown 镜像（任意章节 URL 加 .md）与 llms.txt 索引。",
      },
    ],
  },
];
