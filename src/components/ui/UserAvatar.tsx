import { cn } from '@/lib/utils'

interface UserAvatarProps {
  firstName: string
  lastName: string
  className?: string
}

export default function UserAvatar({ firstName, lastName, className }: UserAvatarProps) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

  return (
    <div
      className={cn(
        'rounded-full bg-brand-400 flex items-center justify-center text-white font-medium shrink-0',
        className
      )}
    >
      {initials}
    </div>
  )
}
