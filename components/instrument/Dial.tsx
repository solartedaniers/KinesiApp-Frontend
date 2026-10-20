import type { ReactNode } from "react";

import { dialAngle, dialArc, dialPoint } from "@/lib/charts/dial";
import { cssVars } from "@/lib/design/css";
import { type Signal, SIGNAL_CLASS, ZONE_CLASS, zoneSpans } from "@/lib/design/signals";

// Escala de la flexión de rodilla en la esfera; pasa del máximo que la IA registra en una sentadilla
export const DIAL_MAX = 150;

const C = { x: 100, y: 100 };
const VALUE_R = 84;
const ZONE_R = 71;
const r = (n: number) => Math.round(n * 100) / 100;

type DialProps = {
  value: number;
  /** Texto para lectores de pantalla: la esfera en sí es decorativa. */
  label: string;
  signal?: Signal;
  max?: number;
  target?: readonly [number, number];
  peak?: number;
  /** Escala numerada cada 30: sólo en los medidores grandes. */
  labels?: boolean;
  /** Marcas de la escala; en los medidores miniatura sobran y tapan la aguja. */
  ticks?: boolean;
  /** Barrido con rebote al cargar; la lectura en vivo lo apaga porque la mueve requestAnimationFrame. */
  sweep?: boolean;
  delayMs?: number;
  className?: string;
  children?: ReactNode;
};

/**
 * Medidor de 240° con bisel, esfera hundida, zonas del rango objetivo, arco del valor y aguja.
 * Sin estado: lo usan tanto las fichas del servidor como la lectura en vivo del cliente.
 */
export function Dial({ value, label, signal = "knee", max = DIAL_MAX, target, peak, labels = false, ticks: showTicks = true, sweep = true, delayMs = 0, className = "", children }: DialProps) {
  const ticks = showTicks ? Array.from({ length: max / 10 + 1 }, (_, i) => i * 10) : [];
  const tone = SIGNAL_CLASS[signal];
  const motion = cssVars({ "--angle": `${r(dialAngle(value, max))}deg`, "--fill": r((Math.min(value, max) / max) * 100), "--delay": `${delayMs}ms` });
  const peakA = peak === undefined ? null : dialPoint(C, VALUE_R - 9, peak, max);
  const peakB = peak === undefined ? null : dialPoint(C, VALUE_R + 9, peak, max);
  return (
    <div className={`kin-bezel ${className}`} style={cssVars({ "--tint": `var(--kin-${signal})` })} role="img" aria-label={label}>
      <div className="kin-face relative aspect-square">
        <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
          <path d={dialArc(C, VALUE_R, 0, max, max)} className="fill-none stroke-sunken" strokeWidth="11" strokeLinecap="round" />
          <path
            d={dialArc(C, VALUE_R, 0, max, max)}
            pathLength={100}
            className={`kin-fill ${sweep ? "kin-fill-sweep" : ""} kin-signal-glow fill-none ${tone.stroke} ${tone.text}`}
            strokeWidth="11"
            strokeLinecap="round"
            style={motion}
          />
          {target && zoneSpans(max, target).map(({ zone, from, to }) => (
            <path key={zone} d={dialArc(C, ZONE_R, from, to, max)} className={`fill-none ${ZONE_CLASS[zone].stroke}`} strokeWidth="4" />
          ))}
          {ticks.map((tick) => {
            const major = tick % 30 === 0;
            const a = dialPoint(C, ZONE_R - 6, tick, max);
            const b = dialPoint(C, ZONE_R - (major ? 15 : 10), tick, max);
            const text = dialPoint(C, ZONE_R - 25, tick, max);
            return (
              <g key={tick}>
                <line x1={r(a.x)} y1={r(a.y)} x2={r(b.x)} y2={r(b.y)} className={major ? "stroke-ink-muted" : "stroke-line-strong"} strokeWidth={major ? 1.6 : 0.9} strokeLinecap="round" />
                {labels && major && <text x={r(text.x)} y={r(text.y)} className="kin-dial-label" textAnchor="middle" dominantBaseline="central">{tick}</text>}
              </g>
            );
          })}
          {peakA && peakB && <line x1={r(peakA.x)} y1={r(peakA.y)} x2={r(peakB.x)} y2={r(peakB.y)} className="stroke-ink" strokeWidth="2.6" strokeLinecap="round" />}
          <g className={`kin-needle ${sweep ? "kin-needle-sweep" : ""} ${tone.text}`} style={motion}>
            <path d="M100 112L97.6 100L100 26L102.4 100Z" className={`${tone.fill} kin-signal-glow`} />
          </g>
          <circle cx="100" cy="100" r="7.5" className="fill-raised stroke-line-strong" strokeWidth="1.2" />
          <circle cx="100" cy="100" r="2.6" className={tone.fill} />
        </svg>
        {children && <div className="absolute inset-x-0 bottom-[11%] grid justify-items-center gap-1 text-center">{children}</div>}
      </div>
    </div>
  );
}
