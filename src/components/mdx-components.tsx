import React from "react";
import { FigureEmbed } from "./FigureEmbed";
import { Lang } from "@/lib/types";
import { resolveFigureSrc } from "@/lib/chapters";
import imageDims from "@/lib/image-dims.json";
import type { Components } from "react-markdown";

const DIMS = imageDims as Record<string, number[]>;

/** Recursively extract text content from React node tree */
function getTextContent(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (node && typeof node === "object" && "props" in node) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return getTextContent(el.props.children);
  }
  return "";
}

/** Generate a section-based heading ID from heading text.
 *  MUST stay in sync with extractHeadings() in lib/chapters.ts and
 *  scripts/build-search-index.mjs. \p{L}/\p{N} keeps CJK characters —
 *  un-numbered Chinese headings previously slugged to "" (no anchor). */
function headingId(node: React.ReactNode): string {
  const text = getTextContent(node);
  const sectionMatch = text.match(/^(\d+(?:\.\d+)*)/);
  return sectionMatch
    ? `section-${sectionMatch[1].replace(/\./g, "-")}`
    : text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 50);
}

export function createMdxComponents(lang: Lang): Components {
  return {
    img: ({ src, alt, ...props }: React.ComponentProps<"img">) => {
      if (!src || typeof src !== "string") return <img {...props} alt={alt} />;
      const resolved = resolveFigureSrc(src, lang);
      const basename = resolved.src.split("/").pop() || "";
      const dims = DIMS[basename];
      return (
        <FigureEmbed
          type={resolved.type}
          src={resolved.src}
          alt={alt || ""}
          width={dims?.[0]}
          height={dims?.[1]}
        />
      );
    },

    h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
      <h2 id={headingId(children)} {...props}>{children}</h2>
    ),

    h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
      <h3 id={headingId(children)} {...props}>{children}</h3>
    ),

    a: ({ href, children, ...props }: React.ComponentProps<"a">) => {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          {...props}
          className="text-gray-700 underline underline-offset-2 decoration-gray-300 hover:decoration-gray-600 transition-colors"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },

    // Unwrap <p> when it contains block-level children (figures, tables)
    // Also add id anchors for reference paragraphs starting with bold [N]
    p: ({ children, ...props }: React.ComponentProps<"p">) => {
      const childArray = React.Children.toArray(children);
      const hasBlockChild = childArray.some(
        (child) =>
          React.isValidElement(child) &&
          typeof child.type !== "string"
      );
      if (hasBlockChild) return <>{children}</>;

      // Detect reference paragraphs: first child is <strong> containing [N]
      const first = childArray[0];
      if (
        React.isValidElement(first) &&
        first.type === "strong"
      ) {
        const strongText = getTextContent(first);
        const refMatch = strongText.match(/^\[(\d+)\]$/);
        if (refMatch) {
          return <p id={`ref-${refMatch[1]}`} className="ref-item" {...props}>{children}</p>;
        }
      }

      return <p {...props}>{children}</p>;
    },

    table: ({ children, ...props }: React.ComponentProps<"table">) => (
      <div className="table-wrapper">
        <table {...props}>{children}</table>
      </div>
    ),
  };
}
