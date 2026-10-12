import { useState } from 'react'
import { CURRENCIES, SERVICES, emptyForm } from '../data.js'
import { formToSubscription, validateForm } from '../subscription.js'

export default function SubscriptionForm({ onSubmit, onCancel, onEdit }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    onEdit()
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(formToSubscription(form))
    setForm(emptyForm)
    setErrors({})
  }

  return (
    <form className="surface form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="service-name">Service name</label>
          <select
            id="service-name"
            value={form.serviceName}
            onChange={(event) => updateField('serviceName', event.target.value)}
          >
            <option value="">Select a service</option>
            {SERVICES.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          {errors.serviceName && <p className="field-error">{errors.serviceName}</p>}
        </div>

        <div className="field">
          <label htmlFor="plan-name">Plan name</label>
          <input
            id="plan-name"
            type="text"
            value={form.planName}
            onChange={(event) => updateField('planName', event.target.value)}
          />
          {errors.planName && <p className="field-error">{errors.planName}</p>}
        </div>

        <div className="field">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
          />
          {errors.price && <p className="field-error">{errors.price}</p>}
        </div>

        <div className="field">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={form.currency}
            onChange={(event) => updateField('currency', event.target.value)}
          >
            <option value="">Select a currency</option>
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          {errors.currency && <p className="field-error">{errors.currency}</p>}
        </div>

        <div className="field">
          <label htmlFor="start-date">Subscription start date</label>
          <input
            id="start-date"
            type="date"
            value={form.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
          />
          {errors.startDate && <p className="field-error">{errors.startDate}</p>}
        </div>

        <div className="field">
          <label htmlFor="duration">Duration (months)</label>
          <input
            id="duration"
            type="text"
            inputMode="decimal"
            value={form.duration}
            onChange={(event) => updateField('duration', event.target.value)}
          />
          {errors.duration && <p className="field-error">{errors.duration}</p>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit">Save subscription</button>
        <button type="button" className="button-quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
