import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Star, Calendar, Loader2, Receipt, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Skeleton from '@/components/ui/Skeleton'
import { useSubscription } from '@/context/SubscriptionContext'
import { getPaymentHistory, cancelSubscription } from '@/services/payments'
import { formatJMD } from '@/lib/currency'
import { formatDate } from '@/lib/dates'
import type { PaymentStatus } from '@/types/payments'

const statusStyles: Record<PaymentStatus, string> = {
  Succeeded: 'bg-success-50 text-success-600',
  Failed: 'bg-brand-50 text-brand-600',
  Pending: 'bg-gray-50 text-gray-600',
  Refunded: 'bg-gray-50 text-gray-600',
}

const statusLabels: Record<PaymentStatus, string> = {
  Succeeded: 'Paid',
  Failed: 'Failed',
  Pending: 'Pending',
  Refunded: 'Refunded',
}

export default function BillingSection() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { subscription, isLoading: subLoading, refresh } = useSubscription()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const { data: payments, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['payment-history'],
    queryFn: getPaymentHistory,
    enabled: !!subscription,
  })

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await cancelSubscription()
      await refresh()
      queryClient.invalidateQueries({ queryKey: ['payment-history'] })
      setCancelModalOpen(false)
      toast.success('Subscription cancelled. You keep Pro access until your billing period ends.')
    } catch {
      toast.error('Could not cancel subscription. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  const expiresAtLabel = subscription?.expiresAt ? formatDate(new Date(subscription.expiresAt)) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Current plan */}
      <div className="bg-white rounded-2xl border border-cream-border overflow-hidden">
        <div className="px-5 md:px-7 py-5 border-b border-gray-50">
          <p className="text-base font-medium text-gray-900">Current plan</p>
          <p className="text-xs text-gray-400 mt-0.5">Manage your subscription.</p>
        </div>

        <div className="px-5 md:px-7 py-6">
          {subLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ) : !subscription?.isPremium ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-medium text-gray-900">Free</p>
                  <span className="text-xs font-medium bg-gray-50 text-gray-400 px-2.5 py-1 rounded-full">
                    Current plan
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Transaction logging, tax assessment, tax summary.
                </p>
              </div>
              <button
                onClick={() => navigate('/upgrade')}
                className="shrink-0 h-9 px-4 rounded-lg bg-brand-400 hover:bg-brand-600 text-white text-sm font-medium border-none cursor-pointer transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-medium text-gray-900">
                      {subscription.planName ?? 'Pro'}
                    </p>
                    <span className="text-xs font-medium bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star size={11} aria-hidden="true" />
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {formatJMD(subscription.priceCents ?? 0)} /{subscription.interval === 'Monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>

              {expiresAtLabel && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-25 rounded-md border border-cream-border">
                  <Calendar size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Renews {expiresAtLabel}</p>
                    <p className="text-xs text-gray-400">
                      Your plan renews automatically. Cancel anytime before this date.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-2xl border border-cream-border overflow-hidden">
        <div className="px-5 md:px-7 py-5 border-b border-gray-50">
          <p className="text-base font-medium text-gray-900">Payment history</p>
          <p className="text-xs text-gray-400 mt-0.5">All payments made on your account.</p>
        </div>

        {isLoadingHistory && (
          <div className="px-7 py-8 flex justify-center">
            <Loader2 size={22} className="animate-spin text-brand-400" aria-hidden="true" />
          </div>
        )}

        {!isLoadingHistory && (!payments || payments.length === 0) && (
          <div className="px-7 py-10 text-center">
            <Receipt size={32} className="text-gray-100 mb-3 mx-auto" aria-hidden="true" />
            <p className="text-sm text-gray-400">No payments yet.</p>
          </div>
        )}

        {!isLoadingHistory && payments && payments.length > 0 && (
          <div>
            {payments.map((payment, index) => (
              <div
                key={payment.id}
                className={`flex items-center justify-between gap-3 px-5 md:px-7 py-4 ${
                  index < payments.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <Receipt size={16} className="text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{payment.planName}</p>
                    <p className="text-xs text-gray-400">{formatDate(new Date(payment.createdAt))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium tabular text-gray-900">
                    {formatJMD(payment.amountCents)}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[payment.status]}`}>
                    {statusLabels[payment.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      {subscription?.isPremium && (
        <div className="bg-white rounded-2xl border border-cream-border overflow-hidden">
          <div className="px-5 md:px-7 py-5 border-b border-gray-50">
            <p className="text-base font-medium text-gray-900">Cancel subscription</p>
            <p className="text-xs text-gray-400 mt-0.5">
              You'll keep Pro access until your current billing period ends.
            </p>
          </div>
          <div className="px-5 md:px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-600 max-w-md">
              After cancelling you'll lose access to S04 breakdown, WhatsApp logging, and unlimited imports
              at the end of your billing period{expiresAtLabel ? <> on <strong>{expiresAtLabel}</strong></> : null}.
            </p>
            <button
              onClick={() => setCancelModalOpen(true)}
              className="shrink-0 h-9 px-4 rounded-lg border border-brand-100 bg-white text-brand-400 text-sm font-medium cursor-pointer hover:bg-brand-50 transition-colors"
            >
              Cancel subscription
            </button>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-[400px] rounded-2xl p-6">
          <DialogHeader className="items-start">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-4">
              <AlertCircle size={22} className="text-brand-400" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base font-medium text-gray-900">
              Cancel your subscription?
            </DialogTitle>
            <p className="text-sm text-gray-400 leading-relaxed">
              You'll keep access to Pro features until{' '}
              {expiresAtLabel && <strong className="text-gray-900">{expiresAtLabel}</strong>}. After that
              your account will revert to the Free plan.
            </p>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="flex-1 h-10 rounded-lg border border-cream-border bg-white text-sm text-gray-600 font-medium cursor-pointer"
            >
              Keep my plan
            </button>
            <button
              onClick={() => void handleCancel()}
              disabled={isCancelling}
              className="flex-1 h-10 rounded-lg bg-brand-400 hover:bg-brand-600 text-white text-sm font-medium border-none cursor-pointer disabled:opacity-60 transition-colors"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, cancel'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
