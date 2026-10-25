import { CURRENCIES, SERVICES } from './data.js'

function isPositiveNumber(value) {
  const text = String(value ?? '').trim()
  const number = Number(text)
  return text !== '' && Number.isFinite(number) && number > 0
}

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(String(value ?? '').trim())
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
  } else if (!isPositiveInteger(form.duration)) {
    errors.duration = 'Duration must be a whole number of months greater than 0.'
  }

  return errors
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
