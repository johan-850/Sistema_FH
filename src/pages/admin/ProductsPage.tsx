import { useState } from 'react'
import {
  Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight,
  X, ChevronDown, Package
} from 'lucide-react'
import { S } from '../../lib/styles'
import { formatCurrency } from '../../lib/utils'
import { toast } from 'sonner'
import type { Product, Category } from '../../types/database'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

// ──────────────── Demo data ────────────────
const DEMO_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Helados',   description: null, color: '#fdb5cc', icon: '🍦', is_active: true, created_at: '' },
  { id: 'c2', name: 'Toppings', description: null, color: '#b5d5fb', icon: '🍓', is_active: true, created_at: '' },
  { id: 'c3', name: 'Bebidas',  description: null, color: '#b5fbca', icon: '🥤', is_active: true, created_at: '' },
  { id: 'c4', name: 'Postres',  description: null, color: '#fde9b5', icon: '🍰', is_active: true, created_at: '' },
]

const DEMO_PRODUCTS: Product[] = [
  { id: 'p1', category_id: 'c1', name: 'Fresa Suprema',   description: 'Helado artesanal de fresa natural',   price: 4.50, image_url: null, is_active: true,  stock_quantity: 25, unit: 'unidad', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[0] },
  { id: 'p2', category_id: 'c1', name: 'Menta Fresca',    description: 'Menta con chips de chocolate',         price: 4.50, image_url: null, is_active: true,  stock_quantity: 18, unit: 'unidad', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[0] },
  { id: 'p3', category_id: 'c1', name: 'Choco Oscuro',    description: 'Chocolate belga 70%',                  price: 5.00, image_url: null, is_active: true,  stock_quantity: 20, unit: 'unidad', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[0] },
  { id: 'p4', category_id: 'c1', name: 'Vainilla Clásica',description: 'Vainilla de Madagascar',               price: 4.00, image_url: null, is_active: false, stock_quantity:  0, unit: 'unidad', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[0] },
  { id: 'p5', category_id: 'c1', name: 'Mora Salvaje',    description: 'Mora silvestre natural',               price: 4.75, image_url: null, is_active: true,  stock_quantity: 14, unit: 'unidad', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[0] },
  { id: 'p6', category_id: 'c1', name: 'Pistache Dream',  description: 'Pistache premium siciliano',           price: 5.50, image_url: null, is_active: true,  stock_quantity: 10, unit: 'unidad', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[0] },
  { id: 'p7', category_id: 'c2', name: 'Chispas Choco',   description: 'Chispas de chocolate belga',          price: 0.75, image_url: null, is_active: true,  stock_quantity: 50, unit: 'porción', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[1] },
  { id: 'p8', category_id: 'c2', name: 'Fresas Frescas',  description: 'Fresas naturales cortadas',           price: 1.00, image_url: null, is_active: true,  stock_quantity: 30, unit: 'porción', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[1] },
  { id: 'p9', category_id: 'c3', name: 'Limonada',        description: 'Limonada natural con menta',          price: 2.50, image_url: null, is_active: true,  stock_quantity: 40, unit: 'vaso', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[2] },
  { id: 'p10',category_id: 'c4', name: 'Brownie',         description: 'Brownie de chocolate caliente',       price: 3.50, image_url: null, is_active: true,  stock_quantity: 15, unit: 'unidad', created_at: new Date().toISOString(), category: DEMO_CATEGORIES[3] },
]

// ──────────────── Form empty state ────────────────
const emptyForm = {
  name: '', description: '', price: '', category_id: 'c1',
  stock_quantity: '', unit: 'unidad', is_active: true,
}

// ──────────────── Category emoji map ────────────────
const catIcon = (catId: string) => DEMO_CATEGORIES.find(c => c.id === catId)?.icon ?? '📦'

// ──────────────── Color by category ────────────────
const catColor: Record<string, string> = {
  c1: 'rgba(253,181,204,0.35)',
  c2: 'rgba(181,213,251,0.35)',
  c3: 'rgba(181,251,202,0.35)',
  c4: 'rgba(253,233,181,0.35)',
}

