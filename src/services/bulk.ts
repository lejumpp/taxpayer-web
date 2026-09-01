import client from './client'
import type { BulkImportPayload, BulkImportResponse } from '@/types/bulk'

export async function bulkImport(payload: BulkImportPayload): Promise<BulkImportResponse> {
  const { data } = await client.post('/api/v1/transactions/bulk', payload)
  return data
}
