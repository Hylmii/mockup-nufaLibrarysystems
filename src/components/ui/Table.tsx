interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  onRowClick,
  emptyMessage = 'Tidak ada data',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-xs font-semibold text-ink-muted uppercase tracking-wide py-3 px-3 ${col.className || ''}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-sm text-ink-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-line/60 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-canvas/50' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-3 text-sm text-ink ${col.className || ''}`}>
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-ink-muted">
        Menampilkan {start}–{end} dari {totalItems.toLocaleString('id-ID')} data
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-md border border-line text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Sebelumnya
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[32px] px-2 py-1.5 text-sm rounded-md border transition-colors ${
              p === page
                ? 'bg-action text-white border-action'
                : 'border-line text-ink hover:bg-canvas'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-md border border-line text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
