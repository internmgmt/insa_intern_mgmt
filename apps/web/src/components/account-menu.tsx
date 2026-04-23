"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Moon, Sun, Key, User } from "lucide-react";
import Link from "next/link";

export function AccountMenu() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const name =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : undefined;
  const email = user?.email ?? "";
  const role = user?.role ?? "";
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("") ||
    email.charAt(0).toUpperCase() ||
    "?";

  const isDark =
    theme === "dark" || document.documentElement.classList.contains("dark");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="group relative h-9 px-2 rounded-full bg-background shadow-sm hover:bg-muted transition-all duration-200"
          aria-label="Account menu"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-border shadow-sm group-hover:border-primary/30 transition-colors">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs transition-colors group-hover:bg-primary/20">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:flex flex-col items-start pr-1">
              <span className="text-xs font-semibold leading-none text-foreground">
                {name || email.split("@")[0]}
              </span>
              <span className="text-[10px] text-muted-foreground/80 leading-none mt-1 uppercase tracking-tight font-medium">
                {role.toLowerCase()}
              </span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[calc(100vw-32px)] sm:w-80 space-y-2 p-3"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 rounded-md bg-muted px-3 py-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {name || email}
              </div>
              {name && (
                <div className="truncate text-xs text-muted-foreground">
                  {email}
                </div>
              )}
              {role && (
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {role}
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Appearance controls: hide for INTERN, remove palette selector */}
        {user?.role !== "INTERN" && (
          <div className="rounded-md border px-3 py-2 text-xs bg-background">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-foreground">Appearance</span>
              <div className="inline-flex items-center gap-1 rounded-full border bg-background px-1 py-0.5 text-[10px]">
                <Button
                  variant={!isDark ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 h-6 ${
                    !isDark
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground/80"
                  }`}
                >
                  <Sun className="h-3 w-3" />
                  Light
                </Button>
                <Button
                  variant={isDark ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 h-6 ${
                    isDark
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground/80"
                  }`}
                >
                  <Moon className="h-3 w-3" />
                  Dark
                </Button>
              </div>
            </div>
          </div>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings/password"
            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted rounded-md mb-1"
          >
            <Key className="h-4 w-4" />
            <span>Change Password</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => void logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
