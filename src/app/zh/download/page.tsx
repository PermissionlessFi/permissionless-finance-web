import { downloadJsonLd, downloadMetadata } from "@/lib/hub-pages";
import { DownloadView } from "@/components/DownloadView";

export const metadata = downloadMetadata("zh");

export default function ZhDownloadPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(downloadJsonLd("zh")).replace(/</g, "\\u003c") }}
      />
      <DownloadView initialLang="zh" />
    </>
  );
}
