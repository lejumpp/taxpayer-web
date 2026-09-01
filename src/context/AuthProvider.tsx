import { useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types/auth'
import { getProfile } from '@/services/profile'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialising, setIsInitialising] = useState(true)

  useEffect(() => {
    getProfile()
      .then(profile => setUser(profile))
      .catch(() => setUser(null))
      .finally(() => setIsInitialising(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated: !!user, isInitialising }}>
      {children}
    </AuthContext.Provider>
  )
}
