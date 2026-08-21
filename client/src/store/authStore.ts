import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "../api/auth";
import { ApiUnreachableError, ApiError } from "../api/client";
import { trackEvent } from "../lib/analytics";

type Role = "student" | "admin";
type User = { name: string; email: string; role: Role };

type AuthState = {
  user: User | null;
  accessToken: string | null;
  /** true when we're running against a local mock session because the API was unreachable */
  isOffline: boolean;
  status: "idle" | "loading";
  error: string | null;

  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  /** Called once on app load — tries to silently restore a session from the refresh cookie. */
  hydrate: () => Promise<void>;
};

async function fetchMe(accessToken: string): Promise<User> {
  const { user } = await authApi.me(accessToken);
  return { name: user.name, email: user.email, role: user.role };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isOffline: false,
      status: "idle",
      error: null,

      signup: async (name, email, password) => {
        set({ status: "loading", error: null });
        try {
          const { accessToken } = await authApi.signup(name, email, password);
          const user = await fetchMe(accessToken);
          set({ user, accessToken, isOffline: false, status: "idle" });
          trackEvent("signup", { method: "email" });
        } catch (err) {
          if (err instanceof ApiUnreachableError) {
            // Backend not running — fall back to a local-only demo session so the
            // rest of the app remains usable. Nothing here is persisted server-side.
            set({ user: { name, email, role: "student" }, accessToken: null, isOffline: true, status: "idle" });
            return;
          }
          set({ status: "idle", error: err instanceof ApiError ? err.message : "Sign up failed" });
          throw err;
        }
      },

      login: async (email, password) => {
        set({ status: "loading", error: null });
        try {
          const { accessToken } = await authApi.login(email, password);
          const user = await fetchMe(accessToken);
          set({ user, accessToken, isOffline: false, status: "idle" });
        } catch (err) {
          if (err instanceof ApiUnreachableError) {
            set({ user: { name: email.split("@")[0], email, role: "student" }, accessToken: null, isOffline: true, status: "idle" });
            return;
          }
          set({ status: "idle", error: err instanceof ApiError ? err.message : "Login failed" });
          throw err;
        }
      },

      loginAsAdmin: async () => {
        // Convenience path for local development/demo. Tries the real API first —
        // works once you've seeded an admin user (see server/README.md) — and
        // falls back to a local mock admin session if the API isn't reachable.
        set({ status: "loading", error: null });
        try {
          const { accessToken } = await authApi.login("admin@learnpath.dev", "admin12345");
          const user = await fetchMe(accessToken);
          set({ user, accessToken, isOffline: false, status: "idle" });
        } catch (err) {
          set({
            user: { name: "Admin", email: "admin@learnpath.dev", role: "admin" },
            accessToken: null,
            isOffline: true,
            status: "idle",
            error: null,
          });
          void err; // expected when no seeded admin exists yet or API is offline
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore — we're clearing local state regardless
        }
        set({ user: null, accessToken: null, isOffline: false });
      },

      hydrate: async () => {
        if (get().isOffline) return; // keep the local mock session as-is
        try {
          const { accessToken } = await authApi.refresh();
          const user = await fetchMe(accessToken);
          set({ user, accessToken, isOffline: false });
        } catch {
          // no valid refresh cookie / API unreachable — stay logged out
          set({ user: null, accessToken: null });
        }
      },
    }),
    { name: "learnpath-auth", partialize: (s) => ({ user: s.user, isOffline: s.isOffline }) }
  )
);
