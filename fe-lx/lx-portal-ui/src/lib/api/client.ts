import axios from "axios";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: apiBase,
});

let refreshPromise: Promise<string> | null = null;

const isAuthEndpoint = (url?: string) => {
  const target = url || "";
  return [
    "/auth/login",
    "/auth/register",
    "/auth/refresh-token",
    "/auth/logout",
  ].some((p) => target.includes(p));
};

const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const syncAuthStateWithStorage = () => {
  void import("@/stores/auth.store").then(({ useAuthStore }) => {
    useAuthStore.setState({
      accessToken: storage.getAccessToken(),
      refreshToken: storage.getRefreshToken(),
      isAuthenticated: Boolean(storage.getAccessToken()),
    });
  });
};

const clearAuthState = () => {
  storage.clearAuthTokens();
  storage.clearUser();
  void import("@/stores/auth.store").then(({ useAuthStore }) => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });
};

api.interceptors.request.use((config) => {
  const token = storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config as
      | ({
          _retry?: boolean;
          url?: string;
          headers?: Record<string, string>;
        } & Record<string, unknown>)
      | undefined;

    if (
      status === 401 &&
      originalRequest &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      if (originalRequest._retry) {
        clearAuthState();
        redirectToLogin();
        return Promise.reject(error);
      }

      const refreshToken = storage.getRefreshToken();
      if (!refreshToken) {
        clearAuthState();
        redirectToLogin();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${apiBase}/auth/refresh-token`, { refreshToken })
            .then((res) => {
              const nextAccessToken = res.data?.accessToken as
                | string
                | undefined;
              const nextRefreshToken = res.data?.refreshToken as
                | string
                | undefined;
              if (!nextAccessToken || !nextRefreshToken) {
                throw new Error("Invalid refresh token response");
              }
              storage.setAuthTokens(nextAccessToken, nextRefreshToken);
              syncAuthStateWithStorage();
              return nextAccessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const nextAccessToken = await refreshPromise;
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${nextAccessToken}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthState();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && isAuthEndpoint(originalRequest?.url)) {
      clearAuthState();
      redirectToLogin();
    }

    if (status === 429) {
      toast.error("Quá nhiều requests. Vui lòng thử lại sau.");
    }
    return Promise.reject(error);
  },
);
