import { labsJsonLd, labsMetadata } from "@/lib/hub-pages";
import { LabsView } from "@/components/labs/LabsView";

export const metadata = labsMetadata("zh");

export default function ZhLabsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(labsJsonLd("zh")).replace(/</g, "\\u003c") }}
      />
      <LabsView initialLang="zh" />
    </>
  );
}
