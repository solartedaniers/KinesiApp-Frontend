import type { ReactNode } from "react";

import styles from "./DataTable.module.css";

export type Column<K extends string> = { key: K; label: string };
export type Row<K extends string> = { key: string | number; cells: Record<K, ReactNode> };

/**
 * <table> semántica en escritorio; en celular cada fila se apila como tarjeta y cada celda lleva su
 * etiqueta (data-label vía CSS). Sin JavaScript.
 */
export function DataTable<K extends string>({ caption, columns, rows }: { caption: string; columns: Column<K>[]; rows: Row<K>[] }) {
  return (
    <table className={styles.table}>
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            {columns.map((column, index) =>
              index === 0 ? (
                <th key={column.key} scope="row" data-label={column.label}>
                  {row.cells[column.key]}
                </th>
              ) : (
                <td key={column.key} data-label={column.label}>
                  {row.cells[column.key]}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
