import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import FloatingBackground from './FloatingBackground.jsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/subscription', label: user?.role === 'admin' ? 'User' : 'Subscriptions', end: false },
    { to: '/total', label: 'Total', end: false },
  ]
  const visibleLinks = links.filter((link) => user?.role !== 'admin' || link.to !== '/total')

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
            {visibleLinks.map((link) => (
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
              <span className="session-label">
                {user.username} · {user.role}
              </span>
              <button type="button" className="button-quiet session-logout" onClick={logout}>
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

