import "./globals.css";
import "./instrument.css";

import type { Metadata } from "next";

import { ButtonLink } from "@/components/instrument/Button";
import { Wordmark } from "@/components/instrument/Wordmark";
import { PREFERENCE_COOKIE } from "@/lib/config";
import { INSTRUMENT_FONT_VARIABLES } from "@/lib/design/fonts";
import { DEFAULT_LOCALE, DICTIONARIES } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";
import { themeBootScript } from "@/lib/theme";

const t = DICTIONARIES[DEFAULT_LOCALE];

export const metadata: Metadata = { title: `${t.notFound.metaTitle} | ${t.app.name}` };

// Rutas que no existen en ningún layout raíz: Next devuelve esta página sin renderizar ninguno, así que
// es estática y va en el idioma por defecto. "Ir al inicio" pasa por /home, que decide según la sesión
export default function GlobalNotFound() {
  return (
    <html lang={DEFAULT_LOCALE} className={INSTRUMENT_FONT_VARIABLES} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript(PREFERENCE_COOKIE.theme) }} />
      </head>
      <body data-design="instrument" className="kin-ambient">
        <main className="mx-auto flex min-h-dvh max-w-content flex-col px-4 sm:px-6">
          <div className="flex h-16 items-center">
            <Wordmark name={t.app.name} />
          </div>
          <div className="my-auto grid max-w-prose justify-items-start gap-4 py-16">
            <p className="font-display text-score font-bold text-line-strong [font-variant-numeric:tabular-nums]">{t.notFound.code}</p>
            <h1 className="font-display text-3xl font-bold text-ink">{t.notFound.title}</h1>
            <p className="text-ink-muted">{t.notFound.body}</p>
            <ButtonLink href={ROUTES.home} className="mt-2">{t.notFound.home}</ButtonLink>
          </div>
        </main>
      </body>
    </html>
  );
}
