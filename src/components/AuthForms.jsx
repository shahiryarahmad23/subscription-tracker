import { useState } from 'react'
import { ApiError } from '../api.js'

const emptyAccount = {
  username: '',
  password: '',
  email: '',
  dob: '',
}

export default function AuthForms({ notice, onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(emptyAccount)
  const [role, setRole] = useState('user')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setErrors({})
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (form.username.trim() === '') nextErrors.username = 'Enter a username.'
    if (form.password === '') nextErrors.password = 'Enter a password.'
    if (mode === 'register') {
      if (form.email.trim() === '') nextErrors.email = 'Enter an email.'
      if (form.dob === '') nextErrors.dob = 'Choose a date of birth.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      if (mode === 'register') await onRegister({ ...form, role })
      else await onLogin({ ...form, role })
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fields).length > 0) {
        setErrors(error.fields)
      } else {
        setErrors({ form: error.message || 'Could not sign in.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="surface form" onSubmit={handleSubmit} noValidate>
      <h2>{mode === 'register' ? 'Create an account' : 'Log in'}</h2>
      <div className="role-toggle" role="group" aria-label="Account type">
        <button
          type="button"
          className={role === 'user' ? 'role-option is-selected' : 'role-option'}
          onClick={() => setRole('user')}
        >
          User
        </button>
        <button
          type="button"
          className={role === 'admin' ? 'role-option is-selected' : 'role-option'}
          onClick={() => setRole('admin')}
        >
          Admin
        </button>
      </div>
      {notice && <p className="field-error">{notice}</p>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={form.username}
            onChange={(event) => updateField('username', event.target.value)}
          />
          {errors.username && <p className="field-error">{errors.username}</p>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        {mode === 'register' && (
          <>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
            <div className="field">
              <label htmlFor="dob">Date of birth</label>
              <input
                id="dob"
                type="date"
                value={form.dob}
                onChange={(event) => updateField('dob', event.target.value)}
              />
              {errors.dob && <p className="field-error">{errors.dob}</p>}
            </div>
          </>
        )}
      </div>
      {errors.form && <p className="field-error">{errors.form}</p>}
      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'register' ? 'Register' : 'Log in'}
        </button>
        <button
          type="button"
          className="button-quiet"
          onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
        >
          {mode === 'register' ? 'Have an account? Log in' : 'Need an account? Register'}
        </button>
      </div>
    </form>
  )
}
