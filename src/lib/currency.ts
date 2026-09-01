export function formatJMD(cents: number): string {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

/** Splits a formatted amount into the whole part and the trailing `.NN`, so the
 * decimals can be de-emphasized in large figures (e.g. hero stat tiles). */
export function formatJMDParts(cents: number): { whole: string; decimal: string } {
  const formatted = formatJMD(cents)
  const dotIndex = formatted.lastIndexOf('.')
  if (dotIndex === -1) return { whole: formatted, decimal: '' }
  return { whole: formatted.slice(0, dotIndex), decimal: formatted.slice(dotIndex) }
}

/** Whole-dollar amount with no cents — for compact list rows (e.g. expense breakdown bars). */
export function formatJMDWhole(cents: number): string {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatJMDCompact(cents: number): string {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function centsToNumber(cents: number): number {
  return cents / 100
}

export function numberToCents(value: number): number {
  return Math.round(value * 100)
}