import type { ReactNode } from "react";

import { dialArc } from "@/lib/charts/dial";

const C = { x: 50, y: 50 };

type Props = {
  /** Lo que se ve dentro: la cámara en vivo, el video grabado o el esqueleto de la guía. */
  children: ReactNode;
  label: string;
  hint: string;
  status: string;
  recording: boolean;
  /** Avance hacia el tope, de 0 a 1; el anillo se pone rosa al llegar. */
  fill: number;
  /** Cifra del centro del anillo: los segundos al grabar, el porcentaje al subir. */
  value: number;
};

/**
 * Escenario oscuro de la captura con las esquinas de encuadre, el aviso de grabación y el anillo de
 * segundos. Lo comparten la captura real y la simulada de la guía.
 */
export function CaptureFrame({ children, label, hint, status, recording, fill, value }: Props) {
  return (
    <figure data-theme="dark" className="kin-stage mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-stage text-on-stage" aria-label={label}>
      {children}
      {/* Esquinas de encuadre: marcan dónde debe quedar el cuerpo entero */}
      <svg viewBox="0 0 100 133" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <path d="M14 10h-6v6M86 10h6v6M14 118h-6v-6M86 118h6v-6" className="fill-none stroke-on-stage opacity-60" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stage/80 px-4 pt-6 pb-3 text-center text-xs text-on-stage">{hint}</figcaption>
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-stage/80 px-2.5 py-1 text-xs font-semibold">
        {recording && <span className="kin-waking size-2.5 rounded-full bg-zone-over text-zone-over" aria-hidden />}
        <span>{status}</span>
      </div>
      <div className="absolute top-3 right-3 grid size-16 place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden>
          <circle cx="50" cy="50" r="42" className="fill-stage stroke-line" strokeWidth="8" />
          {fill > 0 && <path d={dialArc(C, 42, 0, Math.min(fill, 0.999), 1, 360)} transform="rotate(180 50 50)" className={`kin-signal-glow fill-none ${fill >= 1 ? "stroke-zone-over" : "stroke-trunk"} text-trunk`} strokeWidth="8" strokeLinecap="round" />}
        </svg>
        <span className="relative font-display text-lg font-bold [font-variant-numeric:tabular-nums]" role="timer" aria-live="off">{value}</span>
      </div>
    </figure>
  );
}
