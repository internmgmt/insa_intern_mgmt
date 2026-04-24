import { apiFetch } from "@/lib/api";
import type { ApiSuccess, Paginated, Pagination } from "@/lib/types";

export type NotificationItem = {
  id: string;
  recipientUserId: string;
  type: string;
  title: string;
  body: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type NotificationListResponse = ApiSuccess<{
  items: NotificationItem[];
  unreadCount: number;
  pagination: Pagination;
}>;

export async function listNotifications(
  params: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  token?: string,
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (typeof params.unreadOnly === "boolean") {
    qs.set("unreadOnly", String(params.unreadOnly));
  }
  const query = qs.toString();
  return apiFetch<NotificationListResponse>(
    `/notifications${query ? `?${query}` : ""}`,
    { method: "GET", token },
  );
}

export async function markNotificationRead(id: string, token?: string) {
  return apiFetch<ApiSuccess<NotificationItem | null>>(
    `/notifications/${id}/read`,
    {
      method: "PATCH",
      token,
    },
  );
}

export async function markAllNotificationsRead(token?: string) {
  return apiFetch<ApiSuccess<null>>(`/notifications/read-all`, {
    method: "PATCH",
    token,
  });
}
