"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, roleHome } = useAuth();


  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    // Force password change on first login
    if (user.isFirstLogin && pathname !== "/dashboard/settings/password") {
      router.replace("/dashboard/settings/password");
      return;
    }

    const expectedHome = roleHome(user.role);
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      router.replace(expectedHome);
      return;
    }

    // Allow common dashboard paths like settings
    if (pathname.startsWith("/dashboard/settings")) {
      return;
    }

    if (!pathname.startsWith(expectedHome)) {
      router.replace(expectedHome);
    }
  }, [isLoading, user, pathname, router, roleHome]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar - Fixed Position */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden md:flex flex-col bg-background border-r peer/sidebar group transition-[width] duration-200 ease-out",
          "w-[76px] hover:w-[260px]"
        )}
      >
        <Sidebar />
      </aside>

      {/* Wrap the entire main column with NotificationProvider so Topbar (which
          contains NotificationDropdown) has access to the context */}
      <NotificationProvider>
        <div
          className="flex flex-col min-h-screen w-full transition-[margin] duration-200 ease-out md:ml-[76px] peer-hover/sidebar:md:ml-[260px]"
        >
          <Topbar />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 lg:p-10 overflow-x-hidden">
            <div className="mx-auto w-full max-w-6xl animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </NotificationProvider>
    </div>
  );
}
