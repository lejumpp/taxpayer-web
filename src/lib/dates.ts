export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return new Intl.DateTimeFormat('en-JM', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return new Intl.DateTimeFormat('en-JM', {
    day: 'numeric',
    month: 'short',
  }).format(d)
}

export function currentTaxYear(): number {
  return new Date().getFullYear()
}

// Converts a Date to YYYY-MM-DD in LOCAL time — never UTC
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Returns today's date as YYYY-MM-DD in LOCAL time — never UTC
export function todayLocal(): string {
  return toLocalDateString(new Date())
}
