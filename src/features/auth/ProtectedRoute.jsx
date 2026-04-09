import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
