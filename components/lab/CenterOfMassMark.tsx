/** Símbolo del centro de gravedad de los planos técnicos: círculo con dos cuadrantes opuestos rellenos. */
export function CenterOfMassMark({ x, y, size }: { x: number; y: number; size: number }) {
  const r = size / 2;
  return (
    <g transform={`translate(${x} ${y})`} className="fill-accent stroke-accent" strokeWidth={0.6}>
      <circle r={r} className="fill-[var(--kin-skeleton-fill,var(--kin-canvas))]" />
      <path d={`M0 0V${-r}A${r} ${r} 0 0 1 ${r} 0Z M0 0V${r}A${r} ${r} 0 0 1 ${-r} 0Z`} stroke="none" />
    </g>
  );
}
