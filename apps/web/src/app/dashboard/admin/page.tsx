"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, School, FileText, GraduationCap, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { ProgressRing, AreaTrendChart, ModernBarChart, DonutChart } from "@/components/ui/charts";
import { getAdminDashboard } from "@/lib/services/dashboard";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await getAdminDashboard(token);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const {
    counts = { universities: 0, students: 0, interns: 0, applications: 0 },
    distributions = { applications: [], students: [], submissions: [], fields: [] },
    internsByDept = [],
    topUniversities = [],
    applicationsTrend = [],
    submissionsTrend = [],
    metrics = { placementRate: 0 }
  } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader title="Executive Overview" description="Strategic institutional intelligence and performance metrics" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Network", label: "Universities", value: counts.universities, icon: School, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Intake", label: "Students", value: counts.students, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Operations", label: "Active Interns", value: counts.interns, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Flow", label: "Applications", value: counts.applications, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((kpi, i) => (
          <Card key={i} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{kpi.title}</p>
                  <h3 className="text-3xl font-bold mt-1">{kpi.value.toLocaleString()}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
                <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reporting Pulse - Replacing Intake Velocity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Monthly volume of intern submissions & reporting</CardDescription>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              LIVE
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <AreaTrendChart
                data={submissionsTrend.map((t: any) => ({ label: t.month, value: Number(t.count) }))}
                height={300}
              />
            </div>
          </CardContent>
        </Card>

        {/* Placement Velocity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Placement Intensity</CardTitle>
            <CardDescription>Conversion of candidates to active roles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-8 pt-4">
            <ProgressRing
              value={metrics.placementRate}
              label="Placement Rate"
              size={180}
              stroke={14}
            />
            <div className="mt-8 w-full grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Students</p>
                <p className="text-xl font-bold mt-1">{counts.students}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-[10px] uppercase font-bold text-emerald-600">Active</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">{counts.interns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Universities - Now a Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Partner Distribution</CardTitle>
            <CardDescription>Top universities by application volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full flex items-center justify-center">
              <DonutChart
                size={180}
                thickness={22}
                data={topUniversities.map((u: any) => ({
                  label: u.name || "University",
                  value: Number(u.count)
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Field of Study Saturation */}
        <Card>
          <CardHeader>
            <CardTitle>Talent Pool</CardTitle>
            <CardDescription>Top academic fields in current batch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full pt-2 overflow-y-auto custom-scrollbar pr-2">
              <ModernBarChart
                data={distributions.fields.map((f: any) => ({
                  label: f.field || "General",
                  value: Number(f.count)
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Saturation */}
        <Card>
          <CardHeader>
            <CardTitle>Department Deployment</CardTitle>
            <CardDescription>Allocation across organizational departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full flex items-center justify-center">
              <DonutChart
                size={180}
                thickness={22}
                data={internsByDept.slice(0, 5).map((d: any) => ({
                  label: d.departmentName || "General",
                  value: Number(d.count)
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Application Pipeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Processing Pipeline</CardTitle>
              <CardDescription>Current status of all application batches</CardDescription>
            </div>
            <Link href="/dashboard/admin/applications">
              <Button variant="ghost" size="sm" className="h-8 text-primary font-bold">Manage All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {distributions.applications.map((app: any) => {
                const total = counts.applications || 1;
                const percentage = (Number(app.count) / total) * 100;
                const statusTheme: any = {
                  PENDING: { color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-200" },
                  UNDER_REVIEW: { color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-200" },
                  APPROVED: { color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-200" },
                  REJECTED: { color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-200" },
                };
                const theme = statusTheme[app.status] || { color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" };
                
                return (
                  <div key={app.status} className={`p-4 rounded-2xl border ${theme.bg} ${theme.border} space-y-2`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.color}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                      <span className="text-xl font-black">{app.count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-black/5 rounded-full overflow-hidden">
                        <div className={`h-full ${theme.color.replace('text', 'bg')}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-[10px] font-mono font-bold opacity-60">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
