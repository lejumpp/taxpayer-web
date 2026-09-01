export type SubscriptionTier = 'Free' | 'Pro'
export type SubscriptionStatus = 'Free' | 'Active' | 'Cancelled' | 'PastDue' | 'Expired'
export type BillingInterval = 'Monthly' | 'Annual'

export interface SubscriptionInfo {
  tier: SubscriptionTier
  status: SubscriptionStatus
  isPremium: boolean
  planName: string | null
  interval: BillingInterval | null
  priceCents: number | null
  currency: string | null
  expiresAt: string | null
}

export interface Plan {
  id: string
  name: string
  tier: SubscriptionTier
  interval: BillingInterval
  priceCents: number
  currency: string
  paddlePriceId: string
  trialDays: number | null
}

export type PaymentStatus = 'Pending' | 'Succeeded' | 'Failed' | 'Refunded'

export interface PaymentHistoryItem {
  id: string
  planName: string
  amountCents: number
  currency: string
  status: PaymentStatus
  method: string
  createdAt: string
}
