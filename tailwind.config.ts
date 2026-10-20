import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

import { COLORS as INSTRUMENT_COLORS } from "./lib/design/palette.ts";

/*
 * Tokens de diseño: único lugar con colores, tipografía, radios y medidas de layout.
 * Cada color define su par [claro, oscuro]; el plugin de abajo los publica como variables CSS
 * (--kin-*) y las clases de Tailwind sólo leen esas variables, así el tema oscuro no necesita
 * variantes dark: en los componentes. Contrastes verificados con WCAG AA (texto 4.5:1, UI 3:1).
 *
 * La escala risk-* es exclusiva del puntaje de riesgo y de las articulaciones comprometidas:
 * ningún otro elemento de la interfaz usa verde, ámbar ni rojo, para que ese color siempre
 * signifique riesgo.
 */
const COLORS = {
  canvas: ["#F6F7F9", "#111418"],
  panel: ["#FFFFFF", "#181C21"],
  sunken: ["#EEF0F3", "#1F242A"],
  line: ["#DFE3E8", "#2A3038"],
  "line-strong": ["#8C95A1", "#66707E"],
  ink: ["#1A1F26", "#E6E9ED"],
  "ink-muted": ["#59636F", "#9AA4B0"],
  // Acento "de movimiento": acciones primarias, foco y elementos interactivos
  accent: ["#0B7A70", "#2EC4B2"],
  "accent-hover": ["#096A61", "#4AD3C2"],
  "accent-soft": ["#E3F1EF", "#16312E"],
  "on-accent": ["#FFFFFF", "#07201D"],
  // Trazos sobre el video (fondo oscuro fijo): el mismo cian, más vivo, sin texto encima
  "accent-vivid": ["#14B8A6", "#2EC4B2"],
  "risk-low": ["#2A7430", "#6CCB73"],
  "risk-low-soft": ["#E7F3E6", "#1A2E1C"],
  "risk-moderate": ["#9A5800", "#F0B354"],
  "risk-moderate-soft": ["#FCEFD8", "#33281A"],
  "risk-high": ["#B42318", "#F2877D"],
  "risk-high-soft": ["#FDECEA", "#3A1E1C"],
  // Escenario del video: oscuro en ambos temas para que la imagen y los trazos se lean igual
  stage: ["#0F1317", "#0B0E11"],
  "on-stage": ["#E6E9ED", "#E6E9ED"],
  backdrop: ["rgb(17 20 24 / 0.5)", "rgb(0 0 0 / 0.65)"],
} as const;

type Palette = Record<string, readonly [string, string]>;

function variables(mode: 0 | 1, palette: Palette = COLORS): Record<string, string> {
  return Object.fromEntries(Object.entries(palette).map(([name, pair]) => [`--kin-${name}`, pair[mode]]));
}

// La paleta del instrumento (lib/design/palette.ts) suma sus señales y zonas a los nombres actuales
const themeColors = Object.fromEntries(
  Object.keys({ ...COLORS, ...INSTRUMENT_COLORS }).map((name) => [name, `var(--kin-${name})`]),
);

// Familias por variable: las clases font-* leen estas variables. Las cifras usan la display con números
// tabulares; no hay monoespaciada
const INSTRUMENT_FONTS = { "--kin-font-display": "var(--font-instrument-display)", "--kin-font-sans": "var(--font-instrument-sans)", "--kin-font-mono": "var(--font-instrument-display)", "--kin-display-stretch": "92%" };

// Radios por función, no uno igual para todo; como variables para que el CSS del instrumento los use
const RADIUS = { tag: "0.25rem", control: "0.375rem", panel: "0.625rem", stage: "0.875rem" };
const RADIUS_VARS = Object.fromEntries(Object.entries(RADIUS).map(([name, value]) => [`--kin-radius-${name}`, value]));

// Tiempos del movimiento: las medidas se toman su tiempo porque son el contenido; la interfaz responde rápido
const MOTION = {
  "--kin-motion-press": "90ms",
  "--kin-motion-hover": "180ms",
  "--kin-motion-lift": "320ms",
  "--kin-motion-draw": "1400ms",
  "--kin-motion-measure": "1500ms",
  "--kin-motion-stagger": "90ms",
  "--kin-ease-out": "cubic-bezier(0.22, 1, 0.36, 1)",
};

// El instrumento rige dentro de data-design="instrument", que los layouts raíz ponen en <body>.
// Un data-theme anidado fuerza un modo, como la cabina oscura o el escenario del video
const INSTRUMENT = '[data-design="instrument"]';
// Cuánto color lleva el brillo de bordes y medidores: discreto sobre blanco, intenso en la cabina oscura
const GLOW_MIX = ["42%", "62%"];
const instrument = (mode: 0 | 1) => ({
  colorScheme: mode ? "dark" : "light",
  ...variables(mode, INSTRUMENT_COLORS),
  "--kin-glow-mix": GLOW_MIX[mode],
});

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: themeColors,
      fontFamily: {
        // Títulos y cifras grandes (puntaje, grados): Archivo en ancho expandido
        display: ["var(--kin-font-display)", "ui-serif", "Georgia", "serif"],
        // Interfaz, listas y tablas
        sans: ["var(--kin-font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Métricas: grados, tiempos, conteos; cifras tabulares por diseño
        mono: ["var(--kin-font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.3rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.6rem" }],
        xl: ["1.375rem", { lineHeight: "1.8rem" }],
        "2xl": ["1.75rem", { lineHeight: "2.1rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        score: ["clamp(3.25rem, 9vw, 4.75rem)", { lineHeight: "1" }],
        hero: ["clamp(2.25rem, 6vw, 3.75rem)", { lineHeight: "1.05" }],
      },
      borderRadius: Object.fromEntries(Object.keys(RADIUS).map((name) => [name, `var(--kin-radius-${name})`])),
      // Sombra sólo para lo que flota sobre la página (diálogos, menús); las tarjetas usan borde
      boxShadow: {
        overlay: "0 12px 32px -12px rgb(17 20 24 / 0.28), 0 2px 6px rgb(17 20 24 / 0.08)",
      },
      spacing: {
        control: "2.75rem",
        sidebar: "15rem",
        topbar: "3.5rem",
      },
      maxWidth: {
        content: "76rem",
        prose: "40rem",
      },
      transitionDuration: {
        fast: "140ms",
        theme: "220ms",
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ":root": { colorScheme: "light", ...variables(0), ...RADIUS_VARS },
        ':root[data-theme="dark"]': { colorScheme: "dark", ...variables(1) },
        [INSTRUMENT]: { ...instrument(0), ...INSTRUMENT_FONTS, ...MOTION },
        // Sin data-theme (preferencia "sistema") sigue al sistema operativo
        "@media (prefers-color-scheme: dark)": {
          ":root:not([data-theme])": { colorScheme: "dark", ...variables(1) },
          [`:root:not([data-theme]) ${INSTRUMENT}`]: instrument(1),
        },
        [`:root[data-theme="dark"] ${INSTRUMENT}`]: instrument(1),
        [`${INSTRUMENT} [data-theme="light"]`]: instrument(0),
        [`${INSTRUMENT} [data-theme="dark"]`]: instrument(1),
        "@media print": {
          ":root, :root[data-theme]": { colorScheme: "light", ...variables(0) },
          [`${INSTRUMENT}, ${INSTRUMENT} [data-theme]`]: instrument(0),
        },
      });
    }),
  ],
};

export default config;
