import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export interface PaginationProps {
  pageNumber: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  label?: string
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

function PageBtn({
  children,
  onClick,
  disabled = false,
  active,
  ...props
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg border text-[13px] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'bg-brand-400 border-brand-400 text-white font-medium'
          : 'bg-white border-cream-border text-[#5F5E5A] hover:bg-[#F9F8F5]'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function Pagination({
  pageNumber,
  totalPages,
  totalCount,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
  label = 'results',
}: PaginationProps) {
  const from = (pageNumber - 1) * pageSize + 1
  const to = Math.min(pageNumber * pageSize, totalCount)
  const pages = getPageNumbers(pageNumber, totalPages)

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-cream-border gap-3 flex-wrap">
      <p className="text-[12px] text-[#888780]">
        Showing{' '}
        <span className="font-medium text-[#2C2C2A]">{from}–{to}</span>
        {' '}of{' '}
        <span className="font-medium text-[#2C2C2A]">{totalCount}</span>{' '}
        {label}
      </p>

      <div className="flex items-center gap-2 ml-auto">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#888780]">Rows</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-cream-border bg-white text-[12px] text-[#5F5E5A] outline-none"
            >
              {PAGE_SIZE_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-1">
        <PageBtn
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage}
          aria-label="First page"
        >
          <ChevronsLeft size={13} />
        </PageBtn>
        <PageBtn
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={!hasPreviousPage}
          aria-label="Previous page"
        >
          <ChevronLeft size={13} />
        </PageBtn>

        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className="text-[13px] text-gray-200 px-1">
              …
            </span>
          ) : (
            <PageBtn
              key={page}
              onClick={() => onPageChange(page as number)}
              active={page === pageNumber}
              aria-label={`Page ${page}`}
              aria-current={page === pageNumber ? 'page' : undefined}
            >
              {page}
            </PageBtn>
          )
        )}

        <PageBtn
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
        >
          <ChevronRight size={13} />
        </PageBtn>
        <PageBtn
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          aria-label="Last page"
        >
          <ChevronsRight size={13} />
        </PageBtn>
        </div>
      </div>
    </div>
  )
}
