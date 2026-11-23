import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, LICENSE_URL, SITE_X_HANDLE, AUTHOR_X_HANDLE, BOOK_TITLE, AUTHOR_NAME } from "@/lib/site";
import { chapterHref } from "@/lib/keywords";
import { beginnerFaqItems, beginnerFaqTerms } from "@/lib/beginner-faq";
import { GLOSSARY } from "@/lib/glossary";
import { ALL_CHAPTERS, getChapterMeta } from "@/lib/toc";
import { LEARNING_PATHS } from "@/lib/paths";
import { DOWNLOADS } from "@/lib/external";
import { PUBLISHED_LABS } from "@/lib/labs";
import { Lang } from "@/lib/types";

export type HubName = "faq" | "glossary" | "contents" | "paths" | "download" | "labs";

/** Path-based locale URLs for hub pages that used to rely on `?lang=`. */
export function hubHref(lang: Lang, hub: HubName, hash?: string): string {
  const base = lang === "zh" ? `/zh/${hub}` : `/${hub}`;
  return hash ? `${base}#${hash}` : base;
}

export const FAQ_TITLE: Record<Lang, string> = {
  en: "Perpetual Futures FAQ: Funding Rate, Mark Price, Liquidation, ADL",
  zh: "永续合约常见问题：资金费率、标记价格、清算、自动减仓 ADL",
};

export const FAQ_DESCRIPTION: Record<Lang, string> = {
  en: "Beginner answers on perpetual futures: the funding rate, mark price vs index price, liquidation cascades, ADL, funding-rate arbitrage, and stock perps.",
  zh: "永续合约入门问答：资金费率如何运作、标记价格与指数价格的区别、清算级联、保险基金与自动减仓 ADL、资金费率套利，以及股票永续合约。",
};

export const FAQ_KEYWORDS: Record<Lang, string[]> = {
  en: [
    "perpetual futures FAQ",
    "what is funding rate",
    "funding rate explained",
    "mark price vs index price",
    "what is ADL",
    "auto-deleveraging",
    "liquidation cascade",
    "insurance fund",
    "funding rate arbitrage",
    "stock perpetual futures",
    "stock perps",
    "what are stock perps",
  ],
  zh: [
    "永续合约常见问题",
    "资金费率是什么",
    "标记价格与指数价格",
    "什么是自动减仓",
    "ADL",
    "清算级联",
    "保险基金",
    "资金费率套利",
    "股票永续合约",
    "什么是股票永续",
  ],
};

export const GLOSSARY_TITLE: Record<Lang, string> = {
  en: "Perpetual Futures Glossary · 术语表",
  zh: "永续合约术语表：资金费率、清算级联、标记价格、自动减仓",
};

export const GLOSSARY_DESCRIPTION: Record<Lang, string> = {
  en: "Definitions of the core terms of perpetual-futures market microstructure — funding rate, liquidation cascade, mark price, order book, and more.",
  zh: "永续合约市场微观结构的核心术语定义——资金费率、清算级联、标记价格、订单簿、自动减仓、股票永续合约等。",
};

const FAQ_LANGUAGES = {
  "zh-Hans": "/zh/faq",
  en: "/faq",
  "x-default": "/faq",
} as const;

const GLOSSARY_LANGUAGES = {
  "zh-Hans": "/zh/glossary",
  en: "/glossary",
  "x-default": "/glossary",
} as const;

export function faqMetadata(lang: Lang): Metadata {
  const title = `${FAQ_TITLE[lang]} — ${SITE_NAME[lang]}`;
  const description = FAQ_DESCRIPTION[lang];
  const path = hubHref(lang, "faq");
  return {
    title,
    description,
    keywords: FAQ_KEYWORDS[lang],
    alternates: { canonical: path, languages: FAQ_LANGUAGES },
    openGraph: {
      type: "website",
      title: FAQ_TITLE[lang],
      description,
      url: path,
      siteName: SITE_NAME[lang],
      locale: lang === "zh" ? "zh_CN" : "en_US",
      alternateLocale: lang === "zh" ? "en_US" : "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_X_HANDLE,
      creator: AUTHOR_X_HANDLE,
      title: FAQ_TITLE[lang],
      description,
    },
  };
}

