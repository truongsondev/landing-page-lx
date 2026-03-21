import { create } from "zustand";
import {
  authService,
  type LoginPayload,
  type RegisterPayload,
  type RegisterResponse,
} from "@/services/auth.service";
import type { User } from "@/types/models";
import { storage } from "@/lib/storage";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  hydrateMe: () => Promise<void>;
}

const savedUser = storage.getUserRaw();

export const useAuthStore = create<AuthState>()(
  (set: (state: Partial<AuthState>) => void) => ({
    user: savedUser ? (JSON.parse(savedUser) as User) : null,
    accessToken: storage.getAccessToken(),
    refreshToken: storage.getRefreshToken(),
    isAuthenticated: Boolean(storage.getAccessToken()),
    loading: false,

    login: async (payload: LoginPayload) => {
      set({ loading: true });
      try {
        const data = await authService.login(payload);
        storage.setAuthTokens(data.accessToken, data.refreshToken);
        storage.setUserRaw(JSON.stringify(data.user));
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
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
        set({ loading: false });
        return data;
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    logout: async () => {
      const refreshToken = storage.getRefreshToken();
      try {
        if (refreshToken) {
          await authService.logout(refreshToken);
        }
      } finally {
        storage.clearAuthTokens();
        storage.clearUser();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      }
    },

    hydrateMe: async () => {
      if (!storage.getAccessToken()) {
        return;
      }
      try {
        const user = await authService.getMe();
        storage.setUserRaw(JSON.stringify(user));
        set({
          user,
          accessToken: storage.getAccessToken(),
          refreshToken: storage.getRefreshToken(),
          isAuthenticated: true,
        });
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;

        // Only clear session when token is truly invalid/expired and cannot be recovered.
        if (status === 401) {
          storage.clearAuthTokens();
          storage.clearUser();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return;
        }

        // Keep existing session data on transient/non-auth errors.
        set({
          accessToken: storage.getAccessToken(),
          refreshToken: storage.getRefreshToken(),
          isAuthenticated: Boolean(storage.getAccessToken()),
        });
      }
    },
  }),
);
