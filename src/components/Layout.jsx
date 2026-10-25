import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import FloatingBackground from './FloatingBackground.jsx'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/subscription', label: 'Subscriptions', end: false },
  { to: '/total', label: 'Total', end: false },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <FloatingBackground />
      <header className="site-header">
        <nav className="navbar" aria-label="Primary">
          <NavLink to="/" className="brand" end>
            <span className="brand-mark" aria-hidden="true">
              S
            </span>
            <span>Subscription Tracker</span>
          </NavLink>
          <ul className="nav-list">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {user && (
            <div className="session">
              <span className="avatar" aria-hidden="true">
                {user.username.slice(0, 1).toUpperCase()}
              </span>
              <span>
                {user.username} · {user.role}
              </span>
              <button type="button" className="button-quiet" onClick={logout}>
                Log out
              </button>
            </div>
          )}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