export function glossaryMetadata(lang: Lang): Metadata {
  const title = `${GLOSSARY_TITLE[lang]} — ${SITE_NAME[lang]}`;
  const description = GLOSSARY_DESCRIPTION[lang];
  const path = hubHref(lang, "glossary");
  return {
    title,
    description,
    keywords:
      lang === "zh"
        ? ["永续合约术语表", "市场微观结构术语", "资金费率定义", "清算级联", "加密衍生品术语"]
        : [
            "perpetual futures glossary",
            "market microstructure terms",
            "funding rate definition",
            "liquidation cascade",
            "crypto derivatives glossary",
            "永续合约术语",
            "市场微观结构术语",
          ],
    alternates: { canonical: path, languages: GLOSSARY_LANGUAGES },
    openGraph: {
      type: "website",
      title: lang === "zh" ? "术语表 — 无需许可的金融" : "Glossary — Permissionless Finance",
      description:
        lang === "zh"
          ? "永续合约市场微观结构的核心术语。"
          : "The defined vocabulary of perpetual-futures market microstructure.",
      url: path,
      siteName: SITE_NAME[lang],
      locale: lang === "zh" ? "zh_CN" : "en_US",
      alternateLocale: lang === "zh" ? "en_US" : "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_X_HANDLE,
      creator: AUTHOR_X_HANDLE,
      title: GLOSSARY_TITLE[lang],
      description,
    },
  };
}

/** WebPage + FAQPage in the page language, plus DefinedTerm nodes that
 *  share @ids with /glossary so they merge into the one site-wide set. */
export function faqJsonLd(lang: Lang) {
  const pageUrl = `${SITE_URL}${hubHref(lang, "faq")}`;
  const setId = `${SITE_URL}/glossary#set`;
  const inLanguage = lang === "zh" ? "zh-Hans" : "en";
  const items = beginnerFaqItems().filter((it) => (lang === "zh" ? it.qZh && it.aZh : it.qEn && it.aEn));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: FAQ_TITLE[lang],
        description: FAQ_DESCRIPTION[lang],
        inLanguage,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#book` },
        author: { "@id": `${SITE_URL}/#author` },
        publisher: { "@id": `${SITE_URL}/#org` },
        license: LICENSE_URL,
        isAccessibleForFree: true,
        mainEntity: { "@id": `${pageUrl}#faq` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE_NAME[lang], item: SITE_URL },
            { "@type": "ListItem", position: 2, name: lang === "zh" ? "常见问题" : "FAQ", item: pageUrl },
          ],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        url: pageUrl,
        inLanguage,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: items.map((it) => ({
          "@type": "Question",
          "@id": `${pageUrl}#${it.anchor}`,
          name: lang === "zh" ? it.qZh : it.qEn,
          acceptedAnswer: {
            "@type": "Answer",
            text: lang === "zh" ? it.aZh : it.aEn,
            url: `${SITE_URL}${chapterHref(lang, it.chapter)}`,
          },
        })),
      },
      {
        "@type": "DefinedTermSet",
        "@id": setId,
        name: "Glossary — Permissionless Finance",
        url: `${SITE_URL}/glossary`,
        hasDefinedTerm: beginnerFaqTerms().map((t) => ({
          "@type": "DefinedTerm",
          "@id": `${SITE_URL}/glossary#${t.id}`,
          name: t.en,
          alternateName: t.zh,
          description: lang === "zh" ? t.defZh : t.defEn,
          inDefinedTermSet: { "@id": setId },
          url: `${SITE_URL}${hubHref(lang, "glossary", t.id)}`,
        })),
      },
    ],
  };
}

export function glossaryJsonLd(lang: Lang) {
  const pageUrl = `${SITE_URL}${hubHref(lang, "glossary")}`;
  const setId = `${SITE_URL}/glossary#set`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTermSet",
        "@id": setId,
        name: lang === "zh" ? "术语表 — 无需许可的金融" : "Glossary — Permissionless Finance",
        url: pageUrl,
        inLanguage: lang === "zh" ? "zh-Hans" : ["en", "zh-Hans"],
        hasDefinedTerm: GLOSSARY.map((t) => ({
          "@type": "DefinedTerm",
          "@id": `${SITE_URL}/glossary#${t.id}`,
          name: lang === "zh" ? t.zh : t.en,
          alternateName: lang === "zh" ? t.en : t.zh,
          description: lang === "zh" ? t.defZh : t.defEn,
          inDefinedTermSet: { "@id": setId },
          url: `${SITE_URL}${hubHref(lang, "glossary", t.id)}`,
        })),
      },
    ],
  };
}

