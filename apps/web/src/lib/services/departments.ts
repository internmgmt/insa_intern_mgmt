import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated } from "@/lib/types";

export type Department = {
  id: string;
  name: string;
  isActive?: boolean;
};

export async function listDepartments(params: { page?: number; limit?: number } = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiFetch<ApiSuccess<Paginated<Department>>>(`/departments${query ? `?${query}` : ""}`, { method: "GET", token });
}

export type DepartmentType = "NETWORKING" | "CYBERSECURITY" | "SOFTWARE_DEVELOPMENT";

export async function createDepartment(body: { name: string; type: DepartmentType; description?: string }, token?: string) {
  return apiFetch<ApiSuccess<Department>>(`/departments`, { method: "POST", body, token });
}

export async function updateDepartment(id: string, body: { name?: string; description?: string }, token?: string) {
  return apiFetch<ApiSuccess<Department>>(`/departments/${id}`, { method: "PATCH", body, token });
}
