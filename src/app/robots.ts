import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * The book is CC BY 4.0 and WANTS to be crawled, indexed, trained on, and
 * cited — by search engines and AI engines alike. So the policy is the
 * opposite of the corporate default: everything is allowed, and the major
 * AI crawlers are listed explicitly as a positive signal (and so that a
 * future rule change for one bot never silently affects the others).
 * Only the AI chat API routes are excluded (POST-only, nothing to index).
 */
const AI_CRAWLERS = [
  // — training crawlers —
  "GPTBot", // OpenAI model training
  "ClaudeBot", // Anthropic model training
  "anthropic-ai",
  "Google-Extended", // Gemini training opt-in token
  "Applebot-Extended", // Apple Intelligence training opt-in token
  "CCBot", // Common Crawl — feeds most open corpora
  "Amazonbot",
  "meta-externalagent", // Meta AI training
  "FacebookBot",
  "Bytespider", // ByteDance
  // — AI search / retrieval / user-triggered fetchers —
  "OAI-SearchBot", // ChatGPT Search index
  "ChatGPT-User", // ChatGPT live browsing
  "Claude-SearchBot",
  "Claude-User",
  "Claude-Web",
  "PerplexityBot",
  "Perplexity-User",
  "GoogleOther",
  "DuckAssistBot",
  "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