function hubLanguages(hub: HubName) {
  return {
    "zh-Hans": `/zh/${hub}`,
    en: `/${hub}`,
    "x-default": `/${hub}`,
  } as const;
}

function localeMeta(
  lang: Lang,
  hub: HubName,
  title: string,
  description: string,
  extra?: { keywords?: string[]; ogTitle?: string; ogDescription?: string },
): Metadata {
  const path = hubHref(lang, hub);
  return {
    title: `${title} — ${SITE_NAME[lang]}`,
    description,
    ...(extra?.keywords ? { keywords: extra.keywords } : {}),
    alternates: { canonical: path, languages: hubLanguages(hub) },
    openGraph: {
      type: "website",
      title: extra?.ogTitle ?? title,
      description: extra?.ogDescription ?? description,
      url: path,
      siteName: SITE_NAME[lang],
      locale: lang === "zh" ? "zh_CN" : "en_US",
      alternateLocale: lang === "zh" ? "en_US" : "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_X_HANDLE,
      creator: AUTHOR_X_HANDLE,
      title,
      description,
    },
  };
}

const CONTENTS_TITLE: Record<Lang, string> = {
  en: "Contents · 目录",
  zh: "全书目录：三十三章永续合约市场微观结构",
};
const CONTENTS_DESCRIPTION: Record<Lang, string> = {
  en: "The full table of contents — thirty-three chapters on the market microstructure of perpetual futures, across ten parts, each with a one-line summary.",
  zh: "全书目录：十部分、三十三章，涵盖资金费率、清算、流动性与波动率等永续合约市场微观结构，每章附一行提要。",
};

const PATHS_TITLE: Record<Lang, string> = {
  en: "Learning Paths · 学习路径",
  zh: "学习路径：交易者、量化与构建者",
};
const PATHS_DESCRIPTION: Record<Lang, string> = {
  en: "Three reading tracks for traders, quant researchers and builders through 33 chapters on perpetual futures market microstructure, arbitrage and market making.",
  zh: "三条阅读路径，面向交易者、量化研究者与构建者，按阶段导读三十三章永续合约市场微观结构、套利与做市。",
};

const DOWNLOAD_TITLE: Record<Lang, string> = {
  en: "Free Perpetual Futures Book PDF/EPUB · 下载全书",
  zh: "免费下载永续合约书 PDF/EPUB",
};
const DOWNLOAD_DESCRIPTION: Record<Lang, string> = {
  en: "Download Permissionless Finance free as PDF or EPUB, in English and Chinese: 33 chapters on perpetual futures market microstructure, CC BY 4.0.",
  zh: "免费下载《无需许可的金融》中英 PDF 与 EPUB：三十三章永续合约市场微观结构，采用 CC BY 4.0 许可。",
};

const LABS_TITLE: Record<Lang, string> = {
  en: "Perpetual Futures Simulators · Labs",
  zh: "永续合约模拟器 · 实验室",
};
const LABS_DESCRIPTION: Record<Lang, string> = {
  en: "Interactive perpetual futures simulators: trigger a liquidation cascade, play the funding-rate game, and walk a market order through the order book.",
  zh: "交互式永续合约模拟器：亲手触发清算级联、推演资金费率博弈，并走一遍订单簿里的市价单。",
};

export function contentsMetadata(lang: Lang): Metadata {
  return localeMeta(lang, "contents", CONTENTS_TITLE[lang], CONTENTS_DESCRIPTION[lang], {
    ogTitle: lang === "zh" ? "目录 — 无需许可的金融" : "Contents — Permissionless Finance",
    ogDescription:
      lang === "zh" ? "全书三十三章永续合约市场微观结构目录。" : "All 33 chapters on perpetual-futures market microstructure.",
  });
}

export function pathsMetadata(lang: Lang): Metadata {
  return localeMeta(lang, "paths", PATHS_TITLE[lang], PATHS_DESCRIPTION[lang], {
    ogTitle: lang === "zh" ? "学习路径 — 无需许可的金融" : "Learning Paths — Permissionless Finance",
    ogDescription:
      lang === "zh"
        ? "交易者、量化与构建者三条阅读路径。"
        : "Trader · quant · builder tracks through 33 chapters of perpetual-futures market microstructure.",
  });
}

