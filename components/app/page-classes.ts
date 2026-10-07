// Clases compartidas por las pantallas de la app (antes Page.module.css y AuthForm.module.css):
// mismas claves, para que cada pantalla sólo importe el bloque que necesita.

export const pageStyles = {
  page: "grid gap-8",
  header: "grid gap-1.5",
  title: "font-display text-2xl font-semibold text-ink sm:text-3xl",
  subtitle: "max-w-[60ch] text-ink-muted",
  // Panel: borde fino sobre el lienzo, sin sombra (las sombras quedan para lo que flota)
  card: "grid gap-4 rounded-panel border border-line bg-panel p-5 sm:p-6",
  narrow: "max-w-xl",
  empty: "justify-items-center px-5 py-12 text-center text-ink-muted",
  emptyIcon: "grid size-14 place-items-center rounded-full bg-accent-soft text-accent",
  emptyTitle: "text-lg font-semibold text-ink",
  sectionTitle: "font-display text-lg font-semibold text-ink",
  details: "grid gap-3",
  detail: "grid gap-0.5 [&_dd]:font-medium [&_dd]:[overflow-wrap:anywhere] [&_dt]:text-sm [&_dt]:text-ink-muted",
  rowLink: "-mx-3 flex items-center gap-3 rounded-control px-3 py-3 text-ink hover:bg-sunken hover:no-underline",
  rowText: "grid flex-1",
  rowHint: "text-sm font-normal text-ink-muted",
  rowIcon: "text-accent",
  errorPage: "mx-auto max-w-content px-4 pb-12 pt-16",
  backLink: "inline-flex w-fit items-center gap-1 text-sm [&_svg]:rotate-180",
  // Encabezado con una acción principal a la derecha; en celular la acción baja
  headerRow: "flex flex-wrap items-end justify-between gap-4",
  actions: "flex flex-wrap gap-3",
} as const;

export const formStyles = {
  form: "grid gap-4",
  row: "-mt-2 flex justify-end text-sm",
  submit: "mt-2",
  hint: "text-sm text-ink-muted",
} as const;
