import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { verifyEmail, resendVerificationEmail } from '@/services/auth'

type Status = 'loading' | 'success' | 'expired' | 'not-found' | 'invalid'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [resendEmail, setResendEmail] = useState(() => searchParams.get('email') ?? '')
  const [resendSent, setResendSent] = useState(false)
  const verifiedRef = useRef(false)
  const [resendTrigger, setResendTrigger] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setResending] = useState(false)

  useEffect(() => {
    if (verifiedRef.current) return
    verifiedRef.current = true

    const userId = searchParams.get('userId')
    const token = searchParams.get('token')

    if (!userId || !token) {
      setStatus('invalid')
      return
    }

    verifyEmail(userId, decodeURIComponent(token))
      .then(() => setStatus('success'))
      .catch(error => {
        if (axios.isAxiosError(error)) {
          const code = error.response?.status
          if (code === 400) setStatus('expired')
          else if (code === 404) setStatus('not-found')
          else setStatus('invalid')
        } else {
          setStatus('invalid')
        }
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (resendTrigger === 0) return
    setCooldown(60)
    const timer = setInterval(() => {
      setCooldown(n => {
        if (n <= 1) {
          clearInterval(timer)
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendTrigger])

  const handleResend = async () => {
    setResending(true)
    try {
      await resendVerificationEmail(resendEmail)
      setResendSent(true)
      setResendTrigger(t => t + 1)
    } catch {
      toast.error('Could not send. Try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[0.5px] border-cream-border p-8 w-full max-w-[420px] space-y-6">
        <div className="flex items-center justify-center gap-2">
          <LogoMark />
          <span className="text-base font-semibold text-brand-400">TaxPayer</span>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Loader2 className="size-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="size-8 text-success-400" />
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">Email verified</h2>
              <p className="text-sm text-gray-600">You're all set. Log in to get started.</p>
            </div>
            <Button
              asChild
              className="w-full h-11 bg-brand-400 hover:bg-brand-600 text-white rounded-lg font-medium"
            >
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        )}

        {(status === 'expired' || status === 'invalid') && (
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="size-8 text-brand-600" />
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">
                {status === 'expired' ? 'That link has expired' : 'Invalid link'}
              </h2>
              <p className="text-sm text-gray-600">
                {status === 'expired'
                  ? 'Verification links expire after 24 hours. Request a new one below.'
                  : 'This link is incomplete or has already been used. Request a new verification email.'}
              </p>
            </div>

            {resendSent ? (
              <p className="text-sm text-success-600">Verification email sent. Check your inbox.</p>
            ) : (
              <div className="w-full space-y-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                  className="bg-white border-[0.5px] border-gray-100 rounded-lg h-11 text-center"
                />
                <Button
                  type="button"
                  disabled={!resendEmail.trim() || cooldown > 0 || isResending}
                  onClick={handleResend}
                  className="w-full h-11 bg-brand-400 hover:bg-brand-600 text-white rounded-lg font-medium gap-2"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend verification email (${cooldown}s)`
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {status === 'not-found' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="size-8 text-brand-600" />
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">Something went wrong</h2>
              <p className="text-sm text-gray-600">
                We couldn't find that account. Try registering again.
              </p>
            </div>
            <Button
              asChild
              className="w-full h-11 bg-brand-400 hover:bg-brand-600 text-white rounded-lg font-medium"
            >
              <Link to="/register">Create an account</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <div className="w-7 h-7 rounded-lg bg-brand-400 flex items-center justify-center">
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <path
          d="M4 5h12M4 10h8M4 15h5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
