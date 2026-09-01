import { useState, useEffect, type ReactNode } from 'react'
import { getSubscription } from '@/services/payments'
import type { SubscriptionInfo } from '@/types/payments'
import { useAuth } from './AuthContext'
import { SubscriptionContext } from './SubscriptionContext'

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
