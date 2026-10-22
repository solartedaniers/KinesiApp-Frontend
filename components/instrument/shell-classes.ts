// Clases del marco con relieve: las comparten las pantallas de ejemplo de la guía y la app real
export const shellStyles = {
  top: "sticky top-0 z-20 border-b border-line bg-panel shadow-[0_10px_30px_-24px_var(--kin-shade)]",
  bar: "mx-auto flex h-16 max-w-content items-center gap-4 px-4 sm:px-6",
  tab:
    "relative inline-flex min-h-11 items-center gap-2 rounded-panel px-3 text-sm font-semibold text-ink-muted transition-colors " +
    "hover:bg-accent-soft hover:text-accent aria-[current=page]:text-accent aria-[current=page]:bg-accent-soft",
  bottom: "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-panel pb-[env(safe-area-inset-bottom)]",
  bottomTab:
    "relative grid min-h-14 flex-1 place-items-center content-center gap-0.5 text-xs font-semibold text-ink-muted " +
    "aria-[current=page]:text-accent aria-[current=page]:after:absolute aria-[current=page]:after:top-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:w-10 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-accent aria-[current=page]:after:shadow-[0_0_10px_var(--kin-accent)]",
  main: "mx-auto grid max-w-content gap-6 px-4 py-6 sm:px-6 sm:py-8",
} as const;
