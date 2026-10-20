/*
 * Paleta del instrumento vivo. Cada color es su par [claro, oscuro] y tiene un papel fijo:
 * - superficies e interfaz (canvas, panel, raised, sunken, línea, tinta, acento de acción);
 * - una señal por articulación, igual en el esqueleto, las gráficas y los medidores;
 * - tres zonas del rango de flexión (debajo, dentro y encima del objetivo);
 * - la escala de riesgo, que se acompaña siempre de palabra y pasos.
 * El cobalto es a la vez la rodilla y la acción principal: lo que la app mide es lo que invita a hacer.
 * Los contrastes AA los compruebo en palette.test.ts, no a ojo.
 */
export const COLORS = {
  canvas: ["#EDF2FA", "#060A14"],
  panel: ["#FFFFFF", "#0D1424"],
  raised: ["#F6F8FD", "#131C31"],
  sunken: ["#E4EBF5", "#04070F"],
  line: ["#D3DCEB", "#1D2842"],
  "line-strong": ["#6F7D99", "#58688E"],
  ink: ["#0B1430", "#EEF2FB"],
  "ink-muted": ["#475373", "#9DA9C5"],
  accent: ["#2443EA", "#8297FF"],
  "accent-hover": ["#1A33C2", "#A8B6FF"],
  "accent-soft": ["#E3E8FF", "#151F4A"],
  "on-accent": ["#FFFFFF", "#050A1F"],

  knee: ["#2443EA", "#8297FF"],
  "knee-soft": ["#E3E8FF", "#151F4A"],
  trunk: ["#996500", "#FFD34D"],
  "trunk-soft": ["#FFF1C9", "#2D2307"],
  hip: ["#C2135A", "#FF6EA8"],
  "hip-soft": ["#FDE3EE", "#3A0F24"],
  center: ["#007A6A", "#2EE0C8"],
  "center-soft": ["#D6F6F0", "#052B27"],

  "zone-under": ["#0369A1", "#4CC3F7"],
  "zone-under-soft": ["#DFF1FC", "#06233A"],
  "zone-target": ["#047857", "#3DDC9E"],
  "zone-target-soft": ["#DAF5EA", "#05291D"],
  "zone-over": ["#BE123C", "#FF7A91"],
  "zone-over-soft": ["#FFE3E8", "#3A0D17"],

  "risk-low": ["#1F6B45", "#5CCB97"],
  "risk-low-soft": ["#DDF1E6", "#0F2A1E"],
  "risk-moderate": ["#835500", "#E8B54E"],
  "risk-moderate-soft": ["#F8EBCB", "#2C220E"],
  "risk-high": ["#AD2318", "#FF8073"],
  "risk-high-soft": ["#FBE1DD", "#34150F"],

  // Escenario del video: oscuro en ambos temas para que la imagen y los trazos se lean igual
  stage: ["#070B16", "#03050B"],
  "on-stage": ["#EEF2FB", "#EEF2FB"],
  // Luz y sombra del relieve: en claro el reflejo es blanco y la sombra azulada; en la cabina, al revés
  highlight: ["rgb(255 255 255 / 0.9)", "rgb(255 255 255 / 0.07)"],
  shade: ["rgb(22 38 92 / 0.16)", "rgb(0 0 0 / 0.6)"],
  backdrop: ["rgb(11 20 48 / 0.45)", "rgb(0 0 0 / 0.7)"],
} as const;

export type PaletteColor = keyof typeof COLORS;

export const SIGNAL_COLORS = ["knee", "trunk", "hip", "center"] as const;
export const ZONE_COLORS = ["zone-under", "zone-target", "zone-over"] as const;

const SURFACES = ["canvas", "panel", "raised", "sunken"] as const;
const SOFTS = ["accent-soft", "knee-soft", "trunk-soft", "hip-soft", "center-soft", "zone-under-soft", "zone-target-soft", "zone-over-soft"] as const;

// Texto normal: 4.5:1 sobre todas las superficies. Trazos de datos y bordes de control: 3:1
export const CONTRAST_REQUIREMENTS: { fg: PaletteColor; bg: PaletteColor; min: number; modes?: (0 | 1)[] }[] = [
  ...(["ink", "ink-muted", "accent", "accent-hover", "risk-low", "risk-moderate", "risk-high"] as const)
    .flatMap((fg) => SURFACES.map((bg) => ({ fg, bg, min: 4.5 }))),
  ...([...SIGNAL_COLORS, ...ZONE_COLORS, "line-strong"] as const).flatMap((fg) => SURFACES.map((bg) => ({ fg, bg, min: 3 }))),
  // Sobre un tinte suave va texto en tinta; sobre el de su zona, el texto de su propio color
  ...SOFTS.map((bg) => ({ fg: "ink" as const, bg, min: 4.5 })),
  ...ZONE_COLORS.map((fg) => ({ fg, bg: `${fg}-soft` as PaletteColor, min: 4.5 })),
  ...SIGNAL_COLORS.map((fg) => ({ fg, bg: `${fg}-soft` as PaletteColor, min: 3 })),
  { fg: "risk-low", bg: "risk-low-soft", min: 4.5 },
  { fg: "risk-moderate", bg: "risk-moderate-soft", min: 4.5 },
  { fg: "risk-high", bg: "risk-high-soft", min: 4.5 },
  { fg: "accent", bg: "accent-soft", min: 4.5 },
  { fg: "on-accent", bg: "accent", min: 4.5 },
  { fg: "on-accent", bg: "accent-hover", min: 4.5 },
  { fg: "on-stage", bg: "stage", min: 4.5 },
  // Sobre el video el escenario fuerza el modo oscuro, así que sólo cuentan los tonos oscuros
  ...SIGNAL_COLORS.map((fg) => ({ fg, bg: "stage" as const, min: 3, modes: [1 as const] })),
];
