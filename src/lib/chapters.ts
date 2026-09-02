import fs from "fs";
import path from "path";
import katex from "katex";
import { Lang } from "./types";
import contentDates from "./content-dates.json";

const CONTENT_DIR = path.join(process.cwd(), "content");
const CONTENT_DATES = contentDates as Record<string, string>;

/** Stable last-modified date for a chapter (committed snapshot, not build-time
 *  mtime). Used for the visible byline and JSON-LD dateModified. */
export function getContentDate(num: string): Date | null {
  if (CONTENT_DATES[num]) return new Date(CONTENT_DATES[num]);
  return getContentMtime("en", num) ?? getContentMtime("zh", num);
}

/** Read chapter markdown content */
export function getChapterContent(lang: Lang, num: string): string {
  const filePath = path.join(CONTENT_DIR, lang, `${num}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Chapter not found: ${lang}/${num}`);
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Strip the first H1 heading (chapter title) — we render it separately
  content = content.replace(/^#\s+.+\n/, "");

  // Strip typst fenced blocks (PDF build artifacts)
  content = content.replace(/```typst[\s\S]*?```/g, "");

  // Normalize raw <iframe> tags (Ch.1 Chinese uses these instead of ![...]() syntax)
  content = content.replace(
    /<iframe\s+src="\.\/images\/(fig-[\d]+-[\d]+(?:-[a-z-]*)?)\.html"[^>]*><\/iframe>/g,
    (_, figId) => `![${figId}](./images/${figId}.png)`
  );

  // Guarantee a blank line after every image, so a caption placed directly
  // under the image (no blank line — the manuscript is inconsistent here; see
  // chapters 6–13, 18, 29) still renders as its own paragraph instead of
  // merging into the image's block (which breaks caption styling).
  content = content.replace(/^(!\[[^\]]*\]\([^)]*\))\n(?=[^\n])/gm, "$1\n\n");

  // Promote each figure's caption into its alt text. The manuscript alt is
  // often a bare label ("Figure 10-1"); the descriptive, keyword-rich text
  // lives in the caption paragraph right below (`**Figure N-M.** ...`, or its
  // Chinese-edition equivalent). Reusing the author's own caption as alt improves image
  // SEO and accessibility without changing any body content. Render-layer only:
  // the raw .md mirror keeps the original alt.
  content = content.replace(
    /!\[[^\]]*\]\(([^)]+)\)(\n\n)(\*\*(?:Figure|图)\s*[\d.\-–]+\.?\*\*\s*([^\n]+))/g,
    (_m, src, gap, captionBlock, captionText) => {
      const alt = captionText
        .replace(/\[\d+\]/g, "")   // strip [N] citation markers
        .replace(/[*_`\[\]]/g, "") // strip emphasis/brackets that would break ![...]
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 250);
      return alt ? `![${alt}](${src})${gap}${captionBlock}` : _m;
    }
  );

  // Split references into their own section with forced HTML rendering
  // Find where references start (first line starting with [1] or [N])
  const lines = content.split('\n');
  let refStartIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\[1\]\s/.test(lines[i])) {
      refStartIdx = i;
      break;
    }
  }

  if (refStartIdx !== -1) {
    // Process body (before references): inline [N] → superscript links
    const bodyLines = lines.slice(0, refStartIdx);
    const bodyProcessed = bodyLines.map(line =>
      line.replace(
        /\[(\d+)\]/g,
        '<sup><a href="#ref-$1" class="footnote-ref">[$1]</a></sup>'
      )
    );

    // Process references: build HTML block
    const refLines = lines.slice(refStartIdx).filter(l => /^\[\d+\]/.test(l));
    const refsHtml = refLines.map(line => {
      const match = line.match(/^\[(\d+)\]/)!;
      const num = match[1];
      const rest = line.slice(match[0].length);
      // Convert markdown *italic* to <em> within ref text
      const htmlRest = rest.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return `<p id="ref-${num}" class="ref-item"><strong>[${num}]</strong>${htmlRest}</p>`;
    }).join('\n');

    content = bodyProcessed.join('\n') + '\n\n' + refsHtml;
  } else {
    // No reference section found, just process inline refs
    content = lines.map(line =>
      line.replace(
        /\[(\d+)\]/g,
        '<sup><a href="#ref-$1" class="footnote-ref">[$1]</a></sup>'
      )
    ).join('\n');
  }

  // Render LaTeX math formulas to HTML using KaTeX
  // Display math: $$...$$ (with optional \tag{})
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `<code>${math.trim()}</code>`;
    }
  });
  // Inline math: $...$ using the same delimiter rule as pandoc/LaTeX, so the
  // web matches the PDF instead of guessing from content. The opening $ must be
  // followed by a non-space, and the closing $ must be preceded by a non-space
  // and NOT followed by a digit. This renders bare/simple math ($d$, $m$,
  // $d = 0.6$, $2\sigma_0$) while leaving currency untouched ("$35 billion ...
  // $8 billion", "US$200") — those closing $ are preceded by a space or
  // followed by a digit, so they never form a math span.
  // Reject a currency $ as a math opener: "$19 billion" / "$4.3 million" are
  // digits + space + a word, whereas "$2\sigma", "$3 \times", "$d" are math.
  // Without this, a stray currency $ pairs with a later math $ and swallows all
  // the prose between them (e.g. Ch.26). (Opener must be followed by a
  // non-space; closer must be preceded by a non-space and not followed by a
  // digit — the pandoc/LaTeX delimiter rule; no length cap, some inline math
  // legitimately runs 600+ chars.)
  content = content.replace(/(?<!\$)\$(?![\s$])(?!\d[\d.,]*\s+[^\s\\])([^\n$]+?)(?<=[^\s$])\$(?!\d)/g, (match, math) => {
    try {
      // throwOnError:true → genuinely non-math content falls back to the raw
      // literal (via catch) rather than rendering a red KaTeX error.
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: true });
    } catch {
      return match; // not valid math — leave the literal text as-is
    }
  });

  return content;
}

/** Raw, unprocessed markdown for a chapter — for the `.md` mirror and
 *  llms-full.txt. Keeps the H1 title and applies no KaTeX/HTML transforms;
 *  agents want the source, not the rendered page. */
export function getRawChapter(lang: Lang, num: string): string | null {
  try {
    return fs.readFileSync(path.join(CONTENT_DIR, lang, `${num}.md`), "utf-8");
  } catch {
    return null;
  }
}

/** Content file mtime — honest lastModified signal for sitemap / JSON-LD. */
export function getContentMtime(lang: Lang, num: string): Date | null {
  try {
    return fs.statSync(path.join(CONTENT_DIR, lang, `${num}.md`)).mtime;
  } catch {
    return null;
  }
}

/** Figure image basenames referenced by a chapter (for the image sitemap). */
export function getChapterImages(lang: Lang, num: string): string[] {
  const raw = getRawChapter(lang, num);
  if (!raw) return [];
  const out = new Set<string>();
  for (const m of raw.matchAll(/!\[[^\]]*\]\(([^)]+\.png)\)/gi)) {
    const base = m[1].split("/").pop();
    if (base) out.add(base);
  }
  // Ch.1 (zh) references figures as raw <iframe src="./images/fig-*.html">
  for (const m of raw.matchAll(/<iframe\s+src="\.\/images\/([^"]+)\.html"/gi)) {
    out.add(`${m[1]}.png`);
  }
  return [...out];
}

/**
 * Extract a plain-text meta description from a chapter's opening paragraph.
 * Reads the RAW markdown (not the KaTeX-processed content), strips markup,
 * and truncates to meta-description length (~160 latin chars / ~90 CJK chars).
 */
export function getChapterDescription(lang: Lang, num: string): string {
  const filePath = path.join(CONTENT_DIR, lang, `${num}.md`);
  if (!fs.existsSync(filePath)) return "";

  const raw = fs
    .readFileSync(filePath, "utf-8")
    .replace(/^#\s+.+\n/, "") // drop H1
    .replace(/```[\s\S]*?```/g, ""); // drop fenced blocks

  for (const para of raw.split(/\n\s*\n/)) {
    const trimmed = para.trim();
    // Skip headings, images, tables, HTML, blockquotes, list items, captions
    if (!trimmed || /^(#|!\[|\||<|>|[-*]\s|\d+\.\s|\*\*(图|表|Figure|Table))/.test(trimmed)) continue;

    const text = trimmed
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → text
      .replace(/\[\d+\]/g, "") // citation markers
      .replace(/<[^>]+>/g, "") // html tags
      .replace(/[*_`$]/g, "") // emphasis/code/math markers
      .replace(/\s+/g, " ")
      .trim();

    if (text.length < 40) continue;

    if (lang === "zh") {
      return text.length > 90 ? text.slice(0, 88) + "……" : text;
    }
    if (text.length <= 160) return text;
    const cut = text.slice(0, 157);
    return cut.slice(0, cut.lastIndexOf(" ")) + "…";
  }
  return "";
}

/**
 * Resolve a markdown image reference to a static PNG <img>.
 *
 * Figures are rendered as flat PNGs — never interactive HTML/echarts iframes.
 * The markdown already points at the correct per-language file
 * (fig-X-Y.png for zh, fig-X-Y-en.png for en), so we just normalize to a
 * root-relative /images/<basename> path.
 */
export function resolveFigureSrc(
  imgSrc: string,
  _lang: Lang
): { type: "iframe" | "img"; src: string } {
  const file = imgSrc.split("/").pop() || imgSrc;
  return { type: "img", src: `/images/${file}` };
}

/**
 * Extract heading structure from markdown for in-chapter TOC.
 */
export function extractHeadings(
  content: string
): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].trim();

    // MUST stay in sync with headingId() in mdx-components.tsx and
    // scripts/build-search-index.mjs. \p{L}/\p{N} keeps CJK characters —
    // un-numbered Chinese headings previously slugged to "" (no anchor).
    const sectionMatch = text.match(/^(\d+(?:\.\d+)*)/);
    const id = sectionMatch
      ? `section-${sectionMatch[1].replace(/\./g, "-")}`
      : text
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s-]/gu, "")
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 50);

    headings.push({ id, text, level });
  }

  return headings;
}
