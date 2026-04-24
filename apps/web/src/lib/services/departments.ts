import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated } from "@/lib/types";

export type Department = {
  id: string;
  name: string;
  isActive?: boolean;
};

export type DepartmentSupervisor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive?: boolean;
  internCount?: number;
};

export type DepartmentIntern = {
  id: string;
  internId: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  supervisor?: { id: string; firstName: string; lastName: string } | null;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    studentId?: string | null;
  } | null;
};

export type DepartmentDetail = {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  supervisors?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
};

export async function listDepartments(
  params: { page?: number; limit?: number } = {},
  token?: string,
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiFetch<ApiSuccess<Paginated<Department>>>(
    `/departments${query ? `?${query}` : ""}`,
    { method: "GET", token },
  );
}

export async function getDepartmentDetail(id: string, token?: string) {
  return apiFetch<ApiSuccess<DepartmentDetail>>(`/departments/${id}`, {
    method: "GET",
    token,
  });
}

export async function getDepartmentInterns(
  id: string,
  params: {
    page?: number;
    limit?: number;
    status?: string;
    supervisorId?: string;
  } = {},
  token?: string,
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.supervisorId) qs.set("supervisorId", params.supervisorId);
  const query = qs.toString();
  return apiFetch<ApiSuccess<Paginated<DepartmentIntern>>>(
    `/departments/${id}/interns${query ? `?${query}` : ""}`,
    { method: "GET", token },
  );
}

export async function getDepartmentSupervisors(id: string, token?: string) {
  return apiFetch<ApiSuccess<{ items: DepartmentSupervisor[] }>>(
    `/departments/${id}/supervisors`,
    { method: "GET", token },
  );
}

export type DepartmentType =
  | "NETWORKING"
  | "CYBERSECURITY"
  | "SOFTWARE_DEVELOPMENT";

export async function createDepartment(
  body: { name: string; type: DepartmentType; description?: string },
  token?: string,
) {
  return apiFetch<ApiSuccess<Department>>(`/departments`, {
    method: "POST",
    body,
    token,
  });
}

export async function updateDepartment(
  id: string,
  body: { name?: string; description?: string },
  token?: string,
) {
  return apiFetch<ApiSuccess<Department>>(`/departments/${id}`, {
    method: "PATCH",
    body,
    token,
  });
}

export async function deleteDepartmentPermanently(id: string, token?: string) {
  return apiFetch<ApiSuccess<null>>(`/departments/${id}/permanent`, {
    method: "DELETE",
    token,
  });
}
