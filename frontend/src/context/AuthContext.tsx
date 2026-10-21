import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/api'
import { tokenStore } from '@/api/client'
import type { LoginResponse, RegisterRequest, User } from '@/types'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  user: User | null
  token: string | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStore.get())
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const logout = useCallback(() => {
    tokenStore.clear()
    setToken(null)
    setUser(null)
    setStatus('anonymous')
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authApi.me()
      setUser(profile)
      setStatus('authenticated')
    } catch {
      logout()
    }
  }, [logout])

  useEffect(() => {
    if (!tokenStore.get()) {
      setStatus('anonymous')
      return
    }
    void refreshUser()
  }, [refreshUser])

  // The API client clears the token and fires this event when a request comes back 401.
  useEffect(() => {
    const onUnauthorized = () => logout()
    window.addEventListener('havenly:unauthorized', onUnauthorized)
    return () => window.removeEventListener('havenly:unauthorized', onUnauthorized)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const result: LoginResponse = await authApi.login(email, password)
    tokenStore.set(result.token)
    setToken(result.token)
    const profile = await authApi.me()
    setUser(profile)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (payload: RegisterRequest) => {
    await authApi.register(payload)
    const result = await authApi.login(payload.email, payload.password)
    tokenStore.set(result.token)
    setToken(result.token)
    const profile = await authApi.me()
    setUser(profile)
    setStatus('authenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, status, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}
