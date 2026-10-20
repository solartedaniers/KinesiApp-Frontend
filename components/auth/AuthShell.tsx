import Link from "next/link";
import type { ReactNode } from "react";

import { PreferencesControls } from "@/components/app/PreferencesControls";
import { Chronophotograph } from "@/components/instrument/Chronophotograph";
import { Glyph } from "@/components/instrument/Glyph";
import { Wordmark } from "@/components/instrument/Wordmark";
import { cssVars } from "@/lib/design/css";
import { getLocale, getT } from "@/lib/i18n/server";
import { localizedPath, ROUTES } from "@/lib/routes";

/**
 * Marco de las pantallas de cuenta: en escritorio, una cabina oscura con la placa del salto y lo que
 * hace la app; en el celular, solo la marca y el formulario, que es lo que se vino a hacer.
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
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const home = localizedPath(locale, ROUTES.landing);
  return (
    <div className="kin-ambient grid min-h-dvh lg:grid-cols-[minmax(24rem,42%)_1fr]">
      <aside data-theme="dark" className="kin-tinted hidden flex-col justify-between gap-10 px-10 py-9 lg:flex" style={cssVars({ "--tint": "var(--kin-center)" })}>
        <Link href={home} aria-label={t.site.home} className="inline-flex min-h-11 w-fit items-center rounded-panel no-underline hover:no-underline">
          <Wordmark name={t.app.name} />
        </Link>
        <Chronophotograph movement="jump" className="w-full" />
        <div className="grid gap-5">
          <p className="font-display text-3xl font-bold tracking-tight text-ink">{t.authShell.tagline}</p>
          <ul className="grid gap-3 text-ink-muted">
            {t.authShell.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Glyph name="check" size={20} className="mt-0.5 flex-none text-center" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-col px-4 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href={home} aria-label={t.site.home} className="inline-flex min-h-11 min-w-11 items-center rounded-panel no-underline hover:no-underline lg:invisible">
            <Wordmark name={t.app.name} />
          </Link>
          <PreferencesControls compact />
        </div>
        <section className="kin-card mx-auto my-auto grid w-full max-w-[28rem] gap-6 p-6 sm:p-8 [animation:screen-arrive_320ms_ease-out_both]" aria-labelledby="auth-title">
          <header className="grid gap-2">
            <h1 id="auth-title" className="font-display text-3xl font-bold tracking-tight text-ink">
              {title}
            </h1>
            {subtitle && <p className="text-ink-muted">{subtitle}</p>}
          </header>
          {children}
          {footer && (
            // Acción de pie que no es un enlace (cerrar sesión es un POST): se ve igual que uno
            <div className="border-t border-line pt-5 text-center text-sm text-ink-muted [&_button]:cursor-pointer [&_button]:font-semibold [&_button]:text-accent hover:[&_button]:underline">
              {footer}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
