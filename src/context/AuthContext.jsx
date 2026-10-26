/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  ApiError,
  isAccessTokenExpired,
  listUsers,
  loginAccount,
  logoutAccount,
  readAccessClaims,
  refreshAccessToken,
  registerAccount,
  getMemoryAccessToken,
  setMemoryAccessToken,
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
    setMemoryAccessToken('')
    setSession(null)
    setNotice('Your session has expired. Log in again.')
  }, [])

  useEffect(() => {
    let ignore = false
    refreshAccessToken()
      .then((data) => {
        if (ignore) return
        setSession({ accessToken: data.access_token, user: data.user })
      })
      .catch(() => {
        if (!ignore) setSession(null)
      })
    return () => {
      ignore = true
    }
  }, [])

  async function tokenOrExpired() {
    const current = getMemoryAccessToken()
    if (current && !isAccessTokenExpired(current)) return current
    try {
      const data = await refreshAccessToken()
      setSession({ accessToken: data.access_token, user: data.user })
      return data.access_token
    } catch {
      expireSession()
      return null
    }
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
      user: created,
    }
    setMemoryAccessToken(tokens.access_token)
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
        await logoutAccount(tokens.access_token)
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
      user,
    }
    setMemoryAccessToken(tokens.access_token)
    setSession(next)
    setNotice('')
  }

  async function logout() {
    try {
      let token = getMemoryAccessToken()
      if (!token || isAccessTokenExpired(token)) {
        const data = await refreshAccessToken()
        token = data.access_token
      }
      await logoutAccount(token)
    } catch {
      // Leave the screen logged out even if the server is already signed out.
    }
    setMemoryAccessToken('')
    setSession(null)
    setNotice('')
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
