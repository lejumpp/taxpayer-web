import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import { MessageCircle, Camera, Check, Send } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import Skeleton from '@/components/ui/Skeleton'
import { useSubscription } from '@/context/SubscriptionContext'
import { getWhatsAppStatus, linkWhatsApp, verifyWhatsApp, unlinkWhatsApp } from '@/services/whatsapp'
import { formatWhatsAppNumber } from '@/lib/phone'
import { formatDate } from '@/lib/dates'
import type { WhatsAppStatus } from '@/types/whatsapp'

type FlowState = 'unlinked' | 'pending_verification' | 'linked'

const inputClass = 'bg-white border-[0.5px] border-gray-100 rounded-lg h-11'

const howItWorks = [
  { icon: MessageCircle, label: 'Send a message', desc: '"Spent 6500 on fuel today for client meeting"' },
  { icon: Camera, label: 'Or send a receipt photo', desc: 'We extract the amount, date, and description automatically' },
  { icon: Check, label: 'Confirm and log', desc: 'Reply YES to save or NO to discard' },
]

const quickGuide = [
  { label: 'Log expense', example: '"Spent 6500 on fuel today"' },
  { label: 'Log income', example: '"Received 150000 for logo design"' },
  { label: 'Send receipt', example: 'Photo of any receipt' },
  { label: 'Confirm', example: 'Reply YES or NO when asked' },
  { label: 'Help', example: 'Reply HELP anytime' },
]

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) return err.response?.data?.error ?? fallback
  return fallback
}

