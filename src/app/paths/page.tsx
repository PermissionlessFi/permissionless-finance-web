import { pathsJsonLd, pathsMetadata } from "@/lib/hub-pages";
import { PathsView } from "@/components/PathsView";

export const metadata = pathsMetadata("en");

export default function PathsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pathsJsonLd("en")).replace(/</g, "\\u003c") }}
      />
      <PathsView initialLang="en" />
    </>
  );
}
