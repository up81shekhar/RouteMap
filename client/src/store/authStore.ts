import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "../api/auth";
import { ApiUnreachableError, ApiError } from "../api/client";
import { trackEvent } from "../lib/analytics";

type Role = "student" | "admin" | "institution_admin";
type User = { name: string; email: string; role: Role; institutionId?: string };

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isOffline: boolean;
  status: "idle" | "loading";
  error: string | null;

  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setSession: (accessToken: string, user: User) => void;
};

async function fetchMe(accessToken: string): Promise<User> {
  const { user } = await authApi.me(accessToken);
  return { name: user.name, email: user.email, role: user.role, institutionId: user.institutionId };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isOffline: false,
      status: "idle",
      error: null,

      signup: async (name, email, password) => {
        set({ status: "loading", error: null });
        try {
          const { accessToken, refreshToken } = await authApi.signup(name, email, password);
          const user = await fetchMe(accessToken);
          set({ user, accessToken, refreshToken, isOffline: false, status: "idle" });
          trackEvent("signup", { method: "email" });
        } catch (err) {
          if (err instanceof ApiUnreachableError) {
            set({ user: { name, email, role: "student" }, accessToken: null, refreshToken: null, isOffline: true, status: "idle" });
            return;
          }
          set({ status: "idle", error: err instanceof ApiError ? err.message : "Sign up failed" });
          throw err;
        }
      },

      login: async (email, password) => {
        set({ status: "loading", error: null });
        try {
          const { accessToken, refreshToken } = await authApi.login(email, password);
          const user = await fetchMe(accessToken);
          set({ user, accessToken, refreshToken, isOffline: false, status: "idle" });
        } catch (err) {
          if (err instanceof ApiUnreachableError) {
            set({
              user: { name: email.split("@")[0], email, role: "student" },
              accessToken: null,
              refreshToken: null,
              isOffline: true,
              status: "idle",
            });
            return;
          }
          set({ status: "idle", error: err instanceof ApiError ? err.message : "Login failed" });
          throw err;
        }
      },

      loginAsAdmin: async () => {
        set({ status: "loading", error: null });
        try {
          const { accessToken, refreshToken } = await authApi.login("admin@routemap.dev", "admin12345");
          const user = await fetchMe(accessToken);
          set({ user, accessToken, refreshToken, isOffline: false, status: "idle" });
        } catch (err) {
          set({
            user: { name: "Admin", email: "admin@routemap.dev", role: "admin" },
            accessToken: null,
            refreshToken: null,
            isOffline: true,
            status: "idle",
            error: null,
          });
          void err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore
        }
        set({ user: null, accessToken: null, refreshToken: null, isOffline: false });
      },

      hydrate: async () => {
        if (get().isOffline) return;
        const storedRefreshToken = get().refreshToken;
        if (!storedRefreshToken) return;
        try {
          const { accessToken, refreshToken } = await authApi.refresh(storedRefreshToken);
          const user = await fetchMe(accessToken);
          set({ user, accessToken, refreshToken, isOffline: false });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      setSession: (accessToken, user) => set({ user, accessToken, isOffline: false }),
    }),
    { name: "routemap-auth", partialize: (s) => ({ user: s.user, refreshToken: s.refreshToken, isOffline: s.isOffline }) }
  )
);