function UnlinkedState({
  phoneNumber,
  setPhoneNumber,
  onLink,
  isLinking,
  error,
}: {
  phoneNumber: string
  setPhoneNumber: (value: string) => void
  onLink: () => void
  isLinking: boolean
  error: string
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero info card */}
      <div className="flex items-start gap-4 px-5 py-4 bg-info-50 border border-info-100 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-info-600 flex items-center justify-center shrink-0">
          <MessageCircle size={20} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-info-800 mb-1">Log transactions via WhatsApp</p>
          <p className="text-[13px] text-info-600 leading-relaxed">
            Send a message or photo of a receipt to your JumpTax WhatsApp number. We'll parse it and add it to
            your ledger automatically — no app needed.
          </p>
        </div>
      </div>

      {/* Phone number input */}
      <div>
        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
          Your WhatsApp number
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="tel"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            placeholder="+1 876 123 4567"
            className={`flex-1 ${inputClass}`}
          />
          <button
            type="button"
            onClick={onLink}
            disabled={!phoneNumber.trim() || isLinking}
            className="h-11 px-5 rounded-lg bg-info-600 hover:bg-info-800 text-white text-sm font-medium border-none cursor-pointer disabled:opacity-50 transition-colors shrink-0"
          >
            {isLinking ? 'Sending...' : 'Send code'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Enter in international format e.g. +1 876 123 4567. A 6-digit code will be sent to this number via
          WhatsApp.
        </p>
        {error && <p className="text-xs text-brand-400 mt-2">{error}</p>}
      </div>

      {/* How it works */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">How it works</p>
        <div className="flex flex-col gap-3">
          {howItWorks.map(step => (
            <div key={step.label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                <step.icon size={15} className="text-gray-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{step.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 italic">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PendingState({
  phoneNumber,
  code,
  setCode,
  onVerify,
  isVerifying,
  error,
  onBack,
  onResend,
}: {
  phoneNumber: string
  code: string
  setCode: (value: string) => void
  onVerify: () => void
  isVerifying: boolean
  error: string
  onBack: () => void
  onResend: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl">
        <Send size={18} className="text-brand-400 shrink-0" aria-hidden="true" />
        <p className="text-sm text-brand-600">
          A 6-digit verification code was sent to <strong>{phoneNumber}</strong> via WhatsApp.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
          Enter verification code
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className={`w-36 text-center tracking-[0.2em] font-medium ${inputClass}`}
          />
          <button
            type="button"
            onClick={onVerify}
            disabled={code.length !== 6 || isVerifying}
            className="h-11 px-5 rounded-lg bg-info-600 hover:bg-info-800 text-white text-sm font-medium border-none cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {error && <p className="text-xs text-brand-400 mt-2">{error}</p>}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-xs text-gray-400 bg-transparent border-none cursor-pointer text-left w-fit"
      >
        ← Use a different number
      </button>

      <p className="text-xs text-gray-400">
        Didn't receive it?{' '}
        <button
          type="button"
          onClick={onResend}
          className="text-brand-400 bg-transparent border-none cursor-pointer font-medium"
        >
          Resend code
        </button>
      </p>
    </div>
  )
}

function LinkedState({
  status,
  onUnlinkClick,
}: {
  status: WhatsAppStatus | undefined
  onUnlinkClick: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Connected status */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 bg-success-50 border border-success-100 rounded-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-success-400 flex items-center justify-center shrink-0">
            <MessageCircle size={20} className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-success-800">Connected</p>
            <p className="text-xs text-success-600 mt-0.5 truncate">
              {formatWhatsAppNumber(status?.phoneNumber ?? null)}
              {status?.verifiedAt && (
                <span className="text-success-400"> · linked {formatDate(new Date(status.verifiedAt))}</span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onUnlinkClick}
          className="text-xs text-brand-400 font-medium bg-transparent border-none cursor-pointer shrink-0"
        >
          Unlink
        </button>
      </div>

      {/* Quick guide */}
      <div className="bg-gray-25 rounded-xl border border-cream-border px-5 py-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Quick guide</p>
        <div className="flex flex-col gap-2.5">
          {quickGuide.map(item => (
            <div key={item.label} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 text-xs">
              <span className="font-medium text-gray-600 sm:w-24 shrink-0">{item.label}</span>
              <span className="text-gray-400 italic">{item.example}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WhatsAppSection() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isPremium } = useSubscription()

  const { data: status, isLoading } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: getWhatsAppStatus,
    enabled: isPremium,
  })

  const [pendingVerification, setPendingVerification] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false)

  const state: FlowState = pendingVerification ? 'pending_verification' : status?.isVerified ? 'linked' : 'unlinked'

  const handleLink = async () => {
    setIsLinking(true)
    setError('')
    try {
      await linkWhatsApp(phoneNumber.trim())
      setPendingVerification(true)
    } catch (err) {
      setError(extractError(err, 'Something went wrong. Try again.'))
    } finally {
      setIsLinking(false)
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    setError('')
    try {
      await verifyWhatsApp(code)
      await queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] })
      toast.success('WhatsApp linked successfully!')
      setPendingVerification(false)
    } catch (err) {
      setError(extractError(err, 'Invalid code. Please try again.'))
    } finally {
      setIsVerifying(false)
    }
  }

  const handleUnlink = async () => {
    setIsUnlinking(true)
    try {
      await unlinkWhatsApp()
      await queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] })
      setUnlinkModalOpen(false)
      setPendingVerification(false)
      setPhoneNumber('')
      toast.success('WhatsApp unlinked.')
    } catch {
      toast.error('Could not unlink. Please try again.')
    } finally {
      setIsUnlinking(false)
    }
  }

  if (!isPremium) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-info-50 flex items-center justify-center mb-4">
            <MessageCircle size={26} className="text-info-600" aria-hidden="true" />
          </div>
          <p className="text-base font-medium text-gray-900 mb-2">WhatsApp integration</p>
          <p className="text-sm text-gray-400 mb-6 max-w-[320px] leading-relaxed">
            Log transactions by sending a message or receipt photo to your JumpTax WhatsApp number. Available on
            Pro.
          </p>
          <button
            type="button"
            onClick={() => navigate('/upgrade')}
            className="h-10 px-6 rounded-lg bg-brand-400 hover:bg-brand-600 text-white text-sm font-medium border-none cursor-pointer transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-border overflow-hidden">
      <div className="px-5 md:px-7 py-5 border-b border-gray-50">
        <p className="text-base font-medium text-gray-900">WhatsApp</p>
        <p className="text-xs text-gray-400 mt-0.5">Log transactions by messaging or sending a receipt photo.</p>
      </div>

      <div className="px-5 md:px-7 py-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-11 rounded-lg" />
          </div>
        ) : state === 'unlinked' ? (
          <UnlinkedState
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onLink={() => void handleLink()}
            isLinking={isLinking}
            error={error}
          />
        ) : state === 'pending_verification' ? (
          <PendingState
            phoneNumber={phoneNumber}
            code={code}
            setCode={setCode}
            onVerify={() => void handleVerify()}
            isVerifying={isVerifying}
            error={error}
            onBack={() => {
              setPendingVerification(false)
              setCode('')
              setError('')
            }}
            onResend={() => void handleLink()}
          />
        ) : (
          <LinkedState status={status} onUnlinkClick={() => setUnlinkModalOpen(true)} />
        )}
      </div>

      {/* Unlink confirmation modal */}
      <Dialog open={unlinkModalOpen} onOpenChange={setUnlinkModalOpen}>
        <DialogContent className="max-w-[380px] rounded-2xl p-6">
          <DialogHeader className="items-start">
            <DialogTitle className="text-base font-medium text-gray-900">Unlink WhatsApp?</DialogTitle>
            <p className="text-sm text-gray-400 leading-relaxed">
              You'll no longer be able to log transactions via WhatsApp. You can re-link at any time.
            </p>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setUnlinkModalOpen(false)}
              className="flex-1 h-10 rounded-lg border border-cream-border bg-white text-sm text-gray-600 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleUnlink()}
              disabled={isUnlinking}
              className="flex-1 h-10 rounded-lg bg-brand-400 hover:bg-brand-600 text-white text-sm font-medium border-none cursor-pointer disabled:opacity-60 transition-colors"
            >
              {isUnlinking ? 'Unlinking...' : 'Unlink'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
