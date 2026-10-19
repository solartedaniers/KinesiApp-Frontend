// Largest-Triangle-Three-Buckets: reduce una serie a `threshold` puntos conservando picos y valles.
// La uso porque una gráfica de 600 px no muestra 1300 muestras: dibujarlas todas sólo cuesta trabajo
// al navegador y se ve igual. Lógica pura (testeada en lttb.test.ts); en F5 corre dentro del worker.

export type XY = { x: number; y: number };

export function lttb<T extends XY>(points: readonly T[], threshold: number): T[] {
  if (threshold >= points.length || threshold < 3) return [...points];
  const sampled: T[] = [points[0]];
  const bucketSize = (points.length - 2) / (threshold - 2);
  let anchor = 0;
  for (let bucket = 0; bucket < threshold - 2; bucket++) {
    const start = Math.floor(bucket * bucketSize) + 1;
    const end = Math.floor((bucket + 1) * bucketSize) + 1;
    // Promedio del siguiente balde: el tercer vértice del triángulo
    const nextEnd = Math.min(Math.floor((bucket + 2) * bucketSize) + 1, points.length);
    let avgX = 0;
    let avgY = 0;
    for (let i = end; i < nextEnd; i++) {
      avgX += points[i].x;
      avgY += points[i].y;
    }
    const count = Math.max(1, nextEnd - end);
    avgX /= count;
    avgY /= count;

    let best = start;
    let bestArea = -1;
    const a = points[anchor];
    for (let i = start; i < end; i++) {
      const area = Math.abs((a.x - avgX) * (points[i].y - a.y) - (a.x - points[i].x) * (avgY - a.y));
      if (area > bestArea) {
        bestArea = area;
        best = i;
      }
    }
    sampled.push(points[best]);
    anchor = best;
  }
  sampled.push(points[points.length - 1]);
  return sampled;
}
