export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-JM', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('en-JM', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function currentTaxYear(): number {
  return new Date().getFullYear()
}
