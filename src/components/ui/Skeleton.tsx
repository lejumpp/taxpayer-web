import { cn } from '@/lib/utils'

export default function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-gray-50 rounded animate-pulse', className)}
      {...props}
    />
  )
}
