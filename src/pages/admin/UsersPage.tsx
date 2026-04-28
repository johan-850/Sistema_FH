import { useState, useEffect, useCallback } from 'react'
import { Search, X, Loader2, Users, ShieldCheck, ShoppingBag } from 'lucide-react'
import { S } from '../../lib/styles'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import type { Profile, UserRole } from '../../types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

export default function UsersPage() {
  const [profiles,    setProfiles]    = useState<Profile[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterRole,  setFilterRole]  = useState<'all' | UserRole>('all')
  const [roleTarget,  setRoleTarget]  = useState<{ profile: Profile; newRole: UserRole } | null>(null)
  const [saving,      setSaving]      = useState(false)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast.error('Error al cargar usuarios')
    setProfiles(data ?? [])
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProfiles() }, [fetchProfiles])

  const filtered = profiles.filter(p => {
    const matchSearch = !search ||
      p.full_name.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'all' || p.role === filterRole
    return matchSearch && matchRole
  })

  const totalAdmins   = profiles.filter(p => p.role === 'admin').length
  const totalCashiers = profiles.filter(p => p.role === 'cashier').length

  // ── Change role ──
  const changeRole = async () => {
    if (!roleTarget) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ role: roleTarget.newRole })
      .eq('id', roleTarget.profile.id)

    if (error) { toast.error('Error al cambiar rol: ' + error.message); setSaving(false); return }
    toast.success(`Rol actualizado a ${roleTarget.newRole === 'admin' ? 'Admin 👑' : 'Cajero 💰'}`)
    setProfiles(prev => prev.map(p => p.id === roleTarget.profile.id ? { ...p, role: roleTarget.newRole } : p))
    setSaving(false)
    setRoleTarget(null)
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
          <h1 className="text-3xl font-black" style={S.onSurface}>Gestión de Usuarios</h1>
          <p className="text-sm mt-1" style={S.muted}>Consulta y gestiona los roles del equipo de trabajo.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
             style={{ background: 'rgba(254,243,199,0.7)', border: '1px solid rgba(253,233,181,0.8)', color: '#b45309' }}>
          ℹ️ Para crear usuarios usa el panel de Supabase Auth
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total',    value: profiles.length, color: '#1d4ed8', bg: 'rgba(219,234,254,0.6)', icon: '👥' },
          { label: 'Admins',   value: totalAdmins,     color: '#67558c', bg: 'rgba(235,221,255,0.6)', icon: '👑' },
          { label: 'Cajeros',  value: totalCashiers,   color: '#15803d', bg: 'rgba(220,252,231,0.6)', icon: '💰' },
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
            placeholder="Buscar por nombre..."
            className="flex-1 bg-transparent text-sm outline-none" style={S.onSurface}/>
          {search && <button onClick={() => setSearch('')}><X size={14} style={S.muted}/></button>}
        </div>

        <div className="flex rounded-full overflow-hidden"
             style={{ border: '1.5px solid var(--c-outline-var)', background: 'rgba(255,255,255,0.65)' }}>
          {(['all', 'admin', 'cashier'] as const).map(f => (
            <button key={f} onClick={() => setFilterRole(f)}
              className="px-4 py-2 text-xs font-bold cursor-pointer transition-all"
              style={filterRole === f ? { ...S.btnPrimary, borderRadius: 0 } : { background: 'transparent', color: 'var(--c-on-surface-var)' }}>
              {f === 'all' ? 'Todos' : f === 'admin' ? '👑 Admin' : '💰 Cajero'}
            </button>
          ))}
        </div>
      </div>

      {/* ── User cards ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-[24px]" style={S.glassCard}>
          <Users size={48} className="mx-auto mb-4 opacity-30" style={S.muted}/>
          <p className="text-lg font-bold" style={S.muted}>No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const isAdmin = p.role === 'admin'
            return (
              <div key={p.id}
                className="rounded-[20px] p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.01]"
                style={S.glassCard}>

                {/* Avatar + Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shrink-0"
                       style={{
                         background: isAdmin
                           ? 'linear-gradient(135deg, #67558c, #864d61)'
                           : 'linear-gradient(135deg, #30628a, #15803d)',
                         color: '#fff',
                         boxShadow: 'var(--shadow-primary)',
                       }}>
                    {p.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black truncate" style={S.onSurface}>{p.full_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isAdmin
                        ? <><ShieldCheck size={12} style={{ color: '#67558c' }}/><span className="text-xs font-bold" style={{ color: '#67558c' }}>Administrador</span></>
                        : <><ShoppingBag size={12} style={{ color: '#15803d' }}/><span className="text-xs font-bold" style={{ color: '#15803d' }}>Cajero</span></>
                      }
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="text-xs space-y-1" style={S.muted}>
                  <p>📅 Creado: {format(new Date(p.created_at), "dd 'de' MMM yyyy", { locale: es })}</p>
                </div>

                {/* Role toggle */}
                <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>
                  <p className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={S.muted}>Cambiar rol</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => !isAdmin && setRoleTarget({ profile: p, newRole: 'admin' })}
                      disabled={isAdmin}
                      className="flex-1 py-2 rounded-full text-xs font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-default"
                      style={isAdmin
                        ? { background: 'rgba(235,221,255,0.7)', color: '#67558c', border: '1.5px solid rgba(103,85,140,0.4)' }
                        : { ...S.btnOutline }}>
                      👑 Admin
                    </button>
                    <button
                      onClick={() => isAdmin && setRoleTarget({ profile: p, newRole: 'cashier' })}
                      disabled={!isAdmin}
                      className="flex-1 py-2 rounded-full text-xs font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-default"
                      style={!isAdmin
                        ? { background: 'rgba(220,252,231,0.7)', color: '#15803d', border: '1.5px solid rgba(21,128,61,0.4)' }
                        : { ...S.btnOutline }}>
                      💰 Cajero
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={roleTarget !== null}
        title="¿Cambiar rol del usuario?"
        message={`"${roleTarget?.profile.full_name}" pasará a ser ${roleTarget?.newRole === 'admin' ? 'Administrador 👑' : 'Cajero 💰'}. Esto cambia los permisos de acceso al sistema.`}
        confirmLabel={saving ? 'Guardando...' : 'Sí, cambiar'}
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={changeRole}
        onCancel={() => setRoleTarget(null)}
      />
    </div>
  )
}
