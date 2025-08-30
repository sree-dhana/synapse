import { Navigate } from 'react-router-dom'
import { isAuthenticated, clearAuth } from '../utils/auth'

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    clearAuth()
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
