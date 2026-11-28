import { downloadJsonLd, downloadMetadata } from "@/lib/hub-pages";
import { DownloadView } from "@/components/DownloadView";

export const metadata = downloadMetadata("en");

export default function DownloadPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(downloadJsonLd("en")).replace(/</g, "\\u003c") }}
      />
      <DownloadView initialLang="en" />
    </>
  );
}
