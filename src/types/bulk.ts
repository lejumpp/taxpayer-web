export interface BulkRow {
  id: string
  transactionDate: string
  description: string
  type: 'Income' | 'Expense' | ''
  category: string
  amountCents: number | null
  amountDisplay: string
  errors: Record<string, string>
  isValid: boolean
}

export interface BulkImportPayload {
  transactions: {
    transactionDate: string
    description: string
    type: 'Income' | 'Expense'
    category: string
    amountCents: number
  }[]
}

export interface BulkImportResponse {
  importedCount: number
  message: string
}
