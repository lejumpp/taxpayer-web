import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import {
  Check,
  Star,
  ArrowLeft,
  Receipt,
  FileText,
  MessageCircle,
  Import,
  Tag,
  Lock,
  RefreshCw,
  ShieldCheck,
  HandCoins,
  CircleCheck,
  Loader2,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { getPlans, createCheckout } from '@/services/payments';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import { formatJMD, formatJMDWhole } from '@/lib/currency';
import { PlanInterval, SLOGANS, type PlanIntervalValue } from '@/lib/constants';

type PanelState = 'value' | 'checkout' | 'success'

const STATS: Array<{ value: string; label: string }> = [
  { value: 'S04', label: 'Pre-filled return' },
  { value: '6%', label: 'NIS calculated' },
  { value: '3%', label: 'NHT calculated' },
]

const FEATURES: Array<{
  icon: LucideIcon
  iconBg: string
  iconColor: string
  label: string
  desc: string
}> = [
  {
    icon: FileText,
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-400',
    label: 'S04 line-by-line breakdown',
    desc: 'Copy each field directly to the TAJ portal',
  },
  {
    icon: MessageCircle,
    iconBg: 'bg-info-50',
    iconColor: 'text-info-600',
    label: 'WhatsApp transaction logging',
    desc: "Message or photo — we'll parse it instantly",
  },
  {
    icon: Import,
    iconBg: 'bg-success-50',
    iconColor: 'text-success-600',
    label: 'Unlimited bulk import',
    desc: 'No row limits — import an entire year at once',
  },
]

const FREE_FEATURES = [
  'Transaction logging',
  'Tax assessment',
  'Tax summary',
  'CSV export',
  'Bulk import (100 rows)',
]

const TRUST_ITEMS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Lock, label: 'Secure' },
  { icon: RefreshCw, label: 'Cancel anytime' },
  { icon: ShieldCheck, label: 'Paddle protected' },
]

const POLL_MAX_ATTEMPTS = 10
const POLL_DELAY_MS = 2000
// Enough time for the 400ms slide + 200ms stagger delay to finish before Paddle renders into the container
const CHECKOUT_INIT_DELAY_MS = 650
// Average accountant fee in Jamaica for a basic self-employed S04 return
const ACCOUNTANT_FEE_CENTS = 2_500_000

const PANEL_TRANSITION = 'transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
const PANEL_TRANSITION_DELAYED = `${PANEL_TRANSITION} delay-[200ms]`

function Topbar({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-white border-b border-cream-border h-15 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7.5 h-7.5 bg-brand-400 rounded-lg flex items-center justify-center">
          <Receipt size={15} className="text-white" aria-hidden="true" />
        </div>
        <span className="text-sm font-medium text-gray-900">JumpTax</span>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 bg-transparent border-none cursor-pointer hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to dashboard
      </button>
    </div>
  )
}

