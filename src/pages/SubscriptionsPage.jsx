import { serviceColor } from '../data.js'
import { useSubscriptions } from '../context/SubscriptionsContext.jsx'
import { formatDate, formatPrice, remainingLabel } from '../subscription.js'

export default function SubscriptionsPage() {
  const { subscriptions } = useSubscriptions()

  return (
    <article className="page">
      <header className="page-header">
        <h1>Subscriptions</h1>
        <p className="lede">
          Every saved plan appears here with its price, start date, and time remaining.
        </p>
      </header>

      {subscriptions.length === 0 ? (
        <section className="surface stack" aria-label="Subscription list">
          <div className="row">
            <p className="empty-title">No subscriptions yet</p>
            <p className="empty-copy">Plans you add from Home will show up in this list.</p>
          </div>
        </section>
      ) : (
        <ul className="surface stack subscription-list" aria-label="Subscription list">
          {subscriptions.map((subscription) => (
            <li className="row subscription-row" key={subscription.id}>
              <span
                className="service-mark"
                style={{ background: serviceColor[subscription.serviceName] || 'var(--muted)' }}
                aria-hidden="true"
              />
              <div>
                <h2>
                  {subscription.serviceName}
                  <span className="plan-name"> {subscription.planName}</span>
                </h2>
                <p>
                  Started {formatDate(subscription.startDate)} · {subscription.durationMonths}{' '}
                  months · {remainingLabel(subscription.startDate, subscription.durationMonths)}
                </p>
              </div>
              <p className="subscription-price">
                {formatPrice(subscription.price, subscription.currency)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
