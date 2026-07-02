import { type ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-t-2xl bg-white p-4 pb-8">
        {title && <h3 className="mb-4 text-lg font-semibold text-pine">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
