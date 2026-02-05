import http from "./http";

export const login = (email, password) =>
  http.post("/api/v1/auth/login", { email, password });

export const register = (email, password) =>
  http.post("/api/v1/auth/register", { email, password });

export const logout = () => http.post("/api/v1/auth/logout");

export const loginWithTelegram = (payload) =>
  http.post("/api/v1/auth/external/telegram/callback", payload);
