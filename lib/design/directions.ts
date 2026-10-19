/*
 * Tres direcciones visuales candidatas para el rediseño. Comparten los mismos nombres de token para
 * que un componente se vea en cualquiera de ellas sin cambiar sus clases; cada color es su par
 * [claro, oscuro]. Los contrastes AA los compruebo en directions.test.ts, no a ojo.
 *
 * hue-1 y hue-2 son las dos series de las gráficas (flexión de rodilla e inclinación del tronco);
 * hue-3 es el color expresivo de la dirección y sólo decora. risk-* sigue siendo exclusiva del riesgo.
 */
export const DIRECTION_IDS = ["a", "b", "c"] as const;
export type DirectionId = (typeof DIRECTION_IDS)[number];

type Pair = readonly [string, string];

// Mismos tonos de riesgo en las tres: el significado no debe cambiar con la dirección que elijas
const RISK = {
  "risk-low": ["#26704C", "#5CCB97"],
  "risk-low-soft": ["#E0F2E8", "#0F2A1E"],
  "risk-moderate": ["#875800", "#E8B54E"],
  "risk-moderate-soft": ["#F8EDCF", "#2C220E"],
  "risk-high": ["#B0271E", "#FF8073"],
  "risk-high-soft": ["#FBE3DF", "#34150F"],
} as const satisfies Record<string, Pair>;

const PALETTES = {
  // Estela: luz de larga exposición. Blanco de estudio en claro y noche cerrada en oscuro
  a: {
    canvas: ["#F5F7FB", "#05070D"],
    panel: ["#FFFFFF", "#0C101B"],
    sunken: ["#ECF0F6", "#03050A"],
    line: ["#DDE3EC", "#1B2233"],
    "line-strong": ["#7C879A", "#5D6983"],
    ink: ["#111728", "#EDF1F8"],
    "ink-muted": ["#525B6F", "#98A2B7"],
    accent: ["#0A6D96", "#46D2F3"],
    "accent-hover": ["#08597C", "#7EE0F7"],
    "accent-soft": ["#E0F0F7", "#0A2531"],
    "on-accent": ["#FFFFFF", "#021017"],
    "hue-1": ["#0A86B0", "#46D2F3"],
    "hue-2": ["#CC2B69", "#FF5F9D"],
    "hue-3": ["#B07D00", "#FFD35E"],
    glow: ["rgb(10 134 176 / 0.28)", "rgb(70 210 243 / 0.6)"],
    ...RISK,
  },
  // Ritmo: la energía de la pista y la piscina. Hielo luminoso en claro y azul profundo en oscuro
  b: {
    canvas: ["#F4F7FF", "#08111D"],
    panel: ["#FFFFFF", "#101C2B"],
    sunken: ["#E8EEFC", "#050B14"],
    line: ["#D8E0F3", "#1E2D41"],
    "line-strong": ["#7480A3", "#5E708A"],
    ink: ["#0D1734", "#EEF3FB"],
    "ink-muted": ["#4C5677", "#9CABC1"],
    accent: ["#C0145B", "#FF6AA5"],
    "accent-hover": ["#A1104C", "#FF92BD"],
    "accent-soft": ["#FCE4EE", "#3A1024"],
    "on-accent": ["#FFFFFF", "#1E0412"],
    "hue-1": ["#2443EA", "#7D93FF"],
    "hue-2": ["#00806F", "#2EE0C8"],
    "hue-3": ["#F2B705", "#FFD34D"],
    glow: ["rgb(36 67 234 / 0.18)", "rgb(125 147 255 / 0.4)"],
    ...RISK,
  },
  // Instrumento: pantalla de medición. Gris frío en capas en claro y cabina oscura en oscuro
  c: {
    canvas: ["#EBEFF3", "#090D11"],
    panel: ["#FFFFFF", "#121920"],
    sunken: ["#E1E7EC", "#06090C"],
    line: ["#D2D9E0", "#222C36"],
    "line-strong": ["#738190", "#5F6D7B"],
    ink: ["#0E1922", "#E7ECF1"],
    "ink-muted": ["#4D5A66", "#97A3AF"],
    accent: ["#0055D4", "#5CA3FF"],
    "accent-hover": ["#0045AD", "#8ABDFF"],
    "accent-soft": ["#E2EBFA", "#0F2440"],
    "on-accent": ["#FFFFFF", "#03101F"],
    "hue-1": ["#0055D4", "#5CA3FF"],
    "hue-2": ["#5D6B78", "#A3AFBB"],
    "hue-3": ["#00898A", "#3ED0C8"],
    glow: ["rgb(0 85 212 / 0.16)", "rgb(92 163 255 / 0.38)"],
    ...RISK,
  },
} as const satisfies Record<DirectionId, Record<string, Pair>>;

export type DirectionColor = keyof (typeof PALETTES)["a"];
export const DIRECTION_COLORS: Record<DirectionId, Record<DirectionColor, Pair>> = PALETTES;

const SURFACES = ["canvas", "panel", "sunken"] as const;

// Texto normal: 4.5:1 sobre las tres superficies. Trazos de datos y bordes de control: 3:1
export const DIRECTION_CONTRAST: { fg: DirectionColor; bg: DirectionColor; min: number }[] = [
  ...(["ink", "ink-muted", "accent", "accent-hover", "risk-low", "risk-moderate", "risk-high"] as const)
    .flatMap((fg) => SURFACES.map((bg) => ({ fg, bg, min: 4.5 }))),
  ...(["hue-1", "hue-2", "line-strong"] as const).flatMap((fg) => SURFACES.map((bg) => ({ fg, bg, min: 3 }))),
  { fg: "risk-low", bg: "risk-low-soft", min: 4.5 },
  { fg: "risk-moderate", bg: "risk-moderate-soft", min: 4.5 },
  { fg: "risk-high", bg: "risk-high-soft", min: 4.5 },
  { fg: "accent", bg: "accent-soft", min: 4.5 },
  { fg: "ink", bg: "accent-soft", min: 4.5 },
  { fg: "on-accent", bg: "accent", min: 4.5 },
  { fg: "on-accent", bg: "accent-hover", min: 4.5 },
];
