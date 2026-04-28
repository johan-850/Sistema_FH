import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import { S } from '../../lib/styles'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../types/database'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Portal } from '../../components/ui/Portal'

const emptyForm = { name: '', icon: '🍦', description: '', color: 'rgba(235,221,255,0.35)', is_active: true }

const PRESET_ICONS = ['🍦', '🍫', '🫐', '🍓', '🥤', '🍰', '🧁', '🍩', '🍭', '🧊', '🥛', '🍋', '☕', '🍪']
const PRESET_COLORS = [
  'rgba(235,221,255,0.45)', 'rgba(253,181,204,0.45)', 'rgba(181,213,251,0.45)',
  'rgba(181,251,202,0.45)', 'rgba(253,233,181,0.45)', 'rgba(254,202,202,0.45)',
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState<Category | null>(null)
  const [form,       setForm]       = useState({ ...emptyForm })
  const [saving,     setSaving]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})

  // ── Fetch ──
  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('category_id').eq('is_active', true),
    ])
    setCategories(cats ?? [])
    const counts: Record<string, number> = {}
    prods?.forEach(p => { counts[p.category_id] = (counts[p.category_id] ?? 0) + 1 })
    setProductCounts(counts)
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Open forms ──
  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setForm({ name: c.name, icon: c.icon, description: c.description ?? '', color: c.color, is_active: c.is_active })
    setShowForm(true)
  }

  // ── Save ──
  const save = async () => {
    if (!form.name.trim()) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      icon: form.icon || '📦',
      description: form.description.trim() || null,
      color: form.color,
      is_active: form.is_active,
    }
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id)
      if (error) { toast.error('Error al actualizar: ' + error.message); setSaving(false); return }
      toast.success('Categoría actualizada ✨')
    } else {
      const { error } = await supabase.from('categories').insert(payload)
      if (error) { toast.error('Error al crear: ' + error.message); setSaving(false); return }
      toast.success('Categoría creada 🎉')
    }
    await fetchAll()
    setSaving(false)
    setShowForm(false)
  }

  // ── Toggle active ──
  const toggleActive = async (c: Category) => {
    const { error } = await supabase.from('categories').update({ is_active: !c.is_active }).eq('id', c.id)
    if (error) { toast.error('Error al actualizar'); return }
    toast.success(!c.is_active ? 'Categoría activada' : 'Categoría desactivada')
    setCategories(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x))
  }

  // ── Delete ──
  const deleteCategory = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from('categories').delete().eq('id', deleteTarget.id)
    if (error) { toast.error('Error al eliminar: ' + error.message); return }
    toast.success('Categoría eliminada')
    setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const totalActive   = categories.filter(c => c.is_active).length
  const totalInactive = categories.filter(c => !c.is_active).length

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
          <h1 className="text-3xl font-black" style={S.onSurface}>Categorías</h1>
          <p className="text-sm mt-1" style={S.muted}>Organiza el menú de tu heladería por categorías.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
          style={S.btnPrimary}>
          <Plus size={16}/> Nueva Categoría
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total',     value: categories.length, color: '#1d4ed8', bg: 'rgba(219,234,254,0.6)', icon: '📋' },
          { label: 'Activas',   value: totalActive,       color: '#15803d', bg: 'rgba(220,252,231,0.6)', icon: '✅' },
          { label: 'Inactivas', value: totalInactive,     color: '#b45309', bg: 'rgba(254,243,199,0.6)', icon: '⏸️' },
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

      {/* ── Grid ── */}
      {categories.length === 0 ? (
        <div className="text-center py-20 rounded-[24px]" style={S.glassCard}>
          <span className="text-5xl block mb-4">🏷️</span>
          <p className="text-lg font-bold" style={S.muted}>Aún no hay categorías. ¡Crea la primera!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(c => (
            <div key={c.id}
              className="rounded-[20px] overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              style={{ ...S.glassCard, opacity: c.is_active ? 1 : 0.65 }}>

              {/* Color banner */}
              <div className="h-20 flex items-center justify-center text-5xl"
                   style={{ background: c.color || 'rgba(235,221,255,0.4)' }}>
                {c.icon}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-black text-base" style={S.onSurface}>{c.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={c.is_active ? S.tagSuccess : S.tagWarning}>
                    {c.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                {c.description && (
                  <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={S.muted}>{c.description}</p>
                )}

                <div className="mt-auto">
                  <p className="text-xs font-semibold mb-3" style={S.muted}>
                    🛍️ {productCounts[c.id] ?? 0} producto{(productCounts[c.id] ?? 0) !== 1 ? 's' : ''} activo{(productCounts[c.id] ?? 0) !== 1 ? 's' : ''}
                  </p>

                  <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.5)' }}>
                    <button onClick={() => toggleActive(c)}
                      className="flex-1 py-2 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-105"
                      style={S.btnOutline}>
                      {c.is_active ? '⏸ Desactivar' : '▶ Activar'}
                    </button>
                    <button onClick={() => openEdit(c)}
                      className="p-2 rounded-full cursor-pointer transition-all hover:scale-110"
                      style={{ ...S.btnOutline, border: 'none', background: 'rgba(235,221,255,0.5)' }}>
                      <Pencil size={14} style={S.primary}/>
                    </button>
                    <button onClick={() => setDeleteTarget(c)}
                      className="p-2 rounded-full cursor-pointer transition-all hover:scale-110"
                      style={{ ...S.btnOutline, border: 'none', background: 'rgba(254,202,202,0.5)' }}>
                      <Trash2 size={14} style={S.error}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
               style={S.modalOverlay} onClick={() => setShowForm(false)}>
            <div className="w-full max-w-md rounded-[28px] overflow-hidden animate-fade-in-scale"
                 style={{ ...S.glassPanel, maxHeight: '92vh', overflowY: 'auto' }}
                 onClick={e => e.stopPropagation()}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#67558c,#864d61,#30628a)' }}/>
              <div className="p-7">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black" style={S.onSurface}>
                    {editing ? '✏️ Editar Categoría' : '🆕 Nueva Categoría'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-full cursor-pointer hover:bg-black/5">
                    <X size={18} style={S.muted}/>
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Preview */}
                  <div className="h-24 rounded-2xl flex items-center justify-center text-5xl transition-all duration-300"
                       style={{ background: form.color }}>
                    {form.icon || '📦'}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Nombre *</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ej: Helados de Fruta" className="w-full" style={S.input}/>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={S.muted}>Descripción</label>
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      rows={2} placeholder="Descripción opcional..." style={S.textarea}/>
                  </div>

                  {/* Icon picker */}
                  <div>
                    <label className="text-xs font-bold block mb-2" style={S.muted}>Ícono</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {PRESET_ICONS.map(ic => (
                        <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))}
                          className="text-2xl p-2 rounded-xl cursor-pointer transition-all hover:scale-110"
                          style={{ background: form.icon === ic ? 'rgba(103,85,140,0.2)' : 'rgba(255,255,255,0.5)', border: form.icon === ic ? '2px solid #67558c' : '1.5px solid rgba(203,196,208,0.4)' }}>
                          {ic}
                        </button>
                      ))}
                    </div>
                    <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                      placeholder="O escribe un emoji..." className="w-full" style={{ ...S.input, textAlign: 'center' }}/>
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="text-xs font-bold block mb-2" style={S.muted}>Color de fondo</label>
                    <div className="flex gap-2 flex-wrap">
                      {PRESET_COLORS.map(color => (
                        <button key={color} onClick={() => setForm(p => ({ ...p, color }))}
                          className="w-9 h-9 rounded-xl cursor-pointer transition-all hover:scale-110"
                          style={{ background: color, border: form.color === color ? '3px solid #67558c' : '2px solid rgba(255,255,255,0.7)', boxShadow: 'var(--shadow-card)' }}/>
                      ))}
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl"
                       style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)' }}>
                    <p className="text-sm font-bold" style={S.onSurface}>Categoría activa</p>
                    <button onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                      className="cursor-pointer hover:scale-110 transition-all text-2xl">
                      {form.is_active ? '✅' : '⬜'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setShowForm(false)}
                      className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer hover:scale-105 transition-all"
                      style={S.btnOutline}>Cancelar</button>
                    <button onClick={save} disabled={saving}
                      className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer hover:scale-105 transition-all flex items-center justify-center gap-2"
                      style={S.btnPrimary}>
                      {saving
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Guardando...</>
                        : editing ? '✓ Actualizar' : '✓ Crear'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="¿Eliminar categoría?"
        message={`Se eliminará "${deleteTarget?.name}". Los productos asociados quedarán sin categoría.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={deleteCategory}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
