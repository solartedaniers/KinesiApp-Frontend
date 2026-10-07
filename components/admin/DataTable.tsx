import type { ReactNode } from "react";

export type Column<K extends string> = { key: K; label: string };
export type Row<K extends string> = { key: string | number; cells: Record<K, ReactNode> };

// Desde tablet, <table> con filas divididas por línea; en celular cada fila se apila como bloque y
// cada celda muestra su etiqueta (data-label)
const CELL = "px-4 py-3 text-left align-middle max-md:flex max-md:items-center max-md:justify-between max-md:gap-3 max-md:px-0";

/**
 * <table> semántica en escritorio; en celular cada fila se apila como tarjeta y cada celda lleva su
 * etiqueta (data-label vía CSS). Sin JavaScript.
 */
export function DataTable<K extends string>({ caption, columns, rows }: { caption: string; columns: Column<K>[]; rows: Row<K>[] }) {
  return (
    <table className="w-full border-separate border-spacing-0 text-sm max-md:block md:overflow-hidden md:rounded-panel md:border md:border-line md:bg-panel">
      <caption className="visually-hidden">{caption}</caption>
      <thead className="max-md:sr-only">
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" className="bg-sunken px-4 py-2.5 text-left font-medium text-ink-muted">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="max-md:grid max-md:gap-3 md:[&>tr+tr>*]:border-t md:[&>tr+tr>*]:border-line">
        {rows.map((row) => (
          <tr key={row.key} className="max-md:block max-md:rounded-panel max-md:border max-md:border-line max-md:bg-panel max-md:px-4 max-md:py-3">
            {columns.map((column, index) =>
              index === 0 ? (
                <th key={column.key} scope="row" data-label={column.label} className={`${CELL} font-semibold max-md:pb-2 max-md:pt-1 max-md:text-base`}>
                  {row.cells[column.key]}
                </th>
              ) : (
                <td
                  key={column.key}
                  data-label={column.label}
                  className={`${CELL} max-md:py-1 max-md:text-right max-md:before:text-left max-md:before:text-ink-muted max-md:before:content-[attr(data-label)]`}
                >
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
