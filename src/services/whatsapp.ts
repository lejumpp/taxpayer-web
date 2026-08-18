import client from './client'
import type { WhatsAppStatus } from '@/types/whatsapp'

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  const { data } = await client.get<WhatsAppStatus>('/api/v1/whatsapp/status')
  return data
}

export async function linkWhatsApp(phoneNumber: string): Promise<void> {
  await client.post('/api/v1/whatsapp/link', { phoneNumber })
}

export async function verifyWhatsApp(code: string): Promise<void> {
  await client.post('/api/v1/whatsapp/verify', { code })
}

export async function unlinkWhatsApp(): Promise<void> {
  await client.delete('/api/v1/whatsapp/unlink')
}
