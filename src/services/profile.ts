import client from './client'
import type { Profile, UpdateProfilePayload } from '../types/profile'

export async function getProfile(): Promise<Profile> {
  const { data } = await client.get<Profile>('/profile')
  return data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  const { data } = await client.patch<Profile>('/profile', payload)
  return data
}

export async function setAccountType(
  accountType: 'Individual' | 'Business',
  businessName?: string,
): Promise<Profile> {
  const { data } = await client.patch<Profile>('/profile/account-type', { accountType, businessName })
  return data
}
