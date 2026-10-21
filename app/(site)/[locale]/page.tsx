import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/instrument/Button";
import { Chronophotograph } from "@/components/instrument/Chronophotograph";
import { Glyph } from "@/components/instrument/Glyph";
import { LiveGauge } from "@/components/instrument/LiveGauge";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { VIDEO_MAX_SECONDS } from "@/lib/config";
import { cssVars } from "@/lib/design/css";
import type { GlyphName } from "@/lib/design/icons";
import { GUIDE_SAMPLE } from "@/lib/design/guide-sample";
import { DICTIONARIES, format } from "@/lib/i18n";
import { siteLocale } from "@/lib/i18n/site";
import { guidePath, ROUTES } from "@/lib/routes";
import { localeAlternates } from "@/lib/seo";
import { MOVEMENT_TYPES } from "@/lib/types";

// Cada paso se pinta con la señal que entra en juego: el movimiento, la cámara y la lectura
const STEPS: { glyph: GlyphName; tint: string }[] = [
  { glyph: "jump", tint: "var(--kin-knee)" },
  { glyph: "capture", tint: "var(--kin-center)" },
  { glyph: "chat", tint: "var(--kin-trunk)" },
];

const MEASURES = [
  { id: "knee", dot: "bg-knee" },
  { id: "trunk", dot: "bg-trunk" },
  { id: "center", dot: "bg-center" },
  { id: "risk", dot: "bg-risk-moderate" },
] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = await siteLocale(params);
  const t = DICTIONARIES[locale];
  return {
    title: { absolute: t.landing.metaTitle },
    description: t.landing.metaDescription,
    alternates: localeAlternates(ROUTES.landing, locale),
    openGraph: { title: t.landing.metaTitle, description: t.landing.metaDescription, locale, type: "website" },
  };
}

// SSG: el layout no lee cookies, así que las dos versiones (/ y /en) salen del build como HTML estático
export default async function LandingPage({ params }: PageProps<"/[locale]">) {
  const locale = await siteLocale(params);
  const t = DICTIONARIES[locale];
  const l = t.landing;
  return (
    <>
      <SiteHeader locale={locale} path={ROUTES.landing} />
      <main>
        <section aria-labelledby="landing-title" className="mx-auto grid max-w-content items-center gap-10 px-4 pt-10 pb-14 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:pt-16">
          <div className="grid gap-6">
            <h1 id="landing-title" className="font-display text-hero font-bold tracking-tight text-ink">{l.title}</h1>
            <p className="max-w-prose text-lg text-ink-muted">{l.lead}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={ROUTES.register} glyph="chevronRight">{l.createAccount}</ButtonLink>
              <ButtonLink href={ROUTES.login} variant="secondary">{l.signIn}</ButtonLink>
            </div>
          </div>
          {/* La placa va en la cabina oscura en ambos modos: así brillan las señales */}
          <figure data-theme="dark" className="kin-card kin-tinted grid gap-3 p-5 sm:p-7" style={cssVars({ "--tint": "var(--kin-center)" })}>
            <Chronophotograph movement="jump" label={format(t.guide.phasesLabel, { movement: t.guide.movements.jump.name })} className="w-full" />
            <figcaption className="text-sm text-ink-muted">{l.heroCaption}</figcaption>
          </figure>
        </section>

        <section aria-labelledby="landing-steps" className="mx-auto grid max-w-content gap-6 px-4 py-12 sm:px-6" data-reveal>
          <h2 id="landing-steps" className="font-display text-3xl font-bold tracking-tight text-ink">{l.stepsTitle}</h2>
          {/* Una línea de tiempo, no tarjetas iguales: los pasos van unidos por el trazo */}
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {l.steps.map((step, i) => (
              <li key={step.title} className="kin-rise relative grid content-start gap-3 border-l-2 border-line pl-5 md:border-t-2 md:border-l-0 md:pt-5 md:pl-0" style={cssVars({ "--i": i, "--tint": STEPS[i].tint })}>
                <span className="absolute -top-px -left-[9px] size-4 rounded-full bg-(--tint) shadow-[0_0_10px_var(--tint)] max-md:top-0 md:-top-[9px] md:left-0" aria-hidden />
                <span className="flex items-center gap-3">
                  <span className="font-display text-3xl font-bold text-(--tint) [font-variant-numeric:tabular-nums]">{i + 1}</span>
                  <Glyph name={STEPS[i].glyph} size={22} className="text-ink-muted" />
                </span>
                <h3 className="font-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="text-ink-muted">{format(step.body, { seconds: VIDEO_MAX_SECONDS })}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="landing-measures" className="mx-auto grid max-w-content items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]" data-reveal>
          <figure data-theme="dark" className="kin-card kin-tinted grid gap-3 p-5 sm:p-7 lg:order-2">
            <LiveGauge samples={GUIDE_SAMPLE.firstRepetition} target={GUIDE_SAMPLE.kneeTarget} movement={GUIDE_SAMPLE.movement} />
            <figcaption className="text-sm text-ink-muted">{t.site.sampleData}</figcaption>
          </figure>
          <div className="grid gap-5">
            <h2 id="landing-measures" className="font-display text-3xl font-bold tracking-tight text-ink">{l.measuresTitle}</h2>
            <p className="max-w-prose text-lg text-ink-muted">{l.measuresLead}</p>
            <dl className="grid gap-4 sm:grid-cols-2">
              {MEASURES.map((measure) => (
                <div key={measure.id} className="grid gap-1">
                  <dt className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                    <span className={`size-2.5 rounded-full ${measure.dot}`} aria-hidden />
                    {l.measures[measure.id].name}
                  </dt>
                  <dd className="text-ink-muted">{l.measures[measure.id].body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="landing-roles" className="mx-auto grid max-w-content gap-6 px-4 py-12 sm:px-6" data-reveal>
          <h2 id="landing-roles" className="font-display text-3xl font-bold tracking-tight text-ink">{l.rolesTitle}</h2>
          <div className="grid gap-6 border-t border-line pt-6 md:grid-cols-2 md:gap-10">
            {(["athlete", "coach"] as const).map((role) => (
              <div key={role} className="grid content-start gap-2">
                <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                  <Glyph name={role === "athlete" ? "athlete" : "team"} size={22} className="text-accent" />
                  {l.roles[role].title}
                </h3>
                <p className="max-w-prose text-ink-muted">{l.roles[role].body}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="landing-guides" className="mx-auto grid max-w-content gap-6 px-4 pt-12 pb-16 sm:px-6" data-reveal>
          <div className="grid gap-2">
            <h2 id="landing-guides" className="font-display text-3xl font-bold tracking-tight text-ink">{l.guidesTitle}</h2>
            <p className="max-w-prose text-lg text-ink-muted">{l.guidesLead}</p>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {MOVEMENT_TYPES.map((movement) => (
              <li key={movement}>
                <Link href={guidePath(movement, locale)} className="kin-card kin-lift grid gap-3 p-4 text-ink no-underline hover:no-underline sm:p-5" style={cssVars({ "--tint": movement === "jump" ? "var(--kin-knee)" : "var(--kin-trunk)" })}>
                  <Chronophotograph movement={movement} className="kin-well h-28 w-full p-2" />
                  <span className="flex items-center justify-between gap-3 font-display text-lg font-semibold">
                    {t.guide.movements[movement].title}
                    <Glyph name="chevronRight" size={20} className="text-accent" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
