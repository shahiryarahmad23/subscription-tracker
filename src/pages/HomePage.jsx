import { useState } from 'react'
import SubscriptionForm from '../components/SubscriptionForm.jsx'
import { useSubscriptions } from '../context/SubscriptionsContext.jsx'

export default function HomePage() {
  const { addSubscription } = useSubscriptions()
  const [formOpen, setFormOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <article className="page">
      <header className="page-header">
        <h1>Welcome</h1>
        <p className="lede">
          Add the services you pay for. They stay in this browser and show up on
          Subscriptions and Total.
        </p>
      </header>

      {saved && <p className="success">Subscription added.</p>}

      {formOpen ? (
        <SubscriptionForm
          onSubmit={(subscription) => {
            addSubscription(subscription)
            setSaved(true)
          }}
          onCancel={() => setFormOpen(false)}
          onEdit={() => setSaved(false)}
        />
      ) : (
        <button type="button" onClick={() => setFormOpen(true)}>
          Add Subscription
        </button>
      )}
    </article>
  )
}
