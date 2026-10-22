// Tema de la interfaz: claro, oscuro o el del sistema operativo. Lógica pura (testeada en theme.test.ts).

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "system";

export function isTheme(value: unknown): value is Theme {
  return (THEMES as readonly unknown[]).includes(value);
}

export function resolveTheme(cookieValue: string | undefined): Theme {
  return isTheme(cookieValue) ? cookieValue : DEFAULT_THEME;
}

/** Atributo data-theme de <html>: sin atributo, el CSS sigue al sistema (prefers-color-scheme). */
export function themeAttribute(theme: Theme): "light" | "dark" | undefined {
  return theme === "system" ? undefined : theme;
}

// Colores que el navegador necesita fuera del CSS (barra del navegador, manifest): una meta tag no
// puede leer variables CSS. Deben coincidir con canvas / accent de lib/design/palette.ts.
export const THEME_COLOR = {
  light: "#EDF2FA",
  dark: "#060A14",
  brand: "#2443EA",
} as const;

/**
 * Script en línea para las páginas estáticas: aplica el tema de la cookie antes del primer pintado,
 * porque el HTML prerenderizado no puede traerlo. Sin cookie o con "system", sigue al sistema.
 */
export function themeBootScript(cookieName: string): string {
  return `(function(){try{var m=document.cookie.match(/(?:^|; )${cookieName}=(light|dark)(?:;|$)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})()`;
}

/** Color de la barra del navegador según el tema; con "system", uno por cada preferencia del SO. */
export function browserThemeColors(theme: Theme): { media?: string; color: string }[] {
  if (theme !== "system") return [{ color: THEME_COLOR[theme] }];
  return [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.dark },
  ];
}
