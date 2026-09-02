import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { PUBLISHED_LABS } from "@/lib/labs";
import { CascadeLab } from "@/components/labs/CascadeLab";
import { SurvivorGame } from "@/components/labs/SurvivorGame";
import { ExecutionDuel } from "@/components/labs/ExecutionDuel";
import { FundingLab } from "@/components/labs/FundingLab";
import { OrderBookLab } from "@/components/labs/OrderBookLab";

const VIEWS: Record<string, React.ComponentType> = {
  "survivor": SurvivorGame,
  "execution-duel": ExecutionDuel,
  "liquidation-cascade": CascadeLab,
  "funding-rate": FundingLab,
  "order-book": OrderBookLab,
};

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lab = PUBLISHED_LABS.find((l) => l.slug === slug);
  if (!lab) return {};
  return {
    title: `${lab.en} · ${lab.zh} — Permissionless Finance Labs`,
    description: lab.learnEn,
    alternates: { canonical: `/labs/${lab.slug}` },
    openGraph: {
      type: "website",
      title: `${lab.en} — an interactive simulator`,
      description: lab.storyEn,
      url: `/labs/${lab.slug}`,
      siteName: SITE_NAME.en,
    },
  };
}

function jsonLd(slug: string) {
  const lab = PUBLISHED_LABS.find((l) => l.slug === slug)!;
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${lab.en} — interactive simulator`,
    description: lab.learnEn,
    learningResourceType: "Simulation",
    url: `${SITE_URL}/labs/${lab.slug}`,
    isAccessibleForFree: true,
    isPartOf: { "@type": "WebSite", name: SITE_NAME.en, url: SITE_URL },
  };
}

export default async function LabPage({ params }: Props) {
  const { slug } = await params;
  const View = VIEWS[slug];
  if (!View || !PUBLISHED_LABS.some((l) => l.slug === slug)) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(slug)).replace(/</g, "\\u003c") }}
      />
      <View />
    </>
  );
}

export function generateStaticParams() {
  return PUBLISHED_LABS.map((l) => ({ slug: l.slug }));
}
