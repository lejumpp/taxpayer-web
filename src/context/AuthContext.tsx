import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types/auth'
import { getProfile } from '@/services/profile'

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  isInitialising: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

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

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
