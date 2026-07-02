import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Home' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/tax', label: 'Tax' },
  { to: '/profile', label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <div className="flex justify-around py-2">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center px-4 py-1 text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
