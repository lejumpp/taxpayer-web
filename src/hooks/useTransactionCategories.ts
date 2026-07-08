import { useQuery } from '@tanstack/react-query'
import { getTransactionCategories } from '@/services/transactions'

export function useTransactionCategories() {
  return useQuery({
    queryKey: ['transaction-categories'],
    queryFn: getTransactionCategories,
    staleTime: Infinity,
  })
}
