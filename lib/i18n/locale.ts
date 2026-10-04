// Elección del idioma y plantillas de texto: lógica pura, sin los diccionarios (testeada en i18n.test.ts).

export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: unknown): value is Locale {
  return (LOCALES as readonly unknown[]).includes(value);
}

/** Idioma elegido por el usuario (cookie) o, la primera vez, el preferido del navegador. */
export function resolveLocale(cookieValue: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = Number(params.find((param) => param.trim().startsWith("q="))?.split("=")[1] ?? 1);
      return { language: tag.toLowerCase().split("-")[0], quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((entry) => entry.language && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);
  return preferred.map((entry) => entry.language).find(isLocale) ?? DEFAULT_LOCALE;
}

/** Reemplaza {variable} por su valor: format("Dura {seconds} s", { seconds: 45 }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
