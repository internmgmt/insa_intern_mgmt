"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/auth-provider";
import { Building2, Users, FileCheck, Clock, ShieldCheck, Loader2 } from "lucide-react";
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={`Welcome, ${user?.firstName || "Supervisor"}`}
        description={`Department Head Dashboard • ${user?.department?.name || "Department"}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</CardTitle>
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-sm sm:text-xl font-bold truncate leading-none sm:leading-normal">{user?.department?.name || "N/A"}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{user?.department?.type || "General"}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Interns</CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8bac99]" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold leading-none sm:leading-normal">{stats?.internsCount || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{stats?.activeInternsCount || 0} active</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/20 bg-amber-500/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600/80">Pending</CardTitle>
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold leading-none sm:leading-normal text-amber-700/90">{stats?.pendingSubmissions || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Mentors</CardTitle>
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#5ba1a2]" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold leading-none sm:leading-normal">{stats?.mentorsCount || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Staff assigned</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-muted/10 border-dashed p-4 sm:p-8 text-center px-4 sm:px-12 transition-all">
        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Department Head Controls
        </h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          Use the navigation menu to manage operations within the <strong className="text-foreground">{user?.department?.name}</strong> department.
        </p>
      </div>
    </div>
  );
}