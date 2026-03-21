const TOKEN_KEY = "token";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const storage = {
  getAccessToken: () =>
    localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(TOKEN_KEY),
  setAccessToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  },
  clearAccessToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) =>
    localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
  setAuthTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.removeItem(TOKEN_KEY);
  },
  clearAuthTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
  getToken: () =>
    localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  },
  clearToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
  getUserRaw: () => localStorage.getItem(USER_KEY),
  setUserRaw: (value: string) => localStorage.setItem(USER_KEY, value),
  clearUser: () => localStorage.removeItem(USER_KEY),
};
