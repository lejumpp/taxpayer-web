import client from './client'
import type { User } from '../types/auth'

export async function getCurrentUser(): Promise<User> {
  const { data } = await client.get<User>('/api/v1/auth/me')
  return data
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await client.post<{ user: User }>('/api/v1/auth/login', { email, password })
  return data.user
}

export async function logout(): Promise<void> {
  await client.post('/api/v1/auth/logout')
}

export async function register(payload: {
  firstName: string
  lastName: string
  email: string
  password: string
  accountType: 'Individual' | 'Business'
  businessName?: string
}): Promise<void> {
  await client.post('/api/v1/auth/register', payload)
}

export async function resendVerificationEmail(email: string): Promise<void> {
  await client.post('/api/v1/auth/resend-verification', { email })
}

export async function verifyEmail(userId: string, token: string): Promise<void> {
  await client.post('/api/v1/auth/verify-email', { userId, token })
}

export async function resendVerification(): Promise<void> {
  await client.post('/api/v1/auth/resend-verification')
}

export async function forgotPassword(email: string): Promise<void> {
  await client.post('/api/v1/auth/forgot-password', { email })
}

export async function resetPassword(
  userId: string,
  token: string,
  newPassword: string,
): Promise<void> {
  await client.post('/api/v1/auth/reset-password', { userId, token, newPassword })
}
