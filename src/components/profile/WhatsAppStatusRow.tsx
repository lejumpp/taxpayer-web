interface WhatsAppStatusRowProps {
  verified: boolean
  number: string | null
}

export default function WhatsAppStatusRow({ verified, number }: WhatsAppStatusRowProps) {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 bg-gray-25 rounded-[10px]">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-info-50 flex items-center justify-center">
          <i className="ti ti-brand-whatsapp text-info-600 text-lg" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {verified ? number : 'Not connected'}
          </p>
          <p className="text-xs text-gray-400">
            {verified
              ? 'Transactions can be logged via WhatsApp.'
              : 'Connect to log transactions via WhatsApp message or photo.'
            }
          </p>
        </div>
      </div>
      {verified ? (
        // Stub — wire up in WHATSAPP-001
        <button type="button" className="text-xs text-brand-400 bg-transparent border-none cursor-pointer font-medium">
          Unlink
        </button>
      ) : (
        // Stub — wire up in WHATSAPP-001
        <button
          type="button"
          className="h-8 px-3.5 rounded-lg border border-info-100 bg-info-50 text-info-600 text-xs font-medium flex items-center gap-1.5"
        >
          <i className="ti ti-plug-connected text-sm" aria-hidden="true" />
          Connect
        </button>
      )}
    </div>
  )
}
