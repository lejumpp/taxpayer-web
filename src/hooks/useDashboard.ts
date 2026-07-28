import { useQuery } from '@tanstack/react-query'
import { startOfMonth, subMonths } from 'date-fns'
import { getTransactions, getExpenseBreakdown } from '@/services/transactions'
import { getTaxSummaryByYear } from '@/services/tax'
import { toLocalDateString, todayLocal } from '@/lib/dates'

export function useDashboardTransactions() {
  return useQuery({
    queryKey: ['transactions', { pageNumber: 1, pageSize: 5 }],
    queryFn: () => getTransactions({ pageNumber: 1, pageSize: 5 }),
  })
}

/** Income/expense transactions for the last 6 months, used to chart monthly cashflow. */
export function useCashflowTransactions() {
  const fromDate = toLocalDateString(startOfMonth(subMonths(new Date(), 5)))
  const toDate = todayLocal()
  return useQuery({
    queryKey: ['transactions', 'cashflow', fromDate, toDate],
    queryFn: () => getTransactions({ fromDate, toDate, pageNumber: 1, pageSize: 100 }),
    staleTime: 1000 * 60 * 5,
  })
}

export function useExpenseBreakdown(year: number) {
  return useQuery({
    queryKey: ['transactions', 'expense-breakdown', year],
    queryFn: () => getExpenseBreakdown(year),
    staleTime: 1000 * 60 * 5,
  })
}

export function useTaxSummary(year: number) {
  return useQuery({
    queryKey: ['tax-summary', year],
    queryFn: () => getTaxSummaryByYear(year),
    staleTime: 1000 * 60 * 5,
  })
}
