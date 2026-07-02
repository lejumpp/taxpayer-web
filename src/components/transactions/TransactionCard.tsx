import type { Transaction } from '../../types/transaction'
import { formatJMD } from '../../lib/currency'
import { formatDateShort } from '../../lib/dates'
import { Badge } from '../ui/badge'

interface TransactionCardProps {
  transaction: Transaction
  onClick?: () => void
}

export default function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  return (
    <div className="flex cursor-pointer items-center justify-between py-3" onClick={onClick}>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-pine">{transaction.description}</span>
        <span className="text-xs text-gray-500">{formatDateShort(transaction.date)}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span
          className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-primary' : 'text-accent'}`}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatJMD(transaction.amountCents)}
        </span>
        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
          {transaction.type === 'income' ? 'Income' : 'Expense'}
        </Badge>
      </div>
    </div>
  )
}
