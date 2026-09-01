import type { BulkRow } from '@/types/bulk'
import type { TransactionCategory } from '@/types/transaction'
import { todayLocal } from '@/lib/dates'

export function createEmptyRow(): BulkRow {
  return {
    id: crypto.randomUUID(),
    transactionDate: todayLocal(),
    description: '',
    type: '',
    category: '',
    amountCents: null,
    amountDisplay: '',
    errors: {},
    isValid: false,
  }
}

export function validateRow(row: BulkRow, categories: TransactionCategory[]): BulkRow {
  const errors: Record<string, string> = {}

  if (!row.transactionDate)
    errors.transactionDate = 'Required'
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.transactionDate))
    errors.transactionDate = 'Use YYYY-MM-DD'

  if (!row.description.trim())
    errors.description = 'Required'
  else if (row.description.length > 500)
    errors.description = 'Max 500 chars'

  if (!row.type)
    errors.type = 'Required'

  if (!row.category)
    errors.category = 'Required'
  else if (!categories.find(c => c.id === row.category))
    errors.category = 'Invalid category'

  if (!row.amountDisplay || row.amountCents === null || row.amountCents <= 0)
    errors.amount = 'Required'

  return {
    ...row,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

/** A row is "touched" once the user has entered anything beyond the auto-filled default date —
 *  used to avoid flashing an error badge on a pristine, freshly-added row. */
export function isRowTouched(row: BulkRow): boolean {
  return !!(row.description || row.type || row.category || row.amountDisplay)
}

export function parsePastedRow(cells: string[], categories: TransactionCategory[]): BulkRow {
  const [dateRaw, description, typeRaw, categoryDisplay, amountRaw] = cells

  const category = categories.find(
    c => c.displayName.toLowerCase() === categoryDisplay?.trim().toLowerCase()
  )

  const type = typeRaw?.trim() === 'Income' ? 'Income'
    : typeRaw?.trim() === 'Expense' ? 'Expense'
    : ''

  const amountClean = amountRaw?.replace(/[,\s]/g, '').trim()
  const amountNum = amountClean ? parseFloat(amountClean) : NaN
  const amountCents = !isNaN(amountNum) && amountNum > 0 ? Math.round(amountNum * 100) : null

  const row: BulkRow = {
    id: crypto.randomUUID(),
    transactionDate: dateRaw?.trim() ?? '',
    description: description?.trim() ?? '',
    type: type as 'Income' | 'Expense' | '',
    category: category?.id ?? '',
    amountCents,
    amountDisplay: amountCents ? (amountCents / 100).toLocaleString('en-US') : '',
    errors: {},
    isValid: false,
  }

  return validateRow(row, categories)
}
