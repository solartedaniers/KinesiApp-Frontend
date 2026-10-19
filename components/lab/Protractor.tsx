import type { CSSProperties } from "react";

const R = 80;
const CX = 100;
const CY = 92;
const TICKS = Array.from({ length: 19 }, (_, i) => i * 10);

const styles = {
  figure: "grid gap-2",
  svg: "w-full max-w-[20rem] text-ink",
  scale: "fill-none stroke-line-strong [stroke-width:1]",
  tick: "stroke-line-strong [stroke-width:1]",
  tickMajor: "stroke-ink-muted [stroke-width:1.2]",
  tickLabel: "fill-ink-muted font-sans text-[8px] [font-variant-numeric:tabular-nums]",
  sweep: "lab-sweep fill-none stroke-accent [stroke-width:6]",
  needle: "lab-needle stroke-accent [stroke-width:1.6]",
  pivot: "fill-accent",
  caption: "flex items-baseline gap-3",
  value: "font-mono text-4xl font-medium text-ink [font-variant-numeric:tabular-nums]",
  label: "text-sm text-ink-muted",
};

/** Punto del arco a `deg` grados (0 a la izquierda, 180 a la derecha, por arriba). */
function onArc(deg: number, radius: number) {
  const angle = Math.PI - (deg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(angle), y: CY - radius * Math.sin(angle) };
}

/**
 * Transportador de goniómetro: el arco se barre y la aguja gira hasta el ángulo medido. El número
 * es texto real, no del SVG, para que lo lean los lectores de pantalla y se pueda copiar.
 */
export function Protractor({ degrees, label, valueText }: { degrees: number; label: string; valueText: string }) {
  const clamped = Math.min(180, Math.max(0, degrees));
  const start = onArc(0, R);
  const end = onArc(180, R);
  return (
    <div className={styles.figure} style={{ "--lab-angle": clamped } as CSSProperties}>
      <svg viewBox="0 0 200 104" className={styles.svg} aria-hidden>
        <path className={styles.scale} d={`M${start.x} ${start.y}A${R} ${R} 0 0 1 ${end.x} ${end.y}`} />
        {TICKS.map((deg) => {
          const major = deg % 30 === 0;
          const outer = onArc(deg, R);
          const inner = onArc(deg, R - (major ? 9 : 5));
          const text = onArc(deg, R + 9);
          return (
            <g key={deg}>
              <line className={major ? styles.tickMajor : styles.tick} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} />
              {major && <text className={styles.tickLabel} x={text.x} y={text.y + 3} textAnchor="middle">{deg}</text>}
            </g>
          );
        })}
        <path className={styles.sweep} pathLength={180} d={`M${onArc(0, R - 16).x} ${CY}A${R - 16} ${R - 16} 0 0 1 ${onArc(180, R - 16).x} ${CY}`} />
        <line className={styles.needle} x1={CX} y1={CY} x2={CX - (R - 4)} y2={CY} />
        <circle className={styles.pivot} cx={CX} cy={CY} r={3} />
      </svg>
      <p className={styles.caption}>
        <span className={styles.value}>{valueText}</span>
        <span className={styles.label}>{label}</span>
      </p>
    </div>
  );
}
