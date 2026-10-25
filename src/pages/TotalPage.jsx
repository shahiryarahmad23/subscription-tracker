import { useEffect, useState } from 'react'
import { CURRENCIES } from '../data.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSubscriptions } from '../context/SubscriptionsContext.jsx'
import { convertTotals, formatDate, formatPrice, totalsByCurrency } from '../subscription.js'

export default function TotalPage() {
  const { user } = useAuth()
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions()
  const [target, setTarget] = useState('USD')
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState('idle')
  const [amount, setAmount] = useState(0)
  const [rateDate, setRateDate] = useState('')
  const [unconverted, setUnconverted] = useState([])
  const [error, setError] = useState('')

  const totals = totalsByCurrency(subscriptions)
  const needsConversion = totals.some((item) => item.currency !== target)

  useEffect(() => {
    const currentTotals = totalsByCurrency(subscriptions)
    const shouldConvert = currentTotals.some((item) => item.currency !== target)
    if (!shouldConvert) return

    let ignore = false

    fetch('https://open.er-api.com/v6/latest/' + target)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load exchange rates.')
        }
        return response.json()
      })
      .then((data) => {
        if (ignore) return
        // ExchangeRate-API can answer 200 OK and still report an error in the body.
        if (data.result !== 'success') {
          throw new Error('No exchange rates for ' + target + '.')
        }
        const converted = convertTotals(currentTotals, target, data.rates)
        setAmount(converted.amount)
        setRateDate(new Date(data.time_last_update_unix * 1000).toISOString().slice(0, 10))
        setUnconverted(converted.unconverted)
        setError('')
        setStatus('ready')
      })
      .catch((fetchError) => {
        if (ignore) return
        setError(fetchError.message || 'Could not reach ExchangeRate-API.')
        setStatus('error')
      })

    return () => {
      ignore = true
    }
  }, [subscriptions, target, attempt])

  const activeCount = subscriptions.filter((item) => item.active).length
  const sourceAmounts =
    totals.length === 0
      ? '—'
      : totals.map((item) => formatPrice(item.total, item.currency)).join(' · ')

  let sameCurrencyTotal = 0
  for (const item of totals) {
    if (item.currency === target) sameCurrencyTotal += item.total
  }

  let convertedText = '—'
  if (totals.length > 0 && !needsConversion) {
    convertedText = formatPrice(sameCurrencyTotal, target)
  } else if (totals.length > 0 && status === 'ready') {
    convertedText = formatPrice(amount, target)
  } else if (totals.length > 0 && status !== 'error') {
    convertedText = 'Converting…'
  }

  return (
    <article className="page">
      <header className="page-header">
        <h1>Total</h1>
        <p className="lede">
          {user
            ? 'Monthly spending from your saved subscriptions, converted with the ExchangeRate-API.'
            : 'Log in to see your spending.'}
        </p>
      </header>

      {user && !subscriptionsLoading && (
        <>
      <div className="field convert-field">
        <label htmlFor="display-currency">Show total in</label>
        <select
          id="display-currency"
          value={target}
          onChange={(event) => {
            setTarget(event.target.value)
            setStatus('idle')
            setError('')
            setRateDate('')
            setUnconverted([])
          }}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      <section className="totals" aria-label="Expense summary">
        <article className="surface row">
          <h2>Converted total</h2>
          <p className="stat">{convertedText}</p>
          {needsConversion && status === 'ready' && rateDate && (
            <p>
              Rates updated {formatDate(rateDate)}.{' '}
              <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">
                Rates By Exchange Rate API
              </a>
            </p>
          )}
          {needsConversion && status === 'ready' && unconverted.length > 0 && (
            <p className="field-error">{unconverted.join(', ')} could not be converted.</p>
          )}
          {status === 'error' && (
            <p className="field-error">
              {error}{' '}
              <button type="button" className="button-quiet" onClick={() => setAttempt(attempt + 1)}>
                Try again
              </button>
            </p>
          )}
        </article>
        <div className="total-secondary">
          <article className="surface row">
            <h2>Before conversion</h2>
            <p className="stat stat-small">{sourceAmounts}</p>
          </article>
          <article className="surface row">
            <h2>Active plans</h2>
            <p className="stat stat-small">{activeCount}</p>
          </article>
        </div>
      </section>
        </>
      )}
      {user && subscriptionsLoading && <p>Loading subscriptions…</p>}
    </article>
  )
}
