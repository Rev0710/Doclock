import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function ProtectedRoute({ children, allowedRoles, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const effectiveRole = user.role ?? 'user'

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/" replace />
  }

  if (role && effectiveRole !== role) {
    return <Navigate to="/home" replace />
  }

  return children ?? <Outlet />
}
