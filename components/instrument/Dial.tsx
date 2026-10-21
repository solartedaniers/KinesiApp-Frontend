import { type ReactNode, useId } from "react";

import { dialAngle, dialArc, dialPoint } from "@/lib/charts/dial";
import { cssVars } from "@/lib/design/css";
import { type KneeTarget, type Signal, SIGNAL_CLASS, ZONE_CLASS, zoneSpans } from "@/lib/design/signals";

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
  /** Rango sin riesgo del análisis; sin él la esfera no pinta zonas. */
  target?: KneeTarget | null;
  /** Bandas propias de la escala (p. ej. los niveles de riesgo) en lugar de las zonas de la rodilla. */
  bands?: { key: string; from: number; to: number; stroke: string }[];
  /** Color de la aguja y del arco cuando no es una señal articular (p. ej. el nivel de riesgo). */
  tone?: { stroke: string; fill: string; text: string; tint: string };
  /** Cada cuánto va un número en la escala. */
  labelStep?: number;
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
export function Dial({ value, label, signal = "knee", max = DIAL_MAX, target, bands, tone: toneOverride, labelStep = 30, peak, labels = false, ticks: showTicks = true, sweep = true, delayMs = 0, className = "", children }: DialProps) {
  const ticks = showTicks ? Array.from({ length: max / 10 + 1 }, (_, i) => i * 10) : [];
  const tone = toneOverride ?? SIGNAL_CLASS[signal];
  const arcs = bands ?? (target ? zoneSpans(max, target).map(({ zone, from, to }) => ({ key: zone, from, to, stroke: ZONE_CLASS[zone].stroke })) : []);
  const motion = cssVars({ "--angle": `${r(dialAngle(value, max))}deg`, "--fill": r((Math.min(value, max) / max) * 100), "--delay": `${delayMs}ms` });
  const peakA = peak === undefined ? null : dialPoint(C, VALUE_R - 9, peak, max);
  const peakB = peak === undefined ? null : dialPoint(C, VALUE_R + 9, peak, max);
  const screw = useId();
  return (
    <div className={`kin-bezel ${className}`} style={cssVars({ "--tint": toneOverride?.tint ?? `var(--kin-${signal})` })} role="img" aria-label={label}>
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
          {arcs.map(({ key, from, to, stroke }) => (
            <path key={key} d={dialArc(C, ZONE_R, from, to, max)} className={`fill-none ${stroke}`} strokeWidth="4" />
          ))}
          {ticks.map((tick) => {
            const major = tick % labelStep === 0;
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
          <defs>
            <radialGradient id={screw} cx="38%" cy="32%" r="75%">
              <stop offset="0" style={{ stopColor: "var(--kin-highlight)" }} />
              <stop offset="0.35" style={{ stopColor: "var(--kin-raised)" }} />
              <stop offset="1" style={{ stopColor: "var(--kin-sunken)" }} />
            </radialGradient>
          </defs>
          {/* La sombra va en un grupo sin girar para que siempre caiga hacia abajo, como con luz cenital */}
          <g className="kin-needle-body">
            <g className={`kin-needle ${sweep ? "kin-needle-sweep" : ""} ${tone.text}`} style={motion}>
              <path d="M100 112L97.6 100L100 26L102.4 100Z" className={`${tone.fill} kin-signal-glow`} />
            </g>
            <circle cx="100" cy="100" r="8" fill={`url(#${screw})`} className="stroke-line-strong" strokeWidth="1" />
          </g>
          <circle cx="100" cy="100" r="3" className={tone.fill} />
          <path d="M97.9 100H102.1" className="stroke-sunken" strokeWidth="1" strokeLinecap="round" />
        </svg>
        {children && <div className="absolute inset-x-0 bottom-[11%] grid justify-items-center gap-1 text-center">{children}</div>}
      </div>
    </div>
  );
}
