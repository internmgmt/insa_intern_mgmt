import { apiFetch } from "@/lib/api";
import type { ApiSuccess, LoginResponse, User } from "@/lib/types";

export async function loginApi(email: string, password: string) {
  return apiFetch<ApiSuccess<LoginResponse>>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function logoutApi(token: string) {
  return apiFetch<ApiSuccess<null>>("/auth/logout", {
    method: "POST",
    token,
  });
}

export async function meApi(token: string) {
  return apiFetch<ApiSuccess<User>>("/auth/me", {
    method: "GET",
    token,
  });
}
