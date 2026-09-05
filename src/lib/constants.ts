export const AccountType = {
  Individual: 1,
  Business: 2,
} as const

export type AccountTypeValue = typeof AccountType[keyof typeof AccountType]

export const AccountTypeLabel: Record<AccountTypeValue, string> = {
  [AccountType.Individual]: 'Individual',
  [AccountType.Business]: 'Business',
}

export const SLOGANS = {
  /** Register / filing flows */
  filing: 'Jump into filing. Land on done.',
  /** Login / general brand hero */
  oneJumpAhead: 'Your taxes, one jump ahead.',
  /** Upgrade / paid value prop */
  skipAccountant: 'Skip the accountant. Not the accuracy.',
} as const

export const PlanInterval = {
  Monthly: 'Monthly',
  Annual: 'Annual',
} as const

export type PlanIntervalValue = typeof PlanInterval[keyof typeof PlanInterval]

export const oauthErrorMessages: Record<string, string> = {
  google_denied: 'Google sign in was cancelled.',
  invalid_state: 'Sign in session expired. Please try again.',
  google_token_failed: 'Could not connect to Google. Please try again.',
  account_creation_failed: 'Could not create your account. Please try again or contact support.',
}
