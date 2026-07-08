export interface TaxSummary {
  currentYear: number
  totalIncomeCents: number
  totalExpensesCents: number
  taxableIncomeCents: number
  estimatedTaxCents: number
}

export interface TaxAssessment {
  id: string
  taxYear: number
  totalIncomeCents: number
  totalExpensesCents: number
  taxableIncomeCents: number
  estimatedTaxCents: number
  createdAt: string
}

export interface TaxSummaryByYear {
  year?: number
  breakdown: {
    totalStatutoryLiabilityCents: number
    [key: string]: unknown
  }
}
