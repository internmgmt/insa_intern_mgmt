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
    ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LogoBlock } from "@/components/logo-block";
import { useAuth } from "@/components/auth-provider";

export type NavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

export const roleNavItems: Record<string, NavItem[]> = {
    ADMIN: [
        { title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        { title: "Users", href: "/dashboard/admin/users", icon: Users },
        { title: "Universities", href: "/dashboard/admin/universities", icon: Building2 },
        { title: "Departments", href: "/dashboard/admin/departments", icon: Briefcase },
        { title: "Applications", href: "/dashboard/admin/applications", icon: FileText },
        { title: "Students", href: "/dashboard/admin/students", icon: GraduationCap },
        { title: "Interns", href: "/dashboard/admin/interns", icon: Users },
        { title: "Grades", href: "/dashboard/admin/grades", icon: ClipboardList },
        { title: "Submissions", href: "/dashboard/admin/submissions", icon: FileCheck },
        { title: "Documents", href: "/dashboard/admin/documents", icon: FolderOpen },
    ],
    UNIVERSITY: [
        { title: "Dashboard", href: "/dashboard/university", icon: LayoutDashboard },
        { title: "Applications", href: "/dashboard/university/applications", icon: FilePlus },
        { title: "Students", href: "/dashboard/university/students", icon: GraduationCap },
        { title: "Grades", href: "/dashboard/university/grades", icon: ClipboardList },
        { title: "Documents", href: "/dashboard/university/documents", icon: FolderOpen },
    ],
    SUPERVISOR: [
        { title: "Dashboard", href: "/dashboard/supervisor", icon: LayoutDashboard },
        { title: "Mentors", href: "/dashboard/supervisor/mentors", icon: Users },
        { title: "Interns", href: "/dashboard/supervisor/interns", icon: GraduationCap },
        { title: "Grades", href: "/dashboard/supervisor/grades", icon: ClipboardList },
        { title: "Submissions", href: "/dashboard/supervisor/submissions", icon: FileCheck },
    ],
    MENTOR: [
        { title: "Dashboard", href: "/dashboard/mentor", icon: LayoutDashboard },
        { title: "Tasks", href: "/dashboard/mentor/tasks", icon: Briefcase },
        { title: "My Interns", href: "/dashboard/mentor/interns", icon: GraduationCap },
        { title: "Submissions", href: "/dashboard/mentor/submissions", icon: FileCheck },
    ],
    INTERN: [
        { title: "Dashboard", href: "/dashboard/intern", icon: LayoutDashboard },
        { title: "Weekly Reports", href: "/dashboard/intern/reports", icon: FilePlus },
        { title: "Assigned Tasks", href: "/dashboard/intern/tasks", icon: Briefcase },
        { title: "History", href: "/dashboard/intern/submissions", icon: FileCheck },
        { title: "My Profile", href: "/dashboard/intern/profile", icon: User },
    ],
};

interface SidebarProps {
    isMobile?: boolean;
}

export function Sidebar({ isMobile = false }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    if (!user) return null;

    const navItems = user.isFirstLogin
        ? [{ title: "Change Password", href: "/dashboard/settings/password", icon: Key }]
        : (roleNavItems[user.role] || []);

    return (
        <div
            className={cn(
                "group/sidebar flex flex-col h-full border-r bg-background z-40 relative transition-[width] duration-200 ease-out",
                isMobile ? "w-full border-none" : "w-full"
            )}
        >
            {/* Header / Logo */}
            <div className="flex h-[64px] shrink-0 items-center px-[18px] mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <LogoBlock showText={isMobile} />
                </div>
            </div>

            {/* Navigation */}
            <div
                className={cn(
                    "flex-1 overflow-x-hidden px-3 space-y-4",
                    isMobile && "overflow-y-auto no-scrollbar"
                )}
            >
                <nav className="space-y-1">
                    <p className={cn(
                        "px-3 text-[9px] font-bold tracking-[0.2em] text-muted-foreground/40 uppercase transition-all duration-200",
                        "opacity-0 mb-0 -translate-x-3 pointer-events-none h-0",
                        "group-hover/sidebar:opacity-100 group-hover/sidebar:mb-1.5 group-hover/sidebar:translate-x-0 group-hover/sidebar:pointer-events-auto group-hover/sidebar:h-auto"
                    )}>
                        Portal
                    </p>
                    <div className="space-y-1 focus-visible:outline-none">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group/item flex items-center h-[40px] rounded-xl transition-all duration-200 relative",
                                        isActive
                                            ? "bg-primary/[0.08] text-primary"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <div className="flex w-[52px] h-full items-center justify-center shrink-0">
                                        <div className={cn(
                                            "flex items-center justify-center rounded-lg transition-transform duration-200 group-hover/item:scale-110",
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        )}>
                                            <item.icon
                                                className="h-[20px] w-[20px]"
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                        </div>
                                    </div>

                                    <span className={cn(
                                        "text-[13px] font-medium tracking-tight whitespace-nowrap transition-all duration-200",
                                        "opacity-0 -translate-x-3 invisible pointer-events-none",
                                        "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:visible group-hover/sidebar:pointer-events-auto"
                                    )}>
                                        {item.title}
                                    </span>

                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Footer / Profile & Logout (compact to avoid forcing sidebar scroll) */}
            <div className="mt-auto px-3 py-2 space-y-1 border-t border-border/40 text-xs">
                <div className={cn("flex items-center h-[32px] rounded-lg px-2 transition-all duration-200", "group-hover/sidebar:bg-muted/30")}>
                    <div className="flex w-[30px] items-center justify-center shrink-0">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-[10px] border border-primary/20">
                            {user.email[0].toUpperCase()}
                        </div>
                    </div>
                    <div className={cn("ml-2 flex flex-col min-w-0 transition-all duration-200", "opacity-0 -translate-x-3 invisible pointer-events-none", "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:visible group-hover/sidebar:pointer-events-auto") }>
                        <span className="text-[11px] font-semibold truncate text-foreground leading-tight">
                            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                        </span>
                        <span className="text-[9px] text-muted-foreground truncate leading-tight">
                            {user.email}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => logout()}
                    className="group/logout flex items-center h-[32px] w-full rounded-lg transition-all duration-200 text-muted-foreground hover:bg-destructive/10 hover:text-destructive text-[11px]"
                >
                    <div className="flex w-[30px] h-full items-center justify-center shrink-0">
                        <LogOut className="h-[16px] w-[16px] group-hover/logout:scale-110 transition-transform" strokeWidth={2} />
                    </div>
                    <span className={cn(
                        "font-medium transition-all duration-200",
                        "opacity-0 -translate-x-3 invisible pointer-events-none",
                        "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:visible group-hover/sidebar:pointer-events-auto"
                    )}>
                        Log out
                    </span>
                </button>
            </div>
        </div>
    );
}
