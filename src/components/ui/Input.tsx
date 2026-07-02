import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-pine">{label}</label>}
      <input
        className={`rounded-lg border px-3 py-2 text-pine placeholder-gray-400 focus:outline-none focus:border-primary ${error ? 'border-accent' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-accent">{error}</p>}
    </div>
  )
}
