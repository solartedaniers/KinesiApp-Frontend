import styles from "./StatGrid.module.css";

export type StatTile = { label: string; value: string };

/** Cifras sueltas: un número con su etiqueta comunica mejor que un gráfico (§1 de la guía dataviz). */
export function StatGrid({ tiles }: { tiles: StatTile[] }) {
  return (
    <dl className={styles.grid}>
      {tiles.map((tile) => (
        <div key={tile.label} className={styles.tile}>
          <dt className={styles.label}>{tile.label}</dt>
          <dd className={styles.value}>{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
}
