import { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useCartStore } from '../../stores/cartStore'
import { formatCurrency, calculateChange } from '../../lib/utils'
import { S } from '../../lib/styles'
import { toast } from 'sonner'
import { Printer, CheckCircle } from 'lucide-react'
import { ReceiptTemplate, type ReceiptData } from '../../components/shared/ReceiptTemplate'
import { useAuthStore } from '../../stores/authStore'

interface Props { onClose: () => void; tableNum?: number }

const QUICK = [20, 50, 100, 200, 500]
const METHODS = [
  { key:'cash',     label:'Efectivo',      icon:'💵' },
  { key:'card',     label:'Tarjeta',       icon:'💳' },
  { key:'transfer', label:'Transferencia', icon:'🔄' },
] as const

export function CheckoutModal({ onClose, tableNum }: Props) {
  const { profile } = useAuthStore()
  const { getSubtotal, getTax, getTotal, items } = useCartStore()
  const [method,    setMethod]    = useState<'cash'|'card'|'transfer'>('cash')
  const [amountStr, setAmountStr] = useState('')
  const [done,      setDone]      = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const total   = getTotal()
  const amount  = parseFloat(amountStr) || 0
  const change  = calculateChange(total, amount)
  const canPay  = method !== 'cash' || amount >= total

  const key = (k: string) => {
    if (k === '⌫') { setAmountStr(p => p.slice(0,-1)); return }
    if (k === '.' && amountStr.includes('.')) return
    if (amountStr.length >= 10) return
    setAmountStr(p => p + k)
  }

  const receiptData: ReceiptData = {
    type: 'sale',
    orderNumber: '#0042', // in a real app, this would come from the order creation
    tableNum: tableNum,
    items: items,
    subtotal: getSubtotal(),
    tax: getTax(),
    total: total,
    paymentMethod: method,
    cashAmount: method === 'cash' ? amount : undefined,
    change: method === 'cash' ? Math.max(0, change) : undefined,
    date: new Date().toISOString(),
    cashierName: profile?.full_name
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ticket_${receiptData.orderNumber}`,
  })

  const complete = () => {
    if (!canPay) { toast.error('El monto recibido es insuficiente'); return }
    setDone(true)
    toast.success('¡Pago completado! 🎉')
    
    // Auto print receipt
    handlePrint()

    setTimeout(onClose, 2600)
  }

  /* ── Success screen ── */
  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={S.modalOverlay}>
      <div className="rounded-[28px] p-10 text-center animate-fade-in-scale max-w-sm w-full mx-4"
           style={{ ...S.glassPanel, boxShadow:'var(--shadow-glass)' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
             style={{ background:'rgba(220,252,231,0.8)' }}>
          <CheckCircle size={40} color="#15803d" />
        </div>
        <h2 className="text-2xl font-black mb-1" style={S.onSurface}>¡Pago Exitoso!</h2>
        {method === 'cash' && change > 0 && (
          <p className="text-lg font-bold mt-2" style={S.primary}>Cambio: {formatCurrency(change)}</p>
        )}
        <p className="text-sm mt-1" style={S.muted}>Total cobrado: {formatCurrency(total)}</p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={S.modalOverlay}
         onClick={onClose}>
      {/* Background blobs */}
      <div className="fixed w-96 h-96 rounded-full pointer-events-none opacity-40"
           style={{ background:'radial-gradient(circle, #b19cd9 0%, transparent 70%)', filter:'blur(80px)', top:'-10%', left:'-5%' }} />
      <div className="fixed w-80 h-80 rounded-full pointer-events-none opacity-30"
           style={{ background:'radial-gradient(circle, #fdb5cc 0%, transparent 70%)', filter:'blur(80px)', bottom:'-5%', right:'-5%' }} />

      <div className="w-full max-w-3xl flex rounded-2xl overflow-hidden animate-fade-in-scale"
           style={{ ...S.glassPanel, maxHeight:'90vh' }}
           onClick={e => e.stopPropagation()}>

        {/* ── LEFT: summary ── */}
        <div className="w-72 flex flex-col p-7 shrink-0"
             style={{ background:'rgba(235,221,255,0.25)', borderRight:'1px solid rgba(255,255,255,0.4)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black" style={S.primary}>Checkout</h2>
            {tableNum && (
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background:'var(--c-secondary-fixed)', color:'var(--c-secondary)' }}>
                Mesa {tableNum}
              </span>
            )}
          </div>

          {/* Items summary */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between items-center text-sm">
                <span style={S.onSurface} className="flex-1 truncate">
                  <span className="font-bold mr-1" style={S.primary}>{item.quantity}×</span>
                  {item.product.name}
                </span>
                <span className="font-semibold shrink-0 ml-2" style={S.muted}>
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 pt-4" style={{ borderTop:'1px solid rgba(177,156,217,0.3)' }}>
            <div className="flex justify-between text-sm" style={S.muted}>
              <span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm" style={S.muted}>
              <span>IVA</span><span>{formatCurrency(getTax())}</span>
            </div>
            <div className="flex justify-between text-xl font-black pt-1">
              <span style={S.primary}>Total</span>
              <span style={S.primary}>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Change display (cash only) */}
          {method === 'cash' && amount > 0 && (
            <div className="mt-4 rounded-2xl p-4 text-center"
                 style={{ background:'rgba(255,255,255,0.65)', border:'1px solid rgba(255,255,255,0.8)' }}>
              <p className="text-xs font-bold mb-1" style={S.muted}>Cambio a entregar</p>
              <p className="text-3xl font-black" style={change >= 0 ? S.primary : S.error}>
                {formatCurrency(Math.max(0, change))}
              </p>
            </div>
          )}

          {/* Print button */}
          <button onClick={() => handlePrint()}
            className="mt-4 w-full py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
            style={S.btnOutline}>
            <Printer size={15} /> Imprimir Factura
          </button>
        </div>

        {/* ── RIGHT: payment ── */}
        <div className="flex-1 flex flex-col p-7 overflow-y-auto">
          {/* Method selector */}
          <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={S.muted}>Método de Pago</p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {METHODS.map(m => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                className="py-3 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all duration-200"
                style={method === m.key
                  ? { background:'var(--c-primary-fixed)', border:'2.5px solid var(--c-primary)', color:'var(--c-primary)' }
                  : { background:'rgba(255,255,255,0.5)', border:'1.5px solid rgba(203,196,208,0.5)', color:'var(--c-on-surface-var)' }
                }>
                <span className="text-2xl">{m.icon}</span>
                <span className="text-xs font-bold">{m.label}</span>
              </button>
            ))}
          </div>

          {method === 'cash' ? (
            <>
              {/* Amount display */}
              <div className="flex items-center rounded-full px-5 py-3 mb-3"
                   style={{ background:'rgba(255,255,255,0.85)', border:'2px solid var(--c-primary-container)' }}>
                <span className="text-2xl font-black mr-2" style={{ color:'var(--c-primary-container)' }}>$</span>
                <span className="flex-1 text-right text-2xl font-black" style={S.primary}>
                  {amountStr || '0.00'}
                </span>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
                {QUICK.map(q => (
                  <button key={q} onClick={() => setAmountStr(q.toString())}
                    className="px-4 py-2 rounded-full text-sm font-bold cursor-pointer transition-all shrink-0"
                    style={{ background:'rgba(205,229,255,0.5)', border:'1.5px solid var(--c-tertiary-fixed)', color:'var(--c-tertiary)' }}>
                    ${q}
                  </button>
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2">
                {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => (
                  <button key={k} onClick={() => key(k)}
                    className="h-12 rounded-full font-bold text-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
                    style={k === '.' || k === '⌫'
                      ? { background:'var(--c-surface-variant)', color:'var(--c-on-surface)' }
                      : { background:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.9)', color:'var(--c-on-surface)' }
                    }>
                    {k}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
              <span className="text-6xl">{METHODS.find(m => m.key === method)?.icon}</span>
              <p className="text-base font-semibold text-center" style={S.muted}>
                {method === 'card' ? 'Pasar tarjeta por el terminal POS' : 'Ingresar referencia de transferencia'}
              </p>
              <p className="text-3xl font-black" style={S.primary}>{formatCurrency(total)}</p>
              {method === 'transfer' && (
                <input className="w-full max-w-xs text-sm px-4 py-3 rounded-full text-center"
                       style={S.input} placeholder="Referencia / Número de confirmación" />
              )}
            </div>
          )}

          {/* Complete button */}
          <button onClick={complete}
            className="mt-5 w-full py-4 rounded-full font-black text-lg cursor-pointer transition-all duration-300"
            style={canPay
              ? { ...S.btnPrimary, transform:'none' }
              : { background:'var(--c-surface-high)', color:'var(--c-outline)', cursor:'not-allowed' }}
            onMouseEnter={e => canPay && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
            ✓ Completar Orden
          </button>
        </div>
      </div>

      {/* Hidden print container */}
      <div style={{ display: 'none' }}>
        <ReceiptTemplate ref={printRef} data={receiptData} />
      </div>
    </div>
  )
}
