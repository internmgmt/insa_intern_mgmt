import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated, InternListItem } from "@/lib/types";

export type ListInternsParams = {
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "COMPLETED" | "TERMINATED";
  departmentId?: string;
  supervisorId?: string;
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
};

export async function listInterns(params: ListInternsParams = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) {
    const safeLimit = Math.min(params.limit, 50);
    qs.set("limit", String(safeLimit));
  }
  if (params.status) qs.set("status", params.status);
  if (params.departmentId) qs.set("departmentId", params.departmentId);
  if (params.supervisorId) qs.set("supervisorId", params.supervisorId);
  if (params.search) qs.set("search", params.search);
  if (params.startDateFrom) qs.set("startDateFrom", params.startDateFrom);
  if (params.startDateTo) qs.set("startDateTo", params.startDateTo);
  const query = qs.toString();
  return apiFetch<ApiSuccess<Paginated<InternListItem>>>(`/interns${query ? `?${query}` : ""}`, { method: "GET", token });
}

export async function createIntern(body: {
  studentId: string;
  departmentId?: string;
  supervisorId?: string;
  startDate?: string;
  endDate?: string;
}, token?: string) {
  return apiFetch<ApiSuccess<InternListItem>>(`/interns`, { method: "POST", body, token });
}

export async function getInternById(internId: string, token?: string) {
  return apiFetch<ApiSuccess<any>>(`/interns/${internId}`, { method: "GET", token });
}

export async function getMyProfile(token?: string) {
  return apiFetch<ApiSuccess<any>>(`/interns/me`, { method: "GET", token });
}

export async function assignSupervisor(internId: string, body: { supervisorId: string }, token?: string) {
  return apiFetch<ApiSuccess<InternListItem>>(`/interns/${internId}/assign-supervisor`, { method: "POST", body, token });
}

export async function completeInternship(internId: string, body: { finalEvaluation: number; completionNotes?: string }, token?: string) {
  return apiFetch<ApiSuccess<InternListItem>>(`/interns/${internId}/complete`, { method: "POST", body, token });
}

export async function terminateInternship(internId: string, body: { reason: string }, token?: string) {
  return apiFetch<ApiSuccess<InternListItem>>(`/interns/${internId}/terminate`, { method: "POST", body, token });
}

export async function suspendIntern(internId: string, body: { reason: string }, token?: string) {
  return apiFetch<ApiSuccess<InternListItem>>(`/interns/${internId}/suspend`, { method: "POST", body, token });
}

export async function unsuspendIntern(internId: string, token?: string) {
  return apiFetch<ApiSuccess<InternListItem>>(`/interns/${internId}/unsuspend`, { method: "POST", token });
}

export async function issueCertificate(internId: string, body: { certificateUrl: string }, token?: string) {
  return apiFetch<ApiSuccess<InternListItem>>(`/interns/${internId}/issue-certificate`, { method: "POST", body, token });
}

export async function deleteIntern(internId: string, token?: string) {
  return apiFetch<ApiSuccess<null>>(`/interns/${internId}`, { method: "DELETE", token });
}
