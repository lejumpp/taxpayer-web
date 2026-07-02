import client from './client'
import type { User } from '../types/auth'

export async function getCurrentUser(): Promise<User> {
  const { data } = await client.get<User>('/auth/me')
  return data
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await client.post<User>('/auth/login', { email, password })
  return data
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout')
}

export async function register(payload: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<User> {
  const { data } = await client.post<User>('/auth/register', payload)
  return data
}

export async function verifyEmail(token: string): Promise<void> {
  await client.post('/auth/verify-email', { token })
}
