"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  GraduationCap, 
  FileText, 
  Briefcase, 
  ChevronRight,
  ArrowLeft,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { listUniversities } from "@/lib/services/universities";
import { listDepartments } from "@/lib/services/departments";
import { listApplications } from "@/lib/services/applications";
import { listStudents } from "@/lib/services/students";
import { listInterns } from "@/lib/services/interns";
import { toast } from "sonner";

type NavigationLevel = 'root' | 'university' | 'department' | 'year' | 'applications' | 'students' | 'interns';

interface NavigationState {
  level: NavigationLevel;
  universityId?: string;
  departmentId?: string;
  year?: string;
  universityName?: string;
  departmentName?: string;
}

export default function HierarchicalAdminPage() {
  const { token } = useAuth();
  const authToken = token ?? undefined;
  const [navigation, setNavigation] = useState<NavigationState>({ level: 'root' });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [navigation, token]);

  const fetchData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      switch (navigation.level) {
        case 'root':
          await fetchRootData();
          break;
        case 'university':
          await fetchUniversityData();
          break;
        case 'department':
          await fetchDepartmentData();
          break;
        case 'year':
          await fetchYearData();
          break;
        case 'applications':
        case 'students':
        case 'interns':
          await fetchDetailData();
          break;
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRootData = async () => {
    const [universitiesRes, departmentsRes] = await Promise.all([
      listUniversities({ page: 1, limit: 100 }, authToken),
      listDepartments({ page: 1, limit: 100 }, authToken)
    ]);

    const universities = (universitiesRes as any)?.data?.items || [];
    const departments = (departmentsRes as any)?.data?.items || [];

    setData({
      universities: universities.map((u: any) => ({
        ...u,
        studentCount: Math.floor(Math.random() * 100) + 20, // Mock data
        applicationCount: Math.floor(Math.random() * 50) + 5,
        internCount: Math.floor(Math.random() * 30) + 5,
      })),
      departments: departments.map((d: any) => ({
        ...d,
        universityCount: Math.floor(Math.random() * 10) + 3, // Mock data
        internCount: Math.floor(Math.random() * 20) + 5,
      }))
    });
  };

  const fetchUniversityData = async () => {
    const [departmentsRes, applicationsRes, studentsRes, internsRes] = await Promise.all([
      listDepartments({ page: 1, limit: 100 }, authToken),
      listApplications({ universityId: navigation.universityId, limit: 100 }, authToken),
      listStudents({ universityId: navigation.universityId, limit: 100 }, authToken),
      listInterns({ universityId: navigation.universityId, limit: 100 }, authToken)
    ]);

    setData({
      departments: (departmentsRes as any)?.data?.items || [],
      applications: (applicationsRes as any)?.data?.items || [],
      students: (studentsRes as any)?.data?.items || [],
      interns: (internsRes as any)?.data?.items || [],
    });
  };

  const fetchDepartmentData = async () => {
    const [internsRes, applicationsRes] = await Promise.all([
      listInterns({ departmentId: navigation.departmentId, limit: 100 }, authToken),
      listApplications({ departmentId: navigation.departmentId, limit: 100 }, authToken)
    ]);

    setData({
      interns: (internsRes as any)?.data?.items || [],
      applications: (applicationsRes as any)?.data?.items || [],
    });
  };

  const fetchYearData = async () => {
    const applicationsRes = await listApplications({
      universityId: navigation.universityId,
      academicYear: navigation.year,
      limit: 100
    }, authToken);

    setData({
      applications: (applicationsRes as any)?.data?.items || [],
    });
  };

  const fetchDetailData = async () => {
    // This would fetch detailed data for specific views
    setData({});
  };

  const navigateTo = (newState: Partial<NavigationState>) => {
    setNavigation(prev => ({ ...prev, ...newState }));
  };

  const navigateBack = () => {
    switch (navigation.level) {
      case 'university':
        setNavigation({ level: 'root' });
        break;
      case 'department':
      case 'year':
        setNavigation({ level: 'university', universityId: navigation.universityId });
        break;
      case 'applications':
      case 'students':
      case 'interns':
        setNavigation({ level: 'department', universityId: navigation.universityId, departmentId: navigation.departmentId });
        break;
    }
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = [];
    
    if (navigation.level !== 'root') {
      breadcrumbs.push(
        <Button key="back" variant="ghost" size="sm" onClick={navigateBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      );
    }

    if (navigation.level === 'university' && navigation.universityName) {
      breadcrumbs.push(
        <span key="university" className="text-sm font-medium text-muted-foreground">
          {navigation.universityName}
        </span>
      );
    }

    if (navigation.level === 'department' && navigation.departmentName) {
      breadcrumbs.push(
        <span key="department" className="text-sm font-medium text-muted-foreground">
          {navigation.departmentName}
        </span>
      );
    }

    if (navigation.level === 'year' && navigation.year) {
      breadcrumbs.push(
        <span key="year" className="text-sm font-medium text-muted-foreground">
          {navigation.year}
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2 mb-6">
        {breadcrumbs}
      </div>
    );
  };

  const renderRootView = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Universities
        </h2>
        <p className="text-muted-foreground mb-4">Navigate by university to view their data</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.universities?.map((uni: any) => (
            <Card key={uni.id} className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigateTo({ 
                    level: 'university', 
                    universityId: uni.id, 
                    universityName: uni.name 
                  })}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">{uni.name}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{uni.studentCount || 0} students</span>
                  <span>{uni.applicationCount || 0} applications</span>
                  <span>{uni.internCount || 0} interns</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Departments
        </h2>
        <p className="text-muted-foreground mb-4">View departments and their intern allocations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.departments?.map((dept: any) => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigateTo({ 
                    level: 'department', 
                    departmentId: dept.id, 
                    departmentName: dept.name 
                  })}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                    <Briefcase className="h-5 w-5 text-secondary" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">{dept.name}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{dept.internCount || 0} interns</span>
                  <span>{dept.universityCount || 0} universities</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUniversityView = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Applications by Year
        </h2>
        <p className="text-muted-foreground mb-4">Filter applications by academic year</p>
        
        {/* Get unique years from applications */}
        {(() => {
          const years = Array.from(
            new Set((data.applications || []).map((app: any) => app.academicYear))
          ).map((year) => String(year)).filter((year) => year.length > 0);
          return years.map(year => (
            <Card key={year} className="hover:shadow-md transition-shadow cursor-pointer group mb-4"
                  onClick={() => navigateTo({ level: 'year', year })}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{year}</h3>
                    <p className="text-muted-foreground">
                      {(data.applications || []).filter((app: any) => app.academicYear === year).length} applications
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          ));
        })()}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Students
        </h2>
        <p className="text-muted-foreground mb-4">View all students from this university</p>
        <Card className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigateTo({ level: 'students' })}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">All Students</h3>
                <p className="text-muted-foreground">{(data.students || []).length} students</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Departments
        </h2>
        <p className="text-muted-foreground mb-4">View departments with interns from this university</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.departments?.map((dept: any) => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigateTo({ 
                    level: 'department', 
                    departmentId: dept.id, 
                    departmentName: dept.name 
                  })}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{dept.name}</h3>
                    <p className="text-muted-foreground">
                      {(data.interns || []).filter((intern: any) => intern.departmentId === dept.id).length} interns
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderYearView = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        Applications for {navigation.year}
      </h2>
      <div className="space-y-4">
        {data.applications?.map((app: any) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{app.name || 'Untitled Application'}</h3>
                  <p className="text-muted-foreground">
                    {app.studentCount || 0} students • Status: {app.status}
                  </p>
                </div>
                <Link href={`/dashboard/admin/applications?view=${app.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDepartmentView = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Interns in {navigation.departmentName}
        </h2>
        <div className="space-y-4">
          {data.interns?.map((intern: any) => (
            <Card key={intern.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {intern.firstName} {intern.lastName}
                    </h3>
                    <p className="text-muted-foreground">
                      {intern.internId} • Status: {intern.status}
                    </p>
                  </div>
                  <Link href={`/dashboard/admin/interns?view=${intern.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudentsView = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <GraduationCap className="h-6 w-6 text-primary" />
        Students from {navigation.universityName}
      </h2>
      <div className="space-y-4">
        {data.students?.map((student: any) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-muted-foreground">
                    {student.studentId} • {student.fieldOfStudy}
                  </p>
                </div>
                <Link href={`/dashboard/admin/students?view=${student.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (navigation.level) {
      case 'root':
        return renderRootView();
      case 'university':
        return renderUniversityView();
      case 'year':
        return renderYearView();
      case 'department':
        return renderDepartmentView();
      case 'students':
        return renderStudentsView();
      default:
        return <div>View not implemented</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Hierarchical Navigation
          </h1>
          <p className="text-muted-foreground">
            Navigate data by structure instead of filters
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline">Switch to Filter View</Button>
        </Link>
      </div>

      {renderBreadcrumbs()}
      {renderContent()}
    </div>
  );
}
