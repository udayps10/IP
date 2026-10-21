import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Phone, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 6) next.password = 'Use at least 6 characters'
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setBusy(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create your account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth__aside">
        <h2>List your property today</h2>
        <p>Create a free account and reach buyers and tenants searching in your city.</p>
        <div className="auth__points">
          <div>
            <span>
              <User size={15} />
            </span>
            Your own owner dashboard
          </div>
          <div>
            <span>
              <Building2 size={15} />
            </span>
            Unlimited property listings
          </div>
          <div>
            <span>
              <Phone size={15} />
            </span>
            Direct enquiries from prospects
          </div>
        </div>
      </aside>

      <main className="auth__main">
        <div className="auth__card">
          <h1>Create your account</h1>
          <p>It takes less than a minute.</p>

          <form onSubmit={submit} className="stack">
            {formError && <div className="form-error">{formError}</div>}

            <div className={`field${errors.name ? ' field--error' : ''}`}>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="Aarav Sharma"
                autoComplete="name"
                required
              />
              {errors.name && <span className="field__error">{errors.name}</span>}
            </div>

            <div className={`field${errors.email ? ' field--error' : ''}`}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              {errors.email && <span className="field__error">{errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                maxLength={20}
              />
            </div>

            <div className={`field${errors.password ? ' field--error' : ''}`}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
              {errors.password && <span className="field__error">{errors.password}</span>}
            </div>

            <div className={`field${errors.confirm ? ' field--error' : ''}`}>
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={(event) => update('confirm', event.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
              {errors.confirm && <span className="field__error">{errors.confirm}</span>}
            </div>

            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              {busy ? <span className="spinner" /> : <ArrowRight size={16} />}
              Create account
            </button>
          </form>

          <p className="auth__footer">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
