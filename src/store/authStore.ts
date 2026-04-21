import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isPatient: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('voit_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })(),
  token: localStorage.getItem('voit_token'),
  login: (user, token) => {
    localStorage.setItem('voit_user', JSON.stringify(user));
    localStorage.setItem('voit_token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('voit_user');
    localStorage.removeItem('voit_token');
    set({ user: null, token: null });
  },
  isAdmin: () => get().user?.role === 'ADMIN',
  isPatient: () => get().user?.role === 'PATIENT',
}));
