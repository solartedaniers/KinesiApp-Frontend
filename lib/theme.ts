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
// puede leer variables CSS. Deben coincidir con canvas / accent de tailwind.config.ts.
export const THEME_COLOR = {
  light: "#f6f7f9",
  dark: "#111418",
  brand: "#0b7a70",
} as const;

/** Color de la barra del navegador según el tema; con "system", uno por cada preferencia del SO. */
export function browserThemeColors(theme: Theme): { media?: string; color: string }[] {
  if (theme !== "system") return [{ color: THEME_COLOR[theme] }];
  return [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.dark },
  ];
}
