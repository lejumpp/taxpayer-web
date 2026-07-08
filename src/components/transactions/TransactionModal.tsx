import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTransactionCategories } from '@/hooks/useTransactionCategories'
import { createTransaction, updateTransaction } from '@/services/transactions'
import type { Transaction } from '@/types/transaction'

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  type: z.enum(['Income', 'Expense']),
  description: z
    .string()
    .min(1, 'Enter a description')
    .max(500, 'Description is too long'),
  category: z.string().min(1, 'Select a category'),
  transactionDate: z.string().min(1, 'Select a date'),
})

type FormValues = z.infer<typeof schema>

const today = () => new Date().toISOString().split('T')[0]

function centsToDisplay(cents: number): string {
  const [int, dec] = (cents / 100).toFixed(2).split('.')
  return Number(int).toLocaleString('en-US') + '.' + dec
}

function formatAmountInput(raw: string): string {
  if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return ''
  const [intPart, decPart] = raw.split('.')
  return intPart === undefined
    ? ''
    : Number(intPart).toLocaleString('en-US') +
        (raw.includes('.') ? '.' + (decPart ?? '') : '')
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  transaction?: Transaction  // undefined = add mode, set = edit mode
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TransactionModal({ open, onClose, transaction }: TransactionModalProps) {
  const isEdit = !!transaction
  const queryClient = useQueryClient()
  const { data: categories } = useTransactionCategories()

  const [amountDisplay, setAmountDisplay] = useState('')
  const [amountError, setAmountError] = useState('')
  const [hasSaved, setHasSaved] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'Income',
      description: '',
      category: '',
      transactionDate: today(),
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  // Populate / reset when target transaction changes
  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        description: transaction.description,
        category: transaction.category,
        transactionDate: transaction.transactionDate,
      })
      setAmountDisplay(centsToDisplay(transaction.amountCents))
      setAmountError('')
    }
  }, [transaction, form])

  const watchedType = watch('type')
  const watchedCategory = watch('category')

  const filteredCategories = categories?.filter(c => c.type === watchedType) ?? []
  const selectedCategory = categories?.find(c => c.id === watchedCategory)
  const isDeductible = selectedCategory?.isTaxDeductible ?? null

  function handleTypeChange(type: 'Income' | 'Expense') {
    setValue('type', type)
    setValue('category', '')
  }

  function invalidateAfterMutation() {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['tax-summary'] })
  }

  function handleClose() {
    if (!isEdit && hasSaved) {
      invalidateAfterMutation()
    }
    setAmountDisplay('')
    setAmountError('')
    setHasSaved(false)
    setShowSuccess(false)
    form.reset({ type: 'Income', description: '', category: '', transactionDate: today() })
    onClose()
  }

  async function onSubmit(values: FormValues) {
    const raw = amountDisplay.replace(/,/g, '')
    const parsed = parseFloat(raw)
    if (!raw || isNaN(parsed) || parsed <= 0) {
      setAmountError('Enter an amount greater than zero')
      return
    }
    setAmountError('')

    const payload = {
      transactionDate: values.transactionDate,
      description: values.description,
      amountCents: Math.round(parsed * 100),
      type: values.type,
      category: values.category,
    }

    try {
      if (isEdit) {
        await updateTransaction(transaction!.id, payload)
        invalidateAfterMutation()
        onClose()
      } else {
        await createTransaction(payload)
        setHasSaved(true)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 1500)
        form.reset({ type: values.type, description: '', category: '', transactionDate: today() })
        setAmountDisplay('')
      }
    } catch {
      form.setError('root', { message: 'Something went wrong. Try again.' })
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) handleClose() }}>
      <DialogContent className="max-w-120 p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#EDEBE4]">
          <DialogTitle className="text-[17px] font-medium text-[#2C2C2A]">
            {isEdit ? 'Edit transaction' : 'Add transaction'}
          </DialogTitle>
        </DialogHeader>

        {/* Success banner — add mode only */}
        {showSuccess && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-success-50 border-b border-success-100">
            <i className="ti ti-circle-check text-[#0F6E56] text-[16px]" aria-hidden="true" />
            <span className="text-[13px] text-[#0F6E56] font-medium">Transaction saved.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Type toggle */}
          <div className="flex gap-2 px-6 pt-5 pb-4">
            <button
              type="button"
              onClick={() => handleTypeChange('Income')}
              className={`flex-1 py-2 rounded-lg border text-[13px] font-medium transition-colors ${
                watchedType === 'Income'
                  ? 'bg-success-50 border-success-100 text-success-600'
                  : 'bg-white border-[#EDEBE4] text-[#5F5E5A]'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('Expense')}
              className={`flex-1 py-2 rounded-lg border text-[13px] font-medium transition-colors ${
                watchedType === 'Expense'
                  ? 'bg-brand-50 border-brand-100 text-[#993C1D]'
                  : 'bg-white border-[#EDEBE4] text-[#5F5E5A]'
              }`}
            >
              Expense
            </button>
          </div>

          <div className="px-6 pb-5 space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-[12px] font-medium text-[#5F5E5A] mb-1.5">
                Amount
              </label>
              <div className="flex items-center gap-2 border border-[#EDEBE4] rounded-lg px-3 focus-within:border-brand-400 transition-colors">
                <span className="text-[14px] text-[#888780] shrink-0">JMD$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountDisplay}
                  onChange={e => {
                    const raw = e.target.value.replace(/,/g, '')
                    const formatted = formatAmountInput(raw)
                    if (formatted === '' && raw !== '') return
                    setAmountDisplay(formatted)
                    if (amountError) setAmountError('')
                  }}
                  className="flex-1 py-2.5 bg-transparent outline-none text-[18px] font-medium text-[#2C2C2A] tabular-nums placeholder:text-[#C8C6BF] placeholder:font-normal placeholder:text-[16px]"
                />
              </div>
              {amountError && (
                <p className="text-[12px] text-brand-400 mt-1">{amountError}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-medium text-[#5F5E5A] mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Invoice #1042"
                {...register('description')}
                className="w-full px-3 py-2.5 border border-[#EDEBE4] rounded-lg text-[13px] text-[#2C2C2A] placeholder:text-[#C8C6BF] outline-none focus:border-brand-400 transition-colors"
              />
              {errors.description && (
                <p className="text-[12px] text-brand-400 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Category + Date row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#5F5E5A] mb-1.5">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2.5 border border-[#EDEBE4] rounded-lg text-[13px] text-[#2C2C2A] outline-none focus:border-brand-400 transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.displayName}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-[12px] text-brand-400 mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5F5E5A] mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  {...register('transactionDate')}
                  className="w-full px-3 py-2.5 border border-[#EDEBE4] rounded-lg text-[13px] text-[#2C2C2A] outline-none focus:border-brand-400 transition-colors cursor-pointer"
                />
                {errors.transactionDate && (
                  <p className="text-[12px] text-brand-400 mt-1">{errors.transactionDate.message}</p>
                )}
              </div>
            </div>

            {/* Deductible note */}
            {selectedCategory && (
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] ${
                isDeductible
                  ? 'bg-success-50 border-success-100 text-success-600'
                  : 'bg-[#F9F8F5] border-cream-border text-[#888780]'
              }`}>
                <i
                  className={`ti ${isDeductible ? 'ti-circle-check' : 'ti-info-circle'} text-[15px]`}
                  aria-hidden="true"
                />
                <span>
                  {isDeductible
                    ? 'This category is tax deductible — it reduces your taxable income.'
                    : 'This category is not tax deductible.'
                  }
                </span>
              </div>
            )}

            {/* Root error */}
            {errors.root && (
              <p className="text-[13px] text-brand-400">{errors.root.message}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-6 py-4 border-t border-[#EDEBE4]">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg border border-[#EDEBE4] text-[13px] font-medium text-[#5F5E5A] bg-white hover:bg-[#F9F8F5] transition-colors"
            >
              {!isEdit && hasSaved ? 'Done' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-2.5 rounded-lg bg-brand-400 text-white text-[13px] font-medium disabled:opacity-60 transition-opacity"
            >
              {isSubmitting
                ? 'Saving…'
                : isEdit
                  ? 'Save changes'
                  : 'Save transaction'
              }
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
