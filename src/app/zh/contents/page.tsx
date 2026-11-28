import { contentsJsonLd, contentsMetadata } from "@/lib/hub-pages";
import { ContentsView } from "@/components/ContentsView";

export const metadata = contentsMetadata("zh");

export default function ZhContentsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contentsJsonLd("zh")).replace(/</g, "\\u003c") }}
      />
      <ContentsView initialLang="zh" />
    </>
  );
}
