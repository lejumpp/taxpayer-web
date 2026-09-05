import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
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
import { useAuth } from '@/context/AuthContext'
import { patchProfile } from '@/services/profile'
import { logout } from '@/services/auth'
import { AccountType } from '@/lib/constants'

const onboardingSchema = z
  .object({
    accountType: z.enum(['Individual', 'Business']),
    businessName: z.string().max(200).optional(),
  })
  .refine(data => data.accountType !== 'Business' || !!data.businessName?.trim(), {
    message: 'Enter your business name',
    path: ['businessName'],
  })

type OnboardingForm = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      accountType: 'Individual',
      businessName: '',
    },
  })

  const { formState: { isSubmitting }, setError, setValue } = form
  const accountType = useWatch({ control: form.control, name: 'accountType' })

  const onSubmit = async (values: OnboardingForm) => {
    try {
      const updated = await patchProfile({
        accountType: values.accountType === 'Individual'
          ? AccountType.Individual
          : AccountType.Business,
        businessName: values.accountType === 'Business' ? values.businessName : undefined,
      })
      setUser(updated)
      navigate('/dashboard')
    } catch {
      setError('root', { message: 'Something went wrong. Try again.' })
    }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAEEDA] p-4">
      <div className="w-full max-w-115 rounded-2xl border-[0.5px] border-cream-border bg-white p-8 space-y-6">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="text-base font-semibold text-brand-400">JumpTax</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-medium text-gray-900">One more thing</h1>
          <p className="text-sm text-gray-600">How do you file your taxes?</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="accountType"
              render={() => (
                <FormItem>
                  <AccountTypeToggle
                    value={accountType}
                    onChange={type => {
                      setValue('accountType', type)
                      if (type === 'Individual') setValue('businessName', '')
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {accountType === 'Business' && (
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
                        autoFocus
                        className="bg-white border-[0.5px] border-gray-100 rounded-lg h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </Form>

        <div>
          <p className="text-xs text-gray-400 text-center">
            Logged in as {user?.firstName} {user?.lastName}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-brand-600 underline mx-auto block mt-1"
          >
            Log out
          </button>
        </div>
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
