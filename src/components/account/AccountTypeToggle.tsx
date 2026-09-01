import type { ReactNode } from 'react'

interface AccountTypeToggleProps {
  value: 'Individual' | 'Business'
  onChange: (type: 'Individual' | 'Business') => void
  labels?: Record<'Individual' | 'Business', ReactNode>
}

export default function AccountTypeToggle({ value, onChange, labels }: AccountTypeToggleProps) {
  return (
    <div className="flex gap-2">
      {(['Individual', 'Business'] as const).map(type => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={
            value === type
              ? 'flex-1 rounded-lg border-2 border-brand-400 bg-brand-50 text-brand-600 py-2.5 text-sm font-medium transition-colors'
              : 'flex-1 rounded-lg border border-cream-border bg-white text-gray-600 py-2.5 text-sm transition-colors hover:bg-gray-50'
          }
        >
          {labels?.[type] ?? type}
        </button>
      ))}
    </div>
  )
}
