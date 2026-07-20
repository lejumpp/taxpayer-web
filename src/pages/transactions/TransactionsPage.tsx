import { useState, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Plus,
  Download,
  Briefcase,
  Receipt,
  FileUp,
  FileX,
  FilterX,
  Pencil,
  Trash2,
  TrendingUp,
  Hash,
  Calculator,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react'

import PageHeader from '@/components/layout/PageHeader'
import TransactionModal from '@/components/transactions/TransactionModal'
import TransactionCard from '@/components/transactions/TransactionCard'
import DataTable from '@/components/ui/DataTable'
import Pagination from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/search-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions'
import { useTransactionCategories } from '@/hooks/useTransactionCategories'
import { getTaxSummaryByYear } from '@/services/tax'
import { formatJMD } from '@/lib/currency'
import { formatDate, formatDateShort, toLocalDateString } from '@/lib/dates'
import type { Column } from '@/components/ui/DataTable'
import type { TransactionFilters, Transaction } from '@/types/transaction'

// ─── Page-specific components ────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor = '#2C2C2A',
}: {
  label: string
  value: string | number | null
  icon: React.ElementType
  iconBg: string
  iconColor: string
  valueColor?: string
}) {
  return (
    <div className="bg-white rounded-[14px] border border-cream-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={15} className={iconColor} aria-hidden="true" />
        </div>
        <span className="text-[12px] text-[#888780]">{label}</span>
      </div>
      <p className="text-[22px] font-semibold tabular break-words" style={{ color: valueColor }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

function DescriptionCell({ txn }: { txn: Transaction }) {
  const isIncome = txn.type === 'Income'
  const isCsvImport = txn.source === 'CsvImport'
  const iconBg = isCsvImport ? 'bg-info-50' : isIncome ? 'bg-success-50' : 'bg-brand-50'
  const IconComponent = isCsvImport ? FileUp : isIncome ? Briefcase : Receipt
  const iconColor = isCsvImport ? 'text-info-600' : isIncome ? 'text-success-600' : 'text-brand-600'

  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}>
        <IconComponent size={17} className={iconColor} aria-hidden="true" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-[#2C2C2A]">{txn.description}</p>
        <p className="text-[11px] text-[#888780] flex items-center gap-1">
          {isCsvImport ? (
            <><FileUp size={10} aria-hidden="true" />CSV import</>
          ) : (
            'Manual entry'
          )}
        </p>
      </div>
    </div>
  )
}

function DateFilterButton({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value?: string
  onChange: (value: string | undefined) => void
  placeholder: string
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value + 'T00:00:00') : undefined
  const currentYear = new Date().getFullYear()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="text-[13px] text-gray-900 bg-transparent border-none outline-none cursor-pointer whitespace-nowrap"
        >
          {selected ? formatDateShort(selected) : <span className="text-gray-200">{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={new Date(currentYear - 10, 0)}
          endMonth={new Date(currentYear, 11)}
          selected={selected}
          onSelect={date => {
            onChange(date ? toLocalDateString(date) : undefined)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

function EmptyState({
  hasFilters,
  onAdd,
  onClear,
}: {
  hasFilters: boolean
  onAdd: () => void
  onClear: () => void
}) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-12 h-12 rounded-[14px] bg-gray-50 flex items-center justify-center mb-4">
          <FilterX size={22} className="text-[#888780]" aria-hidden="true" />
        </div>
        <p className="text-[15px] font-medium text-[#2C2C2A] mb-1">No transactions match your filters</p>
        <p className="text-[13px] text-[#888780] mb-5">Try adjusting your search or filters.</p>
        <button onClick={onClear} className="text-[13px] text-brand-400 font-medium hover:underline">
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="w-12 h-12 rounded-[14px] bg-gray-50 flex items-center justify-center mb-4">
        <FileX size={22} className="text-[#888780]" aria-hidden="true" />
      </div>
      <p className="text-[15px] font-medium text-[#2C2C2A] mb-1">No transactions yet</p>
      <p className="text-[13px] text-[#888780] mb-5">Add your first income or expense to get started.</p>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-400 text-white text-[13px] font-medium"
      >
        <Plus size={14} aria-hidden="true" />
        Add transaction
      </button>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()

  const [filters, setFilters] = useState<TransactionFilters>({ pageNumber: 1, pageSize: 10 })
  const [searchInput, setSearchInput] = useState('')
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const dateRangeInvalid = !!(
    filters.fromDate &&
    filters.toDate &&
    filters.fromDate > filters.toDate
  )

  const { data, isLoading, isFetching } = useTransactions(
    dateRangeInvalid ? { ...filters, fromDate: undefined, toDate: undefined } : filters
  )
  const { data: categories } = useTransactionCategories()
  const { data: taxSummary } = useQuery({
    queryKey: ['tax-summary', currentYear],
    queryFn: () => getTaxSummaryByYear(currentYear),
  })
  const deleteMutation = useDeleteTransaction()

  function commitSearch() {
    startTransition(() => {
      setFilters(prev => ({ ...prev, search: searchInput || undefined, pageNumber: 1 }))
    })
  }

  function updateFilter<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) {
    setFilters(prev => ({ ...prev, [key]: value, pageNumber: 1 }))
  }

  function clearFilters() {
    setSearchInput('')
    setFilters({ pageNumber: 1, pageSize: 10 })
  }

  const hasActiveFilters = !!(
    filters.type ||
    filters.category ||
    filters.search ||
    filters.fromDate ||
    filters.toDate
  )

  function handleDelete() {
    if (!deleteTargetId) return
    deleteMutation.mutate(deleteTargetId, {
      onSuccess: () => setDeleteTargetId(null),
    })
  }

  const summary = data?.summary
  const pageSize = filters.pageSize ?? 10

  const columns: Column<Transaction>[] = [
    {
      key: 'description',
      header: 'Description',
      render: txn => <DescriptionCell txn={txn} />,
    },
    {
      key: 'date',
      header: 'Date',
      render: txn => (
        <span className="text-[13px] text-[#5F5E5A] whitespace-nowrap">
          {formatDate(txn.transactionDate)}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: txn => (
        <span className="text-[12px] text-[#5F5E5A] bg-gray-50 px-2.5 py-1 rounded-full whitespace-nowrap">
          {txn.categoryDisplayName}
        </span>
      ),
    },
    {
      key: 'deductible',
      header: 'Deductible',
      render: txn =>
        txn.isTaxDeductible ? (
          <span className="text-[12px] text-success-600 bg-success-50 px-2.5 py-1 rounded-full font-medium">
            Deductible
          </span>
        ) : (
          <span className="text-[12px] text-[#888780]">—</span>
        ),
    },
    {
      key: 'amount',
      header: 'Amount',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: txn => (
        <span className={`text-[13px] font-semibold tabular ${
          txn.type === 'Income' ? 'text-success-600' : 'text-[#2C2C2A]'
        }`}>
          {txn.type === 'Income' ? '+' : '−'}{formatJMD(txn.amountCents)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-20 px-2',
      cellClassName: 'w-20 px-2',
      render: txn => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => {
              e.stopPropagation()
              setEditTarget(txn)
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F1EFE8] text-[#888780] hover:text-[#5F5E5A]"
            aria-label="Edit transaction"
          >
            <Pencil size={13} aria-hidden="true" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              setDeleteTargetId(txn.id)
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-brand-50 text-[#888780] hover:text-brand-400"
            aria-label="Delete transaction"
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ]

  // ─── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <PageHeader
        title="Transactions"
        subtitle="View and manage all your income and expenses"
        action={
          <button
            disabled
            title="Coming soon"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cream-border bg-white text-[13px] text-[#5F5E5A] opacity-50 cursor-not-allowed"
          >
            <Download size={14} aria-hidden="true" />
            Export CSV
          </button>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total transactions"
          value={summary ? summary.incomeCount + summary.expenseCount : null}
          icon={Hash}
          iconBg="bg-[#F1EFE8]"
          iconColor="text-[#5F5E5A]"
        />
        <StatCard
          label="Gross income"
          value={summary ? formatJMD(summary.totalIncomeCents) : null}
          icon={TrendingUp}
          iconBg="bg-success-50"
          iconColor="text-success-600"
          valueColor="#0F6E56"
        />
        <StatCard
          label="Expenses"
          value={summary ? formatJMD(summary.totalExpensesCents) : null}
          icon={Receipt}
          iconBg="bg-[#F1EFE8]"
          iconColor="text-[#5F5E5A]"
        />
        <StatCard
          label="Estimated to owe"
          value={taxSummary ? formatJMD(taxSummary.breakdown.totalStatutoryLiabilityCents) : null}
          icon={Calculator}
          iconBg="bg-brand-50"
          iconColor="text-brand-400"
          valueColor="#C04828"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[14px] border border-cream-border">
        {/* Toolbar */}
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-cream-border flex-wrap">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={commitSearch}
            placeholder="Search transactions..."
            isLoading={isFetching}
            className="w-full sm:w-75 sm:shrink-0"
          />

          <Select
            value={filters.type ?? 'all'}
            onValueChange={value =>
              updateFilter('type', value === 'all' ? undefined : (value as 'Income' | 'Expense'))
            }
          >
            <SelectTrigger className="flex-1 min-w-32 rounded-lg border-cream-border bg-white text-[13px] text-[#5F5E5A]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category ?? 'all'}
            onValueChange={value => updateFilter('category', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="flex-1 min-w-32 rounded-lg border-cream-border bg-white text-[13px] text-[#5F5E5A]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-1 min-w-56 items-center gap-1.5 bg-white border border-cream-border rounded-lg px-3 py-1.5">
            <CalendarIcon size={13} className="text-gray-200 shrink-0" aria-hidden="true" />
            <DateFilterButton
              value={filters.fromDate}
              onChange={value => updateFilter('fromDate', value)}
              placeholder="Start date"
              ariaLabel="Start date"
            />
            <span className="text-[13px] text-gray-200">→</span>
            <DateFilterButton
              value={filters.toDate}
              onChange={value => updateFilter('toDate', value)}
              placeholder="End date"
              ariaLabel="End date"
            />
            {(filters.fromDate || filters.toDate) && (
              <button
                type="button"
                onClick={() => {
                  updateFilter('fromDate', undefined)
                  updateFilter('toDate', undefined)
                }}
                className="text-gray-200 hover:text-[#5F5E5A] bg-transparent border-none ml-1"
                aria-label="Clear date range"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          {dateRangeInvalid && (
            <p className="w-full text-[11px] text-brand-400">
              Start date must be before end date.
            </p>
          )}

          <div className="flex flex-1 items-center justify-end gap-4 min-w-fit">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[12px] text-brand-400 bg-transparent border-none whitespace-nowrap"
              >
                Clear all
              </button>
            )}

            <button
              onClick={() => setAddSheetOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-400 text-white text-[13px] font-medium whitespace-nowrap"
            >
              <Plus size={14} aria-hidden="true" />
              Add transaction
            </button>
          </div>
        </div>

        {/* Table — desktop */}
        <div className="hidden md:block">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            keyExtractor={txn => txn.id}
            isLoading={isLoading}
            skeletonRows={pageSize}
            emptyState={
              <EmptyState
                hasFilters={hasActiveFilters}
                onAdd={() => setAddSheetOpen(true)}
                onClear={clearFilters}
              />
            }
          />
          {data && data.totalCount > 0 && (
            <Pagination
              pageNumber={data.pageNumber}
              totalPages={data.totalPages}
              totalCount={data.totalCount}
              pageSize={data.pageSize}
              hasNextPage={data.hasNextPage}
              hasPreviousPage={data.hasPreviousPage}
              onPageChange={page => updateFilter('pageNumber', page)}
              onPageSizeChange={size => updateFilter('pageSize', size)}
              label="transactions"
            />
          )}
        </div>

        {/* Card list — mobile */}
        <div className="block md:hidden">
          {isLoading ? (
            <div className="animate-pulse divide-y divide-cream-border">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-[10px] bg-gray-50 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 bg-gray-50 rounded" />
                    <div className="h-2.5 w-24 bg-gray-50 rounded" />
                  </div>
                  <div className="space-y-2 flex flex-col items-end">
                    <div className="h-3 w-20 bg-gray-50 rounded" />
                    <div className="h-2.5 w-16 bg-gray-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onAdd={() => setAddSheetOpen(true)}
              onClear={clearFilters}
            />
          ) : (
            <>
              <div className="divide-y divide-cream-border">
                {data?.items.map(txn => (
                  <TransactionCard
                    key={txn.id}
                    transaction={txn}
                    onClick={() => navigate(`/transactions/${txn.id}`)}
                  />
                ))}
              </div>
              {data && data.totalCount > 0 && (
                <Pagination
                  pageNumber={data.pageNumber}
                  totalPages={data.totalPages}
                  totalCount={data.totalCount}
                  pageSize={data.pageSize}
                  hasNextPage={data.hasNextPage}
                  hasPreviousPage={data.hasPreviousPage}
                  onPageChange={page => updateFilter('pageNumber', page)}
              onPageSizeChange={size => updateFilter('pageSize', size)}
                  label="transactions"
                />
              )}
            </>
          )}
        </div>
      </div>

      <TransactionModal open={addSheetOpen} onClose={() => setAddSheetOpen(false)} />

      <TransactionModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        transaction={editTarget ?? undefined}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTargetId} onOpenChange={open => !open && setDeleteTargetId(null)}>
        <DialogContent className="max-w-[400px] p-0 gap-0 rounded-2xl overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#EDEBE4]">
            <DialogTitle className="text-[17px] font-medium text-[#2C2C2A]">
              Delete transaction?
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5">
            <p className="text-[13px] text-[#5F5E5A]">
              This transaction will be permanently removed. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-2 px-6 py-4 border-t border-[#EDEBE4]">
            <button
              onClick={() => setDeleteTargetId(null)}
              className="flex-1 py-2.5 rounded-lg border border-[#EDEBE4] text-[13px] font-medium text-[#5F5E5A] bg-white hover:bg-[#F9F8F5] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 py-2.5 rounded-lg bg-brand-400 text-white text-[13px] font-medium disabled:opacity-60 transition-opacity"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
