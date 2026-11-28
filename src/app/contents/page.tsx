import { contentsJsonLd, contentsMetadata } from "@/lib/hub-pages";
import { ContentsView } from "@/components/ContentsView";

export const metadata = contentsMetadata("en");

export default function ContentsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contentsJsonLd("en")).replace(/</g, "\\u003c") }}
      />
      <ContentsView initialLang="en" />
    </>
  );
}
