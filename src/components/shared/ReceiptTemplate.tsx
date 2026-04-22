import { forwardRef } from 'react'
import { formatCurrency, formatDate } from '../../lib/utils'
import type { CartItem } from '../../stores/cartStore'

export interface ReceiptData {
  type: 'sale' | 'expense'
  orderNumber?: string
  tableNum?: number
  items?: CartItem[]
  subtotal?: number
  tax?: number
  total: number
  paymentMethod?: string
  cashAmount?: number
  change?: number
  expenseCategory?: string
  expenseDescription?: string
  date: string
  cashierName?: string
}

interface Props {
  data: ReceiptData | null
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  if (!data) return null

  return (
    <div ref={ref} className="bg-white text-black p-8 w-[80mm] min-h-[100mm] font-mono text-sm leading-tight mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-1">GelatoFlow</h1>
        <p className="text-xs">Heladería Artesanal Premium</p>
        <p className="text-xs">Tel: (555) 123-4567</p>
        <div className="border-b-2 border-dashed border-gray-400 my-4" />
      </div>

      {/* Info */}
      <div className="mb-6 space-y-1 text-xs">
        <p>Fecha: {formatDate(data.date)}</p>
        {data.cashierName && <p>Cajero: {data.cashierName}</p>}
        {data.type === 'sale' && data.orderNumber && <p>Orden: {data.orderNumber}</p>}
        {data.type === 'sale' && data.tableNum && <p>Mesa: {data.tableNum}</p>}
        {data.type === 'expense' && <p className="font-bold uppercase mt-2">*** COMPROBANTE DE GASTO ***</p>}
      </div>

      <div className="border-b-2 border-dashed border-gray-400 my-4" />

      {/* Items for Sale */}
      {data.type === 'sale' && data.items && (
        <div className="mb-4">
          <div className="flex justify-between font-bold text-xs mb-2">
            <span>Cant x Prod</span>
            <span>Monto</span>
          </div>
          <div className="space-y-2 text-xs">
            {data.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="pr-2">
                  <p>{item.quantity} x {item.product.name}</p>
                  {item.notes && <p className="text-[10px] text-gray-600">  {item.notes}</p>}
                </div>
                <span>{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details for Expense */}
      {data.type === 'expense' && (
        <div className="mb-4 space-y-2 text-xs">
          <p><span className="font-bold">Categoría:</span><br/>{data.expenseCategory}</p>
          <p><span className="font-bold">Descripción:</span><br/>{data.expenseDescription}</p>
        </div>
      )}

      <div className="border-b-2 border-dashed border-gray-400 my-4" />

      {/* Totals */}
      <div className="space-y-1 mb-6 text-xs">
        {data.type === 'sale' && (
          <>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(data.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (8%):</span>
              <span>{formatCurrency(data.tax || 0)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between font-bold text-base mt-2">
          <span>TOTAL:</span>
          <span>{formatCurrency(data.total)}</span>
        </div>
        
        {data.type === 'sale' && (
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Método:</span>
              <span className="uppercase">{data.paymentMethod}</span>
            </div>
            {data.paymentMethod === 'cash' && data.cashAmount && (
              <>
                <div className="flex justify-between">
                  <span>Recibido:</span>
                  <span>{formatCurrency(data.cashAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cambio:</span>
                  <span>{formatCurrency(data.change || 0)}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-xs">
        <p>¡Gracias por tu preferencia!</p>
        <p className="mt-2 text-[10px] text-gray-500">
          GelatoFlow POS System
        </p>
      </div>
    </div>
  )
})

ReceiptTemplate.displayName = 'ReceiptTemplate'
