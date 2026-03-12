import { create } from "zustand";
import {
  authService,
  type LoginPayload,
  type RegisterPayload,
} from "@/services/auth.service";
import type { User } from "@/types/models";
import { storage } from "@/lib/storage";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  hydrateMe: () => Promise<void>;
}

const savedUser = storage.getUserRaw();

export const useAuthStore = create<AuthState>()(
  (set: (state: Partial<AuthState>) => void) => ({
    user: savedUser ? (JSON.parse(savedUser) as User) : null,
    token: storage.getToken(),
    isAuthenticated: Boolean(storage.getToken()),
    loading: false,

    login: async (payload: LoginPayload) => {
      set({ loading: true });
      try {
        const data = await authService.login(payload);
        storage.setToken(data.token);
        storage.setUserRaw(JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    register: async (payload: RegisterPayload) => {
      set({ loading: true });
      try {
        const data = await authService.register(payload);
        storage.setToken(data.token);
        storage.setUserRaw(JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    logout: () => {
      storage.clearToken();
      storage.clearUser();
      set({ user: null, token: null, isAuthenticated: false });
    },

    hydrateMe: async () => {
      if (!storage.getToken()) return;
      try {
        const user = await authService.getMe();
        storage.setUserRaw(JSON.stringify(user));
        set({ user, isAuthenticated: true });
      } catch {
        storage.clearToken();
        storage.clearUser();
        set({ user: null, token: null, isAuthenticated: false });
      }
    },
  }),
);
