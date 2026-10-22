import { notFound } from "next/navigation";

import { isLocale, type Locale } from "./index";

/** Idioma del sitio público, tomado del segmento [locale] de la URL. */
export async function siteLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
