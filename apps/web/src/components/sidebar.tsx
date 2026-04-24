"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  FileText,
  Briefcase,
  FilePlus,
  FileCheck,
  User,
  FolderOpen,
  Key,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LogoBlock } from "@/components/logo-block";
import { useAuth } from "@/components/auth-provider";
import { useState } from "react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const roleNavSections: Record<string, NavSection[]> = {
  ADMIN: [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Structure",
      items: [
        {
          title: "Universities",
          href: "/dashboard/admin/universities",
          icon: Building2,
        },
        {
          title: "Departments",
          href: "/dashboard/admin/departments",
          icon: Briefcase,
        },
      ],
    },
    {
      title: "Records",
      items: [
        { title: "Users", href: "/dashboard/admin/users", icon: Users },
        {
          title: "Applications",
          href: "/dashboard/admin/applications",
          icon: FileText,
        },
        {
          title: "Students",
          href: "/dashboard/admin/students",
          icon: GraduationCap,
        },
        { title: "Interns", href: "/dashboard/admin/interns", icon: Users },
        {
          title: "Documents",
          href: "/dashboard/admin/documents",
          icon: FolderOpen,
        },
      ],
    },
    {
      title: "Review",
      items: [
        {
          title: "Submissions",
          href: "/dashboard/admin/submissions",
          icon: FileCheck,
        },
      ],
    },
  ],
  UNIVERSITY: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard/university",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Applications",
      items: [
        {
          title: "Applications",
          href: "/dashboard/university/applications",
          icon: FilePlus,
        },
      ],
    },
    {
      title: "Academic Records",
      items: [
        {
          title: "Students",
          href: "/dashboard/university/students",
          icon: GraduationCap,
        },
        {
          title: "Documents",
          href: "/dashboard/university/documents",
          icon: FolderOpen,
        },
      ],
    },
  ],
  SUPERVISOR: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard/supervisor",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Department",
      items: [
        {
          title: "Departments",
          href: "/dashboard/supervisor/departments",
          icon: Building2,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Mentors",
          href: "/dashboard/supervisor/mentors",
          icon: Users,
        },
        {
          title: "Interns",
          href: "/dashboard/supervisor/interns",
          icon: GraduationCap,
        },
        {
          title: "Submissions",
          href: "/dashboard/supervisor/submissions",
          icon: FileCheck,
        },
      ],
    },
  ],
  MENTOR: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard/mentor",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "My Work",
      items: [
        { title: "Tasks", href: "/dashboard/mentor/tasks", icon: Briefcase },
        {
          title: "My Interns",
          href: "/dashboard/mentor/interns",
          icon: GraduationCap,
        },
        {
          title: "Submissions",
          href: "/dashboard/mentor/submissions",
          icon: FileCheck,
        },
      ],
    },
  ],
  INTERN: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard/intern",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "My Work",
      items: [
        {
          title: "Weekly Reports",
          href: "/dashboard/intern/reports",
          icon: FilePlus,
        },
        {
          title: "Assigned Tasks",
          href: "/dashboard/intern/tasks",
          icon: Briefcase,
        },
        {
          title: "History",
          href: "/dashboard/intern/submissions",
          icon: FileCheck,
        },
        { title: "My Profile", href: "/dashboard/intern/profile", icon: User },
      ],
    },
  ],
};

interface SidebarProps {
  isMobile?: boolean;
}

export function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  if (!user) return null;

  const showExpanded = isMobile || isHovered;

  const navSections: NavSection[] = user.isFirstLogin
    ? [
        {
          title: "Account",
          items: [
            {
              title: "Change Password",
              href: "/dashboard/settings/password",
              icon: Key,
            },
          ],
        },
      ]
    : roleNavSections[user.role] || [];

  return (
    <div
      className={cn(
        "group/sidebar flex flex-col h-full border-r bg-background transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-40 relative group-hover:shadow-[20px_0_40px_-15px_rgba(0,0,0,0.1)]",
        isMobile ? "w-full border-none" : "w-[76px] hover:w-[260px]",
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Header / Logo */}
      <div className="flex h-16 shrink-0 items-center px-[18px] mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <LogoBlock showText={showExpanded} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 no-scrollbar space-y-4">
        <nav className="space-y-1">
          <p
            className={cn(
              "px-3 text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70 uppercase transition-all duration-500",
              showExpanded
                ? "opacity-100 mb-1.5 translate-x-0"
                : "opacity-0 mb-0 -translate-x-4 pointer-events-none h-0",
            )}
          >
            Portal
          </p>
          <div className="space-y-3 focus-visible:outline-none">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p
                  className={cn(
                    "px-3 text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70 uppercase transition-all duration-500",
                    showExpanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4 pointer-events-none h-0",
                  )}
                >
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group/item flex items-center h-10 rounded-xl transition-all duration-200 relative",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground/80 hover:bg-muted/70 hover:text-foreground",
                        )}
                      >
                        <div className="flex w-[52px] h-full items-center justify-center shrink-0">
                          <div
                            className={cn(
                              "flex items-center justify-center rounded-lg transition-transform duration-200 group-hover/item:scale-110",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          >
                            <item.icon
                              className="h-5 w-5"
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                          </div>
                        </div>

                        <span
                          className={cn(
                            "text-[13px] font-medium tracking-tight whitespace-nowrap transition-all duration-500",
                            showExpanded
                              ? "opacity-100 translate-x-0 visible"
                              : "opacity-0 -translate-x-4 invisible pointer-events-none",
                          )}
                        >
                          {item.title}
                        </span>

                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Footer / Profile & Logout */}
      <div className="mt-auto px-3 py-4 space-y-1 border-t border-border/40">
        <div
          className={cn(
            "flex items-center h-10 rounded-xl px-2 transition-all duration-200",
            showExpanded ? "bg-muted/30" : "",
          )}
        >
          <div className="flex w-9 items-center justify-center shrink-0">
            <div className="h-7 w-7 rounded-full bg-linear-to-tr from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-[10px] border border-primary/20">
              {user.email[0].toUpperCase()}
            </div>
          </div>
          {showExpanded && (
            <div className="ml-2 flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-500">
              <span className="text-[12px] font-semibold truncate text-foreground leading-tight">
                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </span>
              <span className="text-[10px] text-muted-foreground/80 truncate leading-tight">
                {user.email}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="group/logout flex items-center h-10 w-full rounded-xl transition-all duration-200 text-muted-foreground/80 hover:bg-destructive/10 hover:text-destructive"
        >
          <div className="flex w-[52px] h-full items-center justify-center shrink-0">
            <LogOut
              className="h-[18px] w-[18px] group-hover/logout:scale-110 transition-transform"
              strokeWidth={2}
            />
          </div>
          <span
            className={cn(
              "text-[13px] font-medium transition-all duration-500",
              showExpanded
                ? "opacity-100 translate-x-0 visible"
                : "opacity-0 -translate-x-4 invisible pointer-events-none",
            )}
          >
            Log out
          </span>
        </button>
      </div>
    </div>
  );
}
