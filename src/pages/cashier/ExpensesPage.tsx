import { useState, useRef } from 'react'
import { Plus, Trash2, Receipt, Printer } from 'lucide-react'
import { S } from '../../lib/styles'
import { formatCurrency, formatDate } from '../../lib/utils'
import { toast } from 'sonner'
import { useReactToPrint } from 'react-to-print'
import { ReceiptTemplate, type ReceiptData } from '../../components/shared/ReceiptTemplate'
import { useAuthStore } from '../../stores/authStore'

const EXPENSE_CATEGORIES = [
  'Insumos / Materias primas','Servicios','Mantenimiento',
  'Transporte','Personal','Limpieza','Otros',
]

interface Expense { id:string; category:string; description:string; amount:number; created_at:string }

const SEED: Expense[] = [
  { id:'e1', category:'Insumos / Materias primas', description:'Compra de leche entera 10L', amount:85, created_at:new Date(Date.now()-7200000).toISOString() },
  { id:'e2', category:'Limpieza', description:'Desinfectante y bolsas', amount:45, created_at:new Date(Date.now()-3600000).toISOString() },
]

export default function ExpensesPage() {
  const { profile } = useAuthStore()
  const [expenses, setExpenses] = useState<Expense[]>(SEED)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ category:EXPENSE_CATEGORIES[0], description:'', amount:'' })
  const [saving, setSaving]     = useState(false)
  
  const [printData, setPrintData] = useState<ReceiptData | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Comprobante_Gasto'
  })

  const totalExpenses = expenses.reduce((s,e) => s + e.amount, 0)

  const save = async () => {
    if (!form.description.trim()) { toast.error('Escribe una descripción'); return }
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) { toast.error('Ingresa un monto válido'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const newExpense = { id:crypto.randomUUID(), category:form.category, description:form.description.trim(), amount:amt, created_at:new Date().toISOString() }
    
    setExpenses(prev => [newExpense, ...prev])
    setForm({ category:EXPENSE_CATEGORIES[0], description:'', amount:'' })
    setShowForm(false); setSaving(false)
    toast.success('Gasto registrado')

    setPrintData({
      type: 'expense',
      expenseCategory: newExpense.category,
      expenseDescription: newExpense.description,
      total: newExpense.amount,
      date: newExpense.created_at,
      cashierName: profile?.full_name
    })
    setTimeout(() => handlePrint(), 100)
  }

  const printExisting = (e: Expense) => {
    setPrintData({
      type: 'expense',
      expenseCategory: e.category,
      expenseDescription: e.description,
      total: e.amount,
      date: e.created_at,
      cashierName: profile?.full_name
    })
    setTimeout(() => handlePrint(), 100)
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black" style={S.onSurface}>Gastos del Turno</h1>
          <p className="text-sm mt-1" style={S.muted}>Registra salidas de dinero durante tu turno.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all" style={S.btnPrimary}>
          <Plus size={16}/> Nuevo Gasto
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-2xl p-5 mb-6 flex items-center justify-between" style={{ background:'linear-gradient(135deg, rgba(253,181,204,0.35),rgba(250,179,202,0.2))', border:'1px solid rgba(253,181,204,0.5)' }}>
        <div>
          <p className="text-xs font-bold" style={S.muted}>Total Gastos del Turno</p>
          <p className="text-3xl font-black" style={S.error}>{formatCurrency(totalExpenses)}</p>
          <p className="text-xs mt-1" style={S.muted}>{expenses.length} registro{expenses.length !== 1 ? 's':''}</p>
        </div>
        <Receipt size={40} style={{ color:'var(--c-secondary)', opacity:.35 }}/>
      </div>

      {showForm && (
        <div className="rounded-[24px] p-6 mb-6 animate-fade-in" style={S.glassPanel}>
          <h3 className="text-lg font-black mb-4" style={S.onSurface}>Registrar Gasto</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={S.muted}>Categoría</label>
              <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} className="w-full text-sm px-4 py-3 rounded-full appearance-none cursor-pointer" style={S.input}>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={S.muted}>Descripción</label>
              <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Ej: Compra de leche entera..." className="w-full text-sm" style={S.textarea}/>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={S.muted}>Monto ($)</label>
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(p=>({...p,amount:e.target.value}))} placeholder="0.00" className="w-full text-sm" style={S.input}/>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer" style={S.btnOutline}>Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-full text-sm font-bold cursor-pointer flex items-center justify-center gap-2" style={S.btnPrimary}>
                {saving ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Guardando...</> : '✓ Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {expenses.length === 0
          ? <div className="text-center py-16 rounded-2xl" style={S.glassCard}><p className="text-4xl mb-3">💸</p><p className="text-sm font-semibold" style={S.muted}>Sin gastos registrados</p></div>
          : expenses.map(e => (
            <div key={e.id} className="rounded-2xl p-4 flex items-start gap-4" style={{ background:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.65)', boxShadow:'var(--shadow-card)' }}>
              <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xl" style={{ background:'var(--c-error-container)' }}>💸</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold mb-0.5" style={S.muted}>{e.category}</p>
                <p className="text-sm font-semibold" style={S.onSurface}>{e.description}</p>
                <p className="text-xs mt-1" style={S.outline}>{formatDate(e.created_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-black" style={S.error}>−{formatCurrency(e.amount)}</p>
                <div className="flex justify-end gap-1 mt-2">
                  <button onClick={() => printExisting(e)} className="p-1.5 rounded-full cursor-pointer transition-colors hover:bg-gray-100" style={S.muted} title="Imprimir ticket">
                    <Printer size={13}/>
                  </button>
                  <button onClick={() => { setExpenses(p=>p.filter(x=>x.id!==e.id)); toast.success('Eliminado') }} className="p-1.5 rounded-full cursor-pointer transition-colors hover:bg-red-50" style={S.error} title="Eliminar">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div style={{ display: 'none' }}>
        <ReceiptTemplate ref={printRef} data={printData} />
      </div>
    </div>
  )
}
