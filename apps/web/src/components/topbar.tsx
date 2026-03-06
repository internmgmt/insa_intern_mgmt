"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Sidebar } from "./sidebar";
import { useState } from "react";

export function Topbar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const { user } = useAuth();
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <header className="flex h-14 lg:h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
      <div className="flex w-full items-center justify-between gap-1 sm:gap-4">
        
        {/* Mobile Sidebar & Breadcrumbs */}
        <div className="min-w-0 flex items-center gap-2 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden h-8 w-8">
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
              className="text-muted-foreground hover:text-foreground transition-all duration-200 shrink-0 hidden sm:inline"
            >
              Dashboard
            </Link>
            <div className="flex items-center gap-1 min-w-0">
              {segments.length > 1 && <span className="text-muted-foreground/30 hidden sm:inline">/</span>}
              {segments.slice(1).map((seg, idx, arr) => {
                const href = "/" + segments.slice(0, idx + 2).join("/");
                const label = seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                const isLast = idx === arr.length - 1;
                
                const showOnMobile = isLast;
                
                return (
                  <span key={href} className={cn(
                    "flex items-center gap-1 min-w-0",
                    !showOnMobile && "hidden sm:flex"
                  )}>
                    {idx > 0 && <span className="text-muted-foreground/30">/</span>}
                    <Link 
                      href={href} 
                      className={cn(
                        "truncate transition-all duration-200",
                        isLast 
                          ? "font-semibold text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
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
          {user?.role !== "INTERN" && <ThemeToggle />}
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
