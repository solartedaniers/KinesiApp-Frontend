"use client";

import { createContext, type ReactNode, useContext } from "react";

import { createFormatters, type Formatters } from "../format";
import { DEFAULT_LOCALE, DICTIONARIES, type Dictionary, type Locale } from "./index";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Lo monta el layout raíz con el idioma que resolvió el servidor: cliente y SSR coinciden. */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Diccionario activo, para Client Components. */
export function useT(): Dictionary {
  return DICTIONARIES[useLocale()];
}

export function useFormat(): Formatters {
  return createFormatters(useLocale());
}
