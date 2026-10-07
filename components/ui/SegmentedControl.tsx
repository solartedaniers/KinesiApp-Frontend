type Option = { value: string; label: string };

/** Radios nativos con estilo de control segmentado: accesible y sin JavaScript. */
export function SegmentedControl({
  name,
  legend,
  options,
  defaultValue,
  error,
}: {
  name: string;
  legend: string;
  options: Option[];
  defaultValue: string;
  error?: string;
}) {
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-medium text-ink">{legend}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-control border border-line bg-sunken p-1">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              className="peer pointer-events-none absolute opacity-0"
            />
            <span className="grid min-h-9 cursor-pointer place-items-center rounded-[0.25rem] px-2 text-sm font-medium text-ink-muted transition-colors duration-fast hover:text-ink peer-checked:bg-panel peer-checked:text-accent peer-checked:ring-1 peer-checked:ring-line peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm font-medium text-ink">{error}</p>}
    </fieldset>
  );
}
