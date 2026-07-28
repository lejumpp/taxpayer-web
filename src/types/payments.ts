export interface SubscriptionInfo {
  tier: 0 | 1
  status: number
  isPremium: boolean
  planName: string | null
  interval: number | null
  priceCents: number | null
  currency: string | null
  expiresAt: string | null
}

export interface Plan {
  id: string
  name: string
  tier: number
  interval: number
  priceCents: number
  currency: string
  trialDays: number | null
}
