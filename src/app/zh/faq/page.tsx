import { faqJsonLd, faqMetadata } from "@/lib/hub-pages";
import { beginnerFaq } from "@/lib/beginner-faq";
import { FaqView } from "@/components/FaqView";

export const metadata = faqMetadata("zh");

export default function ZhFaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd("zh")).replace(/</g, "\\u003c") }}
      />
      <FaqView sections={beginnerFaq()} initialLang="zh" />
    </>
  );
}
