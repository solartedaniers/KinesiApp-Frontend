// Clases de los campos de formulario (antes Field.module.css), compartidas por TextField y sus variantes.
export const fieldStyles = {
  field: "grid gap-1.5",
  label: "text-sm font-medium text-ink",
  input:
    "w-full min-h-control rounded-control border border-line-strong bg-panel px-3 text-ink transition-colors duration-fast " +
    "placeholder:text-ink-muted hover:border-ink-muted focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/20 " +
    "aria-invalid:border-ink aria-invalid:border-2",
  withAction: "pr-14",
  action:
    "absolute inset-y-0 right-0 grid w-control place-items-center rounded-control text-ink-muted hover:text-ink",
  hint: "text-sm text-ink-muted",
  // Errores de validación: texto fuerte con ícono, sin rojo (el rojo es sólo del riesgo)
  error: "flex items-start gap-1.5 text-sm font-medium text-ink [&_svg]:mt-0.5 [&_svg]:flex-none",
  otp: "text-center font-display text-xl font-semibold tracking-[0.4em] tabular-nums",
} as const;
