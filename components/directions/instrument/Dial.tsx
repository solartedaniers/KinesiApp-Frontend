import { dialArc, dialPoint } from "@/lib/charts/dial";

// Escala de la flexión de rodilla en la esfera; pasa del máximo que la IA registra en una sentadilla
export const DIAL_MAX = 150;

const CENTER = { x: 100, y: 104 };
const RADIUS = 84;
const TICKS = Array.from({ length: DIAL_MAX / 10 + 1 }, (_, i) => i * 10);
const r = (n: number) => Math.round(n * 100) / 100;

/**
 * Esfera del medidor en capas: anillo de fondo, rango objetivo, valor y aguja. Sin estado, para que la
 * use tanto la ficha (estática) como la lectura en vivo (cliente).
 */
export function Dial({ value, target, peak, labels = false, className }: { value: number; target: [number, number]; peak?: number; labels?: boolean; className?: string }) {
  const tip = dialPoint(CENTER, RADIUS - 16, value, DIAL_MAX);
  const peakIn = peak === undefined ? null : dialPoint(CENTER, RADIUS + 7, peak, DIAL_MAX);
  const peakOut = peak === undefined ? null : dialPoint(CENTER, RADIUS + 14, peak, DIAL_MAX);
  return (
    <svg viewBox="0 0 200 118" className={className} aria-hidden>
      <path d={dialArc(CENTER, RADIUS, 0, DIAL_MAX, DIAL_MAX)} className="fill-none stroke-sunken" strokeWidth="18" strokeLinecap="round" />
      <path d={dialArc(CENTER, RADIUS, target[0], target[1], DIAL_MAX)} className="fill-none stroke-accent [stroke-opacity:0.22]" strokeWidth="18" />
      <path d={dialArc(CENTER, RADIUS, 0, Math.max(value, 0.01), DIAL_MAX)} className="instrument-glow fill-none stroke-accent" strokeWidth="4" strokeLinecap="round" />
      {TICKS.map((tick) => {
        const major = tick % 30 === 0;
        const a = dialPoint(CENTER, RADIUS - 13, tick, DIAL_MAX);
        const b = dialPoint(CENTER, RADIUS - (major ? 21 : 17), tick, DIAL_MAX);
        const text = dialPoint(CENTER, RADIUS - 31, tick, DIAL_MAX);
        return (
          <g key={tick}>
            <line x1={r(a.x)} y1={r(a.y)} x2={r(b.x)} y2={r(b.y)} className={major ? "stroke-ink-muted" : "stroke-line-strong"} strokeWidth={major ? 1.4 : 0.8} />
            {labels && major && <text x={r(text.x)} y={r(text.y)} className="instrument-tick" textAnchor="middle" dominantBaseline="middle">{tick}</text>}
          </g>
        );
      })}
      {peakIn && peakOut && <line x1={r(peakIn.x)} y1={r(peakIn.y)} x2={r(peakOut.x)} y2={r(peakOut.y)} className="stroke-ink" strokeWidth="2.5" strokeLinecap="round" />}
      <line x1={CENTER.x} y1={CENTER.y} x2={r(tip.x)} y2={r(tip.y)} className="stroke-ink" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={CENTER.x} cy={CENTER.y} r="6" className="fill-panel stroke-ink" strokeWidth="2.5" />
    </svg>
  );
}
