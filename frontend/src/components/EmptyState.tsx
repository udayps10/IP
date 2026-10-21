import type { ReactNode } from 'react'
import { Building2 } from 'lucide-react'

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <Building2 size={24} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="property-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton skeleton--card" />
      ))}
    </div>
  )
}
