import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, IceCreamCone, Layers, Package, History, Users, Settings, HelpCircle, LogOut, Receipt, Lock, Unlock } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCashRegisterStore } from '../../stores/cashRegisterStore'

interface NavItem { to: string; icon: React.ReactNode; label: string }

const adminNav: NavItem[] = [
  { to:'/admin',           icon:<LayoutDashboard size={18}/>, label:'Dashboard'  },
  { to:'/admin/products',  icon:<IceCreamCone    size={18}/>, label:'Productos'  },
  { to:'/admin/resources', icon:<Layers          size={18}/>, label:'Recursos'   },
  { to:'/admin/inventory', icon:<Package         size={18}/>, label:'Inventario' },
  { to:'/admin/history',   icon:<History         size={18}/>, label:'Historial'  },
  { to:'/admin/users',     icon:<Users           size={18}/>, label:'Usuarios'   },
]

const cashierNav: NavItem[] = [
  { to:'/cashier/open',     icon:<Unlock      size={18}/>, label:'Abrir Caja' },
  { to:'/cashier/pos',      icon:<IceCreamCone size={18}/>, label:'POS'       },
  { to:'/cashier/expenses', icon:<Receipt     size={18}/>, label:'Gastos'     },
  { to:'/cashier/close',    icon:<Lock        size={18}/>, label:'Cerrar Caja'},
]

interface Props { role: 'admin' | 'cashier' }

export function Sidebar({ role }: Props) {
  const navigate  = useNavigate()
  const { profile, logout } = useAuthStore()
  const { currentSession } = useCashRegisterStore()
  const navItems  = role === 'admin' ? adminNav : cashierNav

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="fixed left-0 top-0 h-full z-40 flex flex-col p-4 w-64">
      {/* Glass panel */}
      <div className="h-[calc(100vh-32px)] rounded-[32px] flex flex-col overflow-hidden"
           style={{ background:'rgba(255,255,255,0.65)', backdropFilter:'blur(32px)', WebkitBackdropFilter:'blur(32px)', border:'1px solid rgba(255,255,255,0.5)', boxShadow:'0 20px 60px rgba(103,85,140,0.15)' }}>

        {/* Brand header */}
        <div className="p-6" style={{ borderBottom:'1px solid rgba(255,255,255,0.4)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
                 style={{ background:'linear-gradient(135deg, #67558c 0%, #864d61 100%)' }}>
              <IceCreamCone size={18}/>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color:'#67558c' }}>GelatoFlow</h1>
              <p className="text-[11px] font-semibold" style={{ color:'#7a757f' }}>Premium POS</p>
            </div>
          </div>
        </div>

        {/* Session status (cashier) */}
        {role === 'cashier' && currentSession?.status === 'open' && (
          <div className="mx-4 mt-3 rounded-full px-4 py-2 flex items-center gap-2"
               style={{ background:'rgba(220,252,231,0.6)', border:'1px solid rgba(134,239,172,0.5)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background:'#15803d' }}/>
            <span className="text-xs font-bold" style={{ color:'#15803d' }}>Caja Abierta</span>
          </div>
        )}

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              end={item.to === '/admin' || item.to === '/cashier/pos'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${isActive ? '' : 'hover:bg-white/50'}`
              }
              style={({ isActive }) => isActive
                ? { background:'linear-gradient(135deg,#67558c,#7a6aa0)', color:'#fff', boxShadow:'0 4px 14px rgba(103,85,140,0.3)' }
                : { color:'#49454f' }
              }>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 space-y-1" style={{ borderTop:'1px solid rgba(255,255,255,0.4)', paddingTop:'12px' }}>
          <button className="flex items-center gap-3 px-4 py-2 text-sm font-semibold w-full rounded-full cursor-pointer hover:bg-white/50 transition-colors" style={{ color:'#49454f' }}>
            <Settings size={16}/> Ajustes
          </button>
          <button className="flex items-center gap-3 px-4 py-2 text-sm font-semibold w-full rounded-full cursor-pointer hover:bg-white/50 transition-colors" style={{ color:'#49454f' }}>
            <HelpCircle size={16}/> Soporte
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-sm font-semibold w-full rounded-full cursor-pointer transition-colors hover:bg-red-50"
            style={{ color:'var(--c-error)' }}>
            <LogOut size={16}/> Cerrar Sesión
          </button>

          {/* User info */}
          {profile && (
            <div className="flex items-center gap-3 px-4 pt-3 mt-1" style={{ borderTop:'1px solid rgba(255,255,255,0.4)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                   style={{ background:'var(--c-primary-fixed)', color:'var(--c-primary)' }}>
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate" style={{ color:'var(--c-on-surface)' }}>{profile.full_name}</p>
                <p className="text-[10px] capitalize" style={{ color:'var(--c-outline)' }}>{profile.role === 'admin' ? '👑 Admin' : '💰 Cajero'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
