"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  ArrowLeft,
  Briefcase,
  Users,
  Calendar,
  FileText,
} from "lucide-react";
import {
  getDepartmentDetail,
  getDepartmentInterns,
  getDepartmentSupervisors,
} from "@/lib/services/departments";

type DepartmentDetail = {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  supervisors?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
}

function unwrapItems<T>(response: any): T[] {
  return response?.data?.items ?? response?.data ?? [];
}

export default function AdminDepartmentDetailPage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();

  const [department, setDepartment] = useState<DepartmentDetail | null>(null);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token || !params?.id) return;

      setLoading(true);
      setError(null);

      try {
        const [departmentRes, supervisorsRes, internsRes] = await Promise.all([
          getDepartmentDetail(params.id, token),
          getDepartmentSupervisors(params.id, token),
          getDepartmentInterns(params.id, { limit: 100 }, token),
        ]);

        setDepartment((departmentRes as any)?.data ?? null);
        setSupervisors(unwrapItems<any>(supervisorsRes));
        setInterns(unwrapItems<any>(internsRes));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load department details");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token, params?.id]);

  const activeInternCount = useMemo(
    () => interns.filter((intern) => intern.status === "ACTIVE").length,
    [interns],
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!department) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        No department found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={department.name}
        description="Department detail view with supervisors and intern roster."
        right={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin/departments">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to departments
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Department
            </div>
            <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="h-4 w-4 text-primary" /> {department.name}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {department.description || "No description available."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Supervisors
            </div>
            <div className="mt-2 text-3xl font-bold">
              {supervisors.length || department.supervisors?.length || 0}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Assigned department supervisors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interns
            </div>
            <div className="mt-2 text-3xl font-bold">{interns.length}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              All interns in this department
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Active interns
            </div>
            <div className="mt-2 text-3xl font-bold">{activeInternCount}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Currently active placements
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Core department details and metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Type</div>
                  <div className="font-medium uppercase">{department.type}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Description</div>
                  <div className="font-medium">
                    {department.description || "—"}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {formatDate(department.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Updated</div>
                  <div className="font-medium">
                    {formatDate(department.updatedAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">
                    Supervisor records
                  </div>
                  <div className="font-medium">
                    {supervisors.length || department.supervisors?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Placement Snapshot</CardTitle>
            <CardDescription>Quick roster summary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Active</span>
              <Badge variant="success">{activeInternCount}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Completed</span>
              <Badge variant="secondary">
                {
                  interns.filter((intern) => intern.status === "COMPLETED")
                    .length
                }
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Terminated</span>
              <Badge variant="destructive">
                {
                  interns.filter((intern) => intern.status === "TERMINATED")
                    .length
                }
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supervisors</CardTitle>
          <CardDescription>
            Department supervisors and their intern counts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(supervisors.length || department.supervisors?.length || 0) === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No supervisors assigned to this department.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interns</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(supervisors.length
                    ? supervisors
                    : department.supervisors || []
                  ).map((supervisor) => (
                    <TableRow key={supervisor.id}>
                      <TableCell className="font-medium">
                        {supervisor.firstName} {supervisor.lastName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {supervisor.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            supervisor.isActive === false
                              ? "secondary"
                              : "success"
                          }
                        >
                          {supervisor.isActive === false
                            ? "Inactive"
                            : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{supervisor.internCount ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interns</CardTitle>
          <CardDescription>
            Intern roster assigned to this department.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interns.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No interns found in this department.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Intern</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Supervisor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interns.map((intern) => (
                    <TableRow key={intern.id}>
                      <TableCell>
                        <div className="font-medium">
                          {intern.student
                            ? `${intern.student.firstName} ${intern.student.lastName}`
                            : intern.firstName || "Intern"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {intern.student?.studentId || intern.internId}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {intern.internId}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            intern.status === "ACTIVE"
                              ? "success"
                              : intern.status === "COMPLETED"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {intern.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(intern.startDate)}</span>
                          <span>→</span>
                          <span>{formatDate(intern.endDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {intern.supervisor
                          ? `${intern.supervisor.firstName} ${intern.supervisor.lastName}`
                          : "Unassigned"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
