export default function HomePage() {
  return (
    <article className="page">
      <header className="page-header">
        <p className="page-kicker">Dashboard</p>
        <h1>Home</h1>
        <p className="lede">
          Add the services you pay for and keep every plan in one place.
        </p>
      </header>
      <section className="card-grid" aria-label="What you can do">
        <article className="card card-spotify">
          <h2>Add a subscription</h2>
          <p>Service, plan, price, currency, start date, and duration.</p>
        </article>
        <article className="card card-hbo">
          <h2>See what is active</h2>
          <p>Review details and how much time is left on each plan.</p>
        </article>
        <article className="card card-netflix">
          <h2>Check the total</h2>
          <p>Compare spending and convert currencies in one view.</p>
        </article>
      </section>
    </article>
  )
}
