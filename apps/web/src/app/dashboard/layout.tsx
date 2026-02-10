"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, roleHome, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-40 h-14 header-glass border-b border-border flex items-center px-6 shrink-0 elevation-1">
          <Topbar />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
