import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IceCreamCone, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'

const DEMO_USERS = {
  admin:   { email: 'admin@gelatoflow.com',  password: 'admin123',  role: 'admin'   as const, name: 'Administrador' },
  cashier: { email: 'cajero@gelatoflow.com', password: 'cajero123', role: 'cashier' as const, name: 'María López'   },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setProfile, setLoading } = useAuthStore()

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [submitting,  setSubmitting]  = useState(false)

  /* ─── helpers ─── */
  const fillDemo = (role: 'admin' | 'cashier') => {
    setEmail(DEMO_USERS[role].email)
    setPassword(DEMO_USERS[role].password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    try {
      /* Demo shortcut */
      const demo = Object.values(DEMO_USERS).find(
        u => u.email === email.trim() && u.password === password
      )
      if (demo) {
        const fakeId = crypto.randomUUID()
        setUser({ id: fakeId, email: demo.email })
        setProfile({ id: fakeId, full_name: demo.name, role: demo.role, avatar_url: null, created_at: new Date().toISOString() })
        setLoading(false)
        toast.success(`¡Bienvenido, ${demo.name}!`)
        navigate(demo.role === 'admin' ? '/admin' : '/cashier/pos')
        return
      }

      /* Real Supabase auth */
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) { toast.error('Credenciales inválidas. Intenta de nuevo.'); return }
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email! })
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
        if (profile) {
          setProfile(profile)
          setLoading(false)
          toast.success(`¡Bienvenido, ${profile.full_name}!`)
          navigate(profile.role === 'admin' ? '/admin' : '/cashier/pos')
        }
      }
    } catch {
      toast.error('Error inesperado. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ─── UI ─── */
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(177,156,217,0.35) 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translate(-30%, -30%)' }} />
      <div className="fixed bottom-0 right-0 w-[450px] h-[450px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(253,181,204,0.35) 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translate(30%, 30%)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-scale">

        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white shadow-2xl"
               style={{ background: 'linear-gradient(135deg, #67558c 0%, #864d61 100%)', boxShadow: '0 20px 60px rgba(103,85,140,0.4)' }}>
            <IceCreamCone size={34} />
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: '#67558c' }}>GelatoFlow</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: '#7a757f' }}>Sistema de Gestión Premium · POS</p>
        </div>

        {/* Login card */}
        <div className="rounded-[32px] p-8 shadow-2xl"
             style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 20px 60px rgba(103,85,140,0.15)' }}>

          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1d1b1f' }}>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: '#49454f' }}>Correo Electrónico</label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7a757f' }} />
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 text-sm font-medium rounded-full outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.65)', border: '1.5px solid #cbc4d0', color: '#1d1b1f' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#67558c'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,85,140,0.12)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#cbc4d0'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: '#49454f' }}>Contraseña</label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7a757f' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 text-sm font-medium rounded-full outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.65)', border: '1.5px solid #cbc4d0', color: '#1d1b1f' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#67558c'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,85,140,0.12)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#cbc4d0'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  style={{ color: '#7a757f' }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-full text-white font-bold text-base transition-all duration-300 cursor-pointer mt-1"
              style={{ background: 'linear-gradient(135deg, #67558c 0%, #864d61 100%)', boxShadow: '0 8px 24px rgba(103,85,140,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(103,85,140,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 8px 24px rgba(103,85,140,0.35)' }}>
              {submitting
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Ingresando...</span>
                : 'Ingresar'}
            </button>
          </form>

          {/* Demo access */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(203,196,208,0.5)' }}>
            <p className="text-xs font-semibold text-center mb-3" style={{ color: '#7a757f' }}>
              Acceso rápido · Demo
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => fillDemo('admin')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{ background: 'rgba(235,221,255,0.6)', border: '1.5px solid rgba(177,156,217,0.6)', color: '#443267' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(235,221,255,0.9)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(235,221,255,0.6)'}>
                👑 Admin
              </button>
              <button type="button" onClick={() => fillDemo('cashier')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{ background: 'rgba(253,209,227,0.5)', border: '1.5px solid rgba(250,179,202,0.6)', color: '#7a4357' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(253,209,227,0.85)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(253,209,227,0.5)'}>
                💰 Cajero
              </button>
            </div>
            <p className="text-[11px] text-center mt-3" style={{ color: '#7a757f' }}>
              Haz clic en un rol para llenar las credenciales automáticamente
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: '#7a757f' }}>
          © 2026 GelatoFlow · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
