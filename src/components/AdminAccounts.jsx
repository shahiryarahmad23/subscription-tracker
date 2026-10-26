import { useEffect, useState } from 'react'
import { ApiError, deleteUser, listUserSubscriptions, listUsers, setUserAccess } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminAccounts({ manage = false, summaryOnly = false }) {
  const { user, accessToken, expireSession } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [counts, setCounts] = useState({})
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [roleView, setRoleView] = useState('user')

  async function loadAccounts() {
    const people = await listUsers(accessToken)
    setAccounts(people)
    if (!manage) return
    const nextCounts = {}
    await Promise.all(
      people
        .filter((account) => account.role !== 'admin')
        .map(async (account) => {
          const plans = await listUserSubscriptions(accessToken, account.id)
          nextCounts[account.id] = plans.length
        }),
    )
    setCounts(nextCounts)
  }

  useEffect(() => {
    if (!accessToken) return
    let ignore = false
    loadAccounts()
      .then(() => {
        if (!ignore) setError('')
      })
      .catch((requestError) => {
        if (ignore) return
        if (requestError instanceof ApiError && requestError.status === 401) {
          expireSession()
          return
        }
        if (requestError instanceof ApiError && requestError.status === 404) {
          setAccounts([])
          setError('')
          return
        }
        setError(requestError.message || 'Could not load accounts.')
      })
    return () => {
      ignore = true
    }
  }, [accessToken, manage, expireSession])

  async function run(accountId, action) {
    setBusyId(accountId)
    setError('')
    try {
      await action()
      await loadAccounts()
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        expireSession()
        return
      }
      setError(requestError.message || 'Could not update the account.')
    } finally {
      setBusyId('')
    }
  }

  const userCount = accounts.filter((account) => account.role !== 'admin').length
  const adminCount = accounts.filter((account) => account.role === 'admin').length
  const visibleAccounts = accounts.filter((account) =>
    roleView === 'admin' ? account.role === 'admin' : account.role !== 'admin',
  )

  return (
    <section className="section-gap" aria-label={manage ? 'User subscriptions' : 'Registered users'}>
      {summaryOnly && (
        <>
          {error && <p className="field-error">{error}</p>}
          <ul className="recent-list">
          <li className="recent-card">
            <h2>Accounts</h2>
            <p className="recent-price">{accounts.length}</p>
          </li>
          <li className="recent-card">
            <h2>Users</h2>
            <p className="recent-price">{userCount}</p>
          </li>
          <li className="recent-card">
            <h2>Admins</h2>
            <p className="recent-price">{adminCount}</p>
          </li>
          </ul>
        </>
      )}

      {manage && (
        <>
          {error && <p className="field-error">{error}</p>}
          <div className="role-toggle" role="group" aria-label="Show accounts">
            <button
              type="button"
              className={roleView === 'user' ? 'role-option is-selected' : 'role-option'}
              onClick={() => setRoleView('user')}
            >
              User
            </button>
            <button
              type="button"
              className={roleView === 'admin' ? 'role-option is-selected' : 'role-option'}
              onClick={() => setRoleView('admin')}
            >
              Admin
            </button>
          </div>
          <ul className="surface stack subscription-list">
            {visibleAccounts.map((account) => {
              const isSelf = account.id === user?.id
              const stopped = account.is_active === false
              return (
                <li className="row subscription-row" key={account.id}>
                  <div>
                    <div className="title-line">
                      <h2>{account.username}</h2>
                      <span className={account.role === 'admin' ? 'plan-badge is-admin' : 'plan-badge'}>
                        {account.role}
                      </span>
                      {stopped && <span className="plan-badge">Stopped</span>}
                    </div>
                    <p className="item-meta">{account.email}</p>
                    {account.role !== 'admin' && (
                      <p className="item-meta">
                        {counts[account.id] ?? 0} subscription{counts[account.id] === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>
                  {!isSelf && (
                    <div className="form-actions">
                      <button
                        type="button"
                        className="button-quiet"
                        disabled={busyId === account.id}
                        onClick={() =>
                          run(account.id, () => setUserAccess(accessToken, account.id, stopped))
                        }
                      >
                        {stopped ? 'Restore access' : 'Stop access'}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === account.id}
                        onClick={() => run(account.id, () => deleteUser(accessToken, account.id))}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          {visibleAccounts.length === 0 && !error && (
            <p>{roleView === 'admin' ? 'No admins to show.' : 'No users to show.'}</p>
          )}
        </>
      )}
    </section>
  )
}
