export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amountCents: number
  description: string
  category: string
  date: string
  createdAt: string
}

export interface CreateTransactionPayload {
  type: 'income' | 'expense'
  amountCents: number
  description: string
  category: string
  date: string
}
