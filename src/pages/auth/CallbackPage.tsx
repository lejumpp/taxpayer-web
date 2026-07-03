import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getCurrentUser } from '@/services/auth'

export default function CallbackPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getCurrentUser().then(user => {
      setUser(user)
      navigate(user.accountType ? '/dashboard' : '/onboarding', { replace: true })
    }).catch(() => {
      navigate('/login', { replace: true })
    })
  }, [setUser, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <Loader2 className="size-6 animate-spin text-brand-400" />
    </div>
  )
}
