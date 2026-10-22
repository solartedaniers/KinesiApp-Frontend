// Clases de los campos de formulario, compartidas por TextField y sus variantes. El relieve (.kin-field)
// va en la caja que envuelve al input: así el foco y el error se marcan en todo el campo con :has()
export const fieldStyles = {
  field: "grid gap-1.5",
  label: "text-sm font-semibold text-ink",
  box: "kin-field relative flex items-center",
  input:
    "min-h-11 w-full min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base text-ink outline-none placeholder:text-ink-muted focus-visible:outline-none",
  withAction: "pr-12",
  action:
    "absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-[0.75rem] text-ink-muted hover:text-ink",
  hint: "text-sm text-ink-muted",
  // Errores de validación: texto fuerte con ícono, sin rojo (el rojo es sólo del riesgo)
  error: "flex items-start gap-1.5 text-sm font-semibold text-ink [&_svg]:mt-0.5 [&_svg]:flex-none",
  otp: "text-center font-display text-2xl font-semibold tracking-[0.4em] [font-variant-numeric:tabular-nums]",
} as const;
