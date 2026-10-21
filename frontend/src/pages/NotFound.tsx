import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'

export function NotFound() {
  return (
    <div className="page container">
      <EmptyState
        title="Page not found"
        message="The page you are looking for does not exist or has moved."
        action={
          <Link to="/" className="btn btn--primary">
            Back to home
          </Link>
        }
      />
    </div>
  )
}
