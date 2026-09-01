/** Formats a WhatsApp-linked phone number for display, e.g. "18761234567" → "+1 876 123 4567". */
export function formatWhatsAppNumber(number: string | null): string {
  if (!number) return ''
  const digits = number.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  return `+${digits}`
}
