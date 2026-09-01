export interface Profile {
  id: string
  email: string
  firstName: string
  lastName: string
  accountType: 'Individual' | 'Business' | null
  businessName: string | null
  trn: string | null
  trnProvided: boolean
  whatsAppNumber: string | null
  whatsAppVerified: boolean
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  businessName?: string
}
