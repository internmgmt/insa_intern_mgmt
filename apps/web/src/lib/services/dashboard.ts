import { apiFetch } from "@/lib/api";
import type { ApiSuccess } from "@/lib/types";

export type AdminDashboardResponse = ApiSuccess<{
  counts: { users: number; universities: number; applications: number; students: number; interns: number; submissions: number };
  distributions: {
    applications: { status: string; count: string }[];
    students: { status: string; count: string }[];
    submissions: { status: string; count: string }[];
  };
  internsByDept: { departmentId: string | null; count: string }[];
  submissionsTrend: { day: string; count: string }[];
}>;

export async function getAdminDashboard(token?: string) {
  return apiFetch<AdminDashboardResponse>("/dashboard/admin", { method: "GET", token });
}
