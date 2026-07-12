import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '@/services/transactions'
import { getTaxSummaryByYear } from '@/services/tax'

export function useDashboardTransactions() {
  return useQuery({
    queryKey: ['transactions', { pageNumber: 1, pageSize: 5 }],
    queryFn: () => getTransactions({ pageNumber: 1, pageSize: 5 }),
  })
}

export function useTaxSummary(year: number) {
  return useQuery({
    queryKey: ['tax-summary', year],
    queryFn: () => getTaxSummaryByYear(year),
    staleTime: 1000 * 60 * 5,
  })
}
