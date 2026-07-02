export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-JM', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-JM', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

export function currentTaxYear(): number {
  return new Date().getFullYear()
}
