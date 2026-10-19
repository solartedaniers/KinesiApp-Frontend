/** Marca: una rodilla en vista lateral con su arco de flexión, en tinta de cobalto. */
export function LabLogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="flex-none text-accent">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 4.5L20 16 11.5 28" strokeWidth={2.6} />
        <path d="M15.4 11.6a6.4 6.4 0 0 1 .9 9.2" strokeWidth={1.6} />
      </g>
      <circle cx={20} cy={16} r={3} fill="var(--kin-canvas)" stroke="currentColor" strokeWidth={2} />
      <circle cx={8} cy={4.5} r={2} fill="currentColor" />
      <circle cx={11.5} cy={28} r={2} fill="currentColor" />
    </svg>
  );
}

export function LabLogo({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LabLogoMark />
      <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">{name}</span>
    </span>
  );
}
