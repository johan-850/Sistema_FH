import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import type { UserRole } from '../../types/database'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, profile, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse-soft">
          <div className="w-16 h-16 rounded-full bg-primary-container/50 flex items-center justify-center">
            <span className="text-2xl">🍦</span>
          </div>
          <p className="text-on-surface-variant font-semibold">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    const redirectPath = profile?.role === 'admin' ? '/admin' : '/cashier/pos'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
