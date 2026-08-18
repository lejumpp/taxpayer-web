import { ArrowUp, ArrowDown, FileUp, MessageCircle } from 'lucide-react'
import type { Transaction } from '@/types/transaction'
import { formatJMD } from '@/lib/currency'
import { formatDate } from '@/lib/dates'

interface TransactionCardProps {
  transaction: Transaction
  onClick?: () => void
}

export default function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const isIncome = transaction.type === 'Income'
  const isCsvImport = transaction.source === 'CsvImport'
  const isWhatsApp = transaction.source === 'WhatsApp'
  const isAutomated = isCsvImport || isWhatsApp

  const iconBg = isAutomated ? 'bg-info-50' : isIncome ? 'bg-success-50' : 'bg-brand-50'
  const iconColor = isAutomated ? 'text-info-600' : isIncome ? 'text-success-600' : 'text-brand-600'
  const IconComponent = isCsvImport ? FileUp : isWhatsApp ? MessageCircle : isIncome ? ArrowUp : ArrowDown

  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-25 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}>
        <IconComponent size={16} className={iconColor} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{transaction.description}</p>
        <p className="text-xs text-gray-400">
          {isCsvImport ? 'CSV import' : isWhatsApp ? 'WhatsApp' : 'Manual entry'} · {formatDate(transaction.transactionDate)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-sm font-semibold tabular ${isIncome ? 'text-success-600' : 'text-gray-900'}`}>
          {isIncome ? '+' : '−'}{formatJMD(transaction.amountCents)}
        </span>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
          {transaction.categoryDisplayName}
        </span>
      </div>
    </div>
  )
}
