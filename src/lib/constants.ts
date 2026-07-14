export const AccountType = {
  Individual: 1,
  Business: 2,
} as const

export type AccountTypeValue = typeof AccountType[keyof typeof AccountType]

export const AccountTypeLabel: Record<AccountTypeValue, string> = {
  [AccountType.Individual]: 'Individual',
  [AccountType.Business]: 'Business',
}

export const oauthErrorMessages: Record<string, string> = {
  google_denied: 'Google sign in was cancelled.',
  invalid_state: 'Sign in session expired. Please try again.',
  google_token_failed: 'Could not connect to Google. Please try again.',
  account_creation_failed: 'Could not create your account. Please try again or contact support.',
}
