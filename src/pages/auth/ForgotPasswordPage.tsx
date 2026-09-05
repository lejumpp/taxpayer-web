import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Mail, Loader2 } from 'lucide-react'
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
import { forgotPassword } from '@/services/auth'

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const { formState: { isSubmitting } } = form

  const onSubmit = async (values: ForgotForm) => {
    try {
      await forgotPassword(values.email)
    } catch {
      // Always show success — don't leak whether an email is registered
    }
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[0.5px] border-cream-border p-8 w-full max-w-[420px] space-y-6">
        <div className="flex items-center justify-center gap-2">
          <LogoMark />
          <span className="text-base font-semibold text-brand-400">JumpTax</span>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 text-center">
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
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">Check your inbox</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                If that email is registered, we've sent a reset link. Check your spam folder
                if you don't see it.
              </p>
            </div>
            <Link
              to="/login"
              className="text-sm text-brand-600 hover:text-brand-400 transition-colors"
            >
              Back to log in
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-2xl font-medium text-gray-900">Forgot your password?</h2>
              <p className="text-sm text-gray-600">
                Enter your email and we'll send you a reset link.
              </p>
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-brand-400 hover:bg-brand-600 text-white rounded-lg font-medium gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
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
