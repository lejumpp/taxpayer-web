export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  accountType: 'Individual' | 'Business' | null
  businessName: string | null
  trnProvided: boolean
  whatsAppVerified: boolean
}
