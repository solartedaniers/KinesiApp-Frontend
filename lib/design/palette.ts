/*
 * Paleta del laboratorio de biomecánica: papel técnico crema con tinta de plotter cobalto en claro,
 * y sala de análisis con trazos luminosos en oscuro. Cada color es su par [claro, oscuro].
 * Mantengo los nombres semánticos de la paleta anterior para que, al aprobarla, baste con moverla
 * a :root. Los contrastes AA los compruebo en palette.test.ts, no a ojo.
 *
 * risk-* sigue siendo exclusiva del riesgo; trace-right es la segunda serie (lado derecho) de las
 * gráficas, en un tono que no se confunde con ninguna del riesgo.
 */
export const LAB_COLORS = {
  canvas: ["#F3EFE6", "#0C1117"],
  panel: ["#FBF9F4", "#121922"],
  sunken: ["#E8E2D5", "#090D12"],
  line: ["#D9D2C3", "#232E3B"],
  "line-strong": ["#827A6A", "#5A6A7C"],
  "grid-minor": ["#E2E0DD", "#131B24"],
  "grid-major": ["#C9CAD3", "#1D2938"],
  ink: ["#1B2230", "#E2E7EB"],
  "ink-muted": ["#575D66", "#95A1AD"],
  accent: ["#2A43C0", "#8BA1FF"],
  "accent-hover": ["#2035A3", "#A9B9FF"],
  "accent-soft": ["#E0E3F4", "#182142"],
  "on-accent": ["#FFFFFF", "#0B1020"],
  "accent-vivid": ["#7F97FF", "#8BA1FF"],
  "trace-right": ["#8E2C6C", "#E78DC6"],
  "risk-low": ["#2C6A4C", "#5CC995"],
  "risk-low-soft": ["#DCEBE1", "#10261C"],
  "risk-moderate": ["#875800", "#E2AE48"],
  "risk-moderate-soft": ["#F4E6C6", "#2B2210"],
  "risk-high": ["#A1261E", "#FF7D6E"],
  "risk-high-soft": ["#F6DCD5", "#2E1613"],
  stage: ["#0B0F14", "#07090C"],
  "on-stage": ["#E2E7EB", "#E2E7EB"],
  // El brillo de los trazos sólo existe en la sala oscura; en papel la tinta no brilla
  glow: ["rgb(42 67 192 / 0)", "rgb(139 161 255 / 0.45)"],
  backdrop: ["rgb(27 34 48 / 0.45)", "rgb(0 0 0 / 0.65)"],
} as const;

export type LabColor = keyof typeof LAB_COLORS;

const SURFACES = ["canvas", "panel", "sunken"] as const;

// Texto normal: 4.5:1 sobre las tres superficies. Elementos de interfaz (bordes, trazos): 3:1
export const CONTRAST_REQUIREMENTS: { fg: LabColor; bg: LabColor; min: number }[] = [
  ...(["ink", "ink-muted", "accent", "accent-hover", "trace-right", "risk-low", "risk-moderate", "risk-high"] as const)
    .flatMap((fg) => SURFACES.map((bg) => ({ fg, bg, min: 4.5 }))),
  { fg: "risk-low", bg: "risk-low-soft", min: 4.5 },
  { fg: "risk-moderate", bg: "risk-moderate-soft", min: 4.5 },
  { fg: "risk-high", bg: "risk-high-soft", min: 4.5 },
  { fg: "accent", bg: "accent-soft", min: 4.5 },
  { fg: "on-accent", bg: "accent", min: 4.5 },
  { fg: "on-accent", bg: "accent-hover", min: 4.5 },
  { fg: "on-stage", bg: "stage", min: 4.5 },
  { fg: "accent-vivid", bg: "stage", min: 3 },
  ...SURFACES.map((bg) => ({ fg: "line-strong" as const, bg, min: 3 })),
];
