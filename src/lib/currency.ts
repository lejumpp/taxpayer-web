export function formatJMD(cents: number): string {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function centsToDisplay(cents: number): string {
  return (cents / 100).toLocaleString('en-JM')
}