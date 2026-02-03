import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated } from "@/lib/types";

export type Submission = {
  id: string;
  internId?: string;
  internName?: string;
  internUniversity?: string;
  type: string;
  submittedAt: string;
  status: "PENDING" | "REVIEWED" | string;
};

export async function listSubmissions(params: { page?: number; limit?: number; status?: string } = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  const query = qs.toString();
  return apiFetch<ApiSuccess<Paginated<Submission>>>(`/submissions${query ? `?${query}` : ""}`, { method: "GET", token });
}
