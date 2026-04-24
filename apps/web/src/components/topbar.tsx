"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, Bell, CheckCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Sidebar } from "./sidebar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/services/notifications";
import { toast } from "sonner";

export function Topbar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setNotificationsLoading(true);
      const res = await listNotifications({ page: 1, limit: 5 }, token);
      setNotifications(res.data.items || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void loadNotifications();
    const interval = setInterval(() => {
      void loadNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, [token, loadNotifications]);

  useEffect(() => {
    if (notificationsOpen) {
      void loadNotifications();
    }
  }, [notificationsOpen, loadNotifications]);

  const badgeCount = useMemo(() => Math.min(unreadCount, 99), [unreadCount]);

  async function handleMarkRead(id: string) {
    if (!token) return;
    try {
      await markNotificationRead(id, token);
      await loadNotifications();
      setNotificationsOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update notification");
    }
  }

  async function handleMarkAllRead() {
    if (!token || unreadCount === 0) return;
    try {
      await markAllNotificationsRead(token);
      await loadNotifications();
      setNotificationsOpen(false);
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error(error?.message || "Failed to mark notifications as read");
    }
  }

  function formatRelativeTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    const diffMinutes = Math.max(
      0,
      Math.round((Date.now() - date.getTime()) / 60000),
    );
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.round(diffMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  }

  return (
    <header className="flex h-14 lg:h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
      <div className="flex w-full items-center justify-between gap-1 sm:gap-4">
        {/* Mobile Sidebar & Breadcrumbs */}
        <div className="min-w-0 flex items-center gap-2 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden h-8 w-8 bg-background shadow-sm"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-72">
              <Sidebar isMobile />
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs */}
          <div className="min-w-0 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground/80 hover:text-foreground transition-all duration-200 shrink-0 hidden sm:inline"
            >
              Dashboard
            </Link>
            <div className="flex items-center gap-1 min-w-0">
              {segments.length > 1 && (
                <span className="text-muted-foreground/55 hidden sm:inline">
                  /
                </span>
              )}
              {segments.slice(1).map((seg, idx, arr) => {
                const href = "/" + segments.slice(0, idx + 2).join("/");
                const label = seg
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());
                const isLast = idx === arr.length - 1;

                const showOnMobile = isLast;

                return (
                  <span
                    key={href}
                    className={cn(
                      "flex items-center gap-1 min-w-0",
                      !showOnMobile && "hidden sm:flex",
                    )}
                  >
                    {idx > 0 && (
                      <span className="text-muted-foreground/55">/</span>
                    )}
                    <Link
                      href={href}
                      className={cn(
                        "truncate transition-all duration-200",
                        isLast
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground/80 hover:text-foreground",
                      )}
                    >
                      {label}
                    </Link>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <DropdownMenu
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative h-9 w-9 rounded-full bg-background shadow-sm"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {badgeCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {badgeCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[calc(100vw-2rem)] max-w-sm p-0"
            >
              <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleMarkAllRead()}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all read
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {notificationsLoading ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 opacity-30" />
                    <div className="text-sm font-medium">
                      No notifications yet
                    </div>
                    <div className="text-xs">
                      Updates and status changes will appear here.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => void handleMarkRead(notification.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted/50",
                          notification.isRead
                            ? "bg-background"
                            : "bg-primary/5 border-primary/20",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={cn(
                              "mt-1.5 h-2.5 w-2.5 rounded-full shrink-0",
                              notification.isRead
                                ? "bg-muted-foreground/30"
                                : "bg-primary",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate text-sm font-semibold">
                                {notification.title}
                              </div>
                              {!notification.isRead ? (
                                <Badge variant="secondary" className="shrink-0">
                                  New
                                </Badge>
                              ) : null}
                            </div>
                            <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {notification.body}
                            </div>
                            <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                              {formatRelativeTime(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t p-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                >
                  <Link href="/dashboard/notifications">
                    Open notifications center
                  </Link>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {user?.role !== "INTERN" && <ThemeToggle />}
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
