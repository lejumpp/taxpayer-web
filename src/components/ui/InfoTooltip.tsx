interface InfoTooltipProps {
  content: string
}

export default function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <div className="relative group">
      <i className="ti ti-info-circle text-sm text-[#D3D1C7] group-hover:text-[#888780] cursor-pointer transition-colors" aria-hidden="true" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-[#2C2C2A] text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed">
        {content}
        <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-[#2C2C2A]" />
      </div>
    </div>
  )
}
