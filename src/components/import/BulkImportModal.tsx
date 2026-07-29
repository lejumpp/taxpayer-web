import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { Plus, Info, ClipboardPaste, CircleCheck, CircleX } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import BulkImportRow from './BulkImportRow'
import { useSubscription } from '@/context/SubscriptionContext'
import { useTransactionCategories } from '@/hooks/useTransactionCategories'
import { bulkImport } from '@/services/bulk'
import { createEmptyRow, isRowTouched, parsePastedRow } from '@/lib/bulk'
import type { BulkRow, BulkImportResponse } from '@/types/bulk'

const FREE_ROW_LIMIT = 100

type Step = 'edit' | 'success'

interface BulkImportModalProps {
  open: boolean
  onClose: () => void
}

export default function BulkImportModal({ open, onClose }: BulkImportModalProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isPremium } = useSubscription()
  const { data: categories } = useTransactionCategories()

  const [rows, setRows] = useState<BulkRow[]>([createEmptyRow()])
  const [step, setStep] = useState<Step>('edit')
  const [importResult, setImportResult] = useState<BulkImportResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pendingFocusRowId = useRef<string | null>(null)

  const rowLimit = isPremium ? Infinity : FREE_ROW_LIMIT
  const validRows = rows.filter(r => r.isValid)
  const errorRows = rows.filter(r => !r.isValid && isRowTouched(r))
  const isAtLimit = rows.length >= rowLimit

  function resetState() {
    setRows([createEmptyRow()])
    setStep('edit')
    setImportResult(null)
  }

  function handleClose() {
    resetState()
    onClose()
  }

  function updateRow(index: number, updated: BulkRow) {
    setRows(prev => prev.map((r, i) => (i === index ? updated : r)))
  }

  function deleteRow(index: number) {
    setRows(prev => (prev.length === 1 ? [createEmptyRow()] : prev.filter((_, i) => i !== index)))
  }

  function addRow(focusAfter = false) {
    if (isAtLimit) return
    const newRow = createEmptyRow()
    setRows(prev => [...prev, newRow])
    if (focusAfter) pendingFocusRowId.current = newRow.id
  }

  // Only intercept structured (tab/newline-separated) spreadsheet pastes — a plain single-value
  // paste into one cell should behave like a normal browser paste, not overwrite the whole row.
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>, startRowIndex: number) {
    const text = e.clipboardData.getData('text/plain')
    const isMultiCell = text.includes('\t') || text.trim().includes('\n')
    if (!isMultiCell) return
    e.preventDefault()

    const pastedLines = text.trim().split('\n').map(line => line.split('\t'))
    const cats = categories ?? []

    setRows(prev => {
      const next = [...prev]
      pastedLines.forEach((cells, i) => {
        const rowIndex = startRowIndex + i
        const parsed = parsePastedRow(cells, cats)
        if (rowIndex < next.length) {
          next[rowIndex] = parsed
        } else {
          next.push(parsed)
        }
      })
      return isPremium ? next : next.slice(0, FREE_ROW_LIMIT)
    })
  }

  async function handleSubmit() {
    if (validRows.length === 0) return
    setIsSubmitting(true)
    try {
      const result = await bulkImport({
        transactions: validRows.map(r => ({
          transactionDate: r.transactionDate,
          description: r.description,
          type: r.type as 'Income' | 'Expense',
          category: r.category,
          amountCents: r.amountCents!,
        })),
      })
      setImportResult(result)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['tax-summary'] })
      setStep('success')
    } catch (error) {
      const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined
      if (code === 'ROW_LIMIT_EXCEEDED') {
        toast.error('Free plan is limited to 100 rows. Upgrade to Pro for unlimited imports.')
      } else {
        toast.error('Import failed. Please check your rows and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) handleClose() }}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-cream-border px-6 pt-5 pb-4">
          <DialogTitle className="text-lg font-medium text-gray-900">
            Bulk import transactions
          </DialogTitle>
        </DialogHeader>

        {step === 'edit' ? (
          <>
            <p className="flex shrink-0 items-start gap-1.5 border-b border-cream-border px-6 py-3 text-sm text-gray-600">
              <ClipboardPaste size={14} className="mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
              <span>
                Paste from Excel: columns should be in order — Date, Description, Type, Category, Amount.
                Type values: <strong>Income</strong> or <strong>Expense</strong>.
              </span>
            </p>

            {!isPremium && (
              <div className="flex shrink-0 items-center gap-2 border-b border-brand-100 bg-brand-50 px-6 py-2.5">
                <Info size={14} className="shrink-0 text-brand-400" aria-hidden="true" />
                <span className="text-xs text-brand-600">
                  Free plan: {rows.length} / {FREE_ROW_LIMIT} rows used.{' '}
                  <button
                    type="button"
                    onClick={() => { handleClose(); navigate('/upgrade') }}
                    className="cursor-pointer border-none bg-transparent font-medium text-brand-600 underline"
                  >
                    Upgrade to Pro
                  </button>{' '}
                  for unlimited imports.
                </span>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="border-b border-cream-border">
                    <th className="w-36 px-3 py-2.5 text-left text-xs font-medium uppercase text-gray-400">Date</th>
                    <th className="min-w-48 px-3 py-2.5 text-left text-xs font-medium uppercase text-gray-400">Description</th>
                    <th className="w-28 px-3 py-2.5 text-left text-xs font-medium uppercase text-gray-400">Type</th>
                    <th className="w-44 px-3 py-2.5 text-left text-xs font-medium uppercase text-gray-400">Category</th>
                    <th className="w-32 px-3 py-2.5 text-right text-xs font-medium uppercase text-gray-400">Amount (JMD)</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <BulkImportRow
                      key={row.id}
                      row={row}
                      categories={categories ?? []}
                      onChange={updated => updateRow(index, updated)}
                      onDelete={() => deleteRow(index)}
                      onPaste={e => handlePaste(e, index)}
                      canDelete={rows.length > 1}
                      dateInputRef={el => {
                        if (el && pendingFocusRowId.current === row.id) {
                          el.focus()
                          pendingFocusRowId.current = null
                        }
                      }}
                      onAmountTabOut={index === rows.length - 1 ? () => addRow(true) : undefined}
                    />
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => addRow()}
                  disabled={isAtLimit}
                  className="flex items-center gap-1.5 text-sm font-medium text-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={14} aria-hidden="true" />
                  Add row
                </button>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-cream-border px-6 py-4">
              <div className="flex items-center gap-3 text-xs">
                {validRows.length > 0 && (
                  <span className="flex items-center gap-1 font-medium text-success-600">
                    <CircleCheck size={14} aria-hidden="true" />
                    {validRows.length} valid
                  </span>
                )}
                {errorRows.length > 0 && (
                  <span className="flex items-center gap-1 font-medium text-brand-400">
                    <CircleX size={14} aria-hidden="true" />
                    {errorRows.length} {errorRows.length === 1 ? 'error' : 'errors'}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-9 rounded-lg border border-cream-border bg-white px-4 text-sm text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={validRows.length === 0 || isSubmitting}
                  className="h-9 rounded-lg bg-brand-400 px-4 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Importing...' : `Import ${validRows.length} row${validRows.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
              <CircleCheck size={28} className="text-success-400" aria-hidden="true" />
            </div>
            <p className="mb-1 text-lg font-medium text-gray-900">Import complete</p>
            <p className="mb-6 text-sm text-gray-400">
              {importResult?.importedCount} transactions added to your ledger.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-medium text-white"
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
