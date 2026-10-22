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
  wide = false,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  /** Formularios largos (registro): en escritorio el campo va a dos columnas para caber sin scroll. */
  wide?: boolean;
  children: ReactNode;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const home = localizedPath(locale, ROUTES.landing);
  return (
    // En escritorio el marco mide justo la pantalla: si un formulario no cabe, se desplaza solo su columna
    <div className="kin-ambient grid min-h-dvh lg:h-dvh lg:grid-cols-[minmax(24rem,42%)_1fr]">
      <aside data-theme="dark" className="kin-tinted hidden min-h-0 flex-col justify-between gap-6 px-10 py-8 lg:flex" style={cssVars({ "--tint": "var(--kin-center)" })}>
        {/* En escritorio el idioma y el tema van aquí: la columna del formulario queda libre */}
        <div className="flex items-center justify-between gap-3">
          <Link href={home} aria-label={t.site.home} className="inline-flex min-h-11 w-fit items-center rounded-panel no-underline hover:no-underline">
            <Wordmark name={t.app.name} />
          </Link>
          <PreferencesControls compact />
        </div>
        {/* La placa se encoge con la altura de la ventana: es la que cede para que todo quepa */}
        <div className="relative min-h-24 flex-1">
          <Chronophotograph movement="jump" className="absolute inset-0 size-full" />
        </div>
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

      <main className="flex flex-col px-4 py-4 sm:px-8 lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Link href={home} aria-label={t.site.home} className="inline-flex min-h-11 min-w-11 items-center rounded-panel no-underline hover:no-underline">
            <Wordmark name={t.app.name} />
          </Link>
          <PreferencesControls compact />
        </div>
        <section className={`kin-card mx-auto my-auto grid w-full gap-6 p-6 sm:p-8 lg:gap-5 [animation:screen-arrive_320ms_ease-out_both] ${wide ? "max-w-[28rem] lg:max-w-[44rem]" : "max-w-[28rem]"}`} aria-labelledby="auth-title">
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
