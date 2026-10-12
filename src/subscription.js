import { CURRENCIES, SERVICES } from './data.js'

const STORAGE_KEY = 'subscription-tracker.subscriptions'

function isPositiveNumber(value) {
  const text = value.trim()
  if (!/^\d+(\.\d+)?$/.test(text)) return false
  return Number(text) > 0
}

export function validateForm(form) {
  const errors = {}

  if (!form.serviceName) {
    errors.serviceName = 'Choose a service.'
  } else if (!SERVICES.includes(form.serviceName)) {
    errors.serviceName = 'Choose a service from the list.'
  }

  if (form.planName.trim() === '') {
    errors.planName = 'Enter a plan name.'
  }

  if (form.price.trim() === '') {
    errors.price = 'Enter a price.'
  } else if (!isPositiveNumber(form.price)) {
    errors.price = 'Price must be a number greater than 0.'
  }

  if (!form.currency) {
    errors.currency = 'Choose a currency.'
  } else if (!CURRENCIES.includes(form.currency)) {
    errors.currency = 'Choose a currency from the list.'
  }

  if (form.startDate.trim() === '') {
    errors.startDate = 'Choose a start date.'
  } else if (Number.isNaN(new Date(form.startDate + 'T00:00:00').getTime())) {
    errors.startDate = 'Enter a valid start date.'
  }

  if (form.duration.trim() === '') {
    errors.duration = 'Enter a duration.'
  } else if (!isPositiveNumber(form.duration)) {
    errors.duration = 'Duration must be a number of months greater than 0.'
  }

  return errors
}

export function formToSubscription(form) {
  return {
    serviceName: form.serviceName,
    planName: form.planName.trim(),
    price: Number(form.price),
    currency: form.currency,
    startDate: form.startDate,
    durationMonths: Number(form.duration),
    active: true,
  }
}

function isSavedSubscription(item) {
  return (
    item &&
    typeof item.id === 'string' &&
    typeof item.serviceName === 'string' &&
    typeof item.planName === 'string' &&
    typeof item.price === 'number' &&
    typeof item.currency === 'string' &&
    typeof item.startDate === 'string' &&
    typeof item.durationMonths === 'number' &&
    typeof item.active === 'boolean'
  )
}

export function loadSubscriptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSavedSubscription)
  } catch {
    return []
  }
}

export function saveSubscriptions(subscriptions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
}

export function formatPrice(price, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(price)
}

export function formatDate(isoDate) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(isoDate + 'T00:00:00'))
}

function renewalDate(startDate, durationMonths) {
  const start = new Date(startDate + 'T00:00:00')
  const wholeMonths = Math.trunc(durationMonths)
  const extraDays = Math.round((durationMonths - wholeMonths) * 30)
  const end = new Date(start)
  end.setMonth(end.getMonth() + wholeMonths)
  if (extraDays) end.setDate(end.getDate() + extraDays)
  return end
}

export function remainingLabel(startDate, durationMonths) {
  const end = renewalDate(startDate, durationMonths)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.round((end.getTime() - startOfToday.getTime()) / 86400000)
  if (days < 0) return 'Ended'
  if (days === 0) return 'Ends today'
  if (days === 1) return '1 day left'
  return days + ' days left'
}

export function totalsByCurrency(subscriptions) {
  const totals = {}
  for (const item of subscriptions) {
    if (!item.active) continue
    totals[item.currency] = (totals[item.currency] || 0) + item.price
  }
  return Object.keys(totals).map((currency) => ({
    currency,
    total: totals[currency],
  }))
}

// ExchangeRate-API says how many units of a currency equal 1 unit of the target.
// Divide the saved price by that rate to get the target currency.
export function convertTotals(totals, target, rates) {
  let amount = 0
  const unconverted = []

  for (const item of totals) {
    if (item.currency === target) {
      amount += item.total
    } else if (!rates[item.currency]) {
      unconverted.push(item.currency)
    } else {
      amount += item.total / rates[item.currency]
    }
  }

  return { amount, unconverted }
}