export default function ProductsPage() {
  const [products,    setProducts]    = useState<Product[]>(DEMO_PRODUCTS)
  const [search,      setSearch]      = useState('')
  const [filterCat,   setFilterCat]   = useState('all')
  const [filterState, setFilterState] = useState<'all'|'active'|'inactive'>('all')
  const [showForm,    setShowForm]    = useState(false)
  const [editing,     setEditing]     = useState<Product | null>(null)
  const [form,        setForm]        = useState({ ...emptyForm })
  const [saving,      setSaving]      = useState(false)
  const [deleteTarget,setDeleteTarget]= useState<Product | null>(null)

  // ── Derived list ──
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCat   === 'all' || p.category_id === filterCat
    const matchState  = filterState === 'all' || (filterState === 'active' ? p.is_active : !p.is_active)
    return matchSearch && matchCat && matchState
  })

  // ── Stats ──
  const totalActive   = products.filter(p => p.is_active).length
  const totalInactive = products.filter(p => !p.is_active).length
  const lowStock      = products.filter(p => p.stock_quantity < 5 && p.is_active).length

  // ── Open create form ──
  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  // ── Open edit form ──
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: p.price.toString(),
      category_id: p.category_id,
      stock_quantity: p.stock_quantity.toString(),
      unit: p.unit,
      is_active: p.is_active,
    })
    setShowForm(true)
  }

  // ── Save ──
  const save = async () => {
    if (!form.name.trim())          { toast.error('El nombre es requerido'); return }
    if (!form.price || +form.price <= 0) { toast.error('Ingresa un precio válido'); return }
    if (form.stock_quantity === '' || +form.stock_quantity < 0) { toast.error('Ingresa un stock válido'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 500))

    const cat = DEMO_CATEGORIES.find(c => c.id === form.category_id)!
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id
        ? { ...p, ...form, price: +form.price, stock_quantity: +form.stock_quantity, category: cat }
        : p
      ))
      toast.success('Producto actualizado ✨')
    } else {
      const newProd: Product = {
        id: crypto.randomUUID(),
        category_id: form.category_id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: +form.price,
        image_url: null,
        is_active: form.is_active,
        stock_quantity: +form.stock_quantity,
        unit: form.unit,
        created_at: new Date().toISOString(),
        category: cat,
      }
      setProducts(prev => [newProd, ...prev])
      toast.success('Producto creado 🎉')
    }

    setSaving(false)
    setShowForm(false)
  }

  // ── Toggle active ──
  const toggleActive = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p
      const next = !p.is_active
      toast.success(next ? 'Producto activado' : 'Producto desactivado')
      return { ...p, is_active: next }
    }))
  }

  // ── Delete ──
  const deleteProduct = () => {
    if (!deleteTarget) return
    setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
    toast.success('Producto eliminado')
    setDeleteTarget(null)
  }

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black" style={S.onSurface}>Gestión de Productos</h1>
          <p className="text-sm mt-1" style={S.muted}>Crea, edita y administra el catálogo de tu heladería.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
          style={S.btnPrimary}>
          <Plus size={16}/> Nuevo Producto
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Activos',     value: totalActive,   color: '#15803d', bg: 'rgba(220,252,231,0.6)', icon: '✅' },
          { label: 'Inactivos',   value: totalInactive, color: '#b45309', bg: 'rgba(254,243,199,0.6)', icon: '⏸️' },
          { label: 'Stock bajo',  value: lowStock,      color: '#b91c1c', bg: 'rgba(254,202,202,0.6)', icon: '⚠️' },
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
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-48 px-4 py-2.5 rounded-full"
             style={{ background:'rgba(255,255,255,0.65)', border:'1.5px solid var(--c-outline-var)' }}>
          <Search size={16} style={S.muted}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={S.onSurface}/>
          {search && <button onClick={() => setSearch('')}><X size={14} style={S.muted}/></button>}
        </div>

        {/* Category filter */}
        <div className="relative">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 rounded-full text-sm font-bold cursor-pointer outline-none"
            style={{ background:'rgba(255,255,255,0.65)', border:'1.5px solid var(--c-outline-var)', color:'var(--c-on-surface)' }}>
            <option value="all">Todas las categorías</option>
            {DEMO_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={S.muted}/>
        </div>

        {/* Status filter */}
        <div className="flex rounded-full overflow-hidden"
             style={{ border:'1.5px solid var(--c-outline-var)', background:'rgba(255,255,255,0.65)' }}>
          {(['all','active','inactive'] as const).map(s => (
            <button key={s} onClick={() => setFilterState(s)}
              className="px-4 py-2 text-xs font-bold cursor-pointer transition-all"
              style={filterState === s
                ? { ...S.btnPrimary, borderRadius:0 }
                : { background:'transparent', color:'var(--c-on-surface-var)' }}>
              {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-[24px]" style={S.glassCard}>
          <Package size={48} className="mx-auto mb-4 opacity-30" style={S.muted}/>
          <p className="text-lg font-bold" style={S.muted}>No se encontraron productos</p>
          <p className="text-sm mt-1" style={S.muted}>Intenta con otra búsqueda o crea uno nuevo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id}
              className="rounded-[20px] overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              style={{ ...S.glassCard, opacity: p.is_active ? 1 : 0.65 }}>

              {/* Product color banner */}
              <div className="h-24 flex items-center justify-center text-5xl"
                   style={{ background: catColor[p.category_id] ?? 'rgba(235,221,255,0.3)' }}>
                {catIcon(p.category_id)}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                {/* Category tag + status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: catColor[p.category_id] ?? 'rgba(235,221,255,0.5)', color:'var(--c-on-surface)' }}>
                    {p.category?.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={p.is_active ? S.tagSuccess : S.tagWarning}>
                    {p.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <h3 className="font-black text-base leading-tight mb-1" style={S.onSurface}>{p.name}</h3>
                {p.description && (
                  <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={S.muted}>{p.description}</p>
                )}

                <div className="mt-auto space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black" style={S.primary}>{formatCurrency(p.price)}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(255,255,255,0.6)', ...S.muted }}>
                      Stock: {p.stock_quantity} {p.unit}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.5)' }}>
                  <button onClick={() => toggleActive(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-105"
                    style={S.btnOutline} title={p.is_active ? 'Desactivar' : 'Activar'}>
                    {p.is_active
                      ? <><ToggleRight size={14} style={{ color:'#15803d' }}/> Activo</>
                      : <><ToggleLeft  size={14} style={S.muted}/> Inactivo</>
                    }
                  </button>
                  <button onClick={() => openEdit(p)}
                    className="p-2 rounded-full cursor-pointer transition-all hover:scale-110"
                    style={{ ...S.btnOutline, border:'none', background:'rgba(235,221,255,0.5)' }} title="Editar">
                    <Pencil size={14} style={S.primary}/>
                  </button>
                  <button onClick={() => setDeleteTarget(p)}
                    className="p-2 rounded-full cursor-pointer transition-all hover:scale-110"
                    style={{ ...S.btnOutline, border:'none', background:'rgba(254,202,202,0.5)' }} title="Eliminar">
                    <Trash2 size={14} style={S.error}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Product Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
             style={S.modalOverlay} onClick={() => setShowForm(false)}>
          {/* Ambient */}
          <div className="fixed w-96 h-96 rounded-full pointer-events-none"
               style={{ background:'radial-gradient(circle,rgba(177,156,217,0.3) 0%,transparent 70%)', filter:'blur(80px)', top:'-5%', right:'10%' }}/>

          <div className="w-full max-w-lg rounded-[28px] overflow-hidden animate-fade-in-scale"
               style={{ ...S.glassPanel, maxHeight:'90vh', overflowY:'auto' }}
               onClick={e => e.stopPropagation()}>

            {/* Top accent */}
            <div className="h-1 w-full" style={{ background:'linear-gradient(90deg,#67558c,#864d61,#30628a)' }}/>

            <div className="p-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={S.onSurface}>
                  {editing ? '✏️ Editar Producto' : '🆕 Nuevo Producto'}
                </h2>
                <button onClick={() => setShowForm(false)}
                  className="p-2 rounded-full cursor-pointer hover:bg-black/5 transition-colors">
                  <X size={18} style={S.muted}/>
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={S.muted}>Nombre del producto *</label>
                  <input value={form.name} onChange={e => setForm(p=>({...p, name:e.target.value}))}
                    placeholder="Ej: Fresa Suprema" className="w-full" style={S.input}/>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={S.muted}>Descripción</label>
                  <textarea value={form.description} onChange={e => setForm(p=>({...p, description:e.target.value}))}
                    rows={2} placeholder="Descripción breve del producto..." style={S.textarea}/>
                </div>

                {/* Price + Stock in row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Precio ($) *</label>
                    <input type="number" min="0.01" step="0.01" value={form.price}
                      onChange={e => setForm(p=>({...p, price:e.target.value}))}
                      placeholder="0.00" className="w-full" style={S.input}/>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Stock *</label>
                    <input type="number" min="0" value={form.stock_quantity}
                      onChange={e => setForm(p=>({...p, stock_quantity:e.target.value}))}
                      placeholder="0" className="w-full" style={S.input}/>
                  </div>
                </div>

                {/* Unit + Category in row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Unidad</label>
                    <div className="relative">
                      <select value={form.unit} onChange={e => setForm(p=>({...p, unit:e.target.value}))}
                        className="appearance-none w-full text-sm font-semibold cursor-pointer outline-none pr-8"
                        style={S.input}>
                        {['unidad','porción','vaso','litro','kg','gramo'].map(u => <option key={u}>{u}</option>)}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={S.muted}/>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Categoría</label>
                    <div className="relative">
                      <select value={form.category_id} onChange={e => setForm(p=>({...p, category_id:e.target.value}))}
                        className="appearance-none w-full text-sm font-semibold cursor-pointer outline-none pr-8"
                        style={S.input}>
                        {DEMO_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={S.muted}/>
                    </div>
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl"
                     style={{ background:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.7)' }}>
                  <div>
                    <p className="text-sm font-bold" style={S.onSurface}>Disponible para venta</p>
                    <p className="text-xs" style={S.muted}>El producto aparecerá en el POS del cajero</p>
                  </div>
                  <button onClick={() => setForm(p=>({...p, is_active:!p.is_active}))}
                    className="cursor-pointer transition-all hover:scale-110">
                    {form.is_active
                      ? <ToggleRight size={36} style={{ color:'#15803d' }}/>
                      : <ToggleLeft  size={36} style={S.muted}/>
                    }
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer transition-all hover:scale-105"
                    style={S.btnOutline}>
                    Cancelar
                  </button>
                  <button onClick={save} disabled={saving}
                    className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    style={S.btnPrimary}>
                    {saving
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Guardando...</>
                      : editing ? '✓ Actualizar' : '✓ Crear Producto'
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
        title="¿Eliminar producto?"
        message={`Se eliminará "${deleteTarget?.name}" permanentemente. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={deleteProduct}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
