"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export function Topbar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const { user } = useAuth();

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* Breadcrumbs */}
      <div className="min-w-0 flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
        {segments.slice(1).map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 2).join("/");
          const label = seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          return (
            <span key={href} className="flex items-center gap-2">
              <Separator orientation="vertical" className="h-4" />
              <Link href={href} className="truncate text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
            </span>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search…" className="pl-8 w-64" />
        </div>
        {user?.role !== "INTERN" && <ThemeToggle />}
        <AccountMenu />
      </div>
    </div>
  );
}
