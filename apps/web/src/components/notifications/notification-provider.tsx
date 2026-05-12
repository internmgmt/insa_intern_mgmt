"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  entity?: {
    type: "application" | "intern" | "student" | "document" | "grade";
    id: string;
  };
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, token } = useAuth();

  // Mock real-time notifications - in production this would connect to WebSocket or API
  useEffect(() => {
    if (!user || !token) return;

    // Simulate receiving notifications
    const interval = setInterval(() => {
      // Mock notification generation for demo
      if (Math.random() > 0.95) { // 5% chance every 10 seconds
        const mockNotifications: Omit<Notification, "id" | "timestamp" | "read">[] = [
          {
            title: "New Application Received",
            message: "A new internship application from Addis Ababa University needs review",
            type: "info",
            action: {
              label: "Review Application",
              url: "/dashboard/admin/applications"
            },
            entity: {
              type: "application",
              id: "mock-app-id"
            }
          },
          {
            title: "Weekly Report Submitted",
            message: "John Doe has submitted their weekly report for Week 3",
            type: "success",
            action: {
              label: "View Report",
              url: "/dashboard/mentor/submissions"
            },
            entity: {
              type: "grade",
              id: "mock-grade-id"
            }
          },
          {
            title: "Document Upload Required",
            message: "Missing internship agreement document for Jane Smith",
            type: "warning",
            action: {
              label: "Upload Document",
              url: "/dashboard/admin/documents"
            },
            entity: {
              type: "document",
              id: "mock-doc-id"
            }
          },
          {
            title: "System Maintenance",
            message: "Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM",
            type: "error",
            entity: {
              type: "intern",
              id: "system-maintenance"
            }
          }
        ];

        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        addNotification(randomNotification);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user, token]);

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Also show as toast for immediate visibility
    toast[notification.type](notification.message, {
      description: notification.title,
      action: notification.action ? (
        <button
          onClick={() => {
            window.location.href = notification.action!.url;
          }}
          className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
        >
          {notification.action.label}
        </button>
      ) : undefined,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
