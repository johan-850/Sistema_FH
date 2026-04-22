import { create } from 'zustand'
import type { Product } from '../types/database'

export interface CartItem {
  product: Product
  quantity: number
  notes: string
}

interface CartState {
  items: CartItem[]
  tableId: string | null
  setTableId: (id: string | null) => void
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateNotes: (productId: string, notes: string) => void
  clearCart: () => void
  getSubtotal: () => number
  getTax: () => number
  getTotal: () => number
  getItemCount: () => number
}

const TAX_RATE = 0.08

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tableId: null,

  setTableId: (tableId) => set({ tableId }),

  addItem: (product) => {
    const { items } = get()
    const existing = items.find((i) => i.product.id === product.id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({ items: [...items, { product, quantity: 1, notes: '' }] })
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.product.id !== productId) })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    })
  },

  updateNotes: (productId, notes) => {
    set({
      items: get().items.map((i) =>
        i.product.id === productId ? { ...i, notes } : i
      ),
    })
  },

  clearCart: () => set({ items: [], tableId: null }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  },

  getTax: () => {
    return get().getSubtotal() * TAX_RATE
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    return subtotal + subtotal * TAX_RATE
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))
