import { cssVars } from "@/lib/design/css";

// Esquinas del visor de captura: el mismo marco que ve el deportista al grabar
const CORNERS = ["M14 18V8h10", "M136 8h10v10", "M146 62v10h-10", "M24 72H14V62"];
// Keypoints en las esquinas de la cámara, como en los esqueletos
const JOINTS = [[34, 24], [82, 24], [34, 58], [82, 58]];

/**
 * Cámara dentro del visor con un escudo y un candado: el video se guarda privado. Mismo trazo que las
 * placas cronofotográficas (2.2, puntas redondas, keypoints como puntos). Decorativa: la tarjeta se nombra sola.
 */
export function VideoPrivacy({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 80" className={className} aria-hidden>
      {CORNERS.map((d) => <path key={d} d={d} className="fill-none stroke-line-strong" strokeWidth="1.6" strokeLinecap="round" />)}
      <g className="kin-rise" style={cssVars({ "--i": 0 })}>
        <rect x="34" y="24" width="48" height="34" rx="5" className="fill-none stroke-ink-muted" strokeWidth="2.2" />
        <path d="M82 35l16-8v28l-16-8" className="fill-none stroke-ink-muted" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="58" cy="41" r="8" className="fill-none stroke-ink-muted" strokeWidth="2.2" />
        {JOINTS.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.8" className="fill-knee" />)}
      </g>
      <g className="kin-draw" style={cssVars({ "--delay": "500ms" })}>
        <path d="M122 14l17 6v15c0 12-7.5 20-17 24-9.5-4-17-12-17-24V20z" className="kin-signal-glow fill-hip-soft stroke-hip text-hip" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M117 36v-4a5 5 0 0 1 10 0v4" className="fill-none stroke-hip" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="114" y="36" width="16" height="12" rx="2.5" className="fill-hip" />
        <circle cx="122" cy="42" r="1.6" className="fill-panel" />
      </g>
    </svg>
  );
}