export function downloadMetadata(lang: Lang): Metadata {
  return localeMeta(lang, "download", DOWNLOAD_TITLE[lang], DOWNLOAD_DESCRIPTION[lang], {
    ogTitle: lang === "zh" ? "下载全书 — 无需许可的金融" : "Download the Book — Permissionless Finance",
    ogDescription:
      lang === "zh" ? "免费 PDF 与 EPUB，中英双语，CC BY 4.0。" : "Free PDF and EPUB, English and Chinese, CC BY 4.0.",
  });
}

export function labsMetadata(lang: Lang): Metadata {
  return localeMeta(lang, "labs", LABS_TITLE[lang], LABS_DESCRIPTION[lang], {
    ogTitle: lang === "zh" ? "实验室 — 无需许可的金融" : "Labs — Permissionless Finance",
    ogDescription:
      lang === "zh"
        ? "交互模拟器：清算级联、资金费率、订单簿滑点。"
        : "Interactive simulators: liquidation cascades, funding rates, order-book slippage.",
  });
}

export function contentsJsonLd(lang: Lang) {
  const pageUrl = `${SITE_URL}${hubHref(lang, "contents")}`;
  const chapters = ALL_CHAPTERS.filter((c) => /^\d+$/.test(c.num));
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: lang === "zh" ? `目录 — ${BOOK_TITLE.zh}` : `Contents — ${BOOK_TITLE.en}`,
    url: pageUrl,
    inLanguage: lang === "zh" ? "zh-Hans" : "en",
    numberOfItems: chapters.length,
    itemListElement: chapters.map((c) => ({
      "@type": "ListItem",
      position: parseInt(c.num, 10),
      name: getChapterMeta(c.num, lang)!.title,
      url: `${SITE_URL}${chapterHref(lang, c.num)}`,
    })),
  };
}

export function pathsJsonLd(lang: Lang) {
  const pageUrl = `${SITE_URL}${hubHref(lang, "paths")}`;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: lang === "zh" ? "学习路径 — 无需许可的金融" : "Learning Paths — Permissionless Finance",
    url: pageUrl,
    inLanguage: lang === "zh" ? "zh-Hans" : "en",
    numberOfItems: LEARNING_PATHS.length,
    itemListElement: LEARNING_PATHS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "ItemList",
        name: lang === "zh" ? `${p.zh}路径` : `${p.en} track`,
        description: lang === "zh" ? p.whoZh : p.whoEn,
        itemListElement: p.stages.flatMap((s) => s.chapters).map((num, j) => ({
          "@type": "ListItem",
          position: j + 1,
          name: getChapterMeta(num, lang)!.title,
          url: `${SITE_URL}${chapterHref(lang, num)}`,
        })),
      },
    })),
  };
}

export function downloadJsonLd(lang: Lang) {
  const pageUrl = `${SITE_URL}${hubHref(lang, "download")}`;
  const editions = (["en", "zh"] as const).flatMap((edition) =>
    (["pdf", "epub"] as const)
      .filter((f) => DOWNLOADS[f][edition].href !== "")
      .map((f) => ({
        "@type": "Book",
        bookFormat: "https://schema.org/EBook",
        inLanguage: edition === "zh" ? "zh-CN" : "en",
        name: BOOK_TITLE[edition],
        fileFormat: f === "pdf" ? "application/pdf" : "application/epub+zip",
        contentUrl: `${SITE_URL}${DOWNLOADS[f][edition].href}`,
        isAccessibleForFree: true,
        license: "https://creativecommons.org/licenses/by/4.0/",
      })),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: BOOK_TITLE[lang],
    author: { "@type": "Person", name: AUTHOR_NAME },
    url: pageUrl,
    inLanguage: lang === "zh" ? "zh-Hans" : "en",
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    workExample: editions,
  };
}

export function labsJsonLd(lang: Lang) {
  const pageUrl = `${SITE_URL}${hubHref(lang, "labs")}`;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: lang === "zh" ? "实验室 — 无需许可的金融" : "Labs — Permissionless Finance",
    url: pageUrl,
    inLanguage: lang === "zh" ? "zh-Hans" : "en",
    numberOfItems: PUBLISHED_LABS.length,
    itemListElement: PUBLISHED_LABS.map((lab, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LearningResource",
        name: lang === "zh" ? `${lab.zh} — 交互模拟器` : `${lab.en} — interactive simulator`,
        description: lang === "zh" ? lab.learnZh : lab.learnEn,
        learningResourceType: "Simulation",
        url: `${SITE_URL}/labs/${lab.slug}`,
        isAccessibleForFree: true,
      },
    })),
  };
}
