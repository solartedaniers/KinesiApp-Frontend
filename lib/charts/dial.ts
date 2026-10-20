// Esfera semicircular de los medidores: 0 a la izquierda, `max` a la derecha, pasando por arriba.
import type { Point } from "@/lib/design/pose";

export function dialPoint(center: Point, radius: number, value: number, max: number): Point {
  const angle = Math.PI * (1 - Math.min(Math.max(value, 0), max) / max);
  return { x: center.x + radius * Math.cos(angle), y: center.y - radius * Math.sin(angle) };
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Arco de la esfera entre dos valores; nunca pasa de media vuelta, así que el arco corto basta. */
export function dialArc(center: Point, radius: number, from: number, to: number, max: number): string {
  const a = dialPoint(center, radius, from, max);
  const b = dialPoint(center, radius, to, max);
  return `M${round(a.x)} ${round(a.y)}A${radius} ${radius} 0 0 1 ${round(b.x)} ${round(b.y)}`;
}
