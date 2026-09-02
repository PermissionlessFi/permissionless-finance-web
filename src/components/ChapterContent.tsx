import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { createMdxComponents } from "./mdx-components";
import { Lang } from "@/lib/types";

interface ChapterContentProps {
  content: string;
  lang: Lang;
}

export function ChapterContent({ content, lang }: ChapterContentProps) {
  const components = createMdxComponents(lang);

  return (
    <article className="prose-book">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
