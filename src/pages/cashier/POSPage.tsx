import { useState, useRef, useEffect } from 'react'
import { Plus, Minus, Trash2, MessageSquare, ShoppingCart, RotateCcw, Save, Clock } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useTableOrdersStore } from '../../stores/tableOrdersStore'
import { formatCurrency } from '../../lib/utils'
import { S } from '../../lib/styles'
import { CheckoutModal } from './CheckoutModal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { toast } from 'sonner'
import type { Product } from '../../types/database'

/* ─── Demo data ─── */
const CATEGORIES = [
  { id:'1', name:'Helados',  icon:'🍦' },
  { id:'2', name:'Toppings', icon:'🍫' },
  { id:'3', name:'Bebidas',  icon:'🥤' },
  { id:'4', name:'Postres',  icon:'🍰' },
]

const PRODUCTS: Product[] = [
  { id:'p1',  category_id:'1', name:'Fresa Suprema',    description:'Helado artesanal de fresa',    price:4.50, image_url:null, is_active:true, stock_quantity:100, unit:'bola',    created_at:'' },
  { id:'p2',  category_id:'1', name:'Menta Fresca',     description:'Menta con chips de chocolate', price:4.50, image_url:null, is_active:true, stock_quantity:80,  unit:'bola',    created_at:'' },
  { id:'p3',  category_id:'1', name:'Choco Oscuro',     description:'Chocolate belga 70%',          price:5.00, image_url:null, is_active:true, stock_quantity:90,  unit:'bola',    created_at:'' },
  { id:'p4',  category_id:'1', name:'Vainilla Clásica', description:'Vainilla de Madagascar',       price:4.00, image_url:null, is_active:true, stock_quantity:120, unit:'bola',    created_at:'' },
  { id:'p5',  category_id:'1', name:'Mora Salvaje',     description:'Mora silvestre natural',       price:4.75, image_url:null, is_active:true, stock_quantity:70,  unit:'bola',    created_at:'' },
  { id:'p6',  category_id:'1', name:'Pistache Dream',   description:'Pistache premium siciliano',   price:5.50, image_url:null, is_active:true, stock_quantity:60,  unit:'bola',    created_at:'' },
  { id:'p7',  category_id:'2', name:'Chispas Choco',    description:null,                           price:1.50, image_url:null, is_active:true, stock_quantity:200, unit:'porción', created_at:'' },
  { id:'p8',  category_id:'2', name:'Caramelo Salado',  description:null,                           price:1.00, image_url:null, is_active:true, stock_quantity:150, unit:'porción', created_at:'' },
  { id:'p9',  category_id:'2', name:'Nueces Tostadas',  description:null,                           price:1.50, image_url:null, is_active:true, stock_quantity:120, unit:'porción', created_at:'' },
  { id:'p10', category_id:'3', name:'Agua Natural',     description:null,                           price:1.50, image_url:null, is_active:true, stock_quantity:300, unit:'botella', created_at:'' },
  { id:'p11', category_id:'3', name:'Malteada',         description:'Fresa, choco o vainilla',      price:6.00, image_url:null, is_active:true, stock_quantity:50,  unit:'vaso',    created_at:'' },
  { id:'p12', category_id:'3', name:'Limonada Natural', description:'Con menta y jengibre',         price:3.50, image_url:null, is_active:true, stock_quantity:80,  unit:'vaso',    created_at:'' },
  { id:'p13', category_id:'4', name:'Brownie',          description:'Con helado de vainilla',       price:7.00, image_url:null, is_active:true, stock_quantity:40,  unit:'porción', created_at:'' },
  { id:'p14', category_id:'4', name:'Crepe de Fresa',   description:'Con crema chantilly',          price:6.50, image_url:null, is_active:true, stock_quantity:35,  unit:'porción', created_at:'' },
]

const BASE_TABLES = [
  { id:'t1', number:1 }, { id:'t2', number:2 }, { id:'t3', number:3 },
  { id:'t4', number:4 }, { id:'t5', number:5 }, { id:'t6', number:6 },
  { id:'t7', number:7 }, { id:'t8', number:8 },
]

const COLORS = [
  ['#fce4ec','#f8bbd0'],['#e3f2fd','#bbdefb'],['#fff8e1','#ffecb3'],
  ['#f3e5f5','#e1bee7'],['#e8f5e9','#c8e6c9'],['#fbe9e7','#ffccbc'],
  ['#e0f2f1','#b2dfdb'],['#ede7f6','#d1c4e9'],['#fff3e0','#ffe0b2'],
  ['#e8eaf6','#c5cae9'],['#f1f8e9','#dcedc8'],['#fce4ec','#f48fb1'],
  ['#e3f2fd','#90caf9'],['#fff9c4','#fff176'],
]
const EMOJIS = ['🍓','🌿','🍫','🍦','🫐','🥜','🍪','🍯','💧','🥛','🍋','🍰','🍩','🍭']

