import { LabIcon } from "./LabIcon";

import type { LabIconName } from "@/lib/design/icons";

type Option = { value: string; label: string; icon?: LabIconName };

const styles = {
  fieldset: "grid gap-2",
  legend: "mb-2 text-sm font-semibold text-ink",
  options: "grid auto-cols-fr grid-flow-col gap-2",
  option: "relative",
  input: "peer absolute inset-0 m-0 cursor-pointer opacity-0",
  face:
    "flex min-h-14 items-center justify-center gap-2 rounded-tag bg-panel px-3 text-base font-semibold text-ink-muted " +
    "shadow-[inset_0_0_0_1px_var(--kin-line-strong)] transition-[color,box-shadow,background-color] duration-[var(--kin-motion-hover)] " +
    "peer-hover:text-ink peer-checked:bg-accent-soft peer-checked:text-accent peer-checked:shadow-[inset_0_0_0_2px_var(--kin-accent)] " +
    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
};

/** Radios nativos como opciones grandes con ícono (p. ej. salto o sentadilla); sin JavaScript. */
export function OptionPicker({ name, legend, options, defaultValue }: { name: string; legend: string; options: Option[]; defaultValue: string }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input type="radio" name={name} value={option.value} defaultChecked={option.value === defaultValue} className={styles.input} />
            <span className={styles.face}>
              {option.icon && <LabIcon name={option.icon} size={24} />}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
