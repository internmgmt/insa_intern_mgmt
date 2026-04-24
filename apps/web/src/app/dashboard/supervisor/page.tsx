"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/auth-provider";
import {
  Building2,
  Users,
  FileCheck,
  Clock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "@/lib/services/dashboard";

export default function SupervisorDashboardPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!token) return;
      try {
        const res = await getDashboardSummary(token);
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error("Failed to load supervisor stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const browseCards = [
    {
      title: "Department",
      description:
        "Open your assigned department and use it as the root of all browsing.",
      href: "/dashboard/supervisor/departments",
      stat: user?.department?.name || "Assigned department",
    },
    {
      title: "Interns",
      description:
        "Drill into the department roster and inspect active internship records.",
      href: "/dashboard/supervisor/interns",
      stat: `${stats?.internsCount || 0} records`,
    },
    {
      title: "Submissions",
      description:
        "Review pending and reviewed submissions inside the same department scope.",
      href: "/dashboard/supervisor/submissions",
      stat: `${stats?.pendingSubmissions || 0} pending`,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={`Welcome, ${user?.firstName || "Supervisor"}`}
        description={`Department-first dashboard • ${user?.department?.name || "Department"}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Department
            </CardTitle>
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-sm sm:text-xl font-bold truncate leading-none sm:leading-normal">
              {user?.department?.name || "N/A"}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              {user?.department?.type || "General"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Interns
            </CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8bac99]" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold leading-none sm:leading-normal">
              {stats?.internsCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              {stats?.activeInternsCount || 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/20 bg-amber-500/2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600/80">
              Pending
            </CardTitle>
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold leading-none sm:leading-normal text-amber-700/90">
              {stats?.pendingSubmissions || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mentors
            </CardTitle>
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#5ba1a2]" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold leading-none sm:leading-normal">
              {stats?.mentorsCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              Staff assigned
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/15 bg-primary/2">
        <CardHeader className="pb-3">
          <CardTitle>Browse within your department</CardTitle>
          <CardDescription>
            Start from the department hub, then move into interns or submissions
            only after the parent context is clear.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          {browseCards.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Context entry
                  </p>
                  <h3 className="mt-1 text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {item.stat}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/10 border-dashed p-4 sm:p-8 text-center px-4 sm:px-12 transition-all">
        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Department Head Controls
        </h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          Use the navigation menu to manage operations within the{" "}
          <strong className="text-foreground">{user?.department?.name}</strong>{" "}
          department.
        </p>
      </div>
    </div>
  );
}
