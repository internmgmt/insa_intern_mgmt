"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/lib/types";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth-storage";
import { loginApi, logoutApi, meApi } from "@/lib/auth-api";

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithCredentials: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  roleHome: (role: UserRole) => string;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await meApi(storedToken);
      setUser(res.data);
      setToken(storedToken);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkSession = useCallback(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      clearStoredToken();
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")) {
        router.replace("/auth/login");
      }
    }
  }, [router]);

  useEffect(() => {
    refresh().catch(() => {
      clearStoredToken();
      setUser(null);
      setToken(null);
      setLoading(false);
    });
  }, [refresh]);

  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [checkSession]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      setStoredToken(res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      console.error("API Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithCredentials = useCallback(
    async (credentials: { email: string; password: string }) => {
      await login(credentials.email, credentials.password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    const storedToken = getStoredToken();
    clearStoredToken();
    setUser(null);
    setToken(null);

    if (storedToken) {
      try {
        await logoutApi(storedToken);
      } catch {
      }
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      loading,
      isLoading: loading,
      login,
      loginWithCredentials,
      logout,
      refresh,
      roleHome,
    }),
    [user, token, loading, login, loginWithCredentials, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleHome(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "UNIVERSITY":
      return "/dashboard/university";
    case "SUPERVISOR":
      return "/dashboard/supervisor";
    case "INTERN":
      return "/dashboard/intern";
  }
}