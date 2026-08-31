import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSubscription } from '../../context/SubscriptionContext'
import { logout } from '../../services/auth'
import { navItems } from '../../lib/nav'
import UserAvatar from '../ui/UserAvatar'
import BottomNav from './BottomNav'

export default function AppShell() {
  const { user, setUser } = useAuth()
  const { isPremium } = useSubscription()
  const navigate = useNavigate()

  const accountTypeLabel = user?.accountType === 'Individual' ? 'Individual' : 'Business'

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      setUser(null)
      navigate('/login')
    }
  }

  const mainItems = navItems.filter(item => item.section === 'main')
  const accountItems = navItems.filter(item => item.section === 'account')

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Side nav — desktop only */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-[#E8D9C0] fixed left-0 top-0 h-screen">
        {/* Logo — must be exactly 60px to align with header */}
        <div className="h-15 flex items-center px-5 border-b border-[#E8D9C0] shrink-0">
          <LogoMark />
          <span className="ml-2.5 text-base font-semibold text-[#2C2C2A]">TaxPayer</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <p className="px-2.5 pt-2.5 pb-1.25 text-xs font-medium uppercase tracking-[0.07em] text-gray-200">
            Main
          </p>
          {mainItems.map(item => (
            <NavLink
              key={item.path}
              to={item.pro && !isPremium ? '/upgrade' : item.path}
              end={item.path === '/tax'}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] bg-brand-50 text-brand-400 font-medium'
                  : 'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[#5F5E5A] hover:bg-gray-25 transition-colors'
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={isActive ? 'text-brand-400' : 'text-[#888780]'}
                    aria-hidden="true"
                  />
                  <span className="text-sm">{item.label}</span>
                  {item.pro && !isPremium && (
                    <span className="ml-auto text-xs font-medium bg-brand-50 text-brand-400 px-2 py-0.5 rounded-full border border-brand-100">
                      Pro
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          <p className="px-2.5 pt-2.5 pb-1.25 text-xs font-medium uppercase tracking-[0.07em] text-gray-200">
            Account
          </p>
          {accountItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] bg-brand-50 text-brand-400 font-medium'
                  : 'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[#5F5E5A] hover:bg-gray-25 transition-colors'
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={isActive ? 'text-brand-400' : 'text-[#888780]'}
                    aria-hidden="true"
                  />
                  <span className="text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="p-2.5 border-t border-[#E8D9C0]">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] bg-gray-25">
            <UserAvatar firstName={user?.firstName ?? ''} lastName={user?.lastName ?? ''} className="w-8.5 h-8.5 text-xs" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#2C2C2A] truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-[#888780]">{accountTypeLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="text-gray-200 hover:text-[#5F5E5A] transition-colors"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main column: header + page content */}
      <div className="flex flex-col flex-1 lg:ml-60 min-h-screen">
        {/* Top header — desktop only, must be exactly 60px to align with nav logo */}
        <header className="hidden lg:flex h-15 items-center px-6 bg-white border-b border-[#E8D9C0] sticky top-0 z-10 gap-4">
          <div className="ml-auto flex items-center gap-3">
            <UserAvatar firstName={user?.firstName ?? ''} lastName={user?.lastName ?? ''} className="w-9.5 h-9.5 text-xs cursor-pointer" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}

function LogoMark() {
  return (
    <div className="w-7 h-7 rounded-lg bg-brand-400 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <path d="M4 5h12M4 10h8M4 15h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}
