export interface Transaction {
  id: string
  transactionDate: string
  description: string
  amountCents: number
  type: 'Income' | 'Expense'
  category: string
  categoryDisplayName: string
  isTaxDeductible: boolean
  source: 'Manual' | 'CsvImport'
}

export interface TransactionSummary {
  totalIncomeCents: number
  totalExpensesCents: number
  netProfitCents: number
  incomeCount: number
  expenseCount: number
}

export interface TransactionPage {
  items: Transaction[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  summary: TransactionSummary
}

export interface TransactionFilters {
  pageNumber?: number
  pageSize?: number
  type?: 'Income' | 'Expense'
  category?: string
  search?: string
  fromDate?: string
  toDate?: string
}

export interface TransactionCategory {
  id: string
  displayName: string
  type: 'Income' | 'Expense'
  isTaxDeductible: boolean
}

export interface CreateTransactionPayload {
  type: 'Income' | 'Expense'
  amountCents: number
  description: string
  category: string
  transactionDate: string
}
