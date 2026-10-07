export type StatTile = { label: string; value: string };

/**
 * Cifras sueltas: un número con su etiqueta comunica mejor que un gráfico (§1 de la guía dataviz).
 * Una sola franja dividida por líneas, no una tarjeta por cifra.
 */
export function StatGrid({ tiles }: { tiles: StatTile[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="grid content-start gap-1 bg-panel px-4 py-4 sm:px-5">
          <dt className="text-sm text-ink-muted">{tile.label}</dt>
          <dd className="font-display text-2xl font-semibold tabular-nums text-ink [font-stretch:112%]">{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
}
