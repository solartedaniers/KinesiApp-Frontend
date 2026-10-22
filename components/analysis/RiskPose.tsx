import { RISK_FILL, RISK_TONE, type RiskLevel } from "@/lib/design/risk";
import { BONES, focusBones, type RiskFocus } from "@/lib/risk-focus";

type Props = {
  focus: RiskFocus & { keyframe: NonNullable<RiskFocus["keyframe"]> };
  level: RiskLevel;
  /** Tamaño real del video: con el mismo viewBox y "meet", el SVG cae justo sobre el cuadro de object-contain. */
  width: number;
  height: number;
  label: string;
};

const BASE = "fill-none stroke-current [vector-effect:non-scaling-stroke]";

/**
 * El esqueleto que midió la IA en el instante del pico, encima del video: la pierna o el tronco en riesgo
 * van en el color del nivel y la articulación lleva un anillo. Es decorativo para lectores de pantalla:
 * el mismo dato lo dice el texto de la línea de tiempo.
 */
export function RiskPose({ focus, level, width, height, label }: Props) {
  const { points } = focus.keyframe;
  const at = (name: keyof typeof points) => {
    const point = points[name];
    return point ? { x: point.x * width, y: point.y * height } : null;
  };
  const highlight = focusBones(focus);
  const tone = RISK_TONE[level];
  const radius = Math.max(width, height) * 0.018;
  const segment = ([from, to]: readonly [keyof typeof points, keyof typeof points], className: string) => {
    const a = at(from);
    const b = at(to);
    return a && b ? <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={className} /> : null;
  };

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 size-full text-on-stage" aria-hidden>
        <g className="opacity-70">{BONES.map((bone) => segment(bone, `${BASE} [stroke-width:2]`))}</g>
        <g className={tone.stroke}>{highlight.bones.map((bone) => segment(bone, `${BASE} ${tone.stroke} [stroke-width:5] [stroke-linecap:round]`))}</g>
        {highlight.joint.map((name) => {
          const point = at(name);
          return point ? (
            <g key={name}>
              <circle cx={point.x} cy={point.y} r={radius * 1.8} className={`fill-none ${tone.stroke} [stroke-width:2] [vector-effect:non-scaling-stroke] motion-safe:animate-pulse`} />
              <circle cx={point.x} cy={point.y} r={radius * 0.7} className={tone.fill} />
            </g>
          ) : null;
        })}
      </svg>
      <figcaption className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-stage/85 px-3 py-1.5 text-sm font-semibold text-on-stage [font-variant-numeric:tabular-nums]">
        <span className={`size-2.5 flex-none rounded-full ${RISK_FILL[level]}`} aria-hidden />
        {label}
      </figcaption>
    </>
  );
}
