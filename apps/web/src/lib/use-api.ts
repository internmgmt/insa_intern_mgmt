"use client";

import { useAuth } from "@/components/auth-provider";
import { apiFetch } from "@/lib/api";

type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export function useApi() {
  const { token } = useAuth();

  return async function api<T>(path: string, options: FetchOptions = {}): Promise<T> {
    return apiFetch<T>(path, { ...options, token: token ?? undefined });
  };
}
