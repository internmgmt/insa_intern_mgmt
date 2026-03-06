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
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Executive Overview" description="Strategic institutional intelligence and performance metrics" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { title: "Network", label: "Universities", value: counts.universities, icon: School, color: "text-[#5ba1a2]", bg: "bg-[#5ba1a2]/10" },
          { title: "Intake", label: "Students", value: counts.students, icon: GraduationCap, color: "text-[#b28b71]", bg: "bg-[#b28b71]/10" },
          { title: "Operations", label: "Active Interns", value: counts.interns, icon: Users, color: "text-[#8bac99]", bg: "bg-[#8bac99]/10" },
          { title: "Flow", label: "Applications", value: counts.applications, icon: FileText, color: "text-[#b28b71]", bg: "bg-[#b28b71]/10" },
        ].map((kpi, i) => (
          <Card key={i} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{kpi.title}</p>
                  <h3 className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{kpi.value.toLocaleString()}</h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
                <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Reporting Pulse - Replacing Intake Velocity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 px-4 sm:px-6 pt-3 sm:pt-4">
            <div>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Monthly volume of intern submissions & reporting</CardDescription>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              LIVE
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="h-[300px] w-full mt-2 sm:mt-4">
              <AreaTrendChart
                data={submissionsTrend.map((t: any) => ({ label: t.month, value: Number(t.count) }))}
                height={300}
                color="hsl(181, 36%, 52%)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Placement Velocity */}
        <Card className="lg:col-span-1">
          <CardHeader className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2">
            <CardTitle>Placement Intensity</CardTitle>
            <CardDescription>Conversion of candidates to active roles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6 sm:pb-8 pt-2 sm:pt-4 px-4 sm:px-6">
            <ProgressRing
              value={metrics.placementRate}
              label="Placement Rate"
              size={150}
              stroke={14}
              color="hsl(181, 36%, 52%)"
            />
            <div className="mt-6 sm:mt-8 w-full grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Students</p>
                <p className="text-lg sm:text-xl font-bold mt-0.5 sm:mt-1">{counts.students}</p>
              </div>
              <div className="text-center p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-[10px] uppercase font-bold text-emerald-600">Active</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5 sm:mt-1">{counts.interns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Universities - Now a Pie Chart */}
        <Card>
          <CardHeader className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2">
            <CardTitle>Partner Distribution</CardTitle>
            <CardDescription>Top universities by application volume</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="min-h-[200px] w-full flex items-center justify-center py-4">
              <DonutChart
                size={150}
                thickness={20}
                centerLabels={{ label: "Universities", value: counts.universities.toString() }}
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
          <CardHeader className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2">
            <CardTitle>Talent Pool</CardTitle>
            <CardDescription>Top academic fields in current batch</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="min-h-[200px] w-full flex items-center justify-center py-4">
              <DonutChart
                size={150}
                thickness={20}
                centerLabels={{ label: "Fields", value: distributions.fields.length.toString() }}
                data={distributions.fields.map((f: any) => ({
                  label: f.field || "General",
                  value: Number(f.count)
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-2">
        {/* Department Saturation */}
        <Card>
          <CardHeader className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2">
            <CardTitle>Department Deployment</CardTitle>
            <CardDescription>Allocation across organizational departments</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="min-h-[200px] w-full flex items-center justify-center py-4">
              <DonutChart
                size={150}
                thickness={20}
                centerLabels={{ label: "Interns", value: counts.interns.toString() }}
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
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-3 sm:pt-4">
            <div>
              <CardTitle>Processing Pipeline</CardTitle>
              <CardDescription>Current status of all application batches</CardDescription>
            </div>
            <Link href="/dashboard/admin/applications">
              <Button variant="ghost" size="sm" className="h-8 text-primary font-bold">Manage All</Button>
            </Link>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="min-h-[200px] w-full flex items-center justify-center py-4">
              <DonutChart
                size={150}
                thickness={20}
                centerLabels={{ label: "Batches", value: counts.applications.toString() }}
                data={distributions.applications.map((app: any) => {
                  const statusColors: any = {
                    PENDING: "hsl(22, 34%, 57%)",     // Mineral Copper
                    UNDER_REVIEW: "hsl(181, 36%, 52%)", // Mineral Teal
                    APPROVED: "hsl(158, 29%, 61%)",    // Mineral Success
                    REJECTED: "hsl(0, 31%, 57%)",      // Mineral Destructive/Rose
                  };
                  return {
                    label: app.status.replace('_', ' '),
                    value: Number(app.count),
                    color: statusColors[app.status] || "#64748b"
                  };
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
