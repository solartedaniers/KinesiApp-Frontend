import { PreferencesControls } from "@/components/app/PreferencesControls";
import { Logo } from "@/components/brand/Logo";
import { MotionFigure } from "@/components/brand/MotionFigure";
import { ButtonLink } from "@/components/ui/Button";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

// SSR sólo por el idioma (cookie o Accept-Language): no hay datos del usuario
export default async function LandingPage() {
  const t = await getT();
  return (
    <div className="mx-auto flex min-h-dvh max-w-content flex-col px-4 sm:px-8">
      <header className="flex h-20 items-center justify-between gap-3">
        <Logo href={ROUTES.landing} collapsible />
        <PreferencesControls compact />
      </header>

      <main className="grid flex-1 content-center gap-14 py-10">
        <div className="grid items-center gap-10 md:grid-cols-[1.25fr_1fr]">
          <div className="grid gap-6 [animation:screen-arrive_320ms_ease-out_both]">
            <h1 className="max-w-[16ch] text-hero font-semibold text-ink">{t.landing.title}</h1>
            <p className="max-w-prose text-lg text-ink-muted">{t.landing.lead}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={ROUTES.register}>{t.landing.createAccount}</ButtonLink>
              <ButtonLink href={ROUTES.login} variant="secondary">
                {t.landing.signIn}
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-stage border border-line bg-panel p-6 sm:p-8">
            <MotionFigure className="mx-auto w-full max-w-72" />
          </div>
        </div>

        {/* Lista, no tarjetas idénticas: tres columnas separadas por una línea */}
        <ul className="grid border-t border-line sm:grid-cols-3">
          {t.landing.features.map((feature) => (
            <li key={feature.title} className="grid content-start gap-1.5 border-line py-6 sm:pr-8 [&+&]:border-t sm:[&+&]:border-l sm:[&+&]:border-t-0 sm:[&+&]:pl-8">
              <h2 className="text-lg font-semibold text-ink">{feature.title}</h2>
              <p className="text-ink-muted">{feature.body}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-line py-6 text-sm text-ink-muted">
        <p>{t.app.disclaimer}</p>
      </footer>
    </div>
  );
}
