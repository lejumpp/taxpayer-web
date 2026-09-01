import { useQuery } from '@tanstack/react-query'
import { getTaxSummary, getTaxAssessment } from '../services/tax'

export function useTaxSummary() {
  return useQuery({
    queryKey: ['tax', 'summary'],
    queryFn: getTaxSummary,
  })
}

export function useTaxAssessment() {
  return useQuery({
    queryKey: ['tax', 'assessment'],
    queryFn: getTaxAssessment,
  })
}