/* ─── Elapsed time helper ─── */
function elapsedMinutes(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000)
  if (diff < 1) return '<1m'
  if (diff < 60) return `${diff}m`
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}

/* ═══════════════════════════════════════ */
export default function POSPage() {
  const [cat,      setCat]      = useState('1')
  const [tableId,  setTableId]  = useState<string | null>(null)
  const [checkout, setCheckout] = useState(false)
  const [noteFor,  setNoteFor]  = useState<string | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [confirmSwitch, setConfirmSwitch] = useState<string | null>(null) // target tableId
  const noteRef = useRef<HTMLInputElement>(null)

  /* Stores */
  const { items, addItem, removeItem, updateQuantity, updateNotes, clearCart,
          getSubtotal, getTax, getTotal } = useCartStore()
  const { orders, saveOrder, getOrder, clearOrder, hasOrder } = useTableOrdersStore()

  useEffect(() => { if (noteFor && noteRef.current) noteRef.current.focus() }, [noteFor])

  /* ─── Select / deselect table ─── */
  const handleTableClick = (id: string) => {
    if (tableId === id) {
      setTableId(null)
      return
    }

    // If selecting a table that has a saved order, load it
    const saved = getOrder(id)
    if (saved) {
      clearCart()
      useCartStore.setState({
        items: saved.items.map(i => ({ ...i })),
        tableId: id,
      })
      toast.info(`Comanda de Mesa ${BASE_TABLES.find(t => t.id === id)?.number} cargada`)
      setTableId(id)
      return
    }

    // If switching away from a table with unsaved items, ask confirmation
    if (items.length > 0 && tableId !== null && !getOrder(tableId)) {
      setConfirmSwitch(id)
      return
    }

    if (items.length > 0 && tableId !== null) {
      clearCart()
    }
    setTableId(id)
    useCartStore.setState({ tableId: id })
  }

  /* Called when user confirms table switch */
  const doSwitch = (targetId: string) => {
    clearCart()
    setTableId(targetId)
    useCartStore.setState({ tableId: targetId })
    setConfirmSwitch(null)
  }

  /* ─── Save order to table ─── */
  const handleSave = async () => {
    if (!tableId) { toast.error('Selecciona una mesa primero'); return }
    if (items.length === 0) { toast.error('Agrega al menos un producto'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    const tableNum = BASE_TABLES.find(t => t.id === tableId)!.number
    saveOrder(tableId, tableNum, items)
    setSaving(false)
    toast.success(`✅ Comanda guardada en Mesa ${tableNum}`)
  }

  /* ─── After checkout: clear table order ─── */
  const handleCheckoutClose = () => {
    if (tableId) clearOrder(tableId)
    clearCart()
    setTableId(null)
    setCheckout(false)
  }

  /* ─── Derived ─── */
  const products  = PRODUCTS.filter(p => p.category_id === cat)
  const tableNum  = BASE_TABLES.find(t => t.id === tableId)?.number
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const savedOrder = tableId ? getOrder(tableId) : null
  const isDirty   = items.length > 0  // cart has unsaved changes

  /* Order number: use saved if exists, otherwise pending */
  const orderNum = savedOrder ? `#${savedOrder.orderNumber}` : (isDirty ? '#NUEVO' : '---')

  return (
    <div className="flex gap-3 animate-fade-in" style={{ height:'calc(100vh - 112px)', marginTop:'-8px' }}>

      {/* ═══ LEFT: TABLES PANEL ═══ */}
      <aside className="w-48 flex flex-col rounded-2xl p-3 overflow-y-auto shrink-0"
             style={S.glassPanel}>
        <h2 className="text-sm font-bold mb-3 px-1" style={S.onSurface}>Mesas</h2>

        <div className="grid grid-cols-2 gap-2 content-start">
          {BASE_TABLES.map(t => {
            const occupied  = hasOrder(t.id)
            const selected  = tableId === t.id
            const savedO    = orders[t.id]

            return (
              <button key={t.id} onClick={() => handleTableClick(t.id)}
                className="rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer border relative overflow-hidden"
                style={{
                  aspectRatio: '1',
                  ...(occupied ? S.chipOccupied : S.chipAvailable),
                  border: selected ? '2.5px solid var(--c-primary)' : '1px solid rgba(255,255,255,0.5)',
                  transform: selected ? 'scale(1.05)' : undefined,
                  boxShadow: selected
                    ? '0 0 0 3px rgba(103,85,140,0.25), 0 4px 12px rgba(103,85,140,0.2)'
                    : 'var(--shadow-card)',
                }}>

                {/* Occupied dot */}
                {occupied && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        style={{ background:'var(--c-secondary)', boxShadow:'0 0 4px var(--c-secondary)' }}/>
                )}

                <span className="text-xl font-black">T{t.number}</span>

                {occupied && savedO ? (
                  <div className="flex flex-col items-center leading-none mt-0.5">
                    <span className="text-[9px] font-bold opacity-75">#{savedO.orderNumber}</span>
                    <span className="text-[9px] font-semibold opacity-60 flex items-center gap-0.5 mt-0.5">
                      <Clock size={8}/> {elapsedMinutes(savedO.savedAt)}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-semibold opacity-70">Libre</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-auto pt-3 space-y-1.5 border-t" style={{ borderColor:'rgba(255,255,255,0.4)', marginTop:'12px' }}>
          <div className="flex items-center gap-2 text-[10px] font-semibold" style={S.muted}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background:'var(--c-tertiary-fixed)', border:'1px solid var(--c-tertiary-container)' }}/> Libre
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold" style={S.muted}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background:'var(--c-secondary-fixed)', border:'1px solid var(--c-secondary-container)' }}/> Con comanda
          </div>
        </div>
      </aside>

      {/* ═══ CENTER: PRODUCTS ═══ */}
      <section className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 shrink-0">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0"
              style={cat === c.id
                ? { ...S.btnPrimary, padding:'7px 20px' }
                : { background:'rgba(255,255,255,0.55)', border:'1.5px solid rgba(203,196,208,0.5)', color:'var(--c-on-surface-var)', padding:'7px 20px' }
              }>
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 content-start pr-1">
          {products.map((p, i) => {
            const [c1, c2] = COLORS[i % COLORS.length]
            const inCart = items.find(it => it.product.id === p.id)
            return (
              <button key={p.id} onClick={() => addItem(p)}
                className="flex flex-col rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.03] text-left relative"
                style={{ ...S.glassCard, padding:0 }}>
                <div className="w-full aspect-square flex items-center justify-center relative"
                     style={{ background:`linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }}>
                  <span className="text-5xl transition-transform duration-300 group-hover:scale-110">{EMOJIS[i % EMOJIS.length]}</span>
                  {inCart && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                         style={{ background:'var(--c-primary)', boxShadow:'0 2px 8px rgba(103,85,140,0.4)' }}>
                      {inCart.quantity}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold truncate" style={S.onSurface}>{p.name}</p>
                  {p.description && <p className="text-[11px] truncate" style={S.muted}>{p.description}</p>}
                  <p className="text-base font-black mt-1" style={S.primary}>{formatCurrency(p.price)}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ═══ RIGHT: ORDER SIDEBAR ═══ */}
      <aside className="w-80 flex flex-col rounded-[28px] overflow-hidden shrink-0"
             style={{ ...S.glassPanel, boxShadow:'var(--shadow-glass)' }}>

        {/* Header */}
        <div className="p-5 shrink-0" style={{ borderBottom:'1px solid rgba(255,255,255,0.4)' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <ShoppingCart size={17} style={S.primary}/>
              <h2 className="text-base font-black" style={S.onSurface}>Comanda</h2>
            </div>
            <div className="flex items-center gap-2">
              {tableId && (
                <span className="text-xs font-black px-3 py-1 rounded-full"
                      style={{ background:'linear-gradient(135deg, #67558c, #864d61)', color:'#fff' }}>
                  Mesa {tableNum}
                </span>
              )}
              {items.length > 0 && (
                <button onClick={() => { clearCart(); if (tableId) useCartStore.setState({ tableId }) }}
                  className="p-1.5 rounded-full cursor-pointer transition-colors hover:bg-red-50"
                  style={S.error} title="Limpiar">
                  <RotateCcw size={14}/>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold" style={S.muted}>{orderNum}</span>
            {savedOrder && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background:'rgba(220,252,231,0.8)', color:'#15803d' }}>
                <Clock size={9}/> Guardada
              </span>
            )}
            {isDirty && !savedOrder && tableId && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background:'rgba(254,243,199,0.8)', color:'#b45309' }}>
                Sin guardar
              </span>
            )}
          </div>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40 py-12">
              <span className="text-5xl">🍨</span>
              <div className="text-center">
                <p className="text-sm font-bold" style={S.outline}>Sin productos aún</p>
                <p className="text-xs mt-1" style={S.outline}>
                  {tableId ? 'Toca un producto para agregar' : 'Selecciona una mesa primero'}
                </p>
              </div>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="rounded-xl p-3 flex gap-3"
                   style={{ background:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.65)' }}>
                {/* Quantity stepper */}
                <div className="flex flex-col items-center justify-between rounded-full py-1 px-1 shrink-0"
                     style={{ background:'var(--c-surface-container)', minHeight:68, width:28 }}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-5 h-5 flex items-center justify-center cursor-pointer rounded-full transition-colors hover:bg-white" style={S.outline}>
                    <Plus size={12}/>
                  </button>
                  <span className="text-sm font-black" style={S.onSurface}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-5 h-5 flex items-center justify-center cursor-pointer rounded-full transition-colors hover:bg-white" style={S.outline}>
                    <Minus size={12}/>
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-bold truncate" style={S.onSurface}>{item.product.name}</p>
                    <p className="text-sm font-black shrink-0 ml-1" style={S.primary}>
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                  {item.notes && (
                    <p className="text-[10px] italic mt-0.5 truncate" style={S.muted}>"{item.notes}"</p>
                  )}
                  {noteFor === item.product.id ? (
                    <input ref={noteRef}
                      className="mt-1.5 w-full text-xs px-2.5 py-1.5 rounded-lg"
                      style={{ background:'rgba(255,255,255,0.9)', border:'1.5px solid var(--c-primary)', color:'var(--c-on-surface)', outline:'none' }}
                      placeholder="Ej: sin azúcar, doble porción..."
                      value={item.notes}
                      onChange={e => updateNotes(item.product.id, e.target.value)}
                      onBlur={() => setNoteFor(null)}
                    />
                  ) : (
                    <div className="flex gap-2 mt-1.5">
                      <button onClick={() => setNoteFor(item.product.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer px-1 rounded"
                        style={S.outline}>
                        <MessageSquare size={11}/> {item.notes ? 'Editar' : 'Nota'}
                      </button>
                      <button onClick={() => removeItem(item.product.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer px-1 rounded"
                        style={S.error}>
                        <Trash2 size={11}/> Quitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals + Actions */}
        <div className="p-5 shrink-0"
             style={{ borderTop:'1px solid rgba(255,255,255,0.4)', background:'rgba(248,242,247,0.7)' }}>
          <div className="flex justify-between text-sm mb-1.5" style={S.muted}>
            <span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span>
          </div>
          <div className="flex justify-between text-sm mb-4" style={S.muted}>
            <span>IVA (8%)</span><span>{formatCurrency(getTax())}</span>
          </div>
          <div className="flex justify-between text-lg font-black mb-4">
            <span style={S.onSurface}>Total</span>
            <span style={S.primary}>{formatCurrency(getTotal())}</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {/* Save button – only shown when table selected & items present */}
            {tableId && items.length > 0 && (
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 rounded-full font-bold text-sm cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: savedOrder
                    ? 'rgba(220,252,231,0.7)'
                    : 'rgba(235,221,255,0.7)',
                  border: savedOrder
                    ? '1.5px solid rgba(134,239,172,0.6)'
                    : '1.5px solid rgba(177,156,217,0.5)',
                  color: savedOrder ? '#15803d' : 'var(--c-primary)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                {saving
                  ? <><span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin"/>Guardando...</>
                  : <><Save size={15}/> {savedOrder ? 'Actualizar Comanda' : 'Guardar Comanda'}</>
                }
              </button>
            )}

            {/* Checkout button */}
            <button onClick={() => setCheckout(true)}
              disabled={items.length === 0}
              className="w-full py-3.5 rounded-full font-black text-base cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
              style={items.length > 0
                ? { ...S.btnPrimary }
                : { background:'var(--c-surface-high)', color:'var(--c-outline)', cursor:'not-allowed' }}
              onMouseEnter={e => items.length > 0 && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
              💳 Cobrar
            </button>
          </div>
        </div>
      </aside>

      {checkout && (
        <CheckoutModal
          onClose={handleCheckoutClose}
          tableNum={tableNum}
        />
      )}

      {/* Custom confirm dialog — replaces native window.confirm */}
      <ConfirmDialog
        isOpen={confirmSwitch !== null}
        title="¿Cambiar de mesa?"
        message="Tienes productos en la comanda actual sin guardar. Si cambias de mesa se perderán. ¿Guardar primero o descartar?"
        confirmLabel="Descartar y cambiar"
        cancelLabel="Quedarme aquí"
        variant="warning"
        onConfirm={() => confirmSwitch && doSwitch(confirmSwitch)}
        onCancel={() => setConfirmSwitch(null)}
      />
    </div>
  )
}
