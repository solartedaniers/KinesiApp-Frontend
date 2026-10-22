// Significado del color: una señal por articulación y tres zonas del rango de flexión de rodilla.
// Las clases van escritas enteras para que Tailwind las encuentre al compilar.
export const SIGNALS = ["knee", "trunk", "hip", "center"] as const;
export type Signal = (typeof SIGNALS)[number];

export const SIGNAL_CLASS: Record<Signal, { stroke: string; fill: string; bg: string; text: string; soft: string }> = {
  knee: { stroke: "stroke-knee", fill: "fill-knee", bg: "bg-knee", text: "text-knee", soft: "bg-knee-soft" },
  trunk: { stroke: "stroke-trunk", fill: "fill-trunk", bg: "bg-trunk", text: "text-trunk", soft: "bg-trunk-soft" },
  hip: { stroke: "stroke-hip", fill: "fill-hip", bg: "bg-hip", text: "text-hip", soft: "bg-hip-soft" },
  center: { stroke: "stroke-center", fill: "fill-center", bg: "bg-center", text: "text-center", soft: "bg-center-soft" },
};

/**
 * Rango sin riesgo de la rodilla con que la IA puntuó un análisis (AnalysisSummary.knee_target). No hay
 * un rango propio del frontend: un extremo en null es que el modelo no pone límite de ese lado.
 */
export type KneeTarget = { low: number | null; high: number | null };

export const ZONES = ["under", "target", "over"] as const;
export type Zone = (typeof ZONES)[number];

export const ZONE_CLASS: Record<Zone, { stroke: string; fill: string; bg: string; text: string; soft: string; softFill: string }> = {
  under: { stroke: "stroke-zone-under", fill: "fill-zone-under", bg: "bg-zone-under", text: "text-zone-under", soft: "bg-zone-under-soft", softFill: "fill-zone-under-soft" },
  target: { stroke: "stroke-zone-target", fill: "fill-zone-target", bg: "bg-zone-target", text: "text-zone-target", soft: "bg-zone-target-soft", softFill: "fill-zone-target-soft" },
  over: { stroke: "stroke-zone-over", fill: "fill-zone-over", bg: "bg-zone-over", text: "text-zone-over", soft: "bg-zone-over-soft", softFill: "fill-zone-over-soft" },
};

/** Zona de un valor respecto del rango; los bordes cuentan como dentro. */
export function zoneOf(value: number, { low, high }: KneeTarget): Zone {
  if (low !== null && value < low) return "under";
  return high !== null && value > high ? "over" : "target";
}

/** Textos del rango según qué extremos tenga: "60–80°", "90° o más", "hasta 80°". */
export function targetText(
  { low, high }: KneeTarget,
  degrees: (value: number) => string,
  templates: { between: string; from: string; upTo: string },
): string {
  const fill = (template: string) => template.replace("{low}", low === null ? "" : degrees(low)).replace("{high}", high === null ? "" : degrees(high));
  return fill(low !== null && high !== null ? templates.between : low !== null ? templates.from : templates.upTo);
}

/** Zonas que existen para un rango: la sentadilla, sin tope, no tiene "por encima". */
export function zonesOf({ low, high }: KneeTarget): Zone[] {
  return ZONES.filter((zone) => (zone === "under" ? low !== null : zone === "over" ? high !== null : true));
}

/** Tramos de cada zona en una escala de 0 a `max`, para pintar esferas y bandas. */
export function zoneSpans(max: number, { low, high }: KneeTarget): { zone: Zone; from: number; to: number }[] {
  const from = Math.min(low ?? 0, max);
  const to = Math.min(high ?? max, max);
  return [
    { zone: "under" as const, from: 0, to: from },
    { zone: "target" as const, from, to },
    { zone: "over" as const, from: to, to: max },
  ].filter((span) => span.to > span.from);
}
