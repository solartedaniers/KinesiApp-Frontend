// Marca sola (sin nombre ni enlace), usable también desde componentes de cliente. Mismo dibujo que app/icon.svg.
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={`flex-none ${className ?? ""}`}>
      <rect width="32" height="32" rx="7" className="fill-accent" />
      <g className="stroke-on-accent" fill="none" strokeLinecap="round">
        <path d="M9 7v18" strokeWidth="2.6" />
        <path d="M24 7.5 15 16l9 8.5" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M19.73 11.53a6.5 6.5 0 0 1 0 8.94" strokeWidth="1.6" strokeOpacity="0.7" />
      </g>
      <circle cx="15" cy="16" r="2.4" strokeWidth="1.8" className="fill-accent stroke-on-accent" />
      <circle cx="24" cy="7.5" r="2.1" className="fill-on-accent" />
      <circle cx="24" cy="24.5" r="2.1" className="fill-on-accent" />
    </svg>
  );
}
