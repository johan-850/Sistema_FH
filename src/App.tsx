import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AdminLayout }   from './components/layout/AdminLayout'
import { CashierLayout } from './components/layout/CashierLayout'
import { ProtectedRoute } from './components/shared/ProtectedRoute'
import { RequireOpenRegister } from './components/shared/RequireOpenRegister'

// Pages – Auth
import LoginPage from './pages/auth/LoginPage'

// Pages – Admin
import DashboardPage from './pages/admin/DashboardPage'

// Pages – Cashier
import OpenRegisterPage from './pages/cashier/OpenRegisterPage'
import POSPage          from './pages/cashier/POSPage'
import ExpensesPage     from './pages/cashier/ExpensesPage'
import CloseRegisterPage from './pages/cashier/CloseRegisterPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-96 animate-fade-in">
      <div className="text-center p-12 rounded-[28px]"
           style={{ background:'rgba(255,255,255,0.6)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.6)' }}>
        <span className="text-5xl mb-4 block">🚧</span>
        <h2 className="text-2xl font-black mb-2" style={{ color:'var(--c-on-surface)' }}>{title}</h2>
        <p className="text-sm" style={{ color:'var(--c-on-surface-var)' }}>Módulo en desarrollo · Próximamente</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors
        toastOptions={{ style: {
          background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.7)', borderRadius:'16px',
          boxShadow:'0 8px 32px rgba(177,156,217,0.2)',
          fontFamily:"'Epilogue', system-ui, sans-serif",
        }}}
      />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index         element={<DashboardPage />} />
          <Route path="products"  element={<Placeholder title="Gestión de Productos" />} />
          <Route path="resources" element={<Placeholder title="Gestión de Recursos" />} />
          <Route path="inventory" element={<Placeholder title="Inventario" />} />
          <Route path="history"   element={<Placeholder title="Historial de Movimientos" />} />
          <Route path="users"     element={<Placeholder title="Gestión de Usuarios" />} />
        </Route>

        {/* Cashier */}
        <Route path="/cashier" element={<ProtectedRoute requiredRole="cashier"><CashierLayout /></ProtectedRoute>}>
          <Route path="open"     element={<OpenRegisterPage />} />
          <Route path="pos"      element={<RequireOpenRegister><POSPage /></RequireOpenRegister>} />
          <Route path="expenses" element={<RequireOpenRegister><ExpensesPage /></RequireOpenRegister>} />
          <Route path="close"    element={<RequireOpenRegister><CloseRegisterPage /></RequireOpenRegister>} />
        </Route>

        {/* Redirects */}
        <Route path="/"   element={<Navigate to="/login" replace />} />
        <Route path="*"   element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
