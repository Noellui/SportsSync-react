import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../models/user';
import type { Player } from '../models/player';

interface AuthState {
  user: User | null;
  player: Player | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null, player: Player | null) => void;
  clearAuth: () => void;
  refreshUser: (user: User, player?: Player | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      player: null,
      isAuthenticated: false,
      setAuth: (user, player) => set({ user, player, isAuthenticated: !!user }),
      clearAuth: () => set({ user: null, player: null, isAuthenticated: false }),
      refreshUser: (user, player) => set({ user, player: player ?? null }),
    }),
    { name: 'sportssync_auth' },
  ),
);
