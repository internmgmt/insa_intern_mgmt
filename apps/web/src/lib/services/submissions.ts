import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated } from "@/lib/types";

export type Submission = {
  id: string;
  internId?: string;
  internName?: string;
  internUniversity?: string;
  type: string;
  title?: string;
  description?: string;
  submittedAt: string;
  status: "PENDING" | "REVIEWED" | "ASSIGNED" | "SUBMITTED" | string;
  score?: number;
  feedback?: string;
};

export async function listSubmissions(params: { page?: number; limit?: number; status?: string; type?: string } = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.type) qs.set("type", params.type);
  const query = qs.toString();
  return apiFetch<ApiSuccess<Paginated<Submission>>>(`/submissions${query ? `?${query}` : ""}`, { method: "GET", token });
}

export async function createSubmission(body: { 
  internId: string; 
  title: string; 
  description: string; 
  type: string;
  status?: string;
}, token?: string) {
  return apiFetch<ApiSuccess<Submission>>(`/submissions`, { method: "POST", body, token });
}

export async function reviewSubmission(id: string, body: { decision: 'APPROVE' | 'REJECT'; score?: number; feedback?: string; rejectionReason?: string }, token?: string) {
  return apiFetch<ApiSuccess<any>>(`/submissions/${id}/review`, { method: "POST", body, token });
}

export async function deleteSubmission(id: string, token?: string) {
  return apiFetch<ApiSuccess<any>>(`/submissions/${id}`, { method: "DELETE", token });
}
