import styles from "./SegmentedControl.module.css";

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
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input type="radio" name={name} value={option.value} defaultChecked={option.value === defaultValue} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </fieldset>
  );
}
