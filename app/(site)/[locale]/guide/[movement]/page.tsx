import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/instrument/Button";
import { CameraSetup } from "@/components/instrument/CameraSetup";
import { Chronophotograph } from "@/components/instrument/Chronophotograph";
import { Glyph } from "@/components/instrument/Glyph";
import { Notice } from "@/components/instrument/Status";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { cssVars } from "@/lib/design/css";
import { getClientPolicyOrNull } from "@/lib/data/public";
import { DICTIONARIES, format, LOCALES } from "@/lib/i18n";
import { siteLocale } from "@/lib/i18n/site";
import { guidePath, localizedPath, ROUTES } from "@/lib/routes";
import { localeAlternates } from "@/lib/seo";
import { MOVEMENT_TYPES, type MovementType } from "@/lib/types";
import { bytesToMegabytes } from "@/lib/video-upload";

// ISR: las guías salen del build y Next las regenera en segundo plano cada hora con la política vigente
// del backend (duración y tamaño del video). Debe ser un literal: Next lo lee sin ejecutar el módulo
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => MOVEMENT_TYPES.map((movement) => ({ locale, movement })));
}

const TINT: Record<MovementType, string> = { jump: "var(--kin-knee)", squat: "var(--kin-trunk)" };

async function guideParams(params: Promise<{ locale: string; movement: string }>) {
  const locale = await siteLocale(params);
  const { movement } = await params;
  if (!(MOVEMENT_TYPES as readonly string[]).includes(movement)) notFound();
  return { locale, movement: movement as MovementType };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/guide/[movement]">): Promise<Metadata> {
  const { locale, movement } = await guideParams(params);
  const t = DICTIONARIES[locale].guide;
  const description = format(t.metaDescription, { movement: t.movements[movement].name });
  return {
    title: t.movements[movement].title,
    description,
    alternates: localeAlternates(guidePath(movement), locale),
    openGraph: { title: t.movements[movement].title, description, locale, type: "article" },
  };
}

export default async function GuidePage({ params }: PageProps<"/[locale]/guide/[movement]">) {
  const { locale, movement } = await guideParams(params);
  const t = DICTIONARIES[locale];
  const g = t.guide;
  const copy = g.movements[movement];
  const other = MOVEMENT_TYPES.find((option) => option !== movement)!;
  const policy = await getClientPolicyOrNull();
  return (
    <>
      <SiteHeader locale={locale} path={guidePath(movement)} />
      <main className="mx-auto grid max-w-content gap-12 px-4 pt-8 pb-16 sm:px-6 lg:pt-12">
        <Link href={localizedPath(locale, ROUTES.landing)} className="inline-flex min-h-11 w-fit items-center gap-1 text-sm">
          <Glyph name="chevronLeft" size={16} />
          {g.back}
        </Link>

        <section aria-labelledby="guide-title" className="grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="grid gap-4">
            <p className="font-display text-sm font-semibold tracking-wide text-accent">{g.eyebrow}</p>
            <h1 id="guide-title" className="font-display text-hero font-bold tracking-tight text-ink">{copy.title}</h1>
            <p className="max-w-prose text-lg text-ink-muted">{copy.lead}</p>
          </div>
          <figure data-theme="dark" className="kin-card kin-tinted p-5 sm:p-7" style={cssVars({ "--tint": TINT[movement] })}>
            <Chronophotograph movement={movement} label={format(g.phasesLabel, { movement: copy.name })} className="w-full" />
          </figure>
        </section>

        <section aria-labelledby="guide-setup" className="grid items-start gap-8 lg:grid-cols-2" data-reveal>
          <div className="grid gap-4">
            <h2 id="guide-setup" className="font-display text-3xl font-bold tracking-tight text-ink">{g.setupTitle}</h2>
            <ul className="grid gap-3">
              {g.setup.map((item) => (
                <li key={item} className="flex items-start gap-3 text-ink">
                  <Glyph name="check" size={20} className="mt-0.5 flex-none text-zone-target" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="kin-card p-4 sm:p-6" style={cssVars({ "--tint": "var(--kin-accent)" })}>
            <CameraSetup labels={g.diagram} className="w-full" />
          </div>
        </section>

        <section aria-labelledby="guide-views" className="grid gap-3" data-reveal>
          <h2 id="guide-views" className="font-display text-2xl font-semibold text-ink">{g.viewsTitle}</h2>
          <ul className="grid gap-x-8 gap-y-3 text-ink md:grid-cols-3">
            {g.views.map((item) => (
              <li key={item} className="border-l-2 border-accent pl-3">{item}</li>
            ))}
          </ul>
        </section>

        {/* Sin la política (backend dormido en el build) omito la sección: no guardo una copia local de los
            límites y la siguiente regeneración la completa */}
        {policy && (
          <section aria-labelledby="guide-limits" className="grid gap-3" data-reveal>
            <h2 id="guide-limits" className="font-display text-2xl font-semibold text-ink">{g.limitsTitle}</h2>
            <ul className="grid gap-2 text-ink">
              <li className="flex items-center gap-3">
                <Glyph name="clock" size={20} className="text-center" />
                {format(g.limitDuration, { seconds: policy.video_max_duration_seconds })}
              </li>
              <li className="flex items-center gap-3">
                <Glyph name="upload" size={20} className="text-center" />
                {format(g.limitSize, { size: bytesToMegabytes(policy.video_max_size_bytes) })}
              </li>
            </ul>
            <p className="text-sm text-ink-muted">{g.limitsNote}</p>
          </section>
        )}

        <div className="grid gap-8 md:grid-cols-2" data-reveal>
          <section aria-labelledby="guide-execution" className="grid content-start gap-4">
            <h2 id="guide-execution" className="font-display text-2xl font-semibold text-ink">{g.executionTitle}</h2>
            <ol className="grid gap-3">
              {copy.execution.map((step, i) => (
                <li key={step} className="grid grid-cols-[2rem_1fr] items-start gap-2 text-ink">
                  <span className="font-display text-xl font-bold text-accent [font-variant-numeric:tabular-nums]">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="guide-mistakes" className="grid content-start gap-4">
            <h2 id="guide-mistakes" className="font-display text-2xl font-semibold text-ink">{g.mistakesTitle}</h2>
            <ul className="grid gap-3">
              {copy.mistakes.map((mistake) => (
                <li key={mistake}><Notice tone="warning" live={false}>{mistake}</Notice></li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-8">
          <ButtonLink href={ROUTES.newAnalysis} glyph="capture">{g.start}</ButtonLink>
          <ButtonLink href={guidePath(other, locale)} variant="secondary" glyph={other}>{format(g.other, { movement: g.movements[other].name })}</ButtonLink>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
