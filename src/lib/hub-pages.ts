import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, LICENSE_URL, SITE_X_HANDLE, AUTHOR_X_HANDLE } from "@/lib/site";
import { chapterHref } from "@/lib/keywords";
import { beginnerFaqItems, beginnerFaqTerms } from "@/lib/beginner-faq";
import { GLOSSARY } from "@/lib/glossary";
import { Lang } from "@/lib/types";

/** Path-based locale URLs for hub pages that used to rely on `?lang=`. */
export function hubHref(lang: Lang, hub: "faq" | "glossary", hash?: string): string {
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
