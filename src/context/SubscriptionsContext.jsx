/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import {
  ApiError,
  createSubscription,
  deleteSubscription,
  fromSubscription,
  listSubscriptions,
  toSubscriptionBody,
  updateSubscription,
} from '../api.js'
import { useAuth } from './AuthContext.jsx'

const SubscriptionsContext = createContext(null)

export function SubscriptionsProvider({ children }) {
  const { accessToken, tokenOrExpired, expireSession } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [loadedToken, setLoadedToken] = useState('')
  const [error, setError] = useState('')

  const loading = Boolean(accessToken) && loadedToken !== accessToken

  useEffect(() => {
    if (!accessToken) return

    let ignore = false
    listSubscriptions(accessToken)
      .then((items) => {
        if (ignore) return
        setSubscriptions(items.map(fromSubscription))
        setError('')
        setLoadedToken(accessToken)
      })
      .catch((requestError) => {
        if (ignore) return
        if (requestError instanceof ApiError && requestError.status === 401) {
          expireSession()
          return
        }
        setError(requestError.message || 'Could not load subscriptions.')
        setLoadedToken(accessToken)
      })

    return () => {
      ignore = true
    }
  }, [accessToken, expireSession])

  async function withToken(action) {
    const token = tokenOrExpired()
    if (!token) throw new ApiError('Your session has expired. Log in again.', 401, 'Not authenticated')
    try {
      return await action(token)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) expireSession()
      throw requestError
    }
  }

  async function reload(token) {
    const items = await listSubscriptions(token)
    setSubscriptions(items.map(fromSubscription))
    setError('')
    setLoadedToken(token)
  }

  async function addSubscription(form) {
    await withToken(async (token) => {
      await createSubscription(token, toSubscriptionBody(form))
      await reload(token)
    })
  }

  async function editSubscription(id, form) {
    await withToken(async (token) => {
      await updateSubscription(token, { id, ...toSubscriptionBody(form) })
      await reload(token)
    })
  }

  async function removeSubscription(id) {
    await withToken(async (token) => {
      await deleteSubscription(token, id)
      await reload(token)
    })
  }

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions: accessToken ? subscriptions : [],
        loading,
        error: accessToken ? error : '',
        addSubscription,
        editSubscription,
        removeSubscription,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  )
}

export function useSubscriptions() {
  const value = useContext(SubscriptionsContext)
  if (!value) throw new Error('useSubscriptions must be used within SubscriptionsProvider')
  return value
}
