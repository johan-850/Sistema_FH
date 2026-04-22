import { create } from 'zustand'
import type { CashRegisterSession } from '../types/database'

interface CashRegisterState {
  currentSession: CashRegisterSession | null
  isSessionOpen: boolean
  setSession: (session: CashRegisterSession | null) => void
  closeSession: () => void
}

export const useCashRegisterStore = create<CashRegisterState>((set) => ({
  currentSession: null,
  isSessionOpen: false,

  setSession: (session) =>
    set({
      currentSession: session,
      isSessionOpen: session?.status === 'open',
    }),

  closeSession: () =>
    set({
      currentSession: null,
      isSessionOpen: false,
    }),
}))
