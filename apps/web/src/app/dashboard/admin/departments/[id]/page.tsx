"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Users, 
  FileText, 
  GraduationCap, 
  Building2,
  ArrowLeft,
  Edit,
  Eye,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { getDepartmentById } from "@/lib/services/departments";
import { listInterns } from "@/lib/services/interns";
import { listApplications } from "@/lib/services/applications";
import { listUsers } from "@/lib/services/users";
import { toast } from "sonner";

export default function DepartmentDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<any>(null);
  const [interns, setInterns] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!token || !departmentId) return;
    fetchDepartmentDetails();
  }, [token, departmentId]);

  const fetchDepartmentDetails = async () => {
    try {
      setLoading(true);

      // Fetch department details
      const departmentRes = await getDepartmentById(departmentId, token);
      setDepartment(departmentRes.data);

      // Fetch related data
      const [internsRes, applicationsRes, usersRes] = await Promise.all([
        listInterns({ departmentId, limit: 100 }, token),
        listApplications({ departmentId, limit: 100 }, token),
        listUsers({ departmentId, limit: 100 }, token)
      ]);

      setInterns((internsRes as any)?.data?.items || []);
      setApplications((applicationsRes as any)?.data?.items || []);
      setUsers((usersRes as any)?.data?.items || []);

    } catch (error: any) {
      console.error('Failed to fetch department details:', error);
      toast.error(error?.message || 'Failed to load department details');
      router.push('/dashboard/admin/departments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: "success" as const, label: "Active" },
      INACTIVE: { variant: "secondary" as const, label: "Inactive" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      label: status
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      SOFTWARE_DEVELOPMENT: { variant: "default" as const, label: "Software Engineering" },
      CYBERSECURITY: { variant: "destructive" as const, label: "Cyber Operations" },
      NETWORKING: { variant: "secondary" as const, label: "Networking & Infrastructure" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      variant: "outline" as const,
      label: type
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Department not found</p>
        <Button onClick={() => router.push('/dashboard/admin/departments')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin/departments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Departments
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              {department.name}
            </h1>
            <p className="text-muted-foreground">Department detailed information and management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Department Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCheck className="h-4 w-4" />
                Department Head
              </div>
              <p className="font-medium">{department.head || 'Not assigned'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Type
              </div>
              <div>{getTypeBadge(department.type)}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Status
              </div>
              <div>{getStatusBadge(department.isActive !== false ? 'ACTIVE' : 'INACTIVE')}</div>
            </div>
          </div>
          {department.description && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Mission & Objectives</h3>
              <p className="text-muted-foreground">{department.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{interns.length}</p>
                <p className="text-sm text-muted-foreground">Active Interns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-secondary/10">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-success/10">
                <GraduationCap className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Staff Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="interns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="interns">Interns ({interns.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="users">Staff ({users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="interns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Department Interns
              </CardTitle>
              <CardDescription>Active interns assigned to this department</CardDescription>
            </CardHeader>
            <CardContent>
              {interns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No interns found for this department</p>
              ) : (
                <div className="space-y-4">
                  {interns.map((intern) => (
                    <div key={intern.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{intern.firstName} {intern.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {intern.internId} • {intern.university?.name || 'Unknown university'}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{intern.status}</Badge>
                          {intern.gradingStatus && (
                            <Badge variant="secondary">{intern.gradingStatus}</Badge>
                          )}
                        </div>
                      </div>
                      <Link href={`/dashboard/admin/interns?view=${intern.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Department Applications
              </CardTitle>
              <CardDescription>Internship applications for this department</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No applications found for this department</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{app.name || 'Untitled Application'}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.studentCount || 0} students • {app.university?.name || 'Unknown university'}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{app.status}</Badge>
                          <Badge variant="secondary">{app.academicYear}</Badge>
                        </div>
                      </div>
                      <Link href={`/dashboard/admin/applications?view=${app.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department Staff
              </CardTitle>
              <CardDescription>Staff members assigned to this department</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No staff found for this department</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge variant="secondary">{user.status || 'Active'}</Badge>
                        </div>
                      </div>
                      <Link href={`/dashboard/admin/users?view=${user.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
