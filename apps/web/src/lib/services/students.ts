import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated, Student } from "@/lib/types";

export type ListStudentsParams = {
  page?: number;
  limit?: number;
  status?: string;
  universityId?: string;
  academicYear?: string;
  search?: string;
};

export async function listStudents(params: ListStudentsParams = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) {
    const safeLimit = Math.min(params.limit, 50);
    qs.set("limit", String(safeLimit));
  }
  if (params.status) qs.set("status", params.status);
  if (params.universityId) qs.set("universityId", params.universityId);
  if (params.academicYear) qs.set("academicYear", params.academicYear);
  if (params.search) qs.set("search", params.search);
  const query = qs.toString();
  return apiFetch<ApiSuccess<Paginated<Student>>>(`/students${query ? `?${query}` : ""}`, {
    method: "GET",
    token,
  });
}

export async function listApplicationStudents(appId: string, params: { page?: number; limit?: number; status?: string; search?: string } = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) {
    const safeLimit = Math.min(params.limit, 50);
    qs.set("limit", String(safeLimit));
  }
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  const query = qs.toString();
  return apiFetch<ApiSuccess<Paginated<Student>>>(`/applications/${appId}/students${query ? `?${query}` : ""}`, { method: "GET", token });
}

export async function addStudentToApplication(appId: string, body: Omit<Student, "id" | "status" | "createdAt">, token?: string) {
  return apiFetch<ApiSuccess<Student>>(`/applications/${appId}/students`, { method: "POST", body, token });
}

export async function updateApplicationStudent(appId: string, id: string, body: Partial<Omit<Student, "id">>, token?: string) {
  return apiFetch<ApiSuccess<Student>>(`/applications/${appId}/students/${id}`, { method: "PATCH", body, token });
}

export async function removeApplicationStudent(appId: string, id: string, token?: string) {
  return apiFetch<ApiSuccess<null>>(`/applications/${appId}/students/${id}`, { method: "DELETE", token });
}

export async function reviewStudent(
  id: string,
  body: { decision: "ACCEPT" | "REJECT"; rejectionReason?: string },
  token?: string,
) {
  return apiFetch<ApiSuccess<Student>>(`/students/${id}/review`, { method: "POST", body, token });
}

export async function markStudentArrived(id: string, token?: string) {
  return apiFetch<ApiSuccess<Student>>(`/students/${id}/mark-arrived`, { method: "POST", token });
}
