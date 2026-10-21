import { dialArc, dialPoint } from "@/lib/charts/dial";
import { initials } from "@/lib/format";
import { type Signal, SIGNAL_CLASS, SIGNALS } from "@/lib/design/signals";
import type { Team } from "@/lib/types";

const SIZE = {
  sm: "size-10 text-sm",
  md: "size-14 text-lg",
  lg: "size-32 text-4xl sm:size-36",
} as const;

const C = { x: 50, y: 50 };
const ARC_MAX = 6;
const r = (n: number) => Math.round(n * 100) / 100;

/** Color del equipo entre los de las señales de la guía: sale del id, así no cambia entre visitas. */
export function teamSignal(teamId: string): Signal {
  const hash = [...teamId].reduce((sum, ch) => sum * 31 + ch.charCodeAt(0), 7);
  return SIGNALS[Math.abs(hash) % SIGNALS.length];
}

/**
 * Logo del equipo o, sin logo, su emblema: las iniciales dentro del arco de transportador de los medidores,
 * en uno de los colores de la guía. Decorativo: el nombre del equipo siempre va en texto al lado.
 */
export function TeamEmblem({ team, size = "md" }: { team: Pick<Team, "id" | "name" | "logo_url">; size?: keyof typeof SIZE }) {
  const tone = SIGNAL_CLASS[teamSignal(team.id)];
  const box = `relative grid flex-none place-items-center rounded-full ${SIZE[size]}`;
  if (team.logo_url) {
    // <img> y no next/image por lo mismo que el avatar: imagen chica ya comprimida y URL firmada de vida corta
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={team.logo_url} alt="" className={`${box} object-cover ring-2 ring-offset-2 ring-offset-panel ${tone.text} ring-current`} />;
  }
  return (
    <span className={`${box} ${tone.soft}`} aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <path d={dialArc(C, 43, 0, ARC_MAX, ARC_MAX)} className={`fill-none ${tone.stroke}`} strokeWidth="5" strokeLinecap="round" />
        {Array.from({ length: ARC_MAX + 1 }, (_, tick) => {
          const a = dialPoint(C, 34, tick, ARC_MAX);
          const b = dialPoint(C, 29, tick, ARC_MAX);
          return <line key={tick} x1={r(a.x)} y1={r(a.y)} x2={r(b.x)} y2={r(b.y)} className={tone.stroke} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />;
        })}
      </svg>
      <span className={`relative font-display font-bold tracking-tight ${tone.text}`}>{initials(team.name)}</span>
    </span>
  );
}
