const TOKEN_KEY = "token";
const USER_KEY = "user";

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getUserRaw: () => localStorage.getItem(USER_KEY),
  setUserRaw: (value: string) => localStorage.setItem(USER_KEY, value),
  clearUser: () => localStorage.removeItem(USER_KEY),
};
