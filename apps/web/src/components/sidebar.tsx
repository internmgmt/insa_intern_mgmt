"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LogoBlock } from "@/components/logo-block";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type NavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

const roleNavItems: Record<string, NavItem[]> = {
    ADMIN: [
        { title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        { title: "Users", href: "/dashboard/admin/users", icon: Users },
        { title: "Universities", href: "/dashboard/admin/universities", icon: Building2 },
        { title: "Departments", href: "/dashboard/admin/departments", icon: Briefcase },
        { title: "Applications", href: "/dashboard/admin/applications", icon: FileText },
        { title: "Students", href: "/dashboard/admin/students", icon: GraduationCap },
        { title: "Interns", href: "/dashboard/admin/interns", icon: Users },
        { title: "Submissions", href: "/dashboard/admin/submissions", icon: FileCheck },
        { title: "Documents", href: "/dashboard/admin/documents", icon: FolderOpen },
    ],
    UNIVERSITY: [
        { title: "Dashboard", href: "/dashboard/university", icon: LayoutDashboard },
        { title: "Applications", href: "/dashboard/university/applications", icon: FilePlus },
        { title: "Students", href: "/dashboard/university/students", icon: GraduationCap },
        { title: "Documents", href: "/dashboard/university/documents", icon: FolderOpen },
    ],
    SUPERVISOR: [
        { title: "Dashboard", href: "/dashboard/supervisor", icon: LayoutDashboard },
        { title: "Departments", href: "/dashboard/supervisor/departments", icon: Briefcase },
        { title: "Interns", href: "/dashboard/supervisor/interns", icon: Users },
        { title: "Submissions", href: "/dashboard/supervisor/submissions", icon: FileCheck },
    ],
    INTERN: [
        { title: "Dashboard", href: "/dashboard/intern", icon: LayoutDashboard },
        { title: "My Profile", href: "/dashboard/intern/profile", icon: User },
        { title: "Submissions", href: "/dashboard/intern/submissions", icon: FileText },
    ],
};

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    if (!user) return null;

    const navItems = roleNavItems[user.role] || [];

    return (
    	    <div className="fixed left-0 top-0 h-screen hidden md:flex flex-col sidebar-rail border-r border-border w-72 shrink-0 elevation-2 z-40">
            {/* Logo */}
            <div className="px-5 py-4 border-b border-border">
                <LogoBlock />
            </div>
            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                            <Button
                                key={item.href}
                                asChild
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
    	                            "w-full justify-start gap-3 px-3 h-10 text-sm transition-all duration-200",
    	                            isActive
    	                                ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
    	                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:translate-x-1"
    	                        )}
                            >
                            <Link href={item.href}>
                                <item.icon className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isActive && "scale-110"
                                )} />
                                <span>{item.title}</span>
                            </Link>
                        </Button>
                    );
                })}
            </nav>
            {/* User Info & Help */}
            <div className="px-4 py-3 border-t border-border">
                <Separator className="mb-3" />
                <div className="text-[11px] text-muted-foreground">Signed in as</div>
                <div className="mt-1 text-xs font-medium truncate">{user.email}</div>
                <div className="mt-2 text-[11px] text-muted-foreground">Need help? Contact the administrator.</div>
            </div>
        </div>
    );
}
