import { pathsJsonLd, pathsMetadata } from "@/lib/hub-pages";
import { PathsView } from "@/components/PathsView";

export const metadata = pathsMetadata("zh");

export default function ZhPathsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pathsJsonLd("zh")).replace(/</g, "\\u003c") }}
      />
      <PathsView initialLang="zh" />
    </>
  );
}
