import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/subscription', label: 'Subscriptions', end: false },
  { to: '/total', label: 'Total', end: false },
]

export default function Layout() {
  return (
    <div className="app-shell">
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
                  className={({ isActive }) =>
                    isActive ? 'nav-link is-active' : 'nav-link'
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
