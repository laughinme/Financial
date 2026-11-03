import { get, post } from "@/shared/api/http";
export interface User {
  id: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  banned: boolean;
}
export const getMe = (signal?: AbortSignal) =>
  get<User>("/api/v1/users/me/", signal);
export const authenticate = (
  mode: "login" | "register",
  email: string,
  password: string,
) => post(`/api/v1/auth/${mode}`, { email, password });
export const logout = () => post("/api/v1/auth/logout");
export const telegramLogin = (payload: unknown) =>
  post("/api/v1/auth/external/telegram/callback", payload);
export const linkTelegram = (payload: unknown) =>
  post("/api/v1/auth/link/telegram?replace_fields=true", payload);
