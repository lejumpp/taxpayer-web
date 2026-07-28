import client from './client'
import type { SubscriptionInfo, Plan } from '@/types/payments'

export async function getSubscription(): Promise<SubscriptionInfo> {
  const { data } = await client.get<SubscriptionInfo>('/api/v1/payments/subscription')
  return data
}

export async function getPlans(): Promise<Plan[]> {
  const { data } = await client.get<Plan[]>('/api/v1/payments/plans')
  return data
}

export async function createCheckout(planId: string): Promise<{ checkoutUrl: string }> {
  const { data } = await client.post('/api/v1/payments/checkout', { planId })
  return data
}

export async function cancelSubscription(): Promise<void> {
  await client.post('/api/v1/payments/cancel')
}

export async function mockActivate(userId: string, planId: string): Promise<void> {
  await client.post('/api/v1/payments/mock-activate', { userId, planId })
}
