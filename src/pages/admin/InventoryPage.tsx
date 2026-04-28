import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, X, ChevronDown, Package, FlaskConical, Loader2,
  TrendingUp, TrendingDown, Minus as AdjustIcon
} from 'lucide-react'
import { S } from '../../lib/styles'
import { formatCurrency } from '../../lib/utils'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import type { Product, Resource, MovementType, ItemType } from '../../types/database'
import { Portal } from '../../components/ui/Portal'

type TabType = 'products' | 'resources'

const MOVEMENT_LABELS: Record<MovementType, { label: string; icon: React.ReactNode; style: React.CSSProperties }> = {
  entrada: { label: 'Entrada',  icon: <TrendingUp  size={14}/>, style: { background: 'rgba(220,252,231,0.8)', color: '#15803d' } },
  salida:  { label: 'Salida',   icon: <TrendingDown size={14}/>, style: { background: 'rgba(254,202,202,0.8)', color: '#b91c1c' } },
  ajuste:  { label: 'Ajuste',   icon: <AdjustIcon  size={14}/>, style: { background: 'rgba(254,243,199,0.8)', color: '#b45309' } },
}

interface MovementForm {
  item_type: ItemType
  item_id: string
  movement_type: MovementType
  quantity: string
  reason: string
}

const emptyMovForm: MovementForm = {
  item_type: 'product',
  item_id: '',
  movement_type: 'entrada',
  quantity: '',
  reason: '',
}

