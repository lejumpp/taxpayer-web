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
  grossIncomeCents: number
  allowableExpensesCents: number
  netProfitCents: number
  taxableIncomeCents: number
  breakdown: {
    incomeTaxDueCents: number
    nisDueCents: number
    nhtDueCents: number
    educationTaxDueCents: number
    totalStatutoryLiabilityCents: number
  }
}
