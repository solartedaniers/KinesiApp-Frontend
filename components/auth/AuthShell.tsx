import type { ReactNode } from "react";

import { PreferencesControls } from "@/components/app/PreferencesControls";
import { Logo } from "@/components/brand/Logo";
import { MotionFigure } from "@/components/brand/MotionFigure";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

/**
 * Marco de las pantallas de acceso: en escritorio, panel con el esqueleto de captura y lo que hace la
 * app; en celular, sólo el logo y el formulario, que es lo que se vino a hacer.
 */
export async function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const t = await getT();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(22rem,40%)_1fr]">
      <aside className="hidden flex-col justify-between gap-8 border-r border-line bg-panel px-10 py-9 lg:flex">
        <Logo href={ROUTES.landing} />
        <MotionFigure className="mx-auto w-full max-w-64" />
        <div className="grid gap-5">
          <p className="font-display text-2xl font-semibold text-ink [font-stretch:112%]">{t.authShell.tagline}</p>
          <ul className="grid gap-2.5 text-ink-muted">
            {t.authShell.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-2.5 h-0.5 w-3 flex-none bg-accent" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-col px-4 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <span className="lg:invisible">
            <Logo href={ROUTES.landing} collapsible />
          </span>
          <PreferencesControls compact />
        </div>
        <section
          className="mx-auto my-auto grid w-full max-w-[26rem] gap-6 py-10 [animation:screen-arrive_320ms_ease-out_both]"
          aria-labelledby="auth-title"
        >
          <header className="grid gap-2">
            <h1 id="auth-title" className="text-3xl font-semibold text-ink">
              {title}
            </h1>
            {subtitle && <p className="text-ink-muted">{subtitle}</p>}
          </header>
          {children}
          {footer && (
            // Acción de pie que no es un enlace (cerrar sesión es un POST): se ve igual que uno
            <div className="border-t border-line pt-5 text-center text-sm text-ink-muted [&_button]:cursor-pointer [&_button]:font-medium [&_button]:text-accent hover:[&_button]:underline">
              {footer}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
