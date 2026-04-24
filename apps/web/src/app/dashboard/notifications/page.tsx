"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/services/notifications";
import { toast } from "sonner";
import { Bell, CheckCheck, Clock3, Loader2 } from "lucide-react";

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount]);

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const res = await listNotifications({ page: 1, limit: 50 }, token);
        if (!mounted) return;
        setNotifications(res.data.items || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load notifications");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    const interval = setInterval(() => {
      void load();
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  async function handleMarkRead(id: string) {
    if (!token) return;
    try {
      setBusyId(id);
      await markNotificationRead(id, token);
      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error: any) {
      toast.error(error?.message || "Failed to update notification");
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!token || !hasUnread) return;
    try {
      setBusyId("all");
      await markAllNotificationsRead(token);
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error(error?.message || "Failed to mark notifications as read");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Recent updates, status changes, and record activity across the dashboard."
        right={
          <Button
            variant="outline"
            onClick={() => void handleMarkAllRead()}
            disabled={!hasUnread || busyId === "all"}
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Unread
            </div>
            <div className="mt-2 text-3xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Total
            </div>
            <div className="mt-2 text-3xl font-bold">
              {notifications.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Freshness
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" /> Auto-refresh every 60s
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
              <Bell className="h-10 w-10 opacity-30" />
              <div>
                <div className="font-medium">No notifications yet</div>
                <div className="text-sm">
                  Updates, approvals, and new records will appear here.
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleMarkRead(notification.id)}
                  className={`w-full text-left transition-colors hover:bg-muted/40 ${notification.isRead ? "bg-background" : "bg-primary/5"}`}
                  disabled={busyId === notification.id}
                >
                  <div className="flex items-start gap-3 p-4">
                    <div
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.isRead ? "bg-muted-foreground/40" : "bg-primary"}`}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {notification.title}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {formatRelativeTime(notification.createdAt)}
                          </div>
                        </div>
                        {!notification.isRead ? (
                          <Badge variant="secondary">New</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
