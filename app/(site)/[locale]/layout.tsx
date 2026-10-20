import "../../globals.css";
import "../../instrument.css";

import type { Metadata, Viewport } from "next";

import { RevealRoot } from "@/components/instrument/RevealRoot";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PREFERENCE_COOKIE, SITE_ORIGIN } from "@/lib/config";
import { INSTRUMENT_FONT_VARIABLES } from "@/lib/design/fonts";
import { DICTIONARIES, LOCALES } from "@/lib/i18n";
import { siteLocale } from "@/lib/i18n/site";
import { I18nProvider } from "@/lib/i18n/client";
import { browserThemeColors, themeBootScript } from "@/lib/theme";

// Solo existen /es (servido en /) y /en: cualquier otro segmento es un 404 sin renderizar
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const t = DICTIONARIES[await siteLocale(params)];
  return { metadataBase: new URL(SITE_ORIGIN), title: { default: t.app.name, template: `%s | ${t.app.name}` }, description: t.app.description };
}

// Sin cookies en el servidor: el tema lo pone el script de arranque, así que la barra sigue al sistema
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: browserThemeColors("system") };

/**
 * Layout raíz del sitio público (landing y guías). No lee cookies ni headers, así que sus páginas se
 * prerenderizan en el build (SSG/ISR). El idioma sale de la URL y el tema, del script en línea.
 */
export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = await siteLocale(params);
  return (
    <html lang={locale} className={INSTRUMENT_FONT_VARIABLES} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript(PREFERENCE_COOKIE.theme) }} />
      </head>
      <body data-design="instrument" className="kin-ambient">
        <I18nProvider locale={locale}>{children}</I18nProvider>
        <RevealRoot />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
