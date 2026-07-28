import client from './client'
import type {
  Transaction,
  TransactionPage,
  TransactionFilters,
  TransactionCategory,
  CreateTransactionPayload,
  ExpenseBreakdown,
} from '@/types/transaction'

export async function getTransactions(filters: TransactionFilters = {}): Promise<TransactionPage> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
  const { data } = await client.get('/api/v1/transactions', { params })
  return data
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data } = await client.get(`/api/v1/transactions/${id}`)
  return data
}

export async function getTransactionCategories(): Promise<TransactionCategory[]> {
  const { data } = await client.get('/api/v1/transactions/categories')
  return data
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  const { data } = await client.post('/api/v1/transactions', payload)
  return data
}

export async function updateTransaction(id: string, payload: CreateTransactionPayload): Promise<Transaction> {
  const { data } = await client.put(`/api/v1/transactions/${id}`, payload)
  return data
}

export async function deleteTransaction(id: string): Promise<void> {
  await client.delete(`/api/v1/transactions/${id}`)
}

export async function getExpenseBreakdown(year: number): Promise<ExpenseBreakdown> {
  const { data } = await client.get('/api/v1/transactions/expense-breakdown', { params: { year } })
  return data
}
