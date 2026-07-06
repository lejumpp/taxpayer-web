import client from './client'
import type { Transaction, CreateTransactionPayload } from '../types/transaction'

export async function getTransactions(): Promise<Transaction[]> {
  const { data } = await client.get<Transaction[]>('/api/v1/transactions')
  return data
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data } = await client.get<Transaction>(`/api/v1/transactions/${id}`)
  return data
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  const { data } = await client.post<Transaction>('/api/v1/transactions', payload)
  return data
}

export async function deleteTransaction(id: string): Promise<void> {
  await client.delete(`/api/v1/transactions/${id}`)
}
