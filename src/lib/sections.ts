import { Lang } from "./types";
import { chapterHref } from "./keywords";

export type Group = "book" | "other";

export interface NavItem {
  key: string;
  zh: string;
  en: string;
  descZh: string;
  descEn: string;
  /** search-modal quick-nav grouping (book vs other); omit to exclude from quick-nav */
  group?: Group;
  /** undefined → coming soon (not yet built) */
  href?: (lang: Lang) => string;
}

export interface Pillar {
  key: "learn" | "community" | "research" | "about";
  zh: string;
  en: string;
  color: string;
  items: NavItem[];
}

/**
 * Two-level navigation, single source of truth.
 * Level 1 = the four pillars (top-bar menus); level 2 = each pillar's items
 * (dropdown: title + description). Consumed by MenuBar and the landing page.
 * `group` collapses items into "book" / "other" for the search-modal quick-nav.
 * An item with no `href` renders as "coming soon".
 */
export const PILLARS: Pillar[] = [
  {
    key: "learn", zh: "学习", en: "Learning", color: "#b0703b",
    items: [
      { key: "read",  zh: "阅读全书", en: "Read the book",   descZh: "全书 33 章，配 AI 辅导",       descEn: "All 33 chapters, with an AI tutor",       group: "book",  href: (l) => chapterHref(l, "01") },
      { key: "contents", zh: "目录", en: "Contents",         descZh: "全书目录，按篇章分组",         descEn: "The full table of contents",              group: "book",  href: (l) => `/contents?lang=${l}` },
      { key: "paths", zh: "学习路径", en: "Learning paths",  descZh: "交易者 · 量化 · 构建者三轨",     descEn: "Trader · quant · builder tracks",         group: "book",  href: (l) => `/paths?lang=${l}` },
      { key: "download", zh: "下载全书", en: "Download",     descZh: "PDF / EPUB，中英双语，免费",     descEn: "Free PDF & EPUB, both languages",         group: "book",  href: (l) => `/download?lang=${l}` },
      { key: "labs",  zh: "实验室",   en: "Labs",            descZh: "交互模拟器：改一个参数看清算级联", descEn: "Interactive simulators of the book's mechanisms", group: "other", href: (l) => `/labs?lang=${l}` },
    ],
  },
  {
    key: "community", zh: "社群", en: "Community", color: "#2f8f6f",
    items: [
      { key: "join",    zh: "加入社区", en: "Join the community", descZh: "X · GitHub · 邮件订阅",       descEn: "X · GitHub · newsletter",              group: "other", href: (l) => `/community?lang=${l}` },
      { key: "support", zh: "支持我们", en: "Support the book",   descZh: "分享 · 共建 · 翻译 · 赞助",   descEn: "Share, contribute, translate, sponsor", group: "other", href: (l) => `/support?lang=${l}` },
    ],
  },
  {
    key: "research", zh: "研究", en: "Research", color: "#3f6cb3",
    items: [
      { key: "glossary", zh: "术语表",     en: "Glossary",       descZh: "核心术语的定义",               descEn: "Definitions of the core terms",             href: (l) => `/glossary?lang=${l}` },
      { key: "problems", zh: "开放问题",   en: "Open problems",  descZh: "每一篇留下的未解问题",         descEn: "The open questions each part ends on",       group: "other", href: (l) => `/problems?lang=${l}` },
    ],
  },
  {
    key: "about", zh: "关于", en: "About", color: "#8a7c69",
    items: [
      { key: "preface",    zh: "前言",     en: "Preface",          descZh: "本书的缘起与路线",   descEn: "Why this book exists",            href: (l) => `/${l}/preface` },
      { key: "disclaimer", zh: "声明",     en: "Disclaimer",       descZh: "免责与 AI 使用声明", descEn: "Disclaimer & AI disclosure",      href: (l) => `/${l}/disclaimer` },
      { key: "license",    zh: "许可",     en: "License",          descZh: "开放许可与引用方式", descEn: "Open license & how to cite",      href: (l) => `/${l}/license` },
      { key: "author",     zh: "关于作者", en: "About the author", descZh: "Eric Cheung",       descEn: "Eric Cheung",                     href: (l) => `/${l}/about` },
      { key: "changelog",  zh: "更新日志", en: "Changelog",        descZh: "本书与网站的更新记录", descEn: "What's new",                    href: () => "/changelog" },
    ],
  },
];
