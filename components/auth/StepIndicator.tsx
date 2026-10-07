/** Barra de progreso de un flujo por pasos; `current` empieza en 1. */
export function StepIndicator({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="grid gap-2">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={label}
      >
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={`h-1 rounded-full transition-colors duration-fast ${index < current ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>
      <p className="text-sm font-medium text-accent">{label}</p>
    </div>
  );
}
