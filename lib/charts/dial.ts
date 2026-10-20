// Esfera de los medidores: el recorrido abre `sweep` grados centrados arriba, como un tacómetro.
// 0 queda abajo a la izquierda y `max` abajo a la derecha. Ángulos en grados desde las 12, horario.
import type { Point } from "@/lib/design/pose";

export const DIAL_SWEEP = 240;

/** Ángulo de la aguja para un valor; lo uso también para rotarla con CSS. */
export function dialAngle(value: number, max: number, sweep = DIAL_SWEEP): number {
  return -sweep / 2 + (Math.min(Math.max(value, 0), max) / max) * sweep;
}

export function dialPoint(center: Point, radius: number, value: number, max: number, sweep = DIAL_SWEEP): Point {
  const angle = (dialAngle(value, max, sweep) * Math.PI) / 180;
  return { x: center.x + radius * Math.sin(angle), y: center.y - radius * Math.cos(angle) };
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Arco de la esfera entre dos valores, en sentido horario. */
export function dialArc(center: Point, radius: number, from: number, to: number, max: number, sweep = DIAL_SWEEP): string {
  const a = dialPoint(center, radius, from, max, sweep);
  const b = dialPoint(center, radius, to, max, sweep);
  const large = dialAngle(to, max, sweep) - dialAngle(from, max, sweep) > 180 ? 1 : 0;
  return `M${round(a.x)} ${round(a.y)}A${radius} ${radius} 0 ${large} 1 ${round(b.x)} ${round(b.y)}`;
}
