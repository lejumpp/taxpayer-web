import client from './client'
import type { S04Response } from '@/types/s04'

export async function getS04(year: number): Promise<S04Response> {
  const { data } = await client.get<S04Response>(`/api/v1/s04/${year}`)
  return data
}
