import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Supports two usage patterns:
//   1. Layout guard:  <Route element={<ProtectedRoute allowedRoles={['patient','admin']} />}>
//   2. Wrapper guard: <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>
export default function ProtectedRoute({ children, allowedRoles, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // allowedRoles array check (layout guard pattern)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  // single role string check (wrapper pattern)
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  // If used as a layout guard with no children, render nested routes
  return children ?? <Outlet />
}
