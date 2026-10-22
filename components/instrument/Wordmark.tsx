/** Marca: una esfera mínima con la aguja en el objetivo, más el nombre en la display. En el celular
 * queda sólo la esfera: el nombre no cabe junto a las preferencias. */
export function Wordmark({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <circle cx="16" cy="16" r="14.5" className="fill-panel stroke-line" strokeWidth="1" />
        <path d="M8.2 23.2A10.5 10.5 0 1 1 23.8 23.2" className="fill-none stroke-sunken" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M8.2 23.2A10.5 10.5 0 0 1 21.9 7.4" className="fill-none stroke-knee" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M21.9 7.4A10.5 10.5 0 0 1 25.9 13" className="fill-none stroke-zone-target" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M16 16L22.4 9.6" className="stroke-ink" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2.2" className="fill-ink" />
      </svg>
      <span className="max-sm:sr-only">{name}</span>
    </span>
  );
}
