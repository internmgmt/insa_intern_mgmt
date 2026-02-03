"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  Upload
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listApplications, ApplicationListItem } from "@/lib/services/applications";
import { listStudents } from "@/lib/services/students";
import { toast } from "sonner";

export default function UniversityDashboardPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    totalStudents: 0,
    acceptedStudents: 0,
    awaitingArrival: 0,
    arrived: 42, // Keeping one mock if no logic for it yet, but will try to map
  });

  const [recentApplications, setRecentApplications] = useState<ApplicationListItem[]>([]);

  useEffect(() => {
    if (!token || user?.role !== "UNIVERSITY") return;
    fetchDashboardData();
  }, [token, user?.role, user?.university?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const universityId = user?.university?.id || (user as any)?.universityId;
      if (!universityId) {
        setLoading(false);
        return;
      }
      // Fetch applications
      const appRes = await listApplications({ limit: 5, universityId }, token || undefined);
      const apps = (appRes as any)?.data?.items ?? [];
      setRecentApplications(apps);

      // Fetch all applications to calculate stats (realistically should be a backend summary endpoint)
      const allAppRes = await listApplications({ limit: 100, universityId }, token || undefined);
      const allApps = (allAppRes as any)?.data?.items ?? [];

      // For UNIVERSITY role we do not have access to the admin `/students` endpoint.
      // Derive student counts from application `studentCount` where available instead.
      let totalStudents = 0;
      let acceptedStudents = 0;
      let awaitingArrival = 0;
      let arrivedCount = 0;

      // University: sum `studentCount` across applications as a best-effort approximation
      totalStudents = allApps.reduce((acc: number, a: any) => acc + (a.studentCount || 0), 0);
      // We don't have per-student statuses here; use application statuses as approximation
      acceptedStudents = allApps.reduce((acc: number, a: any) => acc + ((a.status === 'APPROVED') ? (a.studentCount || 0) : 0), 0);
      awaitingArrival = allApps.reduce((acc: number, a: any) => acc + ((a.status === 'APPROVED') ? (a.studentCount || 0) : 0), 0);
      arrivedCount = 0; // This info is not available from applications data

      setStats({
        totalApplications: allApps.length,
        pendingReview: allApps.filter((a: any) => a.status === "UNDER_REVIEW").length,
        approved: allApps.filter((a: any) => a.status === "APPROVED").length,
        rejected: allApps.filter((a: any) => a.status === "REJECTED").length,
        totalStudents,
        acceptedStudents,
        awaitingArrival,
        arrived: arrivedCount,
      });
    } catch (error: any) {
      // Gracefully handle permission errors without spamming the console
      const status = error?.status ?? error?.code;
      const msg = error?.message ?? "Failed to load dashboard data";
      if (status === 403 || /permission/i.test(String(msg))) {
        toast.error(msg || "Insufficient permissions");
      } else {
        toast.error("Failed to load dashboard data");
        if (process.env.NODE_ENV === "development") console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "warning" as const, icon: Clock, label: "Pending" },
      UNDER_REVIEW: { variant: "secondary" as const, icon: AlertCircle, label: "Under Review" },
      APPROVED: { variant: "success" as const, icon: CheckCircle, label: "Approved" },
      REJECTED: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1.5">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="University Dashboard"
      />

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/university/applications?new=true" className="group">
          <Card className="transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Quick Action</div>
                  <div className="text-lg font-bold">New Application</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/university/students" className="group">
          <Card className="transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-secondary/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 group-hover:from-secondary/30 group-hover:to-secondary/20 transition-colors">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Manage</div>
                  <div className="text-lg font-bold">Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/university/documents" className="group">
          <Card className="transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-success/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-success/20 to-success/10 group-hover:from-success/30 group-hover:to-success/20 transition-colors">
                  <Upload className="h-6 w-6 text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Upload</div>
                  <div className="text-lg font-bold">Documents</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/university/applications" className="group">
          <Card className="transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-warning/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-warning/20 to-warning/10 group-hover:from-warning/30 group-hover:to-warning/20 transition-colors">
                  <FileText className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">View</div>
                  <div className="text-lg font-bold">Applications</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Statistics Overview */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Overview & Statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalApplications}</p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                  <p className="text-3xl font-bold mt-2">{stats.pendingReview}</p>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting admin</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold mt-2">{stats.approved}</p>
                  <p className="text-xs text-success mt-1">+2 this month</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.acceptedStudents} accepted</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Status Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted Students</p>
                <p className="text-2xl font-bold mt-2">{stats.acceptedStudents}</p>
              </div>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-success/10 text-success">
                  <CheckCircle className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${(stats.acceptedStudents / stats.totalStudents) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Awaiting Arrival</p>
                <p className="text-2xl font-bold mt-2">{stats.awaitingArrival}</p>
              </div>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-warning/10 text-warning">
                  <Clock className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all"
                style={{ width: `${(stats.awaitingArrival / stats.acceptedStudents) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Arrived at INSA</p>
                <p className="text-2xl font-bold mt-2">{stats.arrived}</p>
              </div>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(stats.arrived / stats.acceptedStudents) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Applications
              </CardTitle>
              <CardDescription>Track your latest internship application submissions</CardDescription>
            </div>
            <Link href="/dashboard/university/applications">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <Card key={app.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">{(app as any).name || app.id}</p>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {app.academicYear}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {app.studentCount} students
                          </span>
                          <span>Created {formatDate(app.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/university/applications?view=${app.id}`}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>University Workflow</CardTitle>
          <CardDescription>Key steps to submit and manage applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/university/applications?new=true" className="group">
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Create Application</div>
                    <div className="text-xs text-muted-foreground">Start a new application batch</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/university/students" className="group">
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-secondary/10 group-hover:bg-secondary/20">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Add Students</div>
                    <div className="text-xs text-muted-foreground">Add or edit student entries</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/university/documents" className="group">
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-success/10 group-hover:bg-success/20">
                    <Upload className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Upload Documents</div>
                    <div className="text-xs text-muted-foreground">Attach official letters and credentials</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/university/applications" className="group">
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-warning/10 group-hover:bg-warning/20">
                    <ArrowRight className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Submit for Review</div>
                    <div className="text-xs text-muted-foreground">Send application to INSA for review</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
