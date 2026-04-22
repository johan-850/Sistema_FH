import { create } from 'zustand'
import type { Profile, UserRole } from '../types/database'

interface AuthState {
  user: { id: string; email: string } | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: { id: string; email: string } | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  hasRole: (role: UserRole) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: () => set({ user: null, profile: null, isAuthenticated: false }),

  hasRole: (role) => {
    const { profile } = get()
    return profile?.role === role
  },
}))
