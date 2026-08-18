import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getSubscription } from '@/services/payments'
import type { SubscriptionInfo } from '@/types/payments'
import { useAuth } from './AuthContext'

interface SubscriptionContextType {
  subscription: SubscriptionInfo | null
  isPremium: boolean
  isLoading: boolean
  refresh: () => Promise<SubscriptionInfo | null>
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [isFetching, setIsFetching] = useState(true)

  const load = () =>
    getSubscription()
      .then(sub => {
        setSubscription(sub)
        return sub
      })
      .catch(() => {
        setSubscription(null)
        return null
      })
      .finally(() => setIsFetching(false))

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated])

  const isLoading = isAuthenticated && isFetching
  const effectiveSubscription = isAuthenticated ? subscription : null

  return (
    <SubscriptionContext.Provider value={{
      subscription: effectiveSubscription,
      isPremium: effectiveSubscription?.isPremium ?? false,
      isLoading,
      refresh: load,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider')
  return ctx
}
