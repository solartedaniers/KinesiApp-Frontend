import { PoseFigure } from "./PoseFigure";

import { frameBounds, JUMP_PHASES, type Keypoints, solvePose, SQUAT_PHASES } from "@/lib/design/pose";

export type Movement = "jump" | "squat";

// Cada opción muestra la postura que la distingue: el despegue del salto y el fondo de la sentadilla
const POSES: Record<Movement, Keypoints> = {
  jump: solvePose(JUMP_PHASES[4].angles),
  squat: solvePose(SQUAT_PHASES[3].angles),
};
// Encuadro cada postura a su tamaño para que la figura llene la miniatura
const BOXES = { jump: frameBounds([POSES.jump], 8), squat: frameBounds([POSES.squat], 8) };

/** Radios nativos con forma de tarjeta: el teclado y los lectores los recorren como un grupo. */
export function MovementPicker({ legend, name, options, defaultValue }: { legend: string; name: string; options: { value: Movement; label: string; hint: string }[]; defaultValue?: Movement }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="group kin-card kin-pick kin-lift relative grid cursor-pointer grid-cols-[5.5rem_1fr] items-center gap-3 p-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
            <input type="radio" name={name} value={option.value} defaultChecked={option.value === defaultValue} className="visually-hidden" />
            <svg viewBox={`${BOXES[option.value].x} ${BOXES[option.value].y} ${BOXES[option.value].width} ${BOXES[option.value].height}`} className="kin-well h-24 w-full p-1.5" aria-hidden>
              <line x1={BOXES[option.value].x} x2={BOXES[option.value].x + BOXES[option.value].width} y1="0" y2="0" className="stroke-line-strong" strokeWidth="0.8" />
              <PoseFigure keypoints={POSES[option.value]} width={3.6} />
            </svg>
            <span className="grid gap-0.5">
              <span className="font-display text-lg font-semibold text-ink">{option.label}</span>
              <span className="text-sm text-ink-muted">{option.hint}</span>
            </span>
            <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--kin-line-strong)] group-has-checked:bg-accent group-has-checked:shadow-[0_0_0_4px_var(--kin-accent-soft)]" aria-hidden>
              <span className="size-2 rounded-full bg-on-accent opacity-0 group-has-checked:opacity-100" />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