function LeftPanel({
  panelState,
  isPolling,
  onCancelCheckout,
  onGoToDashboard,
  checkoutContainerRef,
}: {
  panelState: PanelState
  isPolling: boolean
  onCancelCheckout: () => void
  onGoToDashboard: () => void
  checkoutContainerRef: (node: HTMLDivElement | null) => void
}) {
  return (
    <div className="relative overflow-hidden bg-brand-400 md:w-3/5 md:flex-none">
      {/* Value prop */}
      <div
        className={`px-6 py-8 md:px-12 md:py-14 flex flex-col justify-center ${PANEL_TRANSITION} ${
          panelState === 'value' ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="hidden md:inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 mb-8 w-fit">
          <Star size={13} className="text-white" aria-hidden="true" />
          <span className="text-xs font-medium text-white">JumpTax Pro</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-semibold text-white leading-tight tracking-tight mb-2 md:mb-4">
          {SLOGANS.skipAccountant}
        </h1>

        <p className="text-sm text-white/65 leading-relaxed mb-0 md:mb-12 md:max-w-md">
          Join self-employed Jamaicans who file their S04 confidently — without paying for an
          accountant every year.
        </p>

        <div className="hidden md:grid grid-cols-3 gap-3 mb-10">
          {STATS.map(stat => (
            <div key={stat.label} className="bg-white/12 rounded-xl px-4 py-4 text-center">
              <p className="text-2xl font-semibold text-white tabular mb-1">{stat.value}</p>
              <p className="text-xs text-white/55">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3.5 bg-white/10 border border-white/20 rounded-xl px-5 py-4">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <HandCoins size={20} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white mb-0.5">Average accountant fee in Jamaica</p>
            <p className="text-xs text-white/55">For a basic self-employed S04 return</p>
          </div>
          <span className="text-lg font-semibold text-white tabular shrink-0 ml-auto">
            {formatJMDWhole(ACCOUNTANT_FEE_CENTS)}+
          </span>
        </div>
      </div>

      {/* Checkout */}
      <div
        className={`absolute inset-0 bg-white flex flex-col ${PANEL_TRANSITION_DELAYED} ${
          panelState === 'checkout' ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 border-b border-cream-border">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isPolling ? 'Confirming your payment…' : 'Complete your order'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Secured by Paddle</p>
          </div>
          {!isPolling && (
            <button
              onClick={onCancelCheckout}
              aria-label="Cancel and go back"
              className="w-8 h-8 rounded-lg border border-cream-border flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-25 transition-colors"
            >
              <ArrowLeft size={15} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {isPolling ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 size={26} className="animate-spin text-brand-400" aria-hidden="true" />
              <p className="text-sm text-gray-400">Confirming your payment with Paddle…</p>
            </div>
          ) : (
            // Paddle injects the checkout form into this div
            <div ref={checkoutContainerRef} className="paddle-checkout-container w-full" style={{ minHeight: '400px' }} />
          )}
        </div>
      </div>

      {/* Success */}
      <div
        className={`absolute inset-0 bg-white flex flex-col items-center justify-center px-8 md:px-12 text-center ${PANEL_TRANSITION_DELAYED} ${
          panelState === 'success' ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mb-6">
          <CircleCheck size={32} className="text-success-400" aria-hidden="true" />
        </div>
        <p className="text-2xl font-semibold text-gray-900 mb-3">You're on Pro</p>
        <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-xs">
          Your account has been upgraded. You now have full access to S04 breakdown, WhatsApp logging, and
          unlimited imports.
        </p>
        <button
          onClick={onGoToDashboard}
          className="w-full max-w-xs py-3.5 rounded-xl bg-brand-400 hover:bg-brand-600 text-white text-sm font-medium border-none cursor-pointer transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { isPremium, isLoading: subLoading, refresh } = useSubscription()
  const [selectedInterval, setSelectedInterval] = useState<PlanIntervalValue>(PlanInterval.Monthly)
  // Paddle redirects here after a successful payment (see successUrl below) rather than
  // straight to /dashboard, so we can confirm the webhook has landed before sending the
  // customer anywhere — avoids dropping them on a stale, still-Free dashboard.
  const [panelState, setPanelState] = useState<PanelState>(() =>
    searchParams.get('checkout') === 'complete' ? 'checkout' : 'value'
  )
  const [isPolling, setIsPolling] = useState(false)
  const [isStartingCheckout, setIsStartingCheckout] = useState(false)
  const pendingTransactionIdRef = useRef<string | null>(null)
  const checkoutContainerNodeRef = useRef<HTMLDivElement | null>(null)

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  })

  const monthlyPlan = plans?.find(p => p.interval === PlanInterval.Monthly)
  const annualPlan = plans?.find(p => p.interval === PlanInterval.Annual)
  const activePlan = selectedInterval === PlanInterval.Monthly ? monthlyPlan : annualPlan

  const savingsCents =
    monthlyPlan && annualPlan ? monthlyPlan.priceCents * 12 - annualPlan.priceCents : null

  const pollSubscriptionStatus = async () => {
    setIsPolling(true)

    for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
      await new Promise(resolve => setTimeout(resolve, POLL_DELAY_MS))
      const sub = await refresh()

      if (sub?.isPremium) {
        setIsPolling(false)
        setPanelState('success')
        return
      }
    }

    setIsPolling(false)
    toast.success('Payment received! Your account will be upgraded shortly.')
    setPanelState('success')
  }

  const handleUpgrade = async () => {
    if (!activePlan || !user) return

    setIsStartingCheckout(true)
    try {
      const { checkoutUrl, transactionId } = await createCheckout(activePlan.id)

      if (checkoutUrl) {
        // Mock provider — checkoutUrl points at our own /mock-checkout page.
        const url = new URL(checkoutUrl)
        navigate(`${url.pathname}${url.search}`)
        return
      }

      if (transactionId) {
        pendingTransactionIdRef.current = transactionId
        setPanelState('checkout')
        return
      }

      toast.error('Unable to start checkout. Please try again.')
    } catch {
      toast.error('Unable to start checkout. Please try again.')
    } finally {
      setIsStartingCheckout(false)
    }
  }

  const handleCancelCheckout = () => {
    if (checkoutContainerNodeRef.current) {
      checkoutContainerNodeRef.current.innerHTML = ''
    }
    setPanelState('value')
  }

  const goToDashboard = () => navigate('/dashboard?upgraded=true')

  // Paddle redirects the whole page to successUrl once payment completes — it doesn't wait
  // for our webhook to be processed, so we can't trust an in-page event to know when it's
  // safe to send the customer to the dashboard. Instead successUrl brings them back to this
  // same page with ?checkout=complete, and this effect picks up the polling from there.
  useEffect(() => {
    if (searchParams.get('checkout') !== 'complete') return
    const timer = setTimeout(() => void pollSubscriptionStatus(), 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The checkout panel is always mounted (for the slide transition), so the container div
  // already exists in the DOM — Paddle just needs to wait for the animation to finish first.
  useEffect(() => {
    if (panelState !== 'checkout') return
    const transactionId = pendingTransactionIdRef.current
    if (!transactionId) return

    const timer = setTimeout(() => {
      if (!window.Paddle) return

      window.Paddle.Checkout.open({
        settings: {
          displayMode: 'inline',
          frameTarget: 'paddle-checkout-container',
          frameStyle: 'width: 100%; background: transparent; border: none;',
          successUrl: `${window.location.origin}/upgrade?checkout=complete`,
        },
        transactionId,
      })
    }, CHECKOUT_INIT_DELAY_MS)

    return () => clearTimeout(timer)
  }, [panelState])

  // Skip the auto-redirect on the post-checkout return trip — even if isPremium flips true
  // almost immediately, the customer should see the confirmation screen and click through
  // to the dashboard themselves rather than being bounced there automatically.
  const isConfirmingCheckout = searchParams.get('checkout') === 'complete'
  if (!subLoading && isPremium && !isConfirmingCheckout) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar onBack={() => navigate('/dashboard')} />

      <div className="flex-1 flex flex-col md:flex-row">
        <LeftPanel
          panelState={panelState}
          isPolling={isPolling}
          onCancelCheckout={handleCancelCheckout}
          onGoToDashboard={goToDashboard}
          checkoutContainerRef={node => {
            checkoutContainerNodeRef.current = node
          }}
        />

        {/* Right panel */}
        <div className="bg-white md:border-l border-cream-border px-5 py-6 md:px-9 md:py-9 flex-1 md:w-2/5 md:flex-none flex flex-col justify-center overflow-y-auto">
          {/* Dark pine price block */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-5">
            <div className="flex bg-white/10 rounded-lg p-1 gap-1 mb-5">
              {[PlanInterval.Monthly, PlanInterval.Annual].map(interval => (
                <button
                  key={interval}
                  onClick={() => setSelectedInterval(interval)}
                  className={`flex-1 py-1.5 rounded-md text-xs border-none cursor-pointer transition-colors ${
                    selectedInterval === interval
                      ? 'bg-white/12 text-white font-medium'
                      : 'bg-transparent text-white/50'
                  }`}
                >
                  {interval === PlanInterval.Monthly ? 'Monthly' : 'Annual'}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="h-12 w-40 bg-white/10 rounded animate-pulse mb-4" />
            ) : (
              <>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-semibold text-white tracking-tight tabular leading-none">
                    {formatJMD(
                      selectedInterval === PlanInterval.Monthly
                        ? (monthlyPlan?.priceCents ?? 0)
                        : Math.round((annualPlan?.priceCents ?? 0) / 12)
                    )}
                  </span>
                  <span className="text-sm text-white/50">/ month</span>
                </div>

                <p className="text-xs text-white/40 mb-2.5">
                  {selectedInterval === PlanInterval.Monthly
                    ? 'Billed monthly · Cancel anytime'
                    : `Billed annually — ${formatJMD(annualPlan?.priceCents ?? 0)}/year`}
                </p>

                {savingsCents !== null && savingsCents > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-success-400 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    <Tag size={12} aria-hidden="true" />
                    Annual saves you {formatJMD(savingsCents)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Feature cards — stay visible throughout, including while checkout is open in the left panel */}
          <div className="flex flex-col gap-2 mb-5">
            {FEATURES.map(feature => (
              <div
                key={feature.label}
                className="flex items-center gap-3 px-3.5 py-3 rounded-md border border-cream-border bg-white"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${feature.iconBg}`}
                >
                  <feature.icon size={17} className={feature.iconColor} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{feature.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{feature.desc}</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-success-400" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <button
            onClick={panelState === 'value' ? () => void handleUpgrade() : goToDashboard}
            disabled={
              panelState === 'checkout' ||
              (panelState === 'value' && (!activePlan || isLoading || isStartingCheckout))
            }
            className={`w-full inline-flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-colors disabled:opacity-50 mb-2.5 ${
              panelState === 'success'
                ? 'bg-success-400 hover:bg-success-600 text-white'
                : panelState === 'checkout'
                ? 'bg-gray-50 text-gray-200 cursor-not-allowed'
                : 'bg-brand-400 hover:bg-brand-600 text-white'
            }`}
          >
            {panelState === 'success'
              ? <>Go to dashboard <ArrowRight size={16} aria-hidden="true" /></>
              : panelState === 'checkout'
              ? 'Completing order...'
              : isLoading
              ? 'Loading...'
              : isStartingCheckout
              ? 'Starting checkout...'
              : `Upgrade to Pro — ${formatJMD(activePlan?.priceCents ?? 0)}/${
                  selectedInterval === PlanInterval.Monthly ? 'mo' : 'yr'
                }`}
          </button>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-4 mb-5">
            {TRUST_ITEMS.map(item => (
              <div key={item.label} className="flex items-center gap-1 text-xs text-gray-200">
                <item.icon size={13} aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </div>

          {/* Free features */}
          <hr className="border-t border-gray-50 mb-3.5" />
          <p className="text-xs font-medium text-gray-200 uppercase tracking-wide mb-2.5">
            Already included on Free
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {FREE_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-gray-400">
                <Check size={12} className="text-gray-100" aria-hidden="true" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
