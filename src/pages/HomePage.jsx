import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthForms from '../components/AuthForms.jsx'
import AdminAccounts from '../components/AdminAccounts.jsx'
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
  const { user, notice, login, register } = useAuth()
  const { subscriptions, loading, addSubscription } = useSubscriptions()
  const [formOpen, setFormOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  const recent = recentSubscriptions(subscriptions)

  return (
    <article className="page">
      <header className="page-header">
        <h1>Welcome</h1>
        <p className="lede">
          {user?.role === 'admin'
            ? 'A snapshot of the accounts registered in Subscription Tracker.'
            : user
              ? 'Add a subscription to your account. It will show up on Subscriptions and Total.'
              : 'Log in to add subscriptions and see your spending.'}
        </p>
      </header>

      {!user && <AuthForms notice={notice} onLogin={login} onRegister={register} />}

      {user && user.role !== 'admin' && saved && <p className="success">Subscription added.</p>}

      {user && user.role !== 'admin' &&
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

      {user && user.role !== 'admin' && (
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

      {user?.role === 'admin' && <AdminAccounts summaryOnly />}
    </article>
  )
}
