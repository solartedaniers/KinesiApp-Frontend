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

/** Rango de flexión de rodilla que la app marca como objetivo en la sentadilla, en grados. */
export const TARGET_KNEE: readonly [number, number] = [90, 120];

export const ZONES = ["under", "target", "over"] as const;
export type Zone = (typeof ZONES)[number];

export const ZONE_CLASS: Record<Zone, { stroke: string; fill: string; bg: string; text: string; soft: string; softFill: string }> = {
  under: { stroke: "stroke-zone-under", fill: "fill-zone-under", bg: "bg-zone-under", text: "text-zone-under", soft: "bg-zone-under-soft", softFill: "fill-zone-under-soft" },
  target: { stroke: "stroke-zone-target", fill: "fill-zone-target", bg: "bg-zone-target", text: "text-zone-target", soft: "bg-zone-target-soft", softFill: "fill-zone-target-soft" },
  over: { stroke: "stroke-zone-over", fill: "fill-zone-over", bg: "bg-zone-over", text: "text-zone-over", soft: "bg-zone-over-soft", softFill: "fill-zone-over-soft" },
};

/** Zona de un valor respecto del rango; los bordes cuentan como dentro. */
export function zoneOf(value: number, [low, high]: readonly [number, number] = TARGET_KNEE): Zone {
  return value < low ? "under" : value > high ? "over" : "target";
}

/** Tramos de cada zona en una escala de 0 a `max`, para pintar esferas y bandas. */
export function zoneSpans(max: number, [low, high]: readonly [number, number] = TARGET_KNEE): { zone: Zone; from: number; to: number }[] {
  return [
    { zone: "under" as const, from: 0, to: Math.min(low, max) },
    { zone: "target" as const, from: Math.min(low, max), to: Math.min(high, max) },
    { zone: "over" as const, from: Math.min(high, max), to: max },
  ].filter(({ from, to }) => to > from);
}
