import axios from "axios";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: apiBase,
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      storage.clearToken();
      storage.clearUser();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    if (status === 429) {
      toast.error("Quá nhiều requests. Vui lòng thử lại sau.");
    }
    return Promise.reject(error);
  },
);
