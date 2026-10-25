import { useState } from 'react'
import SubscriptionForm from '../components/SubscriptionForm.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSubscriptions } from '../context/SubscriptionsContext.jsx'
import { formatDate, formatPrice, remainingLabel } from '../subscription.js'

export default function SubscriptionsPage() {
  const { user } = useAuth()
  const { subscriptions, loading, error, editSubscription, removeSubscription } = useSubscriptions()
  const [editingId, setEditingId] = useState('')
  const [actionError, setActionError] = useState('')
  const editing = subscriptions.find((item) => item.id === editingId)

  async function remove(id) {
    setActionError('')
    try {
      await removeSubscription(id)
      if (editingId === id) setEditingId('')
    } catch (requestError) {
      setActionError(requestError.message || 'Could not delete the subscription.')
    }
  }

  if (!user) {
    return (
      <article className="page">
        <header className="page-header">
          <h1>Subscriptions</h1>
          <p className="lede">Log in to see your subscriptions.</p>
        </header>
      </article>
    )
  }

  return (
    <article className="page">
      <header className="page-header">
        <h1>Subscriptions</h1>
        <p className="lede">
          Every saved plan appears here with its price, start date, and time remaining.
        </p>
      </header>

      {loading && <p>Loading subscriptions…</p>}
      {error && <p className="field-error">{error}</p>}
      {actionError && <p className="field-error">{actionError}</p>}

      {editing && (
        <SubscriptionForm
          key={editing.id}
          initialForm={{
            serviceName: editing.serviceName,
            planName: editing.planName,
            price: String(editing.price),
            currency: editing.currency,
            startDate: editing.startDate,
            duration: String(editing.durationMonths),
          }}
          submitLabel="Save changes"
          onSubmit={async (form) => {
            await editSubscription(editing.id, form)
            setEditingId('')
          }}
          onCancel={() => setEditingId('')}
          onEdit={() => setActionError('')}
        />
      )}

      {!loading && subscriptions.length === 0 && (
        <section className="surface stack" aria-label="Subscription list">
          <div className="row">
            <p className="empty-title">No subscriptions yet</p>
            <p className="empty-copy">Plans you add from Home will show up in this list.</p>
          </div>
        </section>
      )}

      {subscriptions.length > 0 && (
        <ul className="surface stack subscription-list" aria-label="Subscription list">
          {subscriptions.map((subscription) => {
            const owned = subscription.userId === user.id
            const remaining = remainingLabel(subscription.startDate, subscription.durationMonths)
            const daysMatch = remaining.match(/^(\d+) days left$/)
            const needsAttention =
              remaining === 'Ended' ||
              remaining === 'Ends today' ||
              remaining === '1 day left' ||
              (daysMatch !== null && Number(daysMatch[1]) <= 7)
            const durationLabel =
              subscription.durationMonths === 1
                ? '1 month'
                : subscription.durationMonths + ' months'
            return (
              <li className="row subscription-row" key={subscription.id}>
                <div>
                  <div className="title-line">
                    <span
                      className={needsAttention ? 'status-dot is-attention' : 'status-dot'}
                      aria-hidden="true"
                    />
                    <h2>{subscription.serviceName}</h2>
                    <span className="plan-badge">{subscription.planName}</span>
                  </div>
                  <p className="item-meta">
                    Started {formatDate(subscription.startDate)} · {durationLabel} · {remaining}
                  </p>
                  {user.role === 'admin' && <p className="item-meta">Owner: {subscription.ownerName}</p>}
                </div>
                <div className="subscription-actions">
                  <p className="subscription-price">
                    {formatPrice(subscription.price, subscription.currency)}
                  </p>
                  {owned && (
                    <div className="form-actions">
                      <button type="button" onClick={() => setEditingId(subscription.id)}>
                        Edit
                      </button>
                      <button type="button" className="button-quiet" onClick={() => remove(subscription.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
