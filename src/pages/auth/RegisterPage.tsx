import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, Circle, Ticket, FlaskConical } from 'lucide-react'
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
import AccountTypeToggle from '@/components/account/AccountTypeToggle'
import { register as registerAccount, resendVerificationEmail } from '@/services/auth'
import { oauthErrorMessages, SLOGANS } from '@/lib/constants'
import { isBetaInviteEnabled } from '@/lib/config'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Enter your first name').max(100),
    lastName: z.string().min(1, 'Enter your last name').max(100),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[0-9]/, 'Password must include at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must include at least one special character'),
    accountType: z.enum(['Individual', 'Business']),
    businessName: z.string().max(200).optional(),
    inviteCode: isBetaInviteEnabled
      ? z.string().min(1, 'Enter your invite code')
      : z.string().optional(),
  })
  .refine(data => data.accountType !== 'Business' || !!data.businessName?.trim(), {
    message: 'Enter your business name',
    path: ['businessName'],
  })

type RegisterForm = z.infer<typeof registerSchema>


export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const oauthError = searchParams.get('error')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setResending] = useState(false)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      accountType: 'Individual',
      businessName: '',
      inviteCode: '',
    },
  })

  const { formState: { isSubmitting }, setError, control } = form
  const password = useWatch({ control, name: 'password' })
  const accountType = useWatch({ control, name: 'accountType' })

  useEffect(() => {
    if (cooldown === 0) return
    const timer = setInterval(() => {
      setCooldown(n => (n <= 1 ? 0 : n - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const onSubmit = async (values: RegisterForm) => {
    try {
      await registerAccount(values)
      setSubmittedEmail(values.email)
      setSubmitted(true)
      setCooldown(60)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const code = error.response?.data?.code
        const message = error.response?.data?.error

        if (code === 'INVALID_INVITE_CODE') {
          setError('inviteCode', { message: message ?? 'Invalid invite code.' })
        } else if (status === 409) {
          setError('email', {
            message: 'An account with that email already exists. Log in instead.',
          })
        } else {
          setError('root', { message: 'Something went wrong. Try again.' })
        }
      }
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await resendVerificationEmail(submittedEmail)
      setCooldown(60)
    } catch {
      toast.error('Could not resend. Try again.')
    } finally {
      setResending(false)
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
          <span className="text-lg font-semibold tracking-tight">JumpTax</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              {SLOGANS.filing}
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Track income and expenses year-round.<br />
              Get your S04 ready without an accountant.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Built on Jamaica's Income Tax Act",
              'Every figure calculated for you',
              'Free to get started',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div />
      </div>

      {/* Right panel — cream */}
      <div className="flex flex-col w-full md:w-1/2 min-h-screen bg-cream">
        {/* Mobile header */}
        <div className="flex items-center gap-2 px-6 pt-6 md:hidden">
          <LogoMark size="sm" />
          <span className="text-base font-semibold text-brand-400">JumpTax</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          {submitted ? (
            <SuccessState
              email={submittedEmail}
              cooldown={cooldown}
              isResending={isResending}
              onResend={handleResend}
            />
          ) : (
            <div className="w-full max-w-100 space-y-7">
              {isBetaInviteEnabled && (
                <div className="flex items-start gap-2.5 rounded-xl border-[0.5px] border-brand-100 bg-brand-50 px-4 py-3">
                  <FlaskConical className="size-4 text-brand-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-600 leading-relaxed">
                    JumpTax is currently in private beta. An invite code is required to register.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <h2 className="text-2xl font-medium text-gray-900">Create an account</h2>
                <p className="text-sm text-gray-600">Takes less than a minute.</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {/* First name / Last name — side by side on md+, stacked below */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            First name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className="bg-white border-[0.5px] border-gray-100 rounded-lg h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Last name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="bg-white border-[0.5px] border-gray-100 rounded-lg h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
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

                  {/* Invite code — beta only */}
                  {isBetaInviteEnabled && (
                    <FormField
                      control={form.control}
                      name="inviteCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Invite code
                          </FormLabel>
                          <div className="relative">
                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter your invite code"
                                className="pl-9 bg-white border-[0.5px] border-gray-100 rounded-lg h-11 uppercase tracking-widest"
                                {...field}
                                onChange={e => field.onChange(e.target.value.toUpperCase())}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Password
                        </FormLabel>
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
                        {password.length > 0 && (
                          <ul className="space-y-1 pt-1">
                            {[
                              { label: '8+ characters', met: password.length >= 8 },
                              { label: 'One number', met: /[0-9]/.test(password) },
                              { label: 'One special character', met: /[^a-zA-Z0-9]/.test(password) },
                            ].map(({ label, met }) => (
                              <li key={label} className="flex items-center gap-1.5">
                                {met ? (
                                  <CheckCircle2 className="size-3.5 text-success-400 shrink-0" />
                                ) : (
                                  <Circle className="size-3.5 text-gray-400 shrink-0" />
                                )}
                                <span className={`text-xs ${met ? 'text-success-600' : 'text-gray-600'}`}>
                                  {label}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account type toggle */}
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Account type
                        </FormLabel>
                        <AccountTypeToggle value={accountType} onChange={type => form.setValue('accountType', type)} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business name — animates in/out */}
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      accountType === 'Business' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Business name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe Creative Studio"
                              className="bg-white border-[0.5px] border-gray-100 rounded-lg h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.formState.errors.root && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.root.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-brand-400 hover:bg-brand-600 text-white rounded-lg font-medium gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </form>
              </Form>

              {isBetaInviteEnabled ? (
                <p className="text-center text-xs text-gray-400">
                  Google sign in is disabled during beta.
                </p>
              ) : (
                <>
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

                  {oauthError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {oauthErrorMessages[oauthError] ?? 'Something went wrong. Please try again.'}
                    </div>
                  )}
                </>
              )}

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-brand-400 hover:text-brand-600 font-medium transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SuccessState({
  email,
  cooldown,
  isResending,
  onResend,
}: {
  email: string
  cooldown: number
  isResending: boolean
  onResend: () => void
}) {
  return (
    <div className="w-full max-w-100 flex flex-col items-center text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
        <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-medium text-gray-900">Check your inbox</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We've sent a verification link to{' '}
          <span className="font-medium text-gray-900">{email}</span>
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Click the link to activate your account.
          <br />
          Check your spam folder if you don't see it.
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        disabled={cooldown > 0 || isResending}
        onClick={onResend}
        className="text-brand-400 hover:text-brand-600 hover:bg-brand-50 gap-2"
      >
        {isResending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Resending...
          </>
        ) : cooldown > 0 ? (
          `Resend email (${cooldown}s)`
        ) : (
          'Resend email'
        )}
      </Button>

      <p className="text-sm text-gray-600">
        Already verified?{' '}
        <Link
          to="/login"
          className="text-brand-400 hover:text-brand-600 font-medium transition-colors"
        >
          Log in
        </Link>
      </p>
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
