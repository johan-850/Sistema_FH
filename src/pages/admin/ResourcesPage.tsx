import { useState } from 'react'
import {
  Plus, Search, Pencil, Trash2, X, ChevronDown,
  FlaskConical, AlertTriangle, CheckCircle, TrendingDown
} from 'lucide-react'
import { S } from '../../lib/styles'
import { formatCurrency } from '../../lib/utils'
import { toast } from 'sonner'
import type { Resource } from '../../types/database'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

// ──────── Demo data ────────
const DEMO_RESOURCES: Resource[] = [
  { id: 'r1', name: 'Leche entera',        description: 'Leche entera para bases de helado', quantity: 15, unit: 'litro',  min_stock: 10, cost_per_unit: 1.20,  supplier: 'Lácteos del Valle', is_active: true,  created_at: new Date().toISOString() },
  { id: 'r2', name: 'Crema de leche',      description: 'Crema 35% materia grasa',           quantity:  8, unit: 'litro',  min_stock: 10, cost_per_unit: 2.50,  supplier: 'Lácteos del Valle', is_active: true,  created_at: new Date().toISOString() },
  { id: 'r3', name: 'Azúcar blanca',       description: 'Azúcar refinada',                    quantity: 25, unit: 'kg',     min_stock: 10, cost_per_unit: 0.85,  supplier: 'Distribuidora Sur', is_active: true,  created_at: new Date().toISOString() },
  { id: 'r4', name: 'Fresas frescas',      description: 'Fresas importadas de temporada',     quantity:  3, unit: 'kg',     min_stock:  5, cost_per_unit: 4.00,  supplier: 'Frutas del Mercado',is_active: true,  created_at: new Date().toISOString() },
  { id: 'r5', name: 'Cacao en polvo',      description: 'Cacao 100% natural sin azúcar',      quantity: 12, unit: 'kg',     min_stock:  3, cost_per_unit: 6.50,  supplier: 'Cacaotera SA',      is_active: true,  created_at: new Date().toISOString() },
  { id: 'r6', name: 'Extracto de vainilla',description: 'Vainilla pura de Madagascar',        quantity:  2, unit: 'litro',  min_stock:  1, cost_per_unit: 18.00, supplier: 'Importadora Aromas',is_active: true,  created_at: new Date().toISOString() },
  { id: 'r7', name: 'Conos de waffle',     description: 'Conos artesanales crocantes',        quantity: 80, unit: 'unidad', min_stock: 50, cost_per_unit: 0.15,  supplier: 'Panadería Central', is_active: true,  created_at: new Date().toISOString() },
  { id: 'r8', name: 'Vasos desechables',   description: 'Vasos biodegradables 250ml',         quantity: 120,unit: 'unidad', min_stock:100, cost_per_unit: 0.08,  supplier: 'EcoPack',           is_active: true,  created_at: new Date().toISOString() },
  { id: 'r9', name: 'Pistache molido',     description: 'Pistache siciliano molido premium',  quantity:  4, unit: 'kg',     min_stock:  2, cost_per_unit: 22.00, supplier: 'Importadora Aromas',is_active: false, created_at: new Date().toISOString() },
]

const UNITS = ['litro','kg','gramo','unidad','porción','paquete','caja']

const emptyForm = {
  name: '', description: '', quantity: '', unit: 'kg',
  min_stock: '', cost_per_unit: '', supplier: '', is_active: true,
}

type StockStatus = 'ok' | 'low' | 'critical'

function getStockStatus(r: Resource): StockStatus {
  if (r.quantity === 0) return 'critical'
  if (r.quantity <= r.min_stock) return 'low'
  return 'ok'
}

