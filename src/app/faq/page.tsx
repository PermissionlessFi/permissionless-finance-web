import { faqJsonLd, faqMetadata } from "@/lib/hub-pages";
import { beginnerFaq } from "@/lib/beginner-faq";
import { FaqView } from "@/components/FaqView";

export const metadata = faqMetadata("en");

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd("en")).replace(/</g, "\\u003c") }}
      />
      <FaqView sections={beginnerFaq()} initialLang="en" />
    </>
  );
}
