import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OnboardingGuard() {
  const { user } = useAuth()
  return user?.accountType !== null && user?.accountType !== undefined
    ? <Outlet />
    : <Navigate to="/onboarding" replace />
}