const STATUS_STYLES: Record<StockStatus, { label: string; icon: JSX.Element; tag: React.CSSProperties; bg: string }> = {
  ok:       { label: 'Stock OK',    icon: <CheckCircle  size={13}/>, tag: S.tagSuccess,          bg: 'rgba(220,252,231,0.25)' },
  low:      { label: 'Stock bajo',  icon: <AlertTriangle size={13}/>, tag: S.tagWarning,          bg: 'rgba(254,243,199,0.3)'  },
  critical: { label: 'Sin stock',   icon: <TrendingDown  size={13}/>, tag: S.tagDanger,           bg: 'rgba(254,202,202,0.3)'  },
}

export default function ResourcesPage() {
  const [resources,    setResources]    = useState<Resource[]>(DEMO_RESOURCES)
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState<'all'|StockStatus>('all')
  const [showForm,     setShowForm]     = useState(false)
  const [editing,      setEditing]      = useState<Resource | null>(null)
  const [form,         setForm]         = useState({ ...emptyForm })
  const [saving,       setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)

  // ── Derived list ──
  const filtered = resources.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                       (r.supplier ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || getStockStatus(r) === filterStatus
    return matchSearch && matchStatus
  })

  // ── Stats ──
  const stockOk       = resources.filter(r => getStockStatus(r) === 'ok').length
  const stockLow      = resources.filter(r => getStockStatus(r) === 'low').length
  const stockCritical = resources.filter(r => getStockStatus(r) === 'critical').length
  const totalValue    = resources.reduce((s, r) => s + r.quantity * r.cost_per_unit, 0)

  // ── Open forms ──
  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  const openEdit = (r: Resource) => {
    setEditing(r)
    setForm({
      name:          r.name,
      description:   r.description ?? '',
      quantity:      r.quantity.toString(),
      unit:          r.unit,
      min_stock:     r.min_stock.toString(),
      cost_per_unit: r.cost_per_unit.toString(),
      supplier:      r.supplier ?? '',
      is_active:     r.is_active,
    })
    setShowForm(true)
  }

  // ── Save ──
  const save = async () => {
    if (!form.name.trim())              { toast.error('El nombre es requerido'); return }
    if (!form.quantity || +form.quantity < 0) { toast.error('Ingresa una cantidad válida'); return }
    if (!form.min_stock || +form.min_stock < 0) { toast.error('Ingresa un stock mínimo válido'); return }
    if (!form.cost_per_unit || +form.cost_per_unit <= 0) { toast.error('Ingresa un costo válido'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 500))

    if (editing) {
      setResources(prev => prev.map(r => r.id === editing.id
        ? { ...r, ...form, quantity: +form.quantity, min_stock: +form.min_stock, cost_per_unit: +form.cost_per_unit }
        : r
      ))
      toast.success('Insumo actualizado ✨')
    } else {
      setResources(prev => [{
        id: crypto.randomUUID(),
        name:          form.name.trim(),
        description:   form.description.trim() || null,
        quantity:      +form.quantity,
        unit:          form.unit,
        min_stock:     +form.min_stock,
        cost_per_unit: +form.cost_per_unit,
        supplier:      form.supplier.trim() || null,
        is_active:     form.is_active,
        created_at:    new Date().toISOString(),
      }, ...prev])
      toast.success('Insumo creado 🎉')
    }

    setSaving(false)
    setShowForm(false)
  }

  const deleteResource = () => {
    if (!deleteTarget) return
    setResources(prev => prev.filter(r => r.id !== deleteTarget.id))
    toast.success('Insumo eliminado')
    setDeleteTarget(null)
  }

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black" style={S.onSurface}>Gestión de Recursos</h1>
          <p className="text-sm mt-1" style={S.muted}>Controla los insumos y materias primas de tu heladería.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
          style={S.btnPrimary}>
          <Plus size={16}/> Nuevo Insumo
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Stock OK',      value: stockOk,       color:'#15803d', bg:'rgba(220,252,231,0.6)', icon:'✅' },
          { label: 'Stock bajo',    value: stockLow,      color:'#b45309', bg:'rgba(254,243,199,0.6)', icon:'⚠️' },
          { label: 'Sin stock',     value: stockCritical, color:'#b91c1c', bg:'rgba(254,202,202,0.6)', icon:'🚨' },
          { label: 'Valor en bodega', value: formatCurrency(totalValue), color:'#1d4ed8', bg:'rgba(219,234,254,0.6)', icon:'💰', isText: true },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
               style={{ background: s.bg, border:'1px solid rgba(255,255,255,0.6)', boxShadow:'var(--shadow-card)' }}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className={`font-black leading-none ${(s as any).isText ? 'text-base' : 'text-2xl'}`} style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={S.muted}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-48 px-4 py-2.5 rounded-full"
             style={{ background:'rgba(255,255,255,0.65)', border:'1.5px solid var(--c-outline-var)' }}>
          <Search size={16} style={S.muted}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar insumo o proveedor..."
            className="flex-1 bg-transparent text-sm outline-none" style={S.onSurface}/>
          {search && <button onClick={() => setSearch('')}><X size={14} style={S.muted}/></button>}
        </div>

        <div className="flex rounded-full overflow-hidden"
             style={{ border:'1.5px solid var(--c-outline-var)', background:'rgba(255,255,255,0.65)' }}>
          {(['all','ok','low','critical'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-4 py-2 text-xs font-bold cursor-pointer transition-all"
              style={filterStatus === s
                ? { ...S.btnPrimary, borderRadius:0 }
                : { background:'transparent', color:'var(--c-on-surface-var)' }}>
              {s === 'all' ? 'Todos' : s === 'ok' ? 'OK' : s === 'low' ? 'Bajo' : 'Sin stock'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Resources Table ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-[24px]" style={S.glassCard}>
          <FlaskConical size={48} className="mx-auto mb-4 opacity-30" style={S.muted}/>
          <p className="text-lg font-bold" style={S.muted}>No se encontraron insumos</p>
        </div>
      ) : (
        <div className="rounded-[24px] overflow-hidden" style={S.glassCard}>
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-black uppercase tracking-wider"
               style={{ background:'rgba(235,221,255,0.3)', color:'var(--c-on-surface-var)', borderBottom:'1px solid rgba(255,255,255,0.5)' }}>
            <span>Insumo</span>
            <span className="text-right">Stock actual</span>
            <span className="text-right">Stock mín.</span>
            <span className="text-right">Costo/u</span>
            <span className="text-center">Estado</span>
            <span></span>
          </div>

          <div className="divide-y" style={{ borderColor:'rgba(255,255,255,0.35)' }}>
            {filtered.map(r => {
              const st = getStockStatus(r)
              const info = STATUS_STYLES[st]
              return (
                <div key={r.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center transition-colors hover:bg-white/30"
                  style={{ background: info.bg }}>

                  {/* Name & supplier */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                         style={{ background:'rgba(177,156,217,0.2)' }}>
                      <FlaskConical size={16} style={S.primary}/>
                    </div>
                    <div>
                      <p className="text-sm font-black" style={S.onSurface}>{r.name}</p>
                      {r.supplier && (
                        <p className="text-xs" style={S.muted}>🏭 {r.supplier}</p>
                      )}
                    </div>
                  </div>

                  {/* Stock actual */}
                  <div className="text-right">
                    <p className="text-sm font-black" style={S.onSurface}>{r.quantity}</p>
                    <p className="text-xs" style={S.muted}>{r.unit}</p>
                  </div>

                  {/* Stock mínimo */}
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={S.muted}>{r.min_stock} {r.unit}</p>
                  </div>

                  {/* Costo */}
                  <div className="text-right">
                    <p className="text-sm font-bold" style={S.onSurface}>{formatCurrency(r.cost_per_unit)}</p>
                    <p className="text-xs" style={S.muted}>/{r.unit}</p>
                  </div>

                  {/* Status badge */}
                  <div className="flex justify-center">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold"
                          style={info.tag}>
                      {info.icon} {info.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(r)}
                      className="p-2 rounded-full cursor-pointer transition-all hover:scale-110"
                      style={{ background:'rgba(235,221,255,0.6)' }} title="Editar">
                      <Pencil size={13} style={S.primary}/>
                    </button>
                    <button onClick={() => setDeleteTarget(r)}
                      className="p-2 rounded-full cursor-pointer transition-all hover:scale-110"
                      style={{ background:'rgba(254,202,202,0.6)' }} title="Eliminar">
                      <Trash2 size={13} style={S.error}/>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
             style={S.modalOverlay} onClick={() => setShowForm(false)}>
          <div className="fixed w-96 h-96 rounded-full pointer-events-none"
               style={{ background:'radial-gradient(circle,rgba(177,156,217,0.3) 0%,transparent 70%)', filter:'blur(80px)', top:'-5%', right:'10%' }}/>

          <div className="w-full max-w-lg rounded-[28px] overflow-hidden animate-fade-in-scale"
               style={{ ...S.glassPanel, maxHeight:'92vh', overflowY:'auto' }}
               onClick={e => e.stopPropagation()}>

            <div className="h-1 w-full" style={{ background:'linear-gradient(90deg,#67558c,#864d61,#30628a)' }}/>

            <div className="p-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={S.onSurface}>
                  {editing ? '✏️ Editar Insumo' : '🆕 Nuevo Insumo'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-full cursor-pointer hover:bg-black/5">
                  <X size={18} style={S.muted}/>
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={S.muted}>Nombre del insumo *</label>
                  <input value={form.name} onChange={e => setForm(p=>({...p, name:e.target.value}))}
                    placeholder="Ej: Leche entera" className="w-full" style={S.input}/>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={S.muted}>Descripción</label>
                  <textarea value={form.description} onChange={e => setForm(p=>({...p, description:e.target.value}))}
                    rows={2} placeholder="Descripción breve..." style={S.textarea}/>
                </div>

                {/* Quantity + Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Cantidad actual *</label>
                    <input type="number" min="0" step="0.01" value={form.quantity}
                      onChange={e => setForm(p=>({...p, quantity:e.target.value}))}
                      placeholder="0" className="w-full" style={S.input}/>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Unidad</label>
                    <div className="relative">
                      <select value={form.unit} onChange={e => setForm(p=>({...p, unit:e.target.value}))}
                        className="appearance-none w-full text-sm font-semibold cursor-pointer outline-none pr-8"
                        style={S.input}>
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={S.muted}/>
                    </div>
                  </div>
                </div>

                {/* Min stock + Cost */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Stock mínimo *</label>
                    <input type="number" min="0" step="0.01" value={form.min_stock}
                      onChange={e => setForm(p=>({...p, min_stock:e.target.value}))}
                      placeholder="0" className="w-full" style={S.input}/>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Costo por unidad ($) *</label>
                    <input type="number" min="0.01" step="0.01" value={form.cost_per_unit}
                      onChange={e => setForm(p=>({...p, cost_per_unit:e.target.value}))}
                      placeholder="0.00" className="w-full" style={S.input}/>
                  </div>
                </div>

                {/* Supplier */}
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={S.muted}>Proveedor</label>
                  <input value={form.supplier} onChange={e => setForm(p=>({...p, supplier:e.target.value}))}
                    placeholder="Ej: Lácteos del Valle" className="w-full" style={S.input}/>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer transition-all hover:scale-105"
                    style={S.btnOutline}>
                    Cancelar
                  </button>
                  <button onClick={save} disabled={saving}
                    className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={S.btnPrimary}>
                    {saving
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Guardando...</>
                      : editing ? '✓ Actualizar' : '✓ Crear Insumo'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="¿Eliminar insumo?"
        message={`Se eliminará "${deleteTarget?.name}" permanentemente. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={deleteResource}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
