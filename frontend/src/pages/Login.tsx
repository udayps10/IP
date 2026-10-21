import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/properties'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password')
      return
    }
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth__aside">
        <h2>Welcome back to Havenly</h2>
        <p>Sign in to manage your listings, upload photos and track your properties.</p>
        <div className="auth__points">
          <div>
            <span>
              <ShieldCheck size={15} />
            </span>
            Secure JWT sessions
          </div>
          <div>
            <span>
              <ArrowRight size={15} />
            </span>
            Publish listings in under a minute
          </div>
          <div>
            <span>
              <Mail size={15} />
            </span>
            Tenants and buyers contact you directly
          </div>
        </div>
      </aside>

      <main className="auth__main">
        <div className="auth__card">
          <h1>Sign in</h1>
          <p>Use the email and password you registered with.</p>

          <form onSubmit={submit} className="stack">
            {error && <div className="form-error">{error}</div>}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              {busy ? <span className="spinner" /> : <Lock size={16} />}
              Sign in
            </button>
          </form>

          <p className="auth__footer">
            New to Havenly? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
