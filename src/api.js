const API_BASE = '/api'

let memoryAccessToken = ''
let refreshInFlight = null

export function setMemoryAccessToken(token) {
  memoryAccessToken = token || ''
}

export function getMemoryAccessToken() {
  return memoryAccessToken
}

const FIELD_NAMES = {
  service_name: 'serviceName',
  service_plan: 'planName',
  subscription_date: 'startDate',
  price: 'price',
  currency: 'currency',
  duration: 'duration',
  username: 'username',
  email: 'email',
  password: 'password',
  dob: 'dob',
}

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.fields = fieldsFromDetail(detail)
  }
}

function fieldsFromDetail(detail) {
  if (!Array.isArray(detail)) return {}
  const fields = {}
  for (const item of detail) {
    const location = Array.isArray(item.loc) ? item.loc : []
    const rawName = location[location.length - 1]
    const name = FIELD_NAMES[rawName] || rawName
    if (name) fields[name] = item.msg || 'Invalid value'
  }
  return fields
}

function messageFromDetail(detail, status) {
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail)) {
    const text = detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(' ')
    if (text) return text
  }
  if (status === 401) return 'Not authenticated'
  if (status === 403) return 'Not authorized'
  return 'Request failed'
}

export function readAccessClaims(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = JSON.parse(atob(padded))
    return { id: json.sub, exp: json.exp }
  } catch {
    return null
  }
}

export function isAccessTokenExpired(token) {
  const claims = readAccessClaims(token)
  if (!claims?.exp) return true
  return Date.now() >= claims.exp * 1000
}

export async function apiRequest(path, { method = 'GET', body, token, skipRefresh = false, anonymous = false } = {}) {
  let bearer = anonymous ? '' : token || memoryAccessToken
  if (!skipRefresh && !anonymous && bearer && isAccessTokenExpired(bearer)) {
    const renewed = await refreshAccessToken()
    bearer = renewed.access_token
  }

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (bearer) headers.Authorization = 'Bearer ' + bearer

  let response
  try {
    response = await fetch(API_BASE + path, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server.', 0, null)
  }

  if (response.status === 401 && !skipRefresh && path !== '/user/refresh' && path !== '/user/login') {
    const renewed = await refreshAccessToken()
    return apiRequest(path, { method, body, token: renewed.access_token, skipRefresh: true })
  }

  if (response.status === 204) return null

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    throw new ApiError(messageFromDetail(data?.detail, response.status), response.status, data?.detail)
  }
  return data
}

export function registerAccount(body) {
  return apiRequest('/user/register', { method: 'POST', body, anonymous: true, skipRefresh: true })
}

export function loginAccount(body) {
  return apiRequest('/user/login', { method: 'POST', body, anonymous: true, skipRefresh: true })
}

export function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = apiRequest('/user/refresh', {
      method: 'POST',
      anonymous: true,
      skipRefresh: true,
    })
      .then((data) => {
        memoryAccessToken = data.access_token
        return data
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

export function logoutAccount(accessToken) {
  return apiRequest('/user/logout', {
    method: 'POST',
    token: accessToken,
    skipRefresh: true,
  })
}

export function listUsers(accessToken) {
  return apiRequest('/user/', { token: accessToken })
}

export async function listSubscriptions(accessToken) {
  const items = []
  let cursor = ''

  try {
    do {
      const path = cursor
        ? '/subscriptions/mine?limit=20&cursor=' + encodeURIComponent(cursor)
        : '/subscriptions/mine?limit=20'
      const page = await apiRequest(path, { token: accessToken })
      if (Array.isArray(page?.items)) items.push(...page.items)
      cursor = page?.next_cursor || ''
    } while (cursor)
    return items
  } catch (error) {
    if (error instanceof ApiError && error.status === 404 && error.message === 'No subscriptions found') {
      return items
    }
    throw error
  }
}

export function createSubscription(accessToken, body) {
  return apiRequest('/subscriptions/', { method: 'POST', token: accessToken, body })
}

export function updateSubscription(accessToken, body) {
  return apiRequest('/subscriptions/', { method: 'PATCH', token: accessToken, body })
}

export function deleteSubscription(accessToken, id) {
  return apiRequest('/subscriptions/' + id, { method: 'DELETE', token: accessToken })
}

export async function listUserSubscriptions(accessToken, userId) {
  try {
    return await apiRequest('/user/' + userId + '/subscriptions', { token: accessToken })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return []
    throw error
  }
}

export function setUserAccess(accessToken, userId, active) {
  return apiRequest('/user/' + userId + '/access', {
    method: 'PATCH',
    token: accessToken,
    body: { active },
  })
}

export function deleteUser(accessToken, userId) {
  return apiRequest('/user/' + userId, { method: 'DELETE', token: accessToken })
}

export function toSubscriptionBody(form) {
  return {
    service_name: form.serviceName,
    service_plan: form.planName.trim(),
    price: Number(form.price),
    currency: form.currency,
    subscription_date: form.startDate + 'T00:00:00Z',
    duration: Number(form.duration),
  }
}

export function fromSubscription(item) {
  return {
    id: item.id,
    serviceName: item.service_name,
    planName: item.service_plan,
    price: Number(item.price),
    currency: item.currency,
    startDate: String(item.subscription_date).slice(0, 10),
    durationMonths: item.duration,
    active: true,
    userId: item.user_id,
    ownerName: item.user?.username || '',
    createdAt: item.created_at || '',
  }
}
