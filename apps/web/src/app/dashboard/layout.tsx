"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
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
          "fixed inset-y-0 left-0 z-30 hidden md:flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] peer/sidebar",
          "w-[76px] hover:w-[260px]"
        )}
      >
        <Sidebar />
      </aside>

      {/* Main Content - Pushed by sidebar hover */}
      <div
        className="flex flex-col min-h-screen w-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] md:ml-[76px] peer-hover/sidebar:md:ml-[260px]"
      >
        <Topbar />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 lg:p-10 overflow-x-hidden">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
