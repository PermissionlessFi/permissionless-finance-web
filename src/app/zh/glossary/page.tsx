import { glossaryJsonLd, glossaryMetadata } from "@/lib/hub-pages";
import { GlossaryView } from "@/components/GlossaryView";

export const metadata = glossaryMetadata("zh");

export default function ZhGlossaryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossaryJsonLd("zh")).replace(/</g, "\\u003c") }}
      />
      <GlossaryView initialLang="zh" />
    </>
  );
}
