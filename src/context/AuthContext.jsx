/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'
import {
  ApiError,
  isAccessTokenExpired,
  listUsers,
  loginAccount,
  logoutAccount,
  readAccessClaims,
  registerAccount,
} from '../api.js'

const AuthContext = createContext(null)

async function profileForToken(accessToken, username) {
  const claims = readAccessClaims(accessToken)
  try {
    const users = await listUsers(accessToken)
    const me = users.find((user) => user.id === claims?.id)
    if (me) return me
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 403) throw error
  }
  return {
    id: claims?.id || '',
    username,
    email: '',
    role: 'user',
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [notice, setNotice] = useState('')

  const expireSession = useCallback(() => {
    setSession(null)
    setNotice('Your session has expired. Log in again.')
  }, [])

  function tokenOrExpired() {
    if (!session) return null
    if (isAccessTokenExpired(session.accessToken)) {
      expireSession()
      return null
    }
    return session.accessToken
  }

  async function register(form) {
    const account = {
      username: form.username.trim(),
      password: form.password,
      email: form.email.trim(),
      dob: form.dob,
    }
    if (form.role === 'admin') account.role = 'admin'
    const created = await registerAccount(account)
    const tokens = await loginAccount({
      username: form.username.trim(),
      password: form.password,
    })
    const next = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: created,
    }
    setSession(next)
    setNotice('')
  }

  async function login(form) {
    const tokens = await loginAccount({
      username: form.username.trim(),
      password: form.password,
    })
    const user = await profileForToken(tokens.access_token, form.username.trim())
    const selectedRole = form.role === 'admin' ? 'admin' : 'user'
    if (user.role !== selectedRole) {
      try {
        await logoutAccount(tokens.access_token, tokens.refresh_token)
      } catch {
        // The login is rejected either way. A failed logout still must not start a session.
      }
      const message =
        selectedRole === 'admin'
          ? 'This account is a user. Switch the toggle to User.'
          : 'This account is an admin. Switch the toggle to Admin.'
      throw new ApiError(message, 403, message)
    }
    const next = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user,
    }
    setSession(next)
    setNotice('')
  }

  async function logout() {
    const current = session
    setSession(null)
    setNotice('')
    if (!current) return
    if (isAccessTokenExpired(current.accessToken)) return
    try {
      await logoutAccount(current.accessToken, current.refreshToken)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return
      setNotice(error.message || 'Could not log out.')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        accessToken: session?.accessToken ?? '',
        notice,
        tokenOrExpired,
        register,
        login,
        logout,
        expireSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
