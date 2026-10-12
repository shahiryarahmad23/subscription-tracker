/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { loadSubscriptions, saveSubscriptions } from '../subscription.js'

const SubscriptionsContext = createContext(null)

export function SubscriptionsProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState(loadSubscriptions)

  useEffect(() => {
    saveSubscriptions(subscriptions)
  }, [subscriptions])

  function addSubscription(subscription) {
    const withId = { ...subscription, id: String(Date.now()) }
    setSubscriptions((current) => [...current, withId])
  }

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionsContext.Provider>
  )
}

export function useSubscriptions() {
  const value = useContext(SubscriptionsContext)
  if (!value) {
    throw new Error('useSubscriptions must be used within SubscriptionsProvider')
  }
  return value
}
