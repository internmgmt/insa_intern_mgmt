import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated, University } from "@/lib/types";

export type ListUniversitiesParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

export async function listUniversities(params: ListUniversitiesParams = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (typeof params.isActive === "boolean") qs.set("isActive", String(params.isActive));
  const query = qs.toString();
  const path = `/universities${query ? `?${query}` : ""}`;
  return apiFetch<ApiSuccess<Paginated<University>>>(path, { method: "GET", token });
}

export async function getUniversityById(id: string, token?: string) {
  return apiFetch<ApiSuccess<University>>(`/universities/${id}`, { method: "GET", token });
}
