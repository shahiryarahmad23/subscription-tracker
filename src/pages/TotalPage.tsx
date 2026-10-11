export default function TotalPage() {
  return (
    <article className="page">
      <header className="page-header">
        <p className="page-kicker">Spending</p>
        <h1>Total</h1>
        <p className="lede">
          Expense totals and currency conversion will live on this page.
        </p>
      </header>
      <section className="stat-grid" aria-label="Expense summary">
        <article className="card card-claude">
          <h2>Active plans</h2>
          <p className="stat">0</p>
        </article>
        <article className="card card-cursor">
          <h2>Monthly total</h2>
          <p className="stat">—</p>
        </article>
        <article className="card card-spotify">
          <h2>Converted total</h2>
          <p className="stat">—</p>
        </article>
      </section>
    </article>
  )
}
