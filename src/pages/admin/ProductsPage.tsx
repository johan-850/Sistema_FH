import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight,
  X, ChevronDown, Package, Loader2
} from 'lucide-react'
import { S } from '../../lib/styles'
import { formatCurrency } from '../../lib/utils'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import type { Product, Category } from '../../types/database'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Portal } from '../../components/ui/Portal'

const emptyForm = {
  name: '', description: '', price: '', category_id: '',
  stock_quantity: '', unit: 'unidad', is_active: true,
}


function getCatColor(idx: number) {
  const COLORS = [
    'rgba(253,181,204,0.35)',
    'rgba(181,213,251,0.35)',
    'rgba(181,251,202,0.35)',
    'rgba(253,233,181,0.35)',
    'rgba(235,221,255,0.35)',
  ]
  return COLORS[idx % COLORS.length]
}

export default function ProductsPage() {
  const [products,     setProducts]     = useState<Product[]>([])
  const [categories,   setCategories]   = useState<Category[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterCat,    setFilterCat]    = useState('all')
  const [filterState,  setFilterState]  = useState<'all'|'active'|'inactive'>('all')
  const [showForm,     setShowForm]     = useState(false)
  const [editing,      setEditing]      = useState<Product | null>(null)
  const [form,         setForm]         = useState({ ...emptyForm })
  const [saving,       setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const [showCatForm,  setShowCatForm]  = useState(false)
  const [catForm,      setCatForm]      = useState({ name: '', icon: '🍦' })
  const [savingCat,    setSavingCat]    = useState(false)

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('is_active', true).order('name'),
    ])
    setProducts(prods ?? [])
    setCategories(cats ?? [])
    if (cats && cats.length > 0 && !form.category_id) {
      setForm(p => ({ ...p, category_id: cats[0].id }))
    }
    setLoading(false)
  }, []) // eslint-disable-line

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData() }, [fetchData])

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
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? '' })
    setShowForm(true)
  }

  // ── Open edit form ──
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name:           p.name,
      description:    p.description ?? '',
      price:          p.price.toString(),
      category_id:    p.category_id,
      stock_quantity: p.stock_quantity.toString(),
      unit:           p.unit,
      is_active:      p.is_active,
    })
    setShowForm(true)
  }

  // ── Save ──
  const save = async () => {
    if (!form.name.trim())               { toast.error('El nombre es requerido'); return }
    if (!form.price || +form.price <= 0) { toast.error('Ingresa un precio válido'); return }
    if (form.stock_quantity === '' || +form.stock_quantity < 0) { toast.error('Ingresa un stock válido'); return }
    if (!form.category_id)               { toast.error('Selecciona una categoría'); return }

    setSaving(true)
    const payload = {
      name:           form.name.trim(),
      description:    form.description.trim() || null,
      price:          +form.price,
      category_id:    form.category_id,
      stock_quantity: +form.stock_quantity,
      unit:           form.unit,
      is_active:      form.is_active,
      image_url:      null,
    }

    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
      if (error) { toast.error('Error al actualizar: ' + error.message); setSaving(false); return }
      toast.success('Producto actualizado ✨')
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { toast.error('Error al crear: ' + error.message); setSaving(false); return }
      toast.success('Producto creado 🎉')
    }

    await fetchData()
    setSaving(false)
    setShowForm(false)
  }

  // ── Save Category ──
  const saveCategory = async () => {
    if (!catForm.name.trim()) { toast.error('Ingresa un nombre para la categoría'); return }
    setSavingCat(true)
    const { data, error } = await supabase.from('categories').insert({
      name: catForm.name.trim(),
      icon: catForm.icon || '📦',
      color: 'rgba(235,221,255,0.35)',
      is_active: true
    }).select().single()

    if (error) { toast.error('Error al crear categoría: ' + error.message); setSavingCat(false); return }

    toast.success('Categoría creada')
    setCategories(prev => [...prev, data])
    setForm(p => ({ ...p, category_id: data.id }))
    setShowCatForm(false)
    setCatForm({ name: '', icon: '🍦' })
    setSavingCat(false)
  }

  // ── Toggle active ──
  const toggleActive = async (p: Product) => {
    const { error } = await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id)
    if (error) { toast.error('Error al actualizar'); return }
    toast.success(!p.is_active ? 'Producto activado' : 'Producto desactivado')
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
  }

  // ── Delete ──
  const deleteProduct = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from('products').delete().eq('id', deleteTarget.id)
    if (error) { toast.error('Error al eliminar: ' + error.message); return }
    toast.success('Producto eliminado')
    setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

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
          { label: 'Activos',    value: totalActive,   color: '#15803d', bg: 'rgba(220,252,231,0.6)', icon: '✅' },
          { label: 'Inactivos',  value: totalInactive, color: '#b45309', bg: 'rgba(254,243,199,0.6)', icon: '⏸️' },
          { label: 'Stock bajo', value: lowStock,      color: '#b91c1c', bg: 'rgba(254,202,202,0.6)', icon: '⚠️' },
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
        <div className="flex items-center gap-2 flex-1 min-w-48 px-4 py-2.5 rounded-full"
             style={{ background:'rgba(255,255,255,0.65)', border:'1.5px solid var(--c-outline-var)' }}>
          <Search size={16} style={S.muted}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="flex-1 bg-transparent text-sm outline-none" style={S.onSurface}/>
          {search && <button onClick={() => setSearch('')}><X size={14} style={S.muted}/></button>}
        </div>

        <div className="relative">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 rounded-full text-sm font-bold cursor-pointer outline-none"
            style={{ background:'rgba(255,255,255,0.65)', border:'1.5px solid var(--c-outline-var)', color:'var(--c-on-surface)' }}>
            <option value="all">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={S.muted}/>
        </div>

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
          <p className="text-lg font-bold" style={S.muted}>
            {products.length === 0 ? 'Aún no hay productos. ¡Crea el primero!' : 'No se encontraron productos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const bg = getCatColor(categories.findIndex(c => c.id === p.category_id))
            return (
              <div key={p.id}
                className="rounded-[20px] overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{ ...S.glassCard, opacity: p.is_active ? 1 : 0.65 }}>

                <div className="h-24 flex items-center justify-center text-5xl" style={{ background: bg }}>
                  {p.category?.icon ?? '📦'}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: bg, color:'var(--c-on-surface)' }}>
                      {p.category?.name ?? '—'}
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

                  <div className="flex gap-2 mt-4 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.5)' }}>
                    <button onClick={() => toggleActive(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-105"
                      style={S.btnOutline}>
                      {p.is_active
                        ? <><ToggleRight size={14} style={{ color:'#15803d' }}/> Activo</>
                        : <><ToggleLeft  size={14} style={S.muted}/> Inactivo</>
                      }
                    </button>
                    <button onClick={() => openEdit(p)}
                      className="p-2 rounded-full cursor-pointer transition-all hover:scale-110"
                      style={{ ...S.btnOutline, border:'none', background:'rgba(235,221,255,0.5)' }}>
                      <Pencil size={14} style={S.primary}/>
                    </button>
                    <button onClick={() => setDeleteTarget(p)}
                      className="p-2 rounded-full cursor-pointer transition-all hover:scale-110"
                      style={{ ...S.btnOutline, border:'none', background:'rgba(254,202,202,0.5)' }}>
                      <Trash2 size={14} style={S.error}/>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Product Form Modal ── */}
      {showForm && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
               style={S.modalOverlay} onClick={() => setShowForm(false)}>
            <div className="fixed w-96 h-96 rounded-full pointer-events-none"
                 style={{ background:'radial-gradient(circle,rgba(177,156,217,0.3) 0%,transparent 70%)', filter:'blur(80px)', top:'-5%', right:'10%' }}/>
            <div className="w-full max-w-lg rounded-[28px] overflow-hidden animate-fade-in-scale"
                 style={{ ...S.glassPanel, maxHeight:'90vh', overflowY:'auto' }}
                 onClick={e => e.stopPropagation()}>
              <div className="h-1 w-full" style={{ background:'linear-gradient(90deg,#67558c,#864d61,#30628a)' }}/>
              <div className="p-7">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black" style={S.onSurface}>
                    {editing ? '✏️ Editar Producto' : '🆕 Nuevo Producto'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-full cursor-pointer hover:bg-black/5">
                    <X size={18} style={S.muted}/>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Nombre *</label>
                    <input value={form.name} onChange={e => setForm(p=>({...p, name:e.target.value}))}
                      placeholder="Ej: Fresa Suprema" className="w-full" style={S.input}/>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Descripción</label>
                    <textarea value={form.description} onChange={e => setForm(p=>({...p, description:e.target.value}))}
                      rows={2} placeholder="Descripción breve..." style={S.textarea}/>
                  </div>
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold block" style={S.muted}>Categoría</label>
                      <button type="button" onClick={() => setShowCatForm(true)} className="text-[10px] font-bold px-2 py-0.5 rounded-full hover:opacity-80 cursor-pointer" style={{ background:'var(--c-primary-fixed)', color:'var(--c-primary)' }}>+ Nueva</button>
                    </div>
                    <div className="relative">
                        <select value={form.category_id || ''} onChange={e => setForm(p=>({...p, category_id:e.target.value}))}
                          className="appearance-none w-full text-sm font-semibold cursor-pointer outline-none pr-8"
                          style={S.input}>
                          <option value="" disabled>
                            {categories.length === 0 ? 'Sin categorías' : 'Selecciona...'}
                          </option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={S.muted}/>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl"
                       style={{ background:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.7)' }}>
                    <div>
                      <p className="text-sm font-bold" style={S.onSurface}>Disponible para venta</p>
                      <p className="text-xs" style={S.muted}>El producto aparecerá en el POS</p>
                    </div>
                    <button onClick={() => setForm(p=>({...p, is_active:!p.is_active}))} className="cursor-pointer hover:scale-110 transition-all">
                      {form.is_active
                        ? <ToggleRight size={36} style={{ color:'#15803d' }}/>
                        : <ToggleLeft  size={36} style={S.muted}/>
                      }
                    </button>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowForm(false)}
                      className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer hover:scale-105 transition-all"
                      style={S.btnOutline}>Cancelar</button>
                    <button onClick={save} disabled={saving}
                      className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer hover:scale-105 transition-all flex items-center justify-center gap-2"
                      style={S.btnPrimary}>
                      {saving
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Guardando...</>
                        : editing ? '✓ Actualizar' : '✓ Crear Producto'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Category Form Modal ── */}
      {showCatForm && (
        <Portal>
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in"
               style={S.modalOverlay} onClick={() => setShowCatForm(false)}>
            <div className="w-full max-w-sm rounded-[24px] p-6 animate-fade-in-scale"
                 style={{ ...S.glassPanel, background:'rgba(255,255,255,0.98)' }}
                 onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-black mb-4" style={S.onSurface}>Nueva Categoría</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-20">
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Icono</label>
                    <input value={catForm.icon} onChange={e => setCatForm(p=>({...p, icon:e.target.value}))}
                      className="w-full text-center text-xl" style={S.input}/>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Nombre *</label>
                    <input value={catForm.name} onChange={e => setCatForm(p=>({...p, name:e.target.value}))}
                      placeholder="Ej: Helados" className="w-full" style={S.input}/>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCatForm(false)}
                    className="flex-1 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all hover:scale-105"
                    style={S.btnOutline}>Cancelar</button>
                  <button onClick={saveCategory} disabled={savingCat}
                    className="flex-1 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all hover:scale-105"
                    style={S.btnPrimary}>
                    {savingCat ? '...' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="¿Eliminar producto?"
        message={`Se eliminará "${deleteTarget?.name}" permanentemente.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={deleteProduct}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
