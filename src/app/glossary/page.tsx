import { glossaryJsonLd, glossaryMetadata } from "@/lib/hub-pages";
import { GlossaryView } from "@/components/GlossaryView";

export const metadata = glossaryMetadata("en");

export default function GlossaryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossaryJsonLd("en")).replace(/</g, "\\u003c") }}
      />
      <GlossaryView initialLang="en" />
    </>
  );
}
