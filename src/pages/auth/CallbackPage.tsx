import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getProfile } from '@/services/profile'

export default function CallbackPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getProfile().then(profile => {
      setUser(profile)
      navigate(profile.accountType ? '/dashboard' : '/onboarding', { replace: true })
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
