// Escalas de las gráficas SVG: dominio a píxeles y marcas en valores redondos. Lógica pura (testeada
// en scale.test.ts). No uso d3-scale porque sólo necesito lineal y marcas, unas líneas.

/** Marca de un eje: el valor y su texto ya formateado. */
export type Tick = { value: number; label: string };

export type Linear = ((value: number) => number) & { domain: [number, number] };

export function linear([d0, d1]: [number, number], [r0, r1]: [number, number]): Linear {
  const span = d1 - d0 || 1;
  const scale = ((value: number) => r0 + ((value - d0) / span) * (r1 - r0)) as Linear;
  scale.domain = [d0, d1];
  return scale;
}

/** Paso redondo (1, 2, 2.5 o 5 por potencia de 10) para unas `count` marcas entre min y max. */
function niceStep(min: number, max: number, count: number): number {
  const raw = Math.abs(max - min) / Math.max(1, count);
  if (raw === 0) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

/** Marcas redondas que cubren [min, max]; la última queda por encima del máximo. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  const step = niceStep(min, max, count);
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) ticks.push(Math.round(value * 1e6) / 1e6);
  if (ticks.at(-1) === max) ticks.push(Math.round((max + step) * 1e6) / 1e6);
  return ticks;
}
