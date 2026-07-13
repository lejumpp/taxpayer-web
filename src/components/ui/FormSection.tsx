import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  icon?: string
  label?: string
  bordered?: boolean
  children: ReactNode
}

export default function FormSection({ icon, label, bordered = true, children }: FormSectionProps) {
  return (
    <div className={cn('px-7 py-6', bordered && 'border-b border-gray-50')}>
      {icon && label && (
        <div className="flex items-center gap-2 mb-5">
          <i className={`ti ${icon} text-[17px] text-brand-400`} aria-hidden="true" />
          <span className="text-[14px] font-medium text-gray-900">{label}</span>
        </div>
      )}
      {children}
    </div>
  )
}
