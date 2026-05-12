"use client";

import { useState } from "react";
import { useNotifications } from "./notification-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Check,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const notificationColors = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
};

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    markAsRead(id);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
    setIsOpen(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto p-1 text-xs"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-auto p-1 text-xs text-destructive hover:text-destructive"
              >
                <X className="h-3 w-3" />
                Clear all
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "p-3 cursor-pointer flex-col items-start gap-2",
                    !notification.read && "bg-muted/50"
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <Icon
                        className={cn(
                          "h-4 w-4 mt-0.5 flex-shrink-0",
                          notificationColors[notification.type]
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </span>
                          {notification.action && (
                            <Link href={notification.action.url}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {notification.action.label}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="h-auto p-1 text-xs"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleRemove(notification.id, e)}
                        className="h-auto p-1 text-xs text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center justify-center cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Button variant="ghost" size="sm" className="w-full">
                Close notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
