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
import { LogOut, Moon, Sun } from "lucide-react";

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
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
          aria-label="Account menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 space-y-2 p-3">
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
          <div className="rounded-md border px-3 py-2 text-xs">
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
                      : "text-muted-foreground"
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
                      : "text-muted-foreground"
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
