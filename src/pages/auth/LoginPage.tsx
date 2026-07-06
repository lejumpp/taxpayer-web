import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { login, resendVerificationEmail } from '@/services/auth'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginForm = z.infer<typeof loginSchema>

function formatLockTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const mins = Math.ceil(diff / 60000)
  return mins <= 1 ? 'in 1 minute' : `in ${mins} minutes`
}

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isUnverified, setUnverified] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [lockedUntil, setLockedUntil] = useState<string | null>(null)
  const [resendTrigger, setResendTrigger] = useState(0)
  const [cooldown, setCooldown] = useState(0)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { formState: { isSubmitting }, setError } = form

  useEffect(() => {
    if (resendTrigger === 0) return
    setCooldown(60)
    const timer = setInterval(() => {
      setCooldown(n => {
        if (n <= 1) { clearInterval(timer); return 0 }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendTrigger])

  const handleResend = async () => {
    try {
      await resendVerificationEmail(unverifiedEmail)
      toast.success('Verification email sent.')
      setResendTrigger(t => t + 1)
    } catch {
      toast.error('Could not resend. Try again.')
    }
  }

  const onSubmit = async (values: LoginForm) => {
    setUnverified(false)
    setUnverifiedEmail('')
    setLockedUntil(null)
    setCooldown(0)
    try {
      const user = await login(values.email, values.password)
      setUser(user)
      navigate(user.accountType ? '/dashboard' : '/onboarding')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const code = error.response?.data?.code

        if (status === 401) {
          setError('root', { message: 'Incorrect email or password.' })
        } else if (status === 403 && code === 'EMAIL_UNVERIFIED') {
          setUnverified(true)
          setUnverifiedEmail(values.email)
        } else if (status === 423) {
          setLockedUntil(error.response?.data?.lockedUntil ?? null)
        } else {
          setError('root', { message: 'Something went wrong. Try again.' })
        }
      }
    }
  }

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — terracotta, desktop only */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-10 bg-brand-400 text-white">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-lg font-semibold tracking-tight">TaxPayer</span>
        </div>

        <div className="space-y-8">
          <span className="inline-block bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full">
            2026 filing open
          </span>

          <div className="space-y-3">
            <h1 className="text-[40px] font-bold leading-tight tracking-tight">
              Your taxes,<br />sorted.
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              No accountant needed.<br />No jargon. No guesswork.
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 space-y-3">
            <p className="text-white/60 text-xs uppercase tracking-widest font-medium">
              Filing deadline
            </p>
            <p className="text-2xl font-bold">March 15, 2027</p>
            <p className="text-white/60 text-sm">2026 tax year · S04 return</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['25% Income tax', '6% NIS', '2.25% Ed tax'].map(chip => (
                <span
                  key={chip}
                  className="bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div />
      </div>

      {/* Right panel — cream */}
      <div className="flex flex-col w-full md:w-1/2 min-h-screen bg-cream">
        {/* Mobile header */}
        <div className="flex items-center gap-2 px-6 pt-6 md:hidden">
          <LogoMark size="sm" />
          <span className="text-base font-semibold text-brand-400">TaxPayer</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-100 space-y-7">
            <div className="space-y-1">
              <h2 className="text-[22px] font-medium text-gray-900">Welcome back</h2>
              <p className="text-sm text-gray-600">Log in to your TaxPayer account.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Email
                      </FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="pl-9 bg-white border-[0.5px] border-gray-100 rounded-lg h-11"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Password
                        </FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-brand-400 hover:text-brand-600 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pl-9 pr-10 bg-white border-[0.5px] border-gray-100 rounded-lg h-11"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowPassword(v => !v)}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                {isUnverified && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    Your email isn&apos;t verified yet. Check your inbox or{' '}
                    <button
                      type="button"
                      disabled={cooldown > 0}
                      className="underline font-medium hover:text-amber-900 disabled:opacity-50 disabled:no-underline"
                      onClick={handleResend}
                    >
                      {cooldown > 0 ? `resend the link (${cooldown}s)` : 'resend the link'}
                    </button>
                    .
                  </div>
                )}

                {lockedUntil && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    Too many attempts. Try again {formatLockTime(lockedUntil)}.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-brand-400 hover:bg-brand-600 text-white rounded-lg font-medium gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>
              </form>
            </Form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-white border-[0.5px] border-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-50 gap-2"
              onClick={handleGoogle}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-600">
              New here?{' '}
              <Link
                to="/register"
                className="text-brand-400 hover:text-brand-600 font-medium transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
  return (
    <div className={`${dim} rounded-lg bg-white/20 flex items-center justify-center`}>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'}
      >
        <path
          d="M4 5h12M4 10h8M4 15h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
