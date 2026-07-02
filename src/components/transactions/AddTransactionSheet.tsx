import { useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useCreateTransaction } from '../../hooks/useTransactions'

interface AddTransactionSheetProps {
  open: boolean
  onClose: () => void
}

export default function AddTransactionSheet({ open, onClose }: AddTransactionSheetProps) {
  const [type, setType] = useState<'income' | 'expense'>('income')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const { mutate, isPending } = useCreateTransaction()

  function handleSubmit() {
    mutate(
      {
        type,
        amountCents: Math.round(parseFloat(amount) * 100),
        description,
        category: type,
        date,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Transaction">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button
            variant={type === 'income' ? 'primary' : 'secondary'}
            onClick={() => setType('income')}
            className="flex-1"
          >
            Income
          </Button>
          <Button
            variant={type === 'expense' ? 'primary' : 'secondary'}
            onClick={() => setType('expense')}
            className="flex-1"
          >
            Expense
          </Button>
        </div>
        <Input
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <Input
          label="Amount (J$)"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={isPending || !description || !amount}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </BottomSheet>
  )
}
