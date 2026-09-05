import type { ReactNode } from 'react'
import { User, Building2 } from 'lucide-react'

interface AccountTypeToggleProps {
  value: 'Individual' | 'Business'
  onChange: (type: 'Individual' | 'Business') => void
  labels?: Record<'Individual' | 'Business', ReactNode>
}

const icons = {
  Individual: User,
  Business: Building2,
} as const

export default function AccountTypeToggle({ value, onChange, labels }: AccountTypeToggleProps) {
  return (
    <div className="flex gap-2">
      {(['Individual', 'Business'] as const).map(type => {
        const Icon = icons[type]
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={
              value === type
                ? 'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-brand-400 bg-brand-50 text-brand-600 py-2.5 text-sm font-medium transition-colors'
                : 'flex flex-1 items-center justify-center gap-2 rounded-lg border border-cream-border bg-white text-gray-600 py-2.5 text-sm transition-colors hover:bg-gray-50'
            }
          >
            <Icon size={16} aria-hidden="true" />
            {labels?.[type] ?? type}
          </button>
        )
      })}
    </div>
  )
}
