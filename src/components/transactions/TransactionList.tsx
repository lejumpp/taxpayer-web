import { useNavigate } from 'react-router-dom'
import type { Transaction } from '../../types/transaction'
import TransactionCard from './TransactionCard'

interface TransactionListProps {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const navigate = useNavigate()

  if (transactions.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No transactions yet.</p>
  }

  return (
    <div className="divide-y divide-gray-100">
      {transactions.map(tx => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          onClick={() => navigate(`/transactions/${tx.id}`)}
        />
      ))}
    </div>
  )
}
