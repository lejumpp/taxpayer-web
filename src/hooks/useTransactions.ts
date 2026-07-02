import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  getTransaction,
  createTransaction,
  deleteTransaction,
} from '../services/transactions'
import type { CreateTransactionPayload } from '../types/transaction'

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => getTransaction(id),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => createTransaction(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
