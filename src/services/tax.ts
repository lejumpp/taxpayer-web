import client from './client'
import type { TaxSummary, TaxAssessment } from '../types/tax'

export async function getTaxSummary(): Promise<TaxSummary> {
  const { data } = await client.get<TaxSummary>('/api/v1/tax/summary')
  return data
}

export async function getTaxAssessment(): Promise<TaxAssessment> {
  const { data } = await client.get<TaxAssessment>('/api/v1/tax/assessment')
  return data
}
