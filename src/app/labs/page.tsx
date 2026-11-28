import { labsJsonLd, labsMetadata } from "@/lib/hub-pages";
import { LabsView } from "@/components/labs/LabsView";

export const metadata = labsMetadata("en");

export default function LabsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(labsJsonLd("en")).replace(/</g, "\\u003c") }}
      />
      <LabsView initialLang="en" />
    </>
  );
}
