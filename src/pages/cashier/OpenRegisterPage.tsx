import { useState } from 'react'
import { DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react'
import { S } from '../../lib/styles'
import { formatCurrency } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'
import { useCashRegisterStore } from '../../stores/cashRegisterStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'

const PRESETS = [1, 2, 5, 10, 20, 50, 100, 200, 500]

export default function OpenRegisterPage() {
  const navigate    = useNavigate()
  const { profile } = useAuthStore()
  const { setSession, currentSession } = useCashRegisterStore()

  const [amounts, setAmounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)

  const total = PRESETS.reduce((sum, d) => sum + d * (amounts[d] || 0), 0)
  const update = (denom: number, qty: number) =>
    setAmounts(prev => ({ ...prev, [denom]: Math.max(0, qty) }))

  const openRegister = async () => {
    if (total <= 0) { toast.error('Ingresa al menos un billete o moneda'); return }
    if (!profile) { toast.error('Error de sesión'); return }
    setLoading(true)

    // Cerrar cualquier sesión abierta anterior del mismo cajero (por si acaso)
    await supabase
      .from('cash_register_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('cashier_id', profile.id)
      .eq('status', 'open')

    // Crear nueva sesión en Supabase
    const { data, error } = await supabase
      .from('cash_register_sessions')
      .insert({
        cashier_id:      profile.id,
        opening_amount:  total,
        closing_amount:  null,
        expected_amount: null,
        difference:      null,
        status:          'open',
      })
      .select()
      .single()

    if (error) {
      toast.error('Error al abrir la caja: ' + error.message)
      setLoading(false)
      return
    }

    setSession(data)
    toast.success(`Caja abierta con ${formatCurrency(total)} 🔓`)
    navigate('/cashier/pos')
  }

  /* Si ya hay sesión abierta */
  if (currentSession?.status === 'open') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="rounded-[28px] p-10 text-center max-w-md w-full" style={S.glassPanel}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background:'rgba(220,252,231,0.8)' }}>
            <CheckCircle2 size={32} color="#15803d"/>
          </div>
          <h2 className="text-2xl font-black mb-2" style={S.onSurface}>Caja Abierta</h2>
          <p className="text-sm mb-4" style={S.muted}>
            Monto inicial: <strong style={S.primary}>{formatCurrency(currentSession.opening_amount)}</strong>
          </p>
          <button onClick={() => navigate('/cashier/pos')}
            className="w-full py-3 rounded-full font-bold text-sm cursor-pointer"
            style={S.btnPrimary}>
            Ir al POS →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={S.onSurface}>Apertura de Caja</h1>
        <p className="text-sm mt-1" style={S.muted}>
          Hola, <strong style={S.primary}>{profile?.full_name}</strong>. Cuenta el dinero disponible en caja.
        </p>
      </div>

      <div className="rounded-[28px] p-8" style={S.glassPanel}>
        <div className="flex items-start gap-3 rounded-2xl p-4 mb-6"
             style={{ background:'rgba(254,243,199,0.6)', border:'1px solid rgba(251,191,36,0.4)' }}>
          <AlertTriangle size={18} color="#b45309" className="shrink-0 mt-0.5"/>
          <p className="text-sm font-medium" style={{ color:'#92400e' }}>
            Ingresa la cantidad exacta de cada denominación que tienes en caja antes de comenzar a operar.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="grid grid-cols-3 gap-2 text-xs font-bold px-2 mb-1" style={S.muted}>
            <span>Denominación</span>
            <span className="text-center">Cantidad</span>
            <span className="text-right">Subtotal</span>
          </div>
          {PRESETS.map(denom => {
            const qty = amounts[denom] || 0
            const sub = denom * qty
            return (
              <div key={denom} className="grid grid-cols-3 items-center gap-3 rounded-xl px-4 py-3"
                   style={{ background:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.6)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                       style={{ background:'var(--c-primary-fixed)', color:'var(--c-primary)' }}>
                    {denom >= 20 ? '💵' : '🪙'}
                  </div>
                  <span className="text-sm font-bold" style={S.onSurface}>${denom}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => update(denom, qty - 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold cursor-pointer hover:scale-110 transition-all"
                    style={{ background:'var(--c-surface-high)', color:'var(--c-on-surface)' }}>−</button>
                  <input type="number" min="0" value={qty || ''}
                    onChange={e => update(denom, parseInt(e.target.value) || 0)}
                    className="w-14 text-center text-sm font-bold rounded-lg py-1"
                    style={{ background:'rgba(255,255,255,0.8)', border:'1.5px solid var(--c-outline-var)', color:'var(--c-on-surface)', outline:'none' }}
                    placeholder="0"/>
                  <button onClick={() => update(denom, qty + 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold cursor-pointer hover:scale-110 transition-all"
                    style={{ background:'var(--c-primary-fixed)', color:'var(--c-primary)' }}>+</button>
                </div>
                <p className="text-sm font-black text-right" style={sub > 0 ? S.primary : S.muted}>
                  {sub > 0 ? formatCurrency(sub) : '—'}
                </p>
              </div>
            )
          })}
        </div>

        <div className="rounded-2xl p-5 mb-5 flex items-center justify-between"
             style={{ background:'linear-gradient(135deg,rgba(235,221,255,0.6) 0%,rgba(253,181,204,0.3) 100%)', border:'1px solid rgba(177,156,217,0.3)' }}>
          <div>
            <p className="text-xs font-bold" style={S.muted}>Total en Caja</p>
            <p className="text-3xl font-black" style={S.primary}>{formatCurrency(total)}</p>
          </div>
          <DollarSign size={40} style={{ color:'var(--c-primary)', opacity:0.3 }}/>
        </div>

        <button onClick={openRegister} disabled={loading || total <= 0}
          className="w-full py-4 rounded-full font-black text-base cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
          style={total > 0 && !loading ? { ...S.btnPrimary } : { background:'var(--c-surface-high)', color:'var(--c-outline)', cursor:'not-allowed' }}>
          {loading
            ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Abriendo caja...</>
            : '🔓 Abrir Caja y Comenzar'}
        </button>
      </div>
    </div>
  )
}
