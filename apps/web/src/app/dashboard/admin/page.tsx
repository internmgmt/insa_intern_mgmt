"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { DonutChart, BarChart, LineChart } from "@/components/ui/charts";
import { getAdminDashboard } from "@/lib/services/dashboard";

type Counts = Record<string, number>;

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [counts, setCounts] = useState<Counts>({ users: 0, universities: 0, applications: 0, students: 0, interns: 0, documents: 0, submissions: 0 });
  const [applications, setApplications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) return;

      try {
        const dashboard = await getAdminDashboard(token || undefined);

        if (cancelled) return;

        const d = dashboard.data;
        setCounts(d.counts);
        // Build synthetic arrays for charts based on distributions
        setApplications(
          d.distributions.applications.map((x) => ({ status: x.status, count: Number(x.count) }))
        );
        setStudents(
          d.distributions.students.map((x) => ({ status: x.status, count: Number(x.count) }))
        );
        setSubmissions(
          d.distributions.submissions.map((x) => ({ status: x.status, count: Number(x.count), createdAt: null }))
        );
        setInterns(
          d.internsByDept.map((x) => ({ department: x.departmentId ?? 'Unknown', count: Number(x.count) }))
        );
      } catch (err) {
        // Non-blocking: dashboard falls back to zeros/empty lists
        console.error("Failed to load admin dashboard data", err);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Visual overview of system activity" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.users}</div>
            <div className="text-xs text-muted-foreground mt-1">Total registered users</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Universities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.universities}</div>
            <div className="text-xs text-muted-foreground mt-1">Active partner universities</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.applications}</div>
            <div className="text-xs text-muted-foreground mt-1">Submitted application batches</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.students}</div>
            <div className="text-xs text-muted-foreground mt-1">Students in intake / review</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Applications Status</CardTitle>
              <Link href="/dashboard/admin/applications">
                <Button variant="ghost" size="sm">View <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const dist: Record<string, number> = {};
              applications.forEach((a) => { const st = a.status; dist[st] = (dist[st] || 0) + (a.count ?? 1); });
              const data = [
                { label: "Pending", value: dist.PENDING ?? 0 },
                { label: "Under Review", value: dist.UNDER_REVIEW ?? 0 },
                { label: "Approved", value: dist.APPROVED ?? 0 },
                { label: "Rejected", value: dist.REJECTED ?? 0 },
              ];
              return <DonutChart data={data} />;
            })()}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Students Status Distribution</CardTitle>
                <Link href="/dashboard/admin/students">
                  <Button variant="ghost" size="sm">Manage <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const dist: Record<string, number> = {};
                students.forEach((s) => { const st = s.status; dist[st] = (dist[st] || 0) + (s.count ?? 1); });
                const data = Object.entries(dist).map(([label, value]) => ({ label, value }));
                return data.length ? <BarChart data={data} /> : <div className="text-sm text-muted-foreground">No student data</div>;
              })()}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Interns by Department</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dist: Record<string, number> = {};
                  interns.forEach((i) => { const d = typeof i.department === 'string' ? i.department : (i.department?.name ?? 'Unknown'); dist[d] = (dist[d] || 0) + (i.count ?? 1); });
                  const data = Object.entries(dist).map(([label, value]) => ({ label, value }));
                  return data.length ? <BarChart data={data} /> : <div className="text-sm text-muted-foreground">No intern data</div>;
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submissions Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const byDay: Record<string, number> = {};
                  submissions.forEach((s) => {
                    const d = (s.createdAt || '').slice(0, 10);
                    if (!d) return;
                    byDay[d] = (byDay[d] || 0) + 1;
                  });
                  const days = Object.keys(byDay).sort();
                  const points = days.map((d) => byDay[d]);
                  return points.length ? <LineChart points={points} /> : <div className="text-sm text-muted-foreground">No submission data</div>;
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Submissions Status</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dist: Record<string, number> = {};
              submissions.forEach((s) => { const st = s.status; dist[st] = (dist[st] || 0) + (s.count ?? 1); });
              const data = Object.entries(dist).map(([label, value]) => ({ label, value }));
              return data.length ? <DonutChart data={data} /> : <div className="text-sm text-muted-foreground">No submission data</div>;
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications vs Students</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[
                { label: "Applications", value: counts.applications },
                { label: "Students", value: counts.students },
                { label: "Interns", value: counts.interns },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Link href="/dashboard/admin/users"><Button size="sm">Create User</Button></Link>
              <Link href="/dashboard/admin/universities"><Button variant="outline" size="sm">Add University</Button></Link>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Use the full admin pages for management actions.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
