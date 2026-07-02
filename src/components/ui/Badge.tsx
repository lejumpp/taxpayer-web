interface BadgeProps {
  label: string
  variant?: 'green' | 'red' | 'gray'
}

export default function Badge({ label, variant = 'gray' }: BadgeProps) {
  const variants = {
    green: 'bg-primary/10 text-primary',
    red: 'bg-accent/10 text-accent',
    gray: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}
