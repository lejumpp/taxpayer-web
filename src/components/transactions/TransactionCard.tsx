import { Briefcase, Receipt, FileUp } from 'lucide-react'
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

  const iconBg = isCsvImport
    ? 'bg-[#E6F1FB]'
    : isIncome
    ? 'bg-[#E1F5EE]'
    : 'bg-[#FDF2EC]'

  const IconComponent = isCsvImport ? FileUp : isIncome ? Briefcase : Receipt
  const iconColor = isCsvImport ? 'text-[#185FA5]' : isIncome ? 'text-[#0F6E56]' : 'text-[#993C1D]'

  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F9F8F5] cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <IconComponent size={17} className={iconColor} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#2C2C2A] truncate">{transaction.description}</p>
        <p className="text-[11px] text-[#888780]">
          {isCsvImport ? 'CSV import' : 'Manual entry'} · {formatDate(transaction.transactionDate)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[13px] font-semibold tabular ${isIncome ? 'text-[#0F6E56]' : 'text-[#2C2C2A]'}`}>
          {isIncome ? '+' : '−'}{formatJMD(transaction.amountCents)}
        </span>
        <span className="text-[11px] text-[#888780] bg-[#F1EFE8] px-2 py-0.5 rounded-full">
          {transaction.categoryDisplayName}
        </span>
      </div>
    </div>
  )
}
