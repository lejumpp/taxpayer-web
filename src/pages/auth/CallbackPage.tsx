import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { getProfile } from '@/services/profile'

type Status = 'loading' | 'error'

export default function CallbackPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    getProfile()
      .then(profile => {
        setUser(profile)
        navigate(profile.accountType ? '/dashboard' : '/onboarding', { replace: true })
      })
      .catch(() => {
        setStatus('error')
      })
  }, [setUser, navigate])

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="w-full max-w-105 mx-auto bg-white rounded-2xl border border-cream-border p-8 text-center">
          <XCircle className="size-8 text-brand-400 mx-auto mb-4" aria-hidden="true" />
          <p className="text-lg font-medium text-gray-900 mb-2">Sign in failed</p>
          <p className="text-sm text-gray-600 mb-6">
            Something went wrong with Google sign in. Please try again.
          </p>
          <Button asChild className="bg-brand-400 hover:bg-brand-600 text-white rounded-lg font-medium px-5">
            <Link to="/login">Back to log in</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <Loader2 className="size-6 animate-spin text-brand-400" aria-label="Signing you in..." />
    </div>
  )
}
