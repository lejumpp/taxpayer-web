export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  accountType: 1 | 2 | null
  businessName: string | null
  trnProvided: boolean
  whatsAppVerified: boolean
}
