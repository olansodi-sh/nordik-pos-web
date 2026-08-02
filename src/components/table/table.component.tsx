import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyMessage = "Sin registros.",
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-outline">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-container">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline">
          {loading && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-secondary">
                Cargando…
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-secondary">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-surface-container">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-on-surface ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
