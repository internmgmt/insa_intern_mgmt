"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  FileText, 
  GraduationCap, 
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit,
  Download,
  Eye
} from "lucide-react";
import Link from "next/link";
import { getUniversityById } from "@/lib/services/universities";
import { listApplications } from "@/lib/services/applications";
import { listStudents } from "@/lib/services/students";
import { listInterns } from "@/lib/services/interns";
import { listUsers } from "@/lib/services/users";
import { listDocuments } from "@/lib/services/documents";
import { toast } from "sonner";

export default function UniversityDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const universityId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!token || !universityId) return;
    fetchUniversityDetails();
  }, [token, universityId]);

  const fetchUniversityDetails = async () => {
    try {
      setLoading(true);

      // Fetch university details
      const universityRes = await getUniversityById(universityId, token);
      setUniversity(universityRes.data);

      // Fetch related data
      const [applicationsRes, studentsRes, internsRes, usersRes, documentsRes] = await Promise.all([
        listApplications({ universityId, limit: 100 }, token),
        listStudents({ universityId, limit: 100 }, token),
        listInterns({ universityId, limit: 100 }, token),
        listUsers({ universityId, limit: 100 }, token),
        listDocuments({ universityId, limit: 100 }, token)
      ]);

      setApplications((applicationsRes as any)?.data?.items || []);
      setStudents((studentsRes as any)?.data?.items || []);
      setInterns((internsRes as any)?.data?.items || []);
      setUsers((usersRes as any)?.data?.items || []);
      setDocuments((documentsRes as any)?.data?.items || []);

    } catch (error: any) {
      console.error('Failed to fetch university details:', error);
      toast.error(error?.message || 'Failed to load university details');
      router.push('/dashboard/admin/universities');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: "success" as const, label: "Active" },
      INACTIVE: { variant: "secondary" as const, label: "Inactive" },
      PENDING: { variant: "warning" as const, label: "Pending" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      label: status
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

  if (!university) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">University not found</p>
        <Button onClick={() => router.push('/dashboard/admin/universities')} className="mt-4">
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
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin/universities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Universities
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              {university.name}
            </h1>
            <p className="text-muted-foreground">University detailed information and management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* University Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>University Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                Contact Email
              </div>
              <p className="font-medium">{university.contactEmail || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                Contact Phone
              </div>
              <p className="font-medium">{university.contactPhone || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Address
              </div>
              <p className="font-medium">{university.address || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Status
              </div>
              <div>{getStatusBadge(university.isActive !== false ? 'ACTIVE' : 'INACTIVE')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Users</p>
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
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <Briefcase className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{interns.length}</p>
                <p className="text-sm text-muted-foreground">Interns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="interns">Interns ({interns.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                University Users
              </CardTitle>
              <CardDescription>Users associated with this university</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No users found for this university</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className="mt-1">{user.role}</Badge>
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

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                University Applications
              </CardTitle>
              <CardDescription>Internship applications from this university</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No applications found for this university</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{app.name || 'Untitled Application'}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.studentCount || 0} students • {app.academicYear}
                        </p>
                        <Badge variant="outline" className="mt-1">{app.status}</Badge>
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

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                University Students
              </CardTitle>
              <CardDescription>Students from this university</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No students found for this university</p>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.studentId} • {student.fieldOfStudy}
                        </p>
                        <Badge variant="outline" className="mt-1">{student.status}</Badge>
                      </div>
                      <Link href={`/dashboard/admin/students?view=${student.id}`}>
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

        <TabsContent value="interns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                University Interns
              </CardTitle>
              <CardDescription>Active interns from this university</CardDescription>
            </CardHeader>
            <CardContent>
              {interns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No interns found for this university</p>
              ) : (
                <div className="space-y-4">
                  {interns.map((intern) => (
                    <div key={intern.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{intern.firstName} {intern.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {intern.internId} • {intern.department?.name || 'No department'}
                        </p>
                        <Badge variant="outline" className="mt-1">{intern.status}</Badge>
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

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                University Documents
              </CardTitle>
              <CardDescription>Documents associated with this university</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No documents found for this university</p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.name || 'Untitled Document'}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type || 'Unknown type'} • {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
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
