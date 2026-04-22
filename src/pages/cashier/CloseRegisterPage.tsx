import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react'
import { S } from '../../lib/styles'
import { formatCurrency } from '../../lib/utils'
import { useCashRegisterStore } from '../../stores/cashRegisterStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const PRESETS = [1, 2, 5, 10, 20, 50, 100, 200, 500]

/* Simulated session data */
const SESSION_STATS = { sales: 3240, orders: 28, expenses: 130 }

export default function CloseRegisterPage() {
  const navigate = useNavigate()
  const { currentSession, closeSession } = useCashRegisterStore()

  const [amounts, setAmounts] = useState<Record<number, number>>({})
  const [closing, setClosing] = useState(false)
  const [closed,  setClosed]  = useState(false)

  const counted   = PRESETS.reduce((s, d) => s + d * (amounts[d] || 0), 0)
  const opening   = currentSession?.opening_amount ?? 0
  const expected  = opening + SESSION_STATS.sales - SESSION_STATS.expenses
  const difference = counted - expected

  const update = (d: number, q: number) => setAmounts(p => ({ ...p, [d]: Math.max(0, q) }))

  const closeReg = async () => {
    if (counted <= 0) { toast.error('Cuenta el dinero primero'); return }
    setClosing(true)
    await new Promise(r => setTimeout(r, 900))
    setClosed(true); setClosing(false)
    toast.success('Caja cerrada correctamente')
    setTimeout(() => { closeSession(); navigate('/cashier/pos') }, 2500)
  }

  if (closed) return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="rounded-[28px] p-10 text-center max-w-md w-full" style={S.glassPanel}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background:'rgba(220,252,231,0.8)' }}>
          <CheckCircle2 size={32} color="#15803d"/>
        </div>
        <h2 className="text-2xl font-black mb-2" style={S.onSurface}>¡Caja Cerrada!</h2>
        <p className="text-sm" style={S.muted}>El turno ha finalizado correctamente.</p>
        <div className="mt-6 space-y-2 text-left rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.6)' }}>
          <div className="flex justify-between text-sm"><span style={S.muted}>Esperado</span><span className="font-bold" style={S.onSurface}>{formatCurrency(expected)}</span></div>
          <div className="flex justify-between text-sm"><span style={S.muted}>Contado</span><span className="font-bold" style={S.onSurface}>{formatCurrency(counted)}</span></div>
          <div className="flex justify-between text-sm"><span style={S.muted}>Diferencia</span>
            <span className="font-bold" style={difference >= 0 ? { color:'#15803d' } : S.error}>
              {difference >= 0 ? '+':''}{formatCurrency(difference)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={S.onSurface}>Cierre de Caja</h1>
        <p className="text-sm mt-1" style={S.muted}>Cuenta el dinero en caja y cierra el turno.</p>
      </div>

      {/* Session summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Ventas del turno', value:SESSION_STATS.sales, icon:<TrendingUp size={18}/>, color:'#15803d', bg:'rgba(220,252,231,0.6)' },
          { label:'Gastos del turno', value:SESSION_STATS.expenses, icon:<TrendingDown size={18}/>, color:'var(--c-error)', bg:'rgba(254,202,202,0.4)' },
          { label:'Apertura de caja', value:opening, icon:<DollarSign size={18}/>, color:'var(--c-primary)', bg:'rgba(235,221,255,0.5)' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-4 text-center" style={{ background:stat.bg, border:'1px solid rgba(255,255,255,0.6)' }}>
            <div className="flex justify-center mb-2" style={{ color:stat.color }}>{stat.icon}</div>
            <p className="text-[11px] font-bold mb-1" style={S.muted}>{stat.label}</p>
            <p className="text-lg font-black" style={{ color:stat.color }}>{formatCurrency(stat.value)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] p-7" style={S.glassPanel}>
        {/* Denominations */}
        <h3 className="text-base font-black mb-4" style={S.onSurface}>Contar Dinero en Caja</h3>
        <div className="space-y-2.5 mb-7">
          {PRESETS.map(d => {
            const qty = amounts[d] || 0
            return (
              <div key={d} className="grid grid-cols-3 items-center gap-3 rounded-xl px-4 py-2.5"
                   style={{ background:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.6)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{d >= 20 ? '💵':'🪙'}</span>
                  <span className="text-sm font-bold" style={S.onSurface}>${d}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => update(d, qty-1)} className="w-6 h-6 rounded-full text-sm font-bold cursor-pointer" style={{ background:'var(--c-surface-high)', color:'var(--c-on-surface)' }}>−</button>
                  <input type="number" min="0" value={qty || ''} onChange={e => update(d, parseInt(e.target.value)||0)}
                    className="w-12 text-center text-sm font-bold rounded-lg py-1" style={{ background:'rgba(255,255,255,0.8)', border:'1.5px solid var(--c-outline-var)', color:'var(--c-on-surface)', outline:'none' }} placeholder="0"/>
                  <button onClick={() => update(d, qty+1)} className="w-6 h-6 rounded-full text-sm font-bold cursor-pointer" style={{ background:'var(--c-primary-fixed)', color:'var(--c-primary)' }}>+</button>
                </div>
                <p className="text-sm font-black text-right" style={qty > 0 ? S.primary : S.muted}>
                  {qty > 0 ? formatCurrency(d * qty) : '—'}
                </p>
              </div>
            )
          })}
        </div>

        {/* Reconciliation */}
        <div className="rounded-2xl p-5 mb-5 space-y-2.5" style={{ background:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.7)' }}>
          <div className="flex justify-between text-sm"><span style={S.muted}>Monto esperado</span><span className="font-bold" style={S.onSurface}>{formatCurrency(expected)}</span></div>
          <div className="flex justify-between text-sm"><span style={S.muted}>Monto contado</span><span className="font-bold" style={S.onSurface}>{formatCurrency(counted)}</span></div>
          <div className="h-px" style={{ background:'var(--c-outline-var)', opacity:.4 }}/>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold" style={S.muted}>Diferencia</span>
            <div className="flex items-center gap-2">
              {counted > 0 && (Math.abs(difference) > 5
                ? <AlertCircle size={16} style={S.error}/>
                : <CheckCircle2 size={16} color="#15803d"/>
              )}
              <span className="text-lg font-black" style={difference >= 0 ? { color:'#15803d' } : S.error}>
                {difference >= 0 ? '+':''}{formatCurrency(difference)}
              </span>
            </div>
          </div>
        </div>

        <button onClick={closeReg} disabled={closing}
          className="w-full py-4 rounded-full font-black text-base cursor-pointer transition-all flex items-center justify-center gap-2"
          style={counted > 0 && !closing ? { background:'linear-gradient(135deg,#ba1a1a,#c0392b)', color:'#fff', boxShadow:'0 8px 24px rgba(186,26,26,.35)' } : { background:'var(--c-surface-high)', color:'var(--c-outline)', cursor:'not-allowed' }}>
          {closing ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Cerrando...</> : '🔒 Cerrar Caja'}
        </button>
      </div>
    </div>
  )
}
