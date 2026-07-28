import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CreditCard } from 'lucide-react'
import { mockActivate } from '@/services/payments'
import { useSubscription } from '@/context/SubscriptionContext'

export default function MockCheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refresh } = useSubscription()
  const [isLoading, setIsLoading] = useState(false)

  const userId = searchParams.get('userId') ?? ''
  const planId = searchParams.get('planId') ?? ''

  const handleSuccess = async () => {
    setIsLoading(true)
    try {
      await mockActivate(userId, planId)
      await refresh()
      navigate('/dashboard?upgraded=true')
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="bg-white rounded-2xl border border-cream-border p-8 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <CreditCard size={22} className="text-brand-400" aria-hidden="true" />
        </div>
        <p className="text-base font-medium text-gray-900 mb-1">Mock payment</p>
        <p className="text-sm text-gray-400 mb-6">
          Development only. Simulates a successful payment and activates Pro.
        </p>
        <button
          onClick={handleSuccess}
          disabled={isLoading}
          className="w-full bg-brand-400 hover:bg-brand-600 text-white rounded-lg py-3 text-sm font-medium border-none cursor-pointer disabled:opacity-60 transition-colors"
        >
          {isLoading ? 'Activating...' : 'Simulate successful payment'}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-3 text-sm text-gray-400 bg-transparent border-none cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
