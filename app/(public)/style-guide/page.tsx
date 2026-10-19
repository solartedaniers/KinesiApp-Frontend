import type { Metadata } from "next";

import { RiskPatterns } from "@/components/lab/Risk";
import { ChartsSection } from "@/components/style-guide/ChartsSection";
import { ColorSection } from "@/components/style-guide/ColorSection";
import { ComponentsSection } from "@/components/style-guide/ComponentsSection";
import { FiguresSection } from "@/components/style-guide/FiguresSection";
import { GuideHeader } from "@/components/style-guide/GuideHeader";
import { IconsSection } from "@/components/style-guide/IconsSection";
import { MotionSection } from "@/components/style-guide/MotionSection";
import { TypeSection } from "@/components/style-guide/TypeSection";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  // Es una herramienta de revisión del rediseño: no la indexo
  return { title: t.styleGuide.metaTitle, description: t.styleGuide.lead, robots: { index: false, follow: false } };
}

export default function StyleGuidePage() {
  return (
    <>
      <RiskPatterns />
      <GuideHeader />
      <main className="mx-auto max-w-content px-4 pb-24 sm:px-8">
        <ColorSection />
        <TypeSection />
        <IconsSection />
        <FiguresSection />
        <ComponentsSection />
        <ChartsSection />
        <MotionSection />
      </main>
    </>
  );
}
