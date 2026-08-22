import { apiFetch } from "./client";

export type ApiUser = {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin";
};

export function signup(name: string, email: string, password: string) {
  return apiFetch<{ accessToken: string }>("/auth/signup", { method: "POST", body: { name, email, password } });
}

export function login(email: string, password: string) {
  return apiFetch<{ accessToken: string }>("/auth/login", { method: "POST", body: { email, password } });
}

export function refresh() {
  return apiFetch<{ accessToken: string }>("/auth/refresh", { method: "POST" });
}

export function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function me(accessToken: string) {
  return apiFetch<{ user: ApiUser }>("/auth/me", { accessToken });
}

export function forgotPassword(email: string) {
  return apiFetch<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } });
}

export function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ message: string }>("/auth/reset-password", { method: "POST", body: { token, newPassword } });
}