export default function InventoryPage() {
  const { profile }    = useAuthStore()
  const [tab,          setTab]          = useState<TabType>('products')
  const [products,     setProducts]     = useState<Product[]>([])
  const [resources,    setResources]    = useState<Resource[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [showForm,     setShowForm]     = useState(false)
  const [movForm,      setMovForm]      = useState<MovementForm>({ ...emptyMovForm })
  const [saving,       setSaving]       = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: prods }, { data: ress }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('name'),
      supabase.from('resources').select('*').order('name'),
    ])
    setProducts(prods ?? [])
    setResources(ress ?? [])
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Filtered lists ──
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredResources = resources.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  // ── Open movement form ──
  const openMovement = (itemType: ItemType, itemId: string) => {
    setMovForm({ ...emptyMovForm, item_type: itemType, item_id: itemId })
    setShowForm(true)
  }

  // ── Save movement ──
  const saveMovement = async () => {
    if (!movForm.item_id)        { toast.error('Selecciona un ítem'); return }
    if (!movForm.quantity || +movForm.quantity <= 0) { toast.error('Ingresa una cantidad válida'); return }
    if (!profile)                { toast.error('Sin sesión activa'); return }

    setSaving(true)
    const qty = +movForm.quantity

    // Insert movement record
    const { error: movError } = await supabase.from('inventory_movements').insert({
      item_type:    movForm.item_type,
      item_id:      movForm.item_id,
      movement_type: movForm.movement_type,
      quantity:     qty,
      reason:       movForm.reason.trim() || null,
      performed_by: profile.id,
    })
    if (movError) { toast.error('Error al registrar: ' + movError.message); setSaving(false); return }

    // Update stock in source table
    const delta = movForm.movement_type === 'entrada' ? qty
                : movForm.movement_type === 'salida'  ? -qty
                : null // ajuste sets absolute value

    if (movForm.item_type === 'product') {
      const product = products.find(p => p.id === movForm.item_id)!
      const newStock = delta !== null
        ? Math.max(0, product.stock_quantity + delta)
        : qty
      await supabase.from('products').update({ stock_quantity: newStock }).eq('id', movForm.item_id)
    } else {
      const resource = resources.find(r => r.id === movForm.item_id)!
      const newQty = delta !== null
        ? Math.max(0, resource.quantity + delta)
        : qty
      await supabase.from('resources').update({ quantity: newQty }).eq('id', movForm.item_id)
    }

    toast.success(`Movimiento registrado ✨`)
    await fetchAll()
    setSaving(false)
    setShowForm(false)
  }

  // ── Stats ──
  const lowStockProducts  = products.filter(p => p.stock_quantity < 5 && p.is_active).length
  const lowStockResources = resources.filter(r => r.quantity <= r.min_stock).length
  const totalProductValue = products.reduce((s, p) => s + p.price * p.stock_quantity, 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin" style={S.primary}/>
    </div>
  )

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black" style={S.onSurface}>Inventario</h1>
          <p className="text-sm mt-1" style={S.muted}>Registra entradas, salidas y ajustes de stock.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
          style={S.btnPrimary}>
          <Plus size={16}/> Registrar Movimiento
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Productos stock bajo', value: lowStockProducts,  color: '#b91c1c', bg: 'rgba(254,202,202,0.6)', icon: '⚠️' },
          { label: 'Insumos stock bajo',   value: lowStockResources, color: '#b45309', bg: 'rgba(254,243,199,0.6)', icon: '📉' },
          { label: 'Valor total catálogo', value: formatCurrency(totalProductValue), color: '#1d4ed8', bg: 'rgba(219,234,254,0.6)', icon: '💰', isText: true },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3"
               style={{ background: s.bg, border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'var(--shadow-card)' }}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className={`font-black leading-none ${'isText' in s ? 'text-sm' : 'text-2xl'}`} style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={S.muted}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs + Search ── */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="flex rounded-full overflow-hidden"
             style={{ border: '1.5px solid var(--c-outline-var)', background: 'rgba(255,255,255,0.65)' }}>
          {(['products', 'resources'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 text-sm font-bold cursor-pointer transition-all flex items-center gap-2"
              style={tab === t
                ? { ...S.btnPrimary, borderRadius: 0 }
                : { background: 'transparent', color: 'var(--c-on-surface-var)' }}>
              {t === 'products' ? <><Package size={14}/> Productos</> : <><FlaskConical size={14}/> Insumos</>}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-48 px-4 py-2.5 rounded-full"
             style={{ background: 'rgba(255,255,255,0.65)', border: '1.5px solid var(--c-outline-var)' }}>
          <Search size={16} style={S.muted}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="flex-1 bg-transparent text-sm outline-none" style={S.onSurface}/>
          {search && <button onClick={() => setSearch('')}><X size={14} style={S.muted}/></button>}
        </div>
      </div>

      {/* ── Table ── */}
      {tab === 'products' ? (
        <div className="rounded-[24px] overflow-hidden" style={S.glassCard}>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-black uppercase tracking-wider"
               style={{ background: 'rgba(235,221,255,0.3)', color: 'var(--c-on-surface-var)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
            <span>Producto</span>
            <span className="text-right">Stock</span>
            <span className="text-center">Estado</span>
            <span className="text-right">Precio</span>
            <span/>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.35)' }}>
            {filteredProducts.map(p => {
              const isLow = p.stock_quantity < 5
              return (
                <div key={p.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center transition-colors hover:bg-white/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xl"
                         style={{ background: 'rgba(177,156,217,0.2)' }}>
                      {(p as Product & { category?: { icon: string } }).category?.icon ?? '📦'}
                    </div>
                    <div>
                      <p className="text-sm font-black" style={S.onSurface}>{p.name}</p>
                      <p className="text-xs" style={S.muted}>{(p as Product & { category?: { name: string } }).category?.name ?? '—'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black" style={isLow ? { color: '#b91c1c' } : S.onSurface}>{p.stock_quantity}</p>
                    <p className="text-xs" style={S.muted}>{p.unit}</p>
                  </div>
                  <div className="flex justify-center">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                          style={p.is_active ? (isLow ? { background: 'rgba(254,202,202,0.8)', color: '#b91c1c' } : S.tagSuccess) : S.tagWarning}>
                      {p.is_active ? (isLow ? '⚠️ Bajo' : '✅ OK') : 'Inactivo'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={S.primary}>{formatCurrency(p.price)}</p>
                  </div>
                  <button onClick={() => openMovement('product', p.id)}
                    className="p-2 rounded-full cursor-pointer hover:scale-110 transition-all flex items-center gap-1 px-3 text-xs font-bold"
                    style={{ background: 'rgba(235,221,255,0.6)', color: 'var(--c-primary)' }}>
                    <Plus size={13}/> Mov.
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] overflow-hidden" style={S.glassCard}>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-black uppercase tracking-wider"
               style={{ background: 'rgba(235,221,255,0.3)', color: 'var(--c-on-surface-var)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
            <span>Insumo</span>
            <span className="text-right">Cantidad</span>
            <span className="text-right">Mín.</span>
            <span className="text-center">Estado</span>
            <span/>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.35)' }}>
            {filteredResources.map(r => {
              const isLow = r.quantity <= r.min_stock
              const isEmpty = r.quantity === 0
              return (
                <div key={r.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center transition-colors hover:bg-white/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(177,156,217,0.2)' }}>
                      <FlaskConical size={16} style={S.primary}/>
                    </div>
                    <div>
                      <p className="text-sm font-black" style={S.onSurface}>{r.name}</p>
                      {r.supplier && <p className="text-xs" style={S.muted}>🏭 {r.supplier}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black" style={isEmpty ? { color: '#b91c1c' } : isLow ? { color: '#b45309' } : S.onSurface}>{r.quantity}</p>
                    <p className="text-xs" style={S.muted}>{r.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={S.muted}>{r.min_stock} {r.unit}</p>
                  </div>
                  <div className="flex justify-center">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                          style={isEmpty ? { background: 'rgba(254,202,202,0.8)', color: '#b91c1c' } : isLow ? S.tagWarning : S.tagSuccess}>
                      {isEmpty ? '🚨 Agotado' : isLow ? '⚠️ Bajo' : '✅ OK'}
                    </span>
                  </div>
                  <button onClick={() => openMovement('resource', r.id)}
                    className="p-2 rounded-full cursor-pointer hover:scale-110 transition-all flex items-center gap-1 px-3 text-xs font-bold"
                    style={{ background: 'rgba(235,221,255,0.6)', color: 'var(--c-primary)' }}>
                    <Plus size={13}/> Mov.
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Movement Form Modal ── */}
      {showForm && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
               style={S.modalOverlay} onClick={() => setShowForm(false)}>
            <div className="w-full max-w-md rounded-[28px] overflow-hidden animate-fade-in-scale"
                 style={{ ...S.glassPanel, maxHeight: '90vh', overflowY: 'auto' }}
                 onClick={e => e.stopPropagation()}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#67558c,#864d61,#30628a)' }}/>
              <div className="p-7">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black" style={S.onSurface}>📦 Registrar Movimiento</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-full cursor-pointer hover:bg-black/5">
                    <X size={18} style={S.muted}/>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Item type */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Tipo de ítem</label>
                    <div className="flex rounded-full overflow-hidden" style={{ border: '1.5px solid var(--c-outline-var)' }}>
                      {(['product', 'resource'] as const).map(t => (
                        <button key={t} onClick={() => setMovForm(p => ({ ...p, item_type: t, item_id: '' }))}
                          className="flex-1 py-2.5 text-sm font-bold cursor-pointer transition-all"
                          style={movForm.item_type === t ? { ...S.btnPrimary, borderRadius: 0 } : { background: 'transparent', color: 'var(--c-on-surface-var)' }}>
                          {t === 'product' ? '🛍️ Producto' : '🧪 Insumo'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Item select */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>
                      {movForm.item_type === 'product' ? 'Producto' : 'Insumo'} *
                    </label>
                    <div className="relative">
                      <select value={movForm.item_id} onChange={e => setMovForm(p => ({ ...p, item_id: e.target.value }))}
                        className="appearance-none w-full text-sm font-semibold cursor-pointer outline-none pr-8"
                        style={S.input}>
                        <option value="" disabled>Selecciona...</option>
                        {(movForm.item_type === 'product' ? products : resources).map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={S.muted}/>
                    </div>
                  </div>

                  {/* Movement type */}
                  <div>
                    <label className="text-xs font-bold block mb-2" style={S.muted}>Tipo de movimiento</label>
                    <div className="flex gap-2">
                      {(Object.keys(MOVEMENT_LABELS) as MovementType[]).map(mt => (
                        <button key={mt} onClick={() => setMovForm(p => ({ ...p, movement_type: mt }))}
                          className="flex-1 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                          style={movForm.movement_type === mt
                            ? { ...MOVEMENT_LABELS[mt].style, border: '2px solid currentColor' }
                            : { background: 'rgba(255,255,255,0.5)', border: '1.5px solid var(--c-outline-var)', color: 'var(--c-on-surface-var)' }}>
                          {MOVEMENT_LABELS[mt].icon} {MOVEMENT_LABELS[mt].label}
                        </button>
                      ))}
                    </div>
                    {movForm.movement_type === 'ajuste' && (
                      <p className="text-[11px] mt-1.5 font-medium" style={S.muted}>
                        ℹ️ El ajuste establece la cantidad absoluta (reemplaza el valor actual).
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Cantidad *</label>
                    <input type="number" min="0.01" step="0.01" value={movForm.quantity}
                      onChange={e => setMovForm(p => ({ ...p, quantity: e.target.value }))}
                      placeholder="0" className="w-full" style={S.input}/>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Motivo / Observación</label>
                    <textarea value={movForm.reason} onChange={e => setMovForm(p => ({ ...p, reason: e.target.value }))}
                      rows={2} placeholder="Ej: Compra semanal, producto vencido..." style={S.textarea}/>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setShowForm(false)}
                      className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer hover:scale-105 transition-all"
                      style={S.btnOutline}>Cancelar</button>
                    <button onClick={saveMovement} disabled={saving}
                      className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer hover:scale-105 transition-all flex items-center justify-center gap-2"
                      style={S.btnPrimary}>
                      {saving
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Guardando...</>
                        : '✓ Registrar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
