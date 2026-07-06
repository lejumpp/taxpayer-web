export const AccountType = {
  Individual: 1,
  Business: 2,
} as const

export type AccountTypeValue = typeof AccountType[keyof typeof AccountType]

export const AccountTypeLabel: Record<AccountTypeValue, string> = {
  [AccountType.Individual]: 'Individual',
  [AccountType.Business]: 'Business',
}
