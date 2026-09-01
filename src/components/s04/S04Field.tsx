import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { formatJMD } from '@/lib/currency'
import InfoTooltip from '@/components/ui/InfoTooltip'

interface S04FieldProps {
  lineNumber?: string
  label: string
  valueCents?: number | null
  valueText?: string | null
  editable?: boolean
  hint?: string
  isSubtotal?: boolean
  isTotal?: boolean
}

export default function S04Field({
  lineNumber,
  label,
  valueCents,
  valueText,
  editable,
  hint,
  isSubtotal,
  isTotal,
}: S04FieldProps) {
  const isMonetary = valueCents !== undefined && valueCents !== null
  const [localValue, setLocalValue] = useState(valueText ?? '')
  const [copied, setCopied] = useState(false)

  const showInput = !isMonetary && editable && !valueText
  const displayValue = isMonetary ? formatJMD(valueCents) : (valueText ?? localValue)

  const handleCopy = async () => {
    const toCopy = isMonetary ? (valueCents / 100).toFixed(2) : (valueText ?? localValue)
    if (!toCopy) return
    await navigator.clipboard.writeText(toCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={`flex items-center gap-3 px-6 py-3 border-b border-gray-50 last:border-0 ${
        isTotal ? 'bg-brand-50' : isSubtotal ? 'bg-gray-25' : ''
      }`}
    >
      {lineNumber && (
        <span className="text-xs text-gray-200 w-8 shrink-0 font-mono">{lineNumber}</span>
      )}
      <span
        className={`flex-1 text-sm flex items-center gap-1.5 ${
          isTotal || isSubtotal ? 'font-medium text-gray-900' : 'text-gray-600'
        }`}
      >
        {label}
        {hint && <InfoTooltip content={hint} />}
      </span>

      {showInput ? (
        <input
          type="text"
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          placeholder="Enter value"
          className="w-40 text-right text-sm border border-cream-border rounded-lg px-3 py-1.5 outline-none focus:border-brand-400 transition-colors"
        />
      ) : (
        <span
          className={`text-sm font-medium tabular-nums text-right w-40 ${
            isTotal ? 'text-brand-600 text-base' : 'text-gray-900'
          }`}
        >
          {displayValue || '—'}
        </span>
      )}

      <div className="relative group shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!displayValue}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-cream-border bg-white text-gray-600 hover:text-brand-400 hover:border-brand-100 hover:bg-brand-50 transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-cream-border"
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        >
          {copied ? (
            <Check size={15} className="text-success-400" aria-hidden="true" />
          ) : (
            <Copy size={15} aria-hidden="true" />
          )}
        </button>
        {displayValue && (
          <div className="absolute right-0 bottom-full mb-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {copied ? 'Copied' : 'Copy to clipboard'}
          </div>
        )}
      </div>
    </div>
  )
}
