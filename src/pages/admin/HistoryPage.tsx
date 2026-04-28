import { useState, useEffect, useCallback } from 'react'
import { Search, X, Loader2, TrendingUp, TrendingDown, Minus as AdjustIcon } from 'lucide-react'
import { S } from '../../lib/styles'
import { supabase } from '../../lib/supabase'
import type { InventoryMovement, MovementType } from '../../types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const MOV_STYLE: Record<MovementType, { label: string; icon: React.ReactNode; style: React.CSSProperties }> = {
  entrada: { label: 'Entrada', icon: <TrendingUp  size={13}/>, style: { background: 'rgba(220,252,231,0.8)', color: '#15803d' } },
  salida:  { label: 'Salida',  icon: <TrendingDown size={13}/>, style: { background: 'rgba(254,202,202,0.8)', color: '#b91c1c' } },
  ajuste:  { label: 'Ajuste',  icon: <AdjustIcon  size={13}/>, style: { background: 'rgba(254,243,199,0.8)', color: '#b45309' } },
}

type FilterMovement = 'all' | MovementType
type FilterItem     = 'all' | 'product' | 'resource'

export default function HistoryPage() {
  const [movements,   setMovements]   = useState<InventoryMovement[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterMov,   setFilterMov]   = useState<FilterMovement>('all')
  const [filterItem,  setFilterItem]  = useState<FilterItem>('all')

  const fetchMovements = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('inventory_movements')
      .select(`
        *,
        performer:profiles!performed_by(full_name, role),
        product:products(name, unit),
        resource:resources(name, unit)
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) console.error(error)
    setMovements(data ?? [])
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchMovements() }, [fetchMovements])

  const filtered = movements.filter(m => {
    const name = m.item_type === 'product' ? m.product?.name : m.resource?.name
    const matchSearch = !search || (name ?? '').toLowerCase().includes(search.toLowerCase()) ||
                        (m.reason ?? '').toLowerCase().includes(search.toLowerCase()) ||
                        (m.performer?.full_name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchMov  = filterMov  === 'all' || m.movement_type === filterMov
    const matchItem = filterItem === 'all' || m.item_type === filterItem
    return matchSearch && matchMov && matchItem
  })

  const totalEntradas = movements.filter(m => m.movement_type === 'entrada').length
  const totalSalidas  = movements.filter(m => m.movement_type === 'salida').length
  const totalAjustes  = movements.filter(m => m.movement_type === 'ajuste').length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin" style={S.primary}/>
    </div>
  )

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={S.onSurface}>Historial de Movimientos</h1>
        <p className="text-sm mt-1" style={S.muted}>Registro de todas las entradas, salidas y ajustes de inventario.</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Entradas', value: totalEntradas, color: '#15803d', bg: 'rgba(220,252,231,0.6)', icon: '📈' },
          { label: 'Salidas',  value: totalSalidas,  color: '#b91c1c', bg: 'rgba(254,202,202,0.6)', icon: '📉' },
          { label: 'Ajustes',  value: totalAjustes,  color: '#b45309', bg: 'rgba(254,243,199,0.6)', icon: '🔧' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3"
               style={{ background: s.bg, border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'var(--shadow-card)' }}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={S.muted}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 min-w-48 px-4 py-2.5 rounded-full"
             style={{ background: 'rgba(255,255,255,0.65)', border: '1.5px solid var(--c-outline-var)' }}>
          <Search size={16} style={S.muted}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ítem, motivo o usuario..."
            className="flex-1 bg-transparent text-sm outline-none" style={S.onSurface}/>
          {search && <button onClick={() => setSearch('')}><X size={14} style={S.muted}/></button>}
        </div>

        {/* Movement type filter */}
        <div className="flex rounded-full overflow-hidden"
             style={{ border: '1.5px solid var(--c-outline-var)', background: 'rgba(255,255,255,0.65)' }}>
          {(['all', 'entrada', 'salida', 'ajuste'] as const).map(f => (
            <button key={f} onClick={() => setFilterMov(f)}
              className="px-4 py-2 text-xs font-bold cursor-pointer transition-all"
              style={filterMov === f ? { ...S.btnPrimary, borderRadius: 0 } : { background: 'transparent', color: 'var(--c-on-surface-var)' }}>
              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Item type filter */}
        <div className="flex rounded-full overflow-hidden"
             style={{ border: '1.5px solid var(--c-outline-var)', background: 'rgba(255,255,255,0.65)' }}>
          {(['all', 'product', 'resource'] as const).map(f => (
            <button key={f} onClick={() => setFilterItem(f)}
              className="px-4 py-2 text-xs font-bold cursor-pointer transition-all"
              style={filterItem === f ? { ...S.btnPrimary, borderRadius: 0 } : { background: 'transparent', color: 'var(--c-on-surface-var)' }}>
              {f === 'all' ? 'Todo' : f === 'product' ? '🛍️ Producto' : '🧪 Insumo'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-[24px]" style={S.glassCard}>
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-lg font-bold" style={S.muted}>
            {movements.length === 0 ? 'Aún no hay movimientos registrados.' : 'No se encontraron movimientos.'}
          </p>
        </div>
      ) : (
        <div className="rounded-[24px] overflow-hidden" style={S.glassCard}>
          {/* Header */}
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-black uppercase tracking-wider"
               style={{ background: 'rgba(235,221,255,0.3)', color: 'var(--c-on-surface-var)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
            <span>Fecha</span>
            <span>Ítem</span>
            <span className="text-center">Tipo</span>
            <span className="text-right">Cantidad</span>
            <span>Usuario</span>
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.35)' }}>
            {filtered.map(m => {
              const name = m.item_type === 'product' ? m.product?.name : m.resource?.name
              const unit = m.item_type === 'product' ? m.product?.unit : m.resource?.unit
              const mv   = MOV_STYLE[m.movement_type]
              return (
                <div key={m.id}
                  className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center transition-colors hover:bg-white/30">
                  <div>
                    <p className="text-xs font-semibold" style={S.onSurface}>
                      {format(new Date(m.created_at), 'dd MMM yyyy', { locale: es })}
                    </p>
                    <p className="text-[10px]" style={S.muted}>
                      {format(new Date(m.created_at), 'HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={S.onSurface}>{name ?? '—'}</p>
                    <p className="text-[11px]" style={S.muted}>
                      {m.item_type === 'product' ? '🛍️ Producto' : '🧪 Insumo'}
                      {m.reason ? ` · ${m.reason}` : ''}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold" style={mv.style}>
                      {mv.icon} {mv.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black" style={S.onSurface}>{m.quantity} {unit}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={S.muted}>{m.performer?.full_name ?? '—'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-center text-xs mt-4" style={S.muted}>
        Mostrando {filtered.length} de {movements.length} registros (máx. 200 recientes)
      </p>
    </div>
  )
}
