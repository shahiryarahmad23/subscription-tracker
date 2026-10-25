import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, listUsers } from '../api.js'
import AuthForms from '../components/AuthForms.jsx'
import SubscriptionForm from '../components/SubscriptionForm.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSubscriptions } from '../context/SubscriptionsContext.jsx'
import { formatDate, formatPrice } from '../subscription.js'

function recentSubscriptions(subscriptions) {
  return [...subscriptions]
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime()
      const rightTime = new Date(right.createdAt).getTime()
      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0
      return rightTime - leftTime
    })
    .slice(0, 3)
}

export default function HomePage() {
  const { user, notice, accessToken, login, register, expireSession } = useAuth()
  const { subscriptions, loading, addSubscription } = useSubscriptions()
  const [formOpen, setFormOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [users, setUsers] = useState([])
  const [usersError, setUsersError] = useState('')

  const recent = recentSubscriptions(subscriptions)

  useEffect(() => {
    if (user?.role !== 'admin' || !accessToken) return
    let ignore = false
    listUsers(accessToken)
      .then((items) => {
        if (ignore) return
        setUsers(items)
        setUsersError('')
      })
      .catch((error) => {
        if (ignore) return
        if (error instanceof ApiError && error.status === 401) {
          expireSession()
          return
        }
        if (error instanceof ApiError && error.status === 404) {
          setUsers([])
          setUsersError('')
          return
        }
        setUsersError(error.message || 'Could not load accounts.')
      })
    return () => {
      ignore = true
    }
  }, [user, accessToken, expireSession])

  return (
    <article className="page">
      <header className="page-header">
        <h1>Welcome</h1>
        <p className="lede">
          {user
            ? 'Add a subscription to your account. It will show up on Subscriptions and Total.'
            : 'Log in to add subscriptions and see your spending.'}
        </p>
      </header>

      {!user && <AuthForms notice={notice} onLogin={login} onRegister={register} />}

      {user && saved && <p className="success">Subscription added.</p>}

      {user &&
        (formOpen ? (
          <SubscriptionForm
            onSubmit={async (form) => {
              await addSubscription(form)
              setSaved(true)
            }}
            onCancel={() => setFormOpen(false)}
            onEdit={() => setSaved(false)}
          />
        ) : (
          <button type="button" onClick={() => setFormOpen(true)}>
            Add Subscription
          </button>
        ))}

      {user && (
        <section className="recent-section" aria-label="Recent subscriptions">
          {loading && <p>Loading subscriptions…</p>}
          {!loading && recent.length > 0 && (
            <>
              <ul className="recent-list">
                {recent.map((subscription) => (
                  <li className="recent-card" key={subscription.id}>
                    <h2>{subscription.serviceName}</h2>
                    <p className="plan-badge">{subscription.planName}</p>
                    <p className="recent-price">
                      {formatPrice(subscription.price, subscription.currency)}
                    </p>
                    <p className="item-meta">Started {formatDate(subscription.startDate)}</p>
                  </li>
                ))}
              </ul>
              <Link className="more-link" to="/subscription">
                More
              </Link>
            </>
          )}
        </section>
      )}

      {user?.role === 'admin' && (
        <section className="surface stack section-gap" aria-label="Accounts">
          <div className="row">
            <h2>Accounts</h2>
            {usersError && <p className="field-error">{usersError}</p>}
            {users.length === 0 && !usersError && <p>No accounts to show.</p>}
          </div>
          {users.map((account) => (
            <div className="row" key={account.id}>
              <h2>{account.username}</h2>
              <p>
                {account.email} · {account.role}
              </p>
            </div>
          ))}
        </section>
      )}
    </article>
  )
}
