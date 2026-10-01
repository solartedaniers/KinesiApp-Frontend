import { es } from "./es";

// Un solo idioma por ahora: el idioma por cookie haría dinámicas las páginas SSG
// (ver docs/status, desviaciones de la Fase 1)
export const t = es;

/** Locale de Intl (fechas, números) para el idioma activo. */
export const LOCALE = "es";

/** Reemplaza {variable} por su valor: format("Dura {seconds} s", { seconds: 45 }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
