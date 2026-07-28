import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { getPlans, createCheckout } from '@/services/payments'
import { useSubscription } from '@/context/SubscriptionContext'
import { formatJMD } from '@/lib/currency'
import { PlanInterval } from '@/lib/constants'
import PageHeader from '@/components/layout/PageHeader'

const FREE_FEATURES = [
  { label: 'Transaction logging', included: true },
  { label: 'Tax assessment', included: true },
  { label: 'Tax summary', included: true },
  { label: 'S04 breakdown', included: false },
  { label: 'WhatsApp integration', included: false },
  { label: 'CSV import', included: false },
]

const PRO_FEATURES = [
  'Everything in Free',
  'S04 breakdown',
  'WhatsApp integration',
  'CSV import',
]

function redirectToCheckout(url: string) {
  window.location.href = url
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {included ? (
        <Check size={16} className="text-success-400 shrink-0" aria-hidden="true" />
      ) : (
        <X size={16} className="text-gray-200 shrink-0" aria-hidden="true" />
      )}
      <span className={`text-sm ${included ? 'text-gray-800' : 'text-gray-200'}`}>{label}</span>
    </div>
  )
}

export default function UpgradePage() {
  const { isPremium, isLoading: subLoading } = useSubscription()
  const [selectedInterval, setSelectedInterval] = useState<number>(PlanInterval.Monthly)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  })

  const monthlyPlan = plans?.find(p => p.interval === PlanInterval.Monthly)
  const annualPlan = plans?.find(p => p.interval === PlanInterval.Annual)
  const activePlan = selectedInterval === PlanInterval.Monthly ? monthlyPlan : annualPlan

  const savingsCents =
    monthlyPlan && annualPlan ? monthlyPlan.priceCents * 12 - annualPlan.priceCents : null

  const handleUpgrade = async () => {
    if (!activePlan) return
    setIsCheckingOut(true)
    try {
      const { checkoutUrl } = await createCheckout(activePlan.id)
      redirectToCheckout(checkoutUrl)
    } catch {
      toast.error('Could not start checkout. Try again.')
      setIsCheckingOut(false)
    }
  }

  if (!subLoading && isPremium) return <Navigate to="/dashboard" replace />

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <PageHeader title="Upgrade to Pro" subtitle="Everything you need to file with confidence." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Free card */}
        <div className="bg-white rounded-2xl border border-cream-border p-6 flex flex-col">
          <p className="text-base font-medium text-gray-900 mb-1">Free</p>
          <p className="text-3xl font-semibold text-gray-900 mb-5">
            J$0<span className="text-sm font-normal text-gray-400"> / month</span>
          </p>
          <div className="flex flex-col gap-3 flex-1 mb-6">
            {FREE_FEATURES.map(feature => (
              <FeatureRow key={feature.label} label={feature.label} included={feature.included} />
            ))}
          </div>
          <button
            disabled
            className="w-full h-11 rounded-lg border border-cream-border bg-gray-25 text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            Current plan
          </button>
        </div>

        {/* Pro card */}
        <div className="bg-white rounded-2xl border-2 border-brand-400 p-6 flex flex-col relative">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-medium text-gray-900">Pro</p>
            <span className="text-xs font-medium bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
              Most popular
            </span>
          </div>

          {isLoading ? (
            <div className="h-9 w-32 bg-gray-50 rounded animate-pulse mb-5" />
          ) : (
            <div className="mb-4">
              <p className="text-3xl font-semibold text-gray-900">
                {formatJMD(activePlan?.priceCents ?? 0)}
                <span className="text-sm font-normal text-gray-400">
                  {' '}/ {selectedInterval === PlanInterval.Monthly ? 'month' : 'year'}
                </span>
              </p>
              {selectedInterval === PlanInterval.Annual && savingsCents !== null && savingsCents > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success-600 bg-success-50 px-2 py-0.5 rounded-full mt-1.5">
                  Save {formatJMD(savingsCents)} — 2 months free
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-px bg-gray-25 border border-cream-border rounded-lg overflow-hidden mb-5 w-fit">
            <button
              onClick={() => setSelectedInterval(PlanInterval.Monthly)}
              className={`px-3.5 py-1.5 text-sm border-none cursor-pointer transition-colors ${
                selectedInterval === PlanInterval.Monthly
                  ? 'bg-brand-400 text-white font-medium'
                  : 'bg-transparent text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedInterval(PlanInterval.Annual)}
              className={`px-3.5 py-1.5 text-sm border-none cursor-pointer transition-colors ${
                selectedInterval === PlanInterval.Annual
                  ? 'bg-brand-400 text-white font-medium'
                  : 'bg-transparent text-gray-600'
              }`}
            >
              Annual
            </button>
          </div>

          <div className="flex flex-col gap-3 flex-1 mb-6">
            {PRO_FEATURES.map(label => (
              <FeatureRow key={label} label={label} included />
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={!activePlan || isCheckingOut}
            className="w-full h-11 rounded-lg bg-brand-400 hover:bg-brand-600 text-white text-sm font-medium border-none cursor-pointer disabled:opacity-60 transition-colors"
          >
            {isCheckingOut ? 'Redirecting...' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>
    </div>
  )
}
