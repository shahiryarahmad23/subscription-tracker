export default function SubscriptionsPage() {
  return (
    <article className="page">
      <header className="page-header">
        <p className="page-kicker">Library</p>
        <h1>Subscriptions</h1>
        <p className="lede">
          Every saved plan will appear here with its details, remaining time,
          and actions to unsubscribe or delete.
        </p>
      </header>
      <section className="panel" aria-label="Subscription list">
        <p className="empty-title">No subscriptions yet</p>
        <p className="empty-copy">
          Plans you add from Home will show up in this list.
        </p>
      </section>
    </article>
  )
}
