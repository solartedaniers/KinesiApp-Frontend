import type { Metadata, Viewport } from "next";

import { RevealRoot } from "@/components/instrument/RevealRoot";
import { INSTRUMENT_FONT_VARIABLES } from "@/lib/design/fonts";
import { I18nProvider } from "@/lib/i18n/client";
import { getLocale, getT } from "@/lib/i18n/server";
import { getTheme } from "@/lib/preferences";
import { browserThemeColors, themeAttribute } from "@/lib/theme";

import "../globals.css";
import "../instrument.css";


export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: { default: t.app.name, template: `%s | ${t.app.name}` },
    description: t.app.description,
  };
}

export async function generateViewport(): Promise<Viewport> {
  return { width: "device-width", initialScale: 1, themeColor: browserThemeColors(await getTheme()) };
}

// Idioma y tema salen de cookies ya en el servidor: el HTML llega traducido y con el tema correcto,
// sin parpadeo ni desajuste de hidratación. Sin data-theme, el CSS sigue al sistema operativo
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, theme] = await Promise.all([getLocale(), getTheme()]);
  return (
    <html lang={locale} data-theme={themeAttribute(theme)} className={INSTRUMENT_FONT_VARIABLES}>
      <body data-design="instrument">
        <I18nProvider locale={locale}>{children}</I18nProvider>
        <RevealRoot />
      </body>
    </html>
  );
}
