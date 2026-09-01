import { NavLink } from 'react-router-dom'
import { navItems } from '../../lib/nav'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8D9C0] flex lg:hidden z-50">
      {navItems
        .filter(item => item.bottomNav)
        .map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/tax'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs ${
                isActive ? 'text-brand-400' : 'text-[#888780]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={isActive ? 'text-brand-400' : 'text-[#888780]'}
                  aria-hidden="true"
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
    </nav>
  )
}
