import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { Eye, EyeOff, Save, Check, Circle, ExternalLink } from 'lucide-react'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { changePassword } from '@/services/auth'

const inputClass = 'bg-white border-[0.5px] border-gray-100 rounded-lg h-11'
const labelClass = 'text-xs font-medium text-gray-600 uppercase tracking-wide'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ChangePasswordForm = z.infer<typeof schema>

function CardShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-cream-border overflow-hidden">{children}</div>
  )
}

function GoogleAuthMessage() {
  return (
    <CardShell>
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-info-50 flex items-center justify-center mb-5">
          <GoogleIcon />
        </div>
        <p className="text-base font-medium text-gray-900 mb-2">Secured with Google</p>
        <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-[320px]">
          Your account is signed in through Google. To change your password, visit your Google
          account settings.
        </p>
        <a
          href="https://myaccount.google.com/security"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-info-600 hover:text-info-800 transition-colors"
        >
          Manage Google account
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </CardShell>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a special character', pass: /[^a-zA-Z0-9]/.test(password) },
  ]

  return (
    <div className="mt-2.5 flex flex-col gap-1.5">
      {checks.map(check => (
        <div key={check.label} className="flex items-center gap-1.5">
          {check.pass ? (
            <Check size={13} className="text-success-400 shrink-0" aria-hidden="true" />
          ) : (
            <Circle size={13} className="text-gray-100 shrink-0" aria-hidden="true" />
          )}
          <span className={`text-xs ${check.pass ? 'text-success-600' : 'text-gray-200'}`}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function PasswordField({
  label,
  error,
  autoComplete,
  register,
}: {
  label: string
  error?: string
  autoComplete: string
  register: UseFormRegisterReturn
}) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <label className={`${labelClass} block mb-2`}>{label}</label>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          className={`pr-10 ${inputClass}`}
          {...register}
        />
        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-brand-400 mt-1.5">{error}</p>}
    </div>
  )
}

function ChangePasswordFormCard({ onGoogleUserDetected }: { onGoogleUserDetected: () => void }) {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const { control, register, handleSubmit, setError, formState } = form
  const { errors, isSubmitting } = formState

  const newPassword = useWatch({ control, name: 'newPassword' })

  const onSubmit = async (values: ChangePasswordForm) => {
    try {
      await changePassword(values.currentPassword, values.newPassword, values.confirmPassword)
      toast.success('Password updated. Please log in again.')
      setUser(null)
      navigate('/login?reason=password_changed')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code = error.response?.data?.code
        const message: string | undefined = error.response?.data?.error

        if (code === 'GOOGLE_AUTH_USER') {
          onGoogleUserDetected()
          return
        }
        if (message?.toLowerCase().includes('current password')) {
          setError('currentPassword', { message })
          return
        }
        toast.error(message ?? 'Could not update password. Please try again.')
        return
      }
      toast.error('Could not update password. Please try again.')
    }
  }

  return (
    <CardShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 md:px-7 py-5 border-b border-gray-50">
        <div>
          <p className="text-base font-medium text-gray-900">Change password</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Choose a strong password you don't use elsewhere.
          </p>
        </div>
        <button
          type="submit"
          form="change-password-form"
          disabled={isSubmitting}
          className="h-8.5 px-4 rounded-lg bg-brand-400 hover:bg-brand-600 text-white text-sm font-medium border-none flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors shrink-0"
        >
          <Save size={14} aria-hidden="true" />
          Update password
        </button>
      </div>

      <Form {...form}>
        <form id="change-password-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="px-5 md:px-7 py-6 flex flex-col gap-5">
            <PasswordField
              label="Current password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              register={register('currentPassword')}
            />

            <div>
              <PasswordField
                label="New password"
                autoComplete="new-password"
                error={errors.newPassword?.message}
                register={register('newPassword')}
              />
              {newPassword && <PasswordStrength password={newPassword} />}
            </div>

            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </CardShell>
  )
}

export default function SecuritySection() {
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  if (isGoogleUser) return <GoogleAuthMessage />

  return <ChangePasswordFormCard onGoogleUserDetected={() => setIsGoogleUser(true)} />
}

function GoogleIcon() {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
