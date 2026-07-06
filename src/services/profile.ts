import client from './client'
import type { User } from '@/types/auth'

export async function getProfile(): Promise<User> {
  const { data } = await client.get('/api/v1/profile')
  return data
}

export async function patchProfile(payload: Partial<{
  firstName: string
  lastName: string
  accountType: number
  businessName: string
  trn: string
  whatsAppNumber: string
}>): Promise<User> {
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== null && v !== undefined)
  )
  const { data } = await client.patch('/api/v1/profile', cleaned)
  return data
}
