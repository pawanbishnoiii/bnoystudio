import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  showAuthModal: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setShowAuthModal: (show: boolean) => void;
  logout: () => void;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@devmarket.in';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAdmin: false,
  showAuthModal: false,
  setUser: (user) => set({ user, isAdmin: user?.email === ADMIN_EMAIL }),
  setSession: (session) => set({ session }),
  setShowAuthModal: (show) => set({ showAuthModal: show }),
  logout: () => set({ user: null, session: null, isAdmin: false }),
}));
