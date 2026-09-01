import { createContext, useContext } from 'react'
import type { SubscriptionInfo } from '@/types/payments'

export interface SubscriptionContextType {
  subscription: SubscriptionInfo | null
  isPremium: boolean
  isLoading: boolean
  refresh: () => Promise<SubscriptionInfo | null>
}

export const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider')
  return ctx
}
