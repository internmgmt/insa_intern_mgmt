"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileCheck, 
  Clock, 
  TrendingUp, 
  Users, 
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { listInterns } from "@/lib/services/interns";
import { listSubmissions } from "@/lib/services/submissions";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { Loader2 } from "lucide-react";

export default function MentorDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    internCount: 0,
    pendingReviews: 0,
    activeTasks: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!token) return;
      try {
        const [summaryRes, subsRes] = await Promise.all([
          getDashboardSummary(token),
          listSubmissions({ type: 'TASK', limit: 300 }, token),
        ]);

        const summary = summaryRes.data || {};
        const allItems = (subsRes as any)?.data?.items || [];
        
        // Filter tasks created by this mentor
        const myTasks = allItems.filter((t: any) => t.assignedBy === user?.id);
        
        const completedTasks = myTasks.filter((t: any) => t.status === 'APPROVED').length;
        const totalTasks = myTasks.length;

        setStats({
          internCount: summary?.internsCount ?? 0,
          pendingReviews: summary?.pendingReviews ?? 0,
          activeTasks: myTasks.filter((t: any) => t.status === 'ASSIGNED' || t.status === 'SUBMITTED').length,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        });
      } catch (error) {
        console.error("Failed to load mentor dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [token, user]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-0.5 sm:gap-1 px-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Mentor Dashboard</h1>
        <p className="text-muted-foreground text-[11px] sm:text-sm">Real-time performance metrics and task management overview.</p>
      </div>

      {/* KPI Cards - Data Viz Focus */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { title: "Personnel", label: "Managed Interns", value: stats.internCount, icon: Users, color: "text-[#5ba1a2]", bg: "bg-[#5ba1a2]/10" },
          { title: "Reviews", label: "Pending", value: stats.pendingReviews, icon: Clock, color: "text-[#b28b71]", bg: "bg-[#b28b71]/10" },
          { title: "Operations", label: "Active Tasks", value: stats.activeTasks, icon: FileCheck, color: "text-[#8bac99]", bg: "bg-[#8bac99]/10" },
          { title: "Performance", label: "Rate", value: `${stats.completionRate}%`, icon: TrendingUp, color: "text-[#b28b71]", bg: "bg-[#b28b71]/10" },
        ].map((kpi, i) => (
          <Card key={i} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-6 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-muted-foreground truncate">{kpi.title}</p>
                <h3 className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1 truncate">{kpi.value}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">{kpi.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 truncate sm:hidden">{kpi.label.split(' ')[0]}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 ${kpi.bg} ${kpi.color} ml-2`}>
                <kpi.icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm border-primary/10">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Team Progress</CardTitle>
            <CardDescription className="text-[11px] sm:text-xs uppercase tracking-tight">Consolidated performance of supervised interns</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[300px] flex items-center justify-center border-t bg-muted/[0.02]">
            <div className="text-center space-y-3 p-4">
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/20 mx-auto" />
              <p className="text-[11px] sm:text-sm font-medium text-muted-foreground italic">Performance data is aggregated weekly.</p>
              <Button variant="outline" size="sm" className="h-7 sm:h-9 text-[9px] sm:text-[10px] uppercase font-black px-3" asChild>
                <a href="/dashboard/mentor/tasks">Manage Tasks</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm border-indigo-500/10">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
             <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/30 border border-dashed text-foreground/80">
                <div className="flex items-center gap-2 sm:gap-3">
                   <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-[#5ba1a2]/10 flex items-center justify-center text-[#5ba1a2]">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                   </div>
                   <p className="text-[11px] sm:text-sm font-bold truncate">Current Pool</p>
                </div>
                <p className="text-base sm:text-lg font-mono font-bold text-[#5ba1a2]">{stats.internCount}</p>
             </div>
             <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/30 border border-dashed text-foreground/80">
                <div className="flex items-center gap-2 sm:gap-3">
                   <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                   </div>
                   <p className="text-[11px] sm:text-sm font-bold truncate">Backlog</p>
                </div>
                <p className="text-base sm:text-lg font-mono font-bold text-amber-500">{stats.pendingReviews}</p>
             </div>
             <div className="pt-3 sm:pt-4 border-t border-border/60">
               <p className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-3 sm:mb-4">Unit Integrity</p>
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                    <span className="font-bold">Protocol Adherence</span>
                    <span className="font-mono">{stats.completionRate}%</span>
                 </div>
                 <div className="h-1.5 sm:h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#8bac99] transition-all duration-1000" 
                      style={{ width: `${stats.completionRate}%` }} 
                    />
                 </div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
