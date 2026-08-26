import { apiFetch } from "./client";

export type ApiUser = {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "institution_admin";
  institutionId?: string;
};

export function signup(name: string, email: string, password: string) {
  return apiFetch<{ accessToken: string; refreshToken: string }>("/auth/signup", {
    method: "POST",
    body: { name, email, password },
  });
}

export function login(email: string, password: string) {
  return apiFetch<{ accessToken: string; refreshToken: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function refresh(refreshToken?: string | null) {
  return apiFetch<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
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
