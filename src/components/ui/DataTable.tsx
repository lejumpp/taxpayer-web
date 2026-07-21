export interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  cellClassName?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  isLoading?: boolean
  skeletonRows?: number
  emptyState?: React.ReactNode
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  skeletonRows = 5,
  emptyState,
}: DataTableProps<T>) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-cream-border bg-[#F1EFE8]">
          {columns.map(col => (
            <th
              key={col.key}
              className={`px-5 py-2.5 text-left text-xs font-bold text-[#2C2C2A] uppercase tracking-[0.05em] ${col.className ?? ''} ${col.headerClassName ?? ''}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          Array.from({ length: skeletonRows }).map((_, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              {columns.map(col => (
                <td key={col.key} className="px-5 py-3">
                  <div className="h-4 bg-gray-50 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-5 py-12 text-center">
              {emptyState}
            </td>
          </tr>
        ) : (
          data.map(row => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-gray-50 last:border-0 transition-colors group ${
                onRowClick ? 'cursor-pointer hover:bg-[#F9F8F5]' : ''
              }`}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={`px-5 py-3 ${col.className ?? ''} ${col.cellClassName ?? ''}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
