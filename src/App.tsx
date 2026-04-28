import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AdminLayout }   from './components/layout/AdminLayout'
import { CashierLayout } from './components/layout/CashierLayout'
import { ProtectedRoute } from './components/shared/ProtectedRoute'
import { RequireOpenRegister } from './components/shared/RequireOpenRegister'
import { useAuthInit } from './hooks/useAuthInit'

// Pages – Auth
import LoginPage from './pages/auth/LoginPage'

// Pages – Admin
import DashboardPage   from './pages/admin/DashboardPage'
import ProductsPage    from './pages/admin/ProductsPage'
import ResourcesPage   from './pages/admin/ResourcesPage'
import CategoriesPage  from './pages/admin/CategoriesPage'
import InventoryPage   from './pages/admin/InventoryPage'
import HistoryPage     from './pages/admin/HistoryPage'
import UsersPage       from './pages/admin/UsersPage'

// Pages – Cashier
import OpenRegisterPage from './pages/cashier/OpenRegisterPage'
import POSPage          from './pages/cashier/POSPage'
import ExpensesPage     from './pages/cashier/ExpensesPage'
import CloseRegisterPage from './pages/cashier/CloseRegisterPage'




export default function App() {
  useAuthInit() // ← Inicializa sesión de Supabase al arrancar
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
          <Route index              element={<DashboardPage />} />
          <Route path="products"   element={<ProductsPage />} />
          <Route path="resources"  element={<ResourcesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="inventory"  element={<InventoryPage />} />
          <Route path="history"    element={<HistoryPage />} />
          <Route path="users"      element={<UsersPage />} />
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
