"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "lume_admin_token";
const STORAGE_ADMIN = "lume_admin_user";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface AdminUser {
  id: string;
  email: string;
}

interface AuthState {
  hydrated: boolean;
  token: string | null;
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  // Mirror token in a ref so apiFetch always reads the latest value without
  // forcing its callers to depend on token changes.
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_KEY);
      const a = localStorage.getItem(STORAGE_ADMIN);
      if (t) {
        setToken(t);
        tokenRef.current = t;
      }
      if (a) setAdmin(JSON.parse(a));
    } catch {
      // ignore – treat as logged out
    }
    setHydrated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_ADMIN);
    tokenRef.current = null;
    setToken(null);
    setAdmin(null);
    router.replace("/login");
  }, [router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_URL}/api/v1/admin/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? `login_failed_${res.status}`);
      }
      localStorage.setItem(STORAGE_KEY, body.token);
      localStorage.setItem(STORAGE_ADMIN, JSON.stringify(body.admin));
      tokenRef.current = body.token;
      setToken(body.token);
      setAdmin(body.admin);
    },
    [],
  );

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      const t = tokenRef.current;
      if (t) headers.set("Authorization", `Bearer ${t}`);
      // Default to JSON for body-bearing requests — but never for FormData,
      // which needs the browser-set multipart boundary.
      const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
      if (init.body && !isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      const res = await fetch(`${API_URL}${path}`, { ...init, headers });
      if (res.status === 401) {
        // Token rejected or absent — kick to login.
        logout();
      }
      return res;
    },
    [logout],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const res = await apiFetch("/api/v1/admin/password", {
        method: "PATCH",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Surface field errors (e.g. password too short) and coded errors.
        if (body?.errors?.password?.length) {
          throw new Error(`password ${body.errors.password[0]}`);
        }
        throw new Error(body?.error ?? `change_failed_${res.status}`);
      }
    },
    [apiFetch],
  );

  const value = useMemo<AuthState>(
    () => ({ hydrated, token, admin, login, logout, apiFetch, changePassword }),
    [hydrated, token, admin, login, logout, apiFetch, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
