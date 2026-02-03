import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated } from "@/lib/types";

export type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";

export type ApplicationListItem = {
  id: string;
  name?: string | null;
  academicYear: string;
  status: ApplicationStatus;
  officialLetterUrl?: string | null;
  rejectionReason?: string | null;
  studentCount: number;
  acceptedStudentCount?: number;
  university?: { id: string; name: string };
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
};

export type ListApplicationsParams = {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  universityId?: string;
  academicYear?: string;
  startDate?: string;
  endDate?: string;
};

export async function listApplications(params: ListApplicationsParams = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.universityId) qs.set("universityId", params.universityId);
  if (params.academicYear) qs.set("academicYear", params.academicYear);
  if (params.startDate) qs.set("startDate", params.startDate);
  if (params.endDate) qs.set("endDate", params.endDate);
  const query = qs.toString();
  const path = `/applications${query ? `?${query}` : ""}`;
  return apiFetch<ApiSuccess<Paginated<ApplicationListItem>>>(path, { method: "GET", token });
}

export async function createApplication(body: { academicYear: string }, token?: string) {
  return apiFetch<ApiSuccess<ApplicationListItem>>(`/applications`, { method: "POST", body, token });
}

export type CreateApplicationStudent = {
  firstName: string;
  lastName: string;
  studentId: string;
  fieldOfStudy: string;
  academicYear: string;
  email?: string;
  phone?: string;
};

export type CreateApplicationPayload = {
  name: string;
  academicYear: string;
  universityId: string;
  officialLetterUrl: string;
  students: CreateApplicationStudent[];
};

export async function createApplicationFull(body: CreateApplicationPayload, token?: string) {
  return apiFetch<ApiSuccess<ApplicationListItem>>(`/applications`, { method: "POST", body, token });
}

export async function updateApplication(id: string, body: { academicYear?: string; officialLetterUrl?: string; name?: string }, token?: string) {
  return apiFetch<ApiSuccess<ApplicationListItem>>(`/applications/${id}`, { method: "PATCH", body, token });
}

export async function submitApplication(id: string, token?: string) {
  return apiFetch<ApiSuccess<ApplicationListItem>>(`/applications/${id}/submit`, { method: "POST", token });
}

export async function reviewApplication(
  id: string,
  body: { decision: "APPROVE" | "REJECT"; rejectionReason?: string },
  token?: string
) {
  return apiFetch<ApiSuccess<ApplicationListItem>>(`/applications/${id}/review`, {
    method: "POST",
    body,
    token,
  });
}

export async function getApplication(id: string, token?: string) {
  return apiFetch<ApiSuccess<ApplicationListItem>>(`/applications/${id}`, { method: "GET", token });
}

export async function deleteApplication(id: string, token?: string) {
  return apiFetch<ApiSuccess<void>>(`/applications/${id}`, { method: "DELETE", token });
}
