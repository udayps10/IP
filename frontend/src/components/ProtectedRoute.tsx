import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="page container">
        <div className="skeleton" style={{ height: 260, maxWidth: 520, margin: '60px auto' }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <>{children}</>
}
