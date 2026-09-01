import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle, Circle } from 'lucide-react'
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
import { resetPassword } from '@/services/auth'

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[0-9]/, 'Must include at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Must include at least one special character'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetForm = z.infer<typeof resetSchema>
type Status = 'idle' | 'success' | 'expired'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId')
  const token = searchParams.get('token')

  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const { formState: { isSubmitting }, setError } = form
  const newPassword = useWatch({ control: form.control, name: 'newPassword' }) ?? ''

  const onSubmit = async (values: ResetForm) => {
    if (!userId || !token) return

    try {
      await resetPassword(userId, decodeURIComponent(token), values.newPassword)
      setStatus('success')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setStatus('expired')
        } else {
          setError('root', { message: 'Something went wrong. Try again.' })
        }
      }
    }
  }

  const requirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'At least one number', met: /[0-9]/.test(newPassword) },
    { label: 'At least one special character', met: /[^a-zA-Z0-9]/.test(newPassword) },
  ]

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-[0.5px] border-cream-border p-8 w-full max-w-105 space-y-6">
        <div className="flex items-center justify-center gap-2">
          <LogoMark />
          <span className="text-base font-semibold text-brand-400">TaxPayer</span>
        </div>

        {/* Missing params */}
        {(!userId || !token) && (
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="size-8 text-brand-600" />
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">Invalid link</h2>
              <p className="text-sm text-gray-600">
                This link is incomplete or has already been used. Request a new one.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-brand-600 hover:text-brand-400 transition-colors"
            >
              Request new link
            </Link>
          </div>
        )}

        {/* Expired token */}
        {userId && token && status === 'expired' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="size-8 text-brand-600" />
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">That link has expired</h2>
              <p className="text-sm text-gray-600">
                Reset links expire after 1 hour. Request a new one.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-brand-600 hover:text-brand-400 transition-colors"
            >
              Request new link
            </Link>
          </div>
        )}

        {/* Success */}
        {userId && token && status === 'success' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="size-8 text-success-400" />
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">Password reset</h2>
              <p className="text-sm text-gray-600">
                Your password has been updated. Log in with your new password.
              </p>
            </div>
            <Button
              asChild
              className="w-full h-11 bg-brand-400 hover:bg-brand-600 text-white rounded-lg font-medium"
            >
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        )}

        {/* Form */}
        {userId && token && status === 'idle' && (
          <>
            <div className="space-y-1">
              <h2 className="text-2xl font-medium text-gray-900">Reset your password</h2>
              <p className="text-sm text-gray-600">Enter a new password below.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        New password
                      </FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                        <FormControl>
                          <Input
                            type={showNew ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pl-9 pr-10 bg-white border-[0.5px] border-gray-100 rounded-lg h-11"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          aria-label={showNew ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowNew(v => !v)}
                        >
                          {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {newPassword.length > 0 && (
                        <ul className="space-y-1 pt-1">
                          {requirements.map(({ label, met }) => (
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Confirm password
                      </FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                        <FormControl>
                          <Input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pl-9 pr-10 bg-white border-[0.5px] border-gray-100 rounded-lg h-11"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowConfirm(v => !v)}
                        >
                          {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-brand-400 hover:bg-brand-600 text-white rounded-lg font-medium gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-center text-sm">
              <Link
                to="/login"
                className="text-brand-600 hover:text-brand-400 transition-colors"
              >
                Back to log in
              </Link>
            </p>
          </>
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
