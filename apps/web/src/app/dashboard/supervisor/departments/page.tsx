"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Loader2, Calendar } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { listInterns } from "@/lib/services/interns";
import { apiFetch } from "@/lib/api";

type Supervisor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type DepartmentDetails = {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  supervisors: Supervisor[];
};

export default function SupervisorDepartmentsPage() {
  const { user, token } = useAuth();
  const [department, setDepartment] = useState<DepartmentDetails | null>(null);
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.department?.id || !token) return;

      try {
        const [deptRes, internsRes] = await Promise.all([
          apiFetch<{ data: DepartmentDetails }>(`/departments/${user.department.id}`, { token }),
          listInterns({ departmentId: user.department.id, limit: 100 }, token)
        ]);

        if (deptRes.data) {
          setDepartment(deptRes.data);
        }
        
        if (internsRes.data?.items) {
          setInterns(internsRes.data.items);
        }
      } catch (error) {
        console.error("Failed to fetch department data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, token]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department"
        description="View your department details and intern roster."
      />

      <Card>
        <CardHeader>
          <CardTitle>{department?.name || user?.department?.name || "Department"}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Badge variant="outline">{department?.type || user?.department?.type || "General"}</Badge>
            <span>{department?.description || "No description available."}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <div className="font-medium text-foreground mb-1">Supervisors</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {department?.supervisors && department.supervisors.length > 0 ? (
                department.supervisors.map((sup) => (
                  <Badge key={sup.id} variant="secondary">
                    {sup.firstName} {sup.lastName}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">No supervisors assigned</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-muted-foreground">Created</div>
              <div className="text-foreground">
                {department?.createdAt ? new Date(department.createdAt).toLocaleDateString() : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total interns this cycle</div>
              <div className="text-foreground">{interns.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Interns in your department</CardTitle>
            <CardDescription>Interns currently assigned to this department.</CardDescription>
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intern</TableHead>
                <TableHead>Intern ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Supervisor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No interns found in this department.
                  </TableCell>
                </TableRow>
              ) : (
                interns.map((intern) => (
                  <TableRow key={intern.id}>
                    <TableCell className="font-medium">
                      {intern.firstName} {intern.lastName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {intern.internId || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          intern.status === "ACTIVE" ? "success" : 
                          intern.status === "COMPLETED" ? "secondary" : "destructive"
                        }
                      >
                        {intern.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{intern.startDate ? new Date(intern.startDate).toLocaleDateString() : "—"}</span>
                        <span>→</span>
                        <span>{intern.endDate ? new Date(intern.endDate).toLocaleDateString() : "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {intern.supervisor 
                        ? `${intern.supervisor.firstName} ${intern.supervisor.lastName}`
                        : "Unassigned"
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}