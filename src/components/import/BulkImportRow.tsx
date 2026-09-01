import { Trash2 } from 'lucide-react'
import { validateRow } from '@/lib/bulk'
import type { BulkRow } from '@/types/bulk'
import type { TransactionCategory } from '@/types/transaction'

interface BulkImportRowProps {
  row: BulkRow
  categories: TransactionCategory[]
  onChange: (row: BulkRow) => void
  onDelete: () => void
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  canDelete: boolean
  dateInputRef?: (el: HTMLInputElement | null) => void
  onAmountTabOut?: () => void
}

export default function BulkImportRow({
  row,
  categories,
  onChange,
  onDelete,
  onPaste,
  canDelete,
  dateInputRef,
  onAmountTabOut,
}: BulkImportRowProps) {
  const filteredCategories = categories.filter(c => !row.type || c.type === row.type)

  const cellClass = (field: string) =>
    `w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition-colors ${
      row.errors[field]
        ? 'border-brand-100 bg-brand-50 focus:border-brand-400'
        : 'border-cream-border bg-white focus:border-brand-400'
    }`

  return (
    <tr className="group border-b border-cream-border align-top">
      {/* Date */}
      <td className="px-2 py-1.5">
        <input
          ref={dateInputRef}
          type="date"
          value={row.transactionDate}
          onChange={e => onChange(validateRow({ ...row, transactionDate: e.target.value }, categories))}
          onPaste={onPaste}
          className={cellClass('transactionDate')}
        />
        {row.errors.transactionDate && (
          <p className="mt-0.5 text-xs text-brand-400">{row.errors.transactionDate}</p>
        )}
      </td>

      {/* Description */}
      <td className="px-2 py-1.5">
        <input
          type="text"
          value={row.description}
          placeholder="e.g. Logo design invoice"
          onChange={e => onChange(validateRow({ ...row, description: e.target.value }, categories))}
          onPaste={onPaste}
          className={cellClass('description')}
        />
        {row.errors.description && (
          <p className="mt-0.5 text-xs text-brand-400">{row.errors.description}</p>
        )}
      </td>

      {/* Type */}
      <td className="px-2 py-1.5">
        <select
          value={row.type}
          onChange={e => {
            const updated = { ...row, type: e.target.value as 'Income' | 'Expense' | '', category: '' }
            onChange(validateRow(updated, categories))
          }}
          className={cellClass('type')}
        >
          <option value="">Select</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
      </td>

      {/* Category */}
      <td className="px-2 py-1.5">
        <select
          value={row.category}
          onChange={e => onChange(validateRow({ ...row, category: e.target.value }, categories))}
          disabled={!row.type}
          className={`${cellClass('category')} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">Select</option>
          {filteredCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.displayName}</option>
          ))}
        </select>
      </td>

      {/* Amount */}
      <td className="px-2 py-1.5">
        <input
          type="text"
          inputMode="decimal"
          value={row.amountDisplay}
          placeholder="0.00"
          onChange={e => {
            const raw = e.target.value.replace(/,/g, '')
            const num = parseFloat(raw)
            const amountCents = !isNaN(num) && num > 0 ? Math.round(num * 100) : null
            const formatted = amountCents ? (amountCents / 100).toLocaleString('en-US') : raw
            onChange(validateRow({ ...row, amountDisplay: formatted, amountCents }, categories))
          }}
          onPaste={onPaste}
          onKeyDown={e => {
            if (e.key === 'Tab' && !e.shiftKey && onAmountTabOut) {
              e.preventDefault()
              onAmountTabOut()
            }
          }}
          className={`${cellClass('amount')} tabular text-right`}
        />
        {row.errors.amount && (
          <p className="mt-0.5 text-right text-xs text-brand-400">{row.errors.amount}</p>
        )}
      </td>

      {/* Delete */}
      <td className="px-2 py-1.5 text-center">
        <button
          type="button"
          onClick={onDelete}
          disabled={!canDelete}
          className="text-gray-100 opacity-0 transition-colors group-hover:opacity-100 hover:text-brand-400 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Delete row"
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </td>
    </tr>
  )
}
