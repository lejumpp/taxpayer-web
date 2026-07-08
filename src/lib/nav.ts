import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  FileText,
  User,
  MessageCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  section: 'main' | 'account'
  pro?: boolean
  bottomNav?: boolean
}

export const navItems: NavItem[] = [
  { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, section: 'main',    bottomNav: true },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight,  section: 'main',    bottomNav: true },
  { path: '/tax',          label: 'Tax',          icon: Receipt,         section: 'main',    bottomNav: true },
  { path: '/tax/s04',      label: 'S04',          icon: FileText,        section: 'main',    pro: true },
  { path: '/profile',      label: 'Profile',      icon: User,            section: 'account', bottomNav: true },
  { path: '/whatsapp',     label: 'WhatsApp',     icon: MessageCircle,   section: 'account' },
]
