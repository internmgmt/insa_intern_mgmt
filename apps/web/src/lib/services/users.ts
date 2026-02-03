import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated, User, UserRole } from "@/lib/types";

export type ListUsersParams = {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  isActive?: boolean;
  departmentId?: string;
};

export async function listUsers(params: ListUsersParams = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.role) qs.set("role", params.role);
  if (params.search) qs.set("search", params.search);
  if (typeof params.isActive === "boolean") qs.set("isActive", String(params.isActive));
  if (params.departmentId) qs.set("departmentId", params.departmentId);
  const query = qs.toString();
  const path = `/users${query ? `?${query}` : ""}`;
  return apiFetch<ApiSuccess<Paginated<User>>>(path, { method: "GET", token });
}

export type CreateUserBody = {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: string;
  universityId?: string;
};

export async function createUser(body: CreateUserBody, token?: string) {
  return apiFetch<ApiSuccess<User>>("/users", { method: "POST", body, token });
}

export async function updateUser(id: string, body: Partial<CreateUserBody> & { isActive?: boolean }, token?: string) {
  return apiFetch<ApiSuccess<User>>(`/users/${id}`, { method: "PATCH", body, token });
}

export async function deactivateUser(id: string, token?: string) {
  return apiFetch<ApiSuccess<null>>(`/users/${id}`, { method: "DELETE", token });
}
