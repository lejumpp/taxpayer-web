export function formatJMD(cents: number): string {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function centsToNumber(cents: number): number {
  return cents / 100
}

export function numberToCents(value: number): number {
  return Math.round(value * 100)
}