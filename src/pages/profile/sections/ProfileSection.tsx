import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import Skeleton from '@/components/ui/Skeleton'
import UserAvatar from '@/components/ui/UserAvatar'
import FormSection from '@/components/ui/FormSection'
import AccountTypeToggle from '@/components/account/AccountTypeToggle'
import WhatsAppStatusRow from '@/components/profile/WhatsAppStatusRow'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { logout } from '@/services/auth'
import { AccountType } from '@/lib/constants'
import type { User } from '@/types/auth'

const profileSchema = z
  .object({
    firstName: z.string().min(1, 'Enter your first name').max(100),
    lastName: z.string().min(1, 'Enter your last name').max(100),
    accountType: z.enum(['Individual', 'Business']),
    businessName: z.string().max(200).optional(),
    trn: z
      .string()
      .optional()
      .refine(val => !val || /^\d{3}-?\d{3}-?\d{3}$/.test(val), {
        message: 'Enter a valid TRN (e.g. 123-456-789)',
      }),
  })
  .refine(data => data.accountType !== 'Business' || !!data.businessName?.trim(), {
    message: 'Enter your business name',
    path: ['businessName'],
  })

type ProfileForm = z.infer<typeof profileSchema>

function getDefaultValues(profile: User): ProfileForm {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    accountType: profile.accountType ?? 'Individual',
    businessName: profile.businessName ?? '',
    trn: '', // never pre-fill TRN
  }
}

const inputClass = 'bg-white border-[0.5px] border-gray-100 rounded-lg h-11'
const labelClass = 'text-xs font-medium text-gray-600 uppercase tracking-wide'

export default function ProfileSection() {
  const { setUser } = useAuth()
  const { subscription } = useSubscription()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const navigate = useNavigate()
  const trnRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      accountType: 'Individual',
      businessName: '',
      trn: '',
    },
  })

  useEffect(() => {
    if (!profile) return
    form.reset(getDefaultValues(profile))
  }, [profile, form])

  const { control, handleSubmit, setValue, formState: { isSubmitting, isDirty } } = form
  const accountType = useWatch({ control, name: 'accountType' })

  const onSubmit = async (values: ProfileForm) => {
    try {
      const updated = await updateProfile.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        accountType: values.accountType === 'Individual' ? AccountType.Individual : AccountType.Business,
        businessName: values.accountType === 'Business' ? values.businessName : undefined,
        trn: values.trn ? values.trn.replace(/-/g, '') : undefined,
      })
      setUser(updated)
      toast.success('Profile updated.')
      form.reset({ ...values, trn: '' })
    } catch {
      toast.error('Something went wrong. Try again.')
    }
  }

  const handleDiscard = () => {
    if (!profile) return
    form.reset(getDefaultValues(profile))
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      setUser(null)
      navigate('/login')
    }
  }

  const handleAccountTypeChange = (type: 'Individual' | 'Business') => {
    setValue('accountType', type)
    if (type === 'Individual') setValue('businessName', '')
  }

  const focusTrn = () => {
    trnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    trnRef.current?.focus()
  }

  const loading = isLoading || !profile

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-5 border-b border-gray-50">
        <div>
          <p className="text-base font-medium text-gray-900">Profile information</p>
          <p className="text-xs text-gray-400 mt-0.5">Update your personal details and tax information.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={loading || !isDirty}
            className="h-8.5 px-3.5 rounded-lg border border-cream-border bg-white text-sm text-gray-600 disabled:opacity-60"
          >
            Discard
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={loading || isSubmitting || !isDirty}
            className="h-8.5 px-4 rounded-lg bg-brand-400 hover:bg-brand-600 text-white text-sm font-medium border-none flex items-center gap-1.5 disabled:opacity-60 transition-colors"
          >
            <i className="ti ti-device-floppy text-sm" aria-hidden="true" />
            Save changes
          </button>
        </div>
      </div>

      {/* Avatar */}
      {loading ? (
        <div className="flex items-center gap-4 px-7 py-6 border-b border-gray-50">
          <Skeleton className="w-17 h-17 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
            <Skeleton className="h-5 w-24 rounded-full mt-1" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 px-7 py-6 border-b border-gray-50">
          <UserAvatar firstName={profile.firstName} lastName={profile.lastName} className="w-17 h-17 text-2xl" />
          <div>
            <p className="text-base font-medium text-gray-900">{profile.firstName} {profile.lastName}</p>
            <p className="text-sm text-gray-400 mt-0.5">{profile.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                <i className={`ti ${profile.accountType === 'Business' ? 'ti-building-store' : 'ti-user'} text-xs text-gray-400`} aria-hidden="true" />
                {profile.accountType === 'Business' ? profile.businessName : 'Individual'}
              </div>
              <div
                className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                  subscription?.isPremium ? 'bg-brand-50 text-brand-600' : 'bg-gray-50 text-gray-600'
                }`}
              >
                <i className="ti ti-star text-xs" aria-hidden="true" />
                {subscription?.isPremium ? subscription.planName ?? 'Pro' : 'Free'}
              </div>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {loading ? (
            <div className="px-7 py-6 space-y-4">
              <Skeleton className="h-3 w-32 mb-2" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-11 rounded-lg" />
                <Skeleton className="h-11 rounded-lg" />
              </div>
              <Skeleton className="h-11 rounded-lg" />
              <Skeleton className="h-11 rounded-lg" />
            </div>
          ) : (
            <>
              <FormSection icon="ti-user" label="Personal information">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>First name</FormLabel>
                          <FormControl>
                            <Input className={inputClass} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Last name</FormLabel>
                          <FormControl>
                            <Input className={inputClass} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <label className={`${labelClass} block mb-2`}>Email</label>
                    <div className="relative">
                      <i className="ti ti-lock absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-400 pointer-events-none" aria-hidden="true" />
                      <Input
                        value={profile.email}
                        disabled
                        className={`pl-9 ${inputClass}`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </div>
              </FormSection>

              <FormSection icon="ti-building-store" label="Account type">
                <div className="space-y-4">
                  <FormField
                    control={control}
                    name="accountType"
                    render={() => (
                      <FormItem>
                        <AccountTypeToggle value={accountType} onChange={handleAccountTypeChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {accountType === 'Business' && (
                    <FormField
                      control={control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Business name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe Creative Studio" autoFocus className={inputClass} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </FormSection>

              <FormSection icon="ti-id-badge" label="Tax information">
                <FormField
                  control={control}
                  name="trn"
                  render={({ field: { ref, ...field } }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>TRN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123-456-789"
                          className={inputClass}
                          {...field}
                          ref={node => {
                            ref(node)
                            trnRef.current = node
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-400">
                        Required to pre-fill your S04 Annual Return. Never shared.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!profile.trnProvided && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-brand-50 border border-brand-100 rounded-lg mt-2.5">
                    <i className="ti ti-alert-circle text-brand-400 text-base shrink-0" aria-hidden="true" />
                    <span className="text-xs text-brand-600 flex-1">Your TRN is missing — add it to pre-fill your S04.</span>
                    <button
                      type="button"
                      onClick={focusTrn}
                      className="text-xs text-brand-400 font-medium bg-transparent border-none cursor-pointer whitespace-nowrap"
                    >
                      Add now →
                    </button>
                  </div>
                )}
              </FormSection>

              <FormSection icon="ti-brand-whatsapp" label="WhatsApp integration">
                <WhatsAppStatusRow verified={profile.whatsAppVerified} number={profile.whatsAppNumber} />
              </FormSection>

              <FormSection bordered={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Log out of TaxPayer</p>
                    <p className="text-xs text-gray-400 mt-0.5">You'll need to log back in to access your account.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="h-8.5 px-3.5 rounded-lg border border-brand-100 bg-white text-brand-400 text-xs font-medium flex items-center gap-1.5"
                  >
                    <i className="ti ti-logout text-sm" aria-hidden="true" />
                    Log out
                  </button>
                </div>
              </FormSection>
            </>
          )}
        </form>
      </Form>
    </>
  )
}
