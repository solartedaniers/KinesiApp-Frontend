import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans } from "next/font/google";

import { I18nProvider } from "@/lib/i18n/client";
import { AmbientScene } from "@/components/app/AmbientScene";
import { getLocale, getT } from "@/lib/i18n/server";
import { getTheme } from "@/lib/preferences";
import { browserThemeColors, themeAttribute } from "@/lib/theme";

import "./globals.css";

// Dos familias: Archivo (ancho expandido) para títulos y cifras, IBM Plex Sans para la interfaz y las tablas
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: { default: t.app.name, template: `%s · ${t.app.name}` },
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
    <html lang={locale} data-theme={themeAttribute(theme)} className={`${archivo.variable} ${plex.variable}`}>
      <body>
        <AmbientScene />
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
