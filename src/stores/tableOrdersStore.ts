import { create } from 'zustand'
import type { Product } from '../types/database'

export interface CartItem {
  product: Product
  quantity: number
  notes: string
}

export interface TableOrder {
  tableId: string
  tableNum: number
  items: CartItem[]
  orderNumber: string
  savedAt: string
}

interface TableOrdersState {
  /** Map of tableId -> active saved order */
  orders: Record<string, TableOrder>

  /** Save current cart items to a table */
  saveOrder: (tableId: string, tableNum: number, items: CartItem[]) => void

  /** Load the saved order for a table (returns items or null) */
  getOrder: (tableId: string) => TableOrder | null

  /** Remove order from table (after payment or manual clear) */
  clearOrder: (tableId: string) => void

  /** Check if a table has a saved order */
  hasOrder: (tableId: string) => boolean
}

let orderCounter = 41 // start from #0042 in demo

export const useTableOrdersStore = create<TableOrdersState>((set, get) => ({
  orders: {},

  saveOrder: (tableId, tableNum, items) => {
    orderCounter++
    const order: TableOrder = {
      tableId,
      tableNum,
      items: [...items],
      orderNumber: String(orderCounter).padStart(4, '0'),
      savedAt: new Date().toISOString(),
    }
    set(state => ({ orders: { ...state.orders, [tableId]: order } }))
  },

  getOrder: (tableId) => {
    return get().orders[tableId] ?? null
  },

  clearOrder: (tableId) => {
    set(state => {
      const next = { ...state.orders }
      delete next[tableId]
      return { orders: next }
    })
  },

  hasOrder: (tableId) => {
    return tableId in get().orders
  },
}))
