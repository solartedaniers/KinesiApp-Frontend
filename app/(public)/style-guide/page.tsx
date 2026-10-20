import type { Metadata } from "next";
import Link from "next/link";

import { PreferencesControls } from "@/components/app/PreferencesControls";
import { ChartSection, ProgressSection, ScreensSection } from "@/components/instrument/guide/ChartSection";
import { ColorSection } from "@/components/instrument/guide/ColorSection";
import { ComponentSection } from "@/components/instrument/guide/ComponentSection";
import { GlyphSection, TypeSection } from "@/components/instrument/guide/TypeSection";
import { LiveGauge } from "@/components/instrument/LiveGauge";
import { AiStatus } from "@/components/instrument/Status";
import { Wordmark } from "@/components/instrument/Wordmark";
import { cssVars } from "@/lib/design/css";
import { GUIDE_SAMPLE } from "@/lib/design/guide-sample";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

// El índice usa el color de cada sección, el mismo de su luz ambiental
const INDEX = [
  { id: "color", tint: "var(--kin-knee)" },
  { id: "type", tint: "var(--kin-trunk)" },
  { id: "glyphs", tint: "var(--kin-center)" },
  { id: "components", tint: "var(--kin-accent)" },
  { id: "charts", tint: "var(--kin-center)" },
  { id: "progress", tint: "var(--kin-hip)" },
  { id: "screens", tint: "var(--kin-trunk)" },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  // Es material de revisión del rediseño, no una página pública: no la indexo
  return { title: `${t.styleGuide.title} · ${t.styleGuide.metaTitle}`, description: t.styleGuide.metaDescription, robots: { index: false, follow: false } };
}

export default async function StyleGuidePage() {
  const t = await getT();
  const g = t.styleGuide;
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-panel shadow-[0_10px_30px_-24px_var(--kin-shade)]">
        <div className="mx-auto flex h-16 max-w-content items-center gap-3 px-4 sm:px-6">
          <Link href={ROUTES.styleGuide} aria-label={g.home} className="inline-flex min-h-11 min-w-11 items-center rounded-panel"><Wordmark name={t.app.name} /></Link>
          <span className="text-sm text-ink-muted max-sm:hidden">{g.eyebrow}</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="max-md:hidden"><AiStatus state="ready" label={g.components.aiReady} /></span>
            <PreferencesControls compact />
          </div>
        </div>
      </header>

      <main>
        <section aria-labelledby="guide-title" className="mx-auto grid max-w-content items-center gap-10 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:pt-16">
          <div className="grid gap-5">
            <p className="font-display text-sm font-semibold tracking-wide text-accent">{g.eyebrow}</p>
            <h1 id="guide-title" className="font-display text-hero font-bold tracking-tight text-ink">{g.title}</h1>
            <p className="max-w-prose text-lg text-ink-muted">{g.lead}</p>
            <p className="text-sm text-ink-muted">{g.sampleNote}</p>
            <nav aria-label={g.index}>
              <ul className="flex flex-wrap gap-2">
                {INDEX.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="kin-btn kin-btn-secondary inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold" style={cssVars({ "--tint": item.tint })}>
                      <span className="size-2 rounded-full bg-(--tint) shadow-[0_0_8px_var(--tint)]" aria-hidden />
                      {g.sections[item.id]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {/* La lectura principal va en una cabina oscura en ambos modos: así el instrumento brilla */}
          <div data-theme="dark" className="kin-card kin-tinted p-5 sm:p-7">
            <LiveGauge samples={GUIDE_SAMPLE.firstRepetition} />
          </div>
        </section>

        <ColorSection />
        <TypeSection />
        <GlyphSection />
        <ComponentSection />
        <ChartSection />
        <ProgressSection />
        <ScreensSection />
      </main>
    </>
  );
}
