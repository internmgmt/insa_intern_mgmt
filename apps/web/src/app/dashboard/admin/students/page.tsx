"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  RotateCcw,
  FileDown
} from "lucide-react";
import Link from "next/link";
import {
  listStudents,
  listApplicationStudents,
  addStudentToApplication,
  updateApplicationStudent,
  removeApplicationStudent,
  reviewStudent,
  markStudentArrived
} from "@/lib/services/students";
import { listApplications, type ApplicationListItem as Application } from "@/lib/services/applications";
import { listUniversities } from "@/lib/services/universities";
import { listDepartments } from "@/lib/services/departments";
import { listUsers } from "@/lib/services/users";
import { createIntern } from "@/lib/services/interns";
import { uploadDocument, listDocuments } from "@/lib/services/documents";
import { downloadFile } from "@/lib/download";
import { toast } from "sonner";
import { sanitizeFormData, sanitizeInput } from "@/lib/sanitize";
import { getAcademicYears } from "@/lib/utils";

export default function AdminStudentsPage() {
  const { token } = useAuth();

  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
  const [selectedUniId, setSelectedUniId] = useState<string>("ALL");
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unisLoading, setUnisLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [assignmentData, setAssignmentData] = useState({
    departmentId: "",
    startDate: "",
    endDate: "",
  });

  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    fieldOfStudy: "",
    academicYear: getAcademicYears()[0],
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUnis = async () => {
      if (!token) return;
      try {
        setUnisLoading(true);
        const res = await listUniversities({ page: 1, limit: 50 }, token);
        const items = (res as any)?.data?.items || (res as any)?.data || [];
        setUniversities(items);
      } catch (err: any) {
        console.error("Failed to fetch universities", err);
        toast.error("Failed to load universities");
      } finally {
        setUnisLoading(false);
      }
    };
    fetchUnis();
  }, [token]);

  useEffect(() => {
    const fetchApps = async () => {
      if (!token) return;
      try {
        setAppsLoading(true);
        const params: any = { page: 1, limit: 50 };
        if (selectedUniId !== "ALL") params.universityId = selectedUniId;
        const res = await listApplications(params, token);
        setApplications(res.data.items || []);
      } catch (err: any) {
        console.error("Failed to fetch applications", err);
      } finally {
        setAppsLoading(false);
      }
    };
    fetchApps();
  }, [token, selectedUniId]);

  const academicYears = useMemo(() => {
    const years = new Set(applications.map(a => a.academicYear));
    return Array.from(years).sort();
  }, [applications]);

  useEffect(() => {
    if (showAssignDialog && token) {
      listDepartments(token).then(res => {
        const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
        setDepartments(Array.isArray(items) ? items : []);
      });
    }
  }, [showAssignDialog, token]);

  const fetchStudentsData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 50 };
      if (selectedUniId !== "ALL") params.universityId = selectedUniId;
      if (selectedBatch !== "ALL") params.academicYear = selectedBatch;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await listStudents(params, token);
      setStudents((res as any).data.items || []);
    } catch (err: any) {
      console.error("Failed to fetch students", err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [token, selectedUniId, selectedBatch, statusFilter]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(s => {
      const matchesSearch =
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [students, searchQuery]);

  function validateFile(file: File | null, allowedMimes: string[] = ["application/pdf"], maxSize = 10 * 1024 * 1024) {
    if (!file) return true;
    const name = sanitizeInput(file.name || "");
    const type = file.type || "";
    if (file.size > maxSize) {
      toast.error(`${name} exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }
    const lower = name.toLowerCase();
    if (!lower.endsWith(".pdf")) {
      toast.error(`${name} must be a PDF`);
      return false;
    }
    if (name.split(".").length > 2) {
      toast.error(`${name} has multiple extensions; upload a clean filename`);
      return false;
    }
    if (allowedMimes.length && type && !allowedMimes.includes(type)) {
      toast.error(`${name} has invalid MIME type`);
      return false;
    }
    return true;
  }

  const handleAddStudent = async () => {
    if (!token) return;
    const targetApp = applications.find(a =>
      (selectedUniId === "ALL" ? true : a.university?.id === selectedUniId) &&
      (selectedBatch === "ALL" ? true : a.academicYear === selectedBatch)
    );
    if (!targetApp) {
      toast.error("Please select or ensure a specific University and Application Batch exists to add a student.");
      return;
    }
    if (!validateFile(cvFile) || !validateFile(transcriptFile)) return;
    try {
      setIsSubmitting(true);
      const cleanForm = sanitizeFormData(formData);
      const res = await addStudentToApplication(targetApp.id, cleanForm, token);
      const newStudent = res.data;
      if (cvFile) {
        await uploadDocument(cvFile, {
          documentType: "CV",
          studentId: newStudent.id,
          applicationId: targetApp.id,
          entityType: "STUDENT",
          entityId: newStudent.id,
          title: `CV - ${sanitizeInput(newStudent.firstName)} ${sanitizeInput(newStudent.lastName)}`
        }, token);
      }
      if (transcriptFile) {
        await uploadDocument(transcriptFile, {
          documentType: "TRANSCRIPT",
          studentId: newStudent.id,
          applicationId: targetApp.id,
          entityType: "STUDENT",
          entityId: newStudent.id,
          title: `Transcript - ${sanitizeInput(newStudent.firstName)} ${sanitizeInput(newStudent.lastName)}`
        }, token);
      }
      toast.success("Student added successfully");
      setShowAddDialog(false);
      resetForm();
      fetchStudentsData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent || !token) return;
    const appId = (selectedStudent as any).applicationId;
    if (!appId) {
      toast.error("Cannot update student: missing application ID");
      return;
    }
    if (!validateFile(cvFile) || !validateFile(transcriptFile)) return;
    try {
      setIsSubmitting(true);
      const cleanForm = sanitizeFormData(formData);
      await updateApplicationStudent(appId, selectedStudent.id, cleanForm, token);
      if (cvFile) {
        await uploadDocument(cvFile, {
          documentType: "CV",
          studentId: selectedStudent.id,
          applicationId: appId,
          entityType: "STUDENT",
          entityId: selectedStudent.id,
          title: `CV - ${sanitizeInput(cleanForm.firstName)} ${sanitizeInput(cleanForm.lastName)}`
        }, token);
      }
      if (transcriptFile) {
        await uploadDocument(transcriptFile, {
          documentType: "TRANSCRIPT",
          studentId: selectedStudent.id,
          applicationId: appId,
          entityType: "STUDENT",
          entityId: selectedStudent.id,
          title: `Transcript - ${sanitizeInput(cleanForm.firstName)} ${sanitizeInput(cleanForm.lastName)}`
        }, token);
      }
      toast.success("Student updated successfully");
      setShowEditDialog(false);
      resetForm();
      fetchStudentsData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent || !token) return;
    const appId = (selectedStudent as any).applicationId;
    if (!appId) {
      toast.error("Cannot delete student: missing application ID");
      return;
    }
    try {
      setIsSubmitting(true);
      await removeApplicationStudent(appId, selectedStudent.id, token);
      toast.success("Student removed successfully");
      setShowDeleteDialog(false);
      fetchStudentsData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = (s: any) => {
    setSelectedStudent(s);
    setAssignmentData({
      departmentId: "",
      startDate: "",
      endDate: "",
    });
    setShowAssignDialog(true);
  };

  const handleAssignAndApprove = async () => {
    if (!selectedStudent || !token) return;
    if (!assignmentData.departmentId) {
      toast.error("Please select a department");
      return;
    }
    try {
      setIsSubmitting(true);
      await reviewStudent(selectedStudent.id, { decision: "ACCEPT" }, token);
      await createIntern({
        studentId: selectedStudent.id,
        departmentId: assignmentData.departmentId,
        startDate: assignmentData.startDate || undefined,
        endDate: assignmentData.endDate || undefined,
      }, token);
      toast.success("Student approved and intern account created");
      setShowAssignDialog(false);
      fetchStudentsData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to process approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Rejection reason (required):', '');
    if (!reason || !reason.trim()) return;
    try {
      await reviewStudent(id, { decision: "REJECT", rejectionReason: reason.trim() }, token || undefined);
      toast.success("Student rejected");
      fetchStudentsData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject student');
    }
  };

  const handleMarkArrived = async (id: string) => {
    try {
      await markStudentArrived(id, token || undefined);
      toast.success("Marked as ARRIVED");
      fetchStudentsData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to mark arrived');
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      fieldOfStudy: "",
      academicYear: getAcademicYears()[0],
    });
    setCvFile(null);
    setTranscriptFile(null);
    setSelectedStudent(null);
  };

  const resetFilters = () => {
    setSelectedUniId("ALL");
    setSelectedBatch("ALL");
    setStatusFilter("ALL");
    setSearchQuery("");
  };

  const openEdit = (s: any) => {
    setSelectedStudent(s);
    setFormData({
      studentId: s.studentId,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email || "",
      phone: s.phone || "",
      fieldOfStudy: s.fieldOfStudy,
      academicYear: s.academicYear,
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW": return <Badge variant="warning">Pending Review</Badge>;
      case "AWAITING_ARRIVAL": return <Badge variant="secondary">Awaiting Arrival</Badge>;
      case "ARRIVED": return <Badge variant="success">Arrived</Badge>;
      case "ACCOUNT_CREATED": return <Badge variant="success">Account Created</Badge>;
      case "REJECTED": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  async function handleDownload(docIdOrType: string, studentName: string, type: string, studentId?: string) {
    if (!token) return;
    const normalizedType = type.toUpperCase();
    try {
      let finalDocId = docIdOrType;
      if (studentId && (docIdOrType.toLowerCase().includes('cv') || docIdOrType.toLowerCase().includes('transcript'))) {
        const res = await listDocuments({
          entityId: studentId,
          entityType: 'STUDENT'
        }, token);
        const docs = (res as any)?.data?.items || [];
        const found = docs.find((d: any) => {
          try {
            const meta = JSON.parse(d.metadata || '{}');
            return meta.documentType === normalizedType;
          } catch (e) { return false; }
        });
        if (found) {
          finalDocId = found.id;
        } else {
          if (!docIdOrType.includes('_') && docIdOrType.length > 30) {
            finalDocId = docIdOrType;
          } else {
            toast.error(`${type} document not found`);
            return;
          }
        }
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
      await downloadFile(`${baseUrl}/documents/${finalDocId}/download`, token, `${studentName}_${type}.pdf`);
    } catch (error: any) {
      toast.error("Failed to download document");
    }
  }

  return (
    <div className="space-y-10 px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground text-lg">Review and manage students from all partnered universities.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <Button onClick={() => { resetForm(); setShowAddDialog(true); }} disabled={selectedUniId === "ALL" && selectedBatch === "ALL"}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-visible">
        <CardHeader className="pb-4">
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">University</Label>
              <Select value={selectedUniId} onValueChange={setSelectedUniId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Universities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Universities</SelectItem>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Application Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Applications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Applications</SelectItem>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.academicYear}>{app.name || app.academicYear}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="AWAITING_ARRIVAL">Awaiting Arrival</SelectItem>
                  <SelectItem value="ARRIVED">Arrived</SelectItem>
                  <SelectItem value="ACCOUNT_CREATED">Account Created</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading || appsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <Users className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">No students found for this selection.</p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-bold text-[10px] uppercase">Student</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">ID</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">University</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">Batch</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="group hover:bg-muted/10 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">{student.firstName} {student.lastName}</span>
                          <span className="text-[10px] text-muted-foreground">{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{student.studentId}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{universities.find(u => u.id === (student as any).universityId)?.name || (student as any).universityId || "—"}</span>
                          <span className="text-[10px] text-primary/80">{(student as any).applicationName || 'Untitled Application'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground uppercase text-[10px]">{student.academicYear}</TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {student.status === "PENDING_REVIEW" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-success hover:bg-success/10"
                                onClick={() => handleApprove(student)}
                                title="Approve"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleReject(student.id)}
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {student.status === "AWAITING_ARRIVAL" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] px-2"
                              onClick={() => handleMarkArrived(student.id)}
                            >
                              Mark Arrived
                            </Button>
                          )}
                          {(student.status === "ARRIVED" || student.status === "ACCOUNT_CREATED") && (
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px] text-primary"
                            >
                              <Link href={`/dashboard/admin/interns?studentId=${student.id}`}>
                                To Intern <ArrowRight className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedStudent(student); setShowViewDialog(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 transition-opacity group-hover:opacity-100" onClick={() => openEdit(student)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 transition-opacity group-hover:opacity-100" onClick={() => { setSelectedStudent(student); setShowDeleteDialog(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setShowEditDialog(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{showAddDialog ? "Add New Student" : "Edit Student"}</DialogTitle>
            <DialogDescription>
              {showAddDialog
                ? "Enter student details and upload necessary documents."
                : "Update student profile and documents."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs">First Name *</Label>
                <Input id="firstName" className="h-8 text-sm" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs">Last Name *</Label>
                <Input id="lastName" className="h-8 text-sm" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="studentId" className="text-xs">Student ID *</Label>
                <Input id="studentId" className="h-8 text-sm" value={formData.studentId} disabled={showEditDialog} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email *</Label>
                <Input id="email" type="email" className="h-8 text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fieldOfStudy" className="text-xs">Field of Study *</Label>
                <Input id="fieldOfStudy" className="h-8 text-sm" value={formData.fieldOfStudy} onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="academicYear" className="text-xs">Academic Year *</Label>
                <Select 
                  value={formData.academicYear} 
                  onValueChange={(val) => setFormData({ ...formData, academicYear: val })}
                >
                  <SelectTrigger id="academicYear" className="h-8 text-sm">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAcademicYears().map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs">Phone Number *</Label>
              <Input id="phone" type="tel" className="h-8 text-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documents
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground italic">CV (PDF)</Label>
                  <Input
                    type="file"
                    className="text-xs h-9 cursor-pointer"
                    accept=".pdf"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground italic">Transcript (PDF)</Label>
                  <Input
                    type="file"
                    className="text-xs h-9 cursor-pointer"
                    accept=".pdf"
                    onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setShowEditDialog(false); resetForm(); }}>Cancel</Button>
            <Button
              size="sm"
              onClick={showAddDialog ? handleAddStudent : handleUpdateStudent}
              disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.studentId || !formData.email || !formData.fieldOfStudy || !formData.academicYear || !formData.phone}
            >
              {isSubmitting ? "Processing..." : (showAddDialog ? "Add Student" : "Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>Full details and documents.</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-muted-foreground">Student ID:</div>
                <div className="font-mono font-medium">{selectedStudent.studentId}</div>
                <div className="text-muted-foreground">Name:</div>
                <div className="font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</div>
                <div className="text-muted-foreground">University:</div>
                <div>{universities.find(u => u.id === (selectedStudent as any).universityId)?.name || "Unknown"}</div>
                <div className="text-muted-foreground">Email:</div>
                <div className="text-primary">{selectedStudent.email || "—"}</div>
                <div className="text-muted-foreground">Phone:</div>
                <div>{selectedStudent.phone || "—"}</div>
                <div className="text-muted-foreground">Field of Study:</div>
                <div>{selectedStudent.fieldOfStudy}</div>
                <div className="text-muted-foreground">Academic Year:</div>
                <div>{selectedStudent.academicYear}</div>
                <div className="text-muted-foreground">Status:</div>
                <div>{getStatusBadge(selectedStudent.status)}</div>
              </div>

              {selectedStudent.status === "REJECTED" && selectedStudent.rejectionReason && (
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase text-destructive/70">Rejection Reason</p>
                        <p className="text-sm text-destructive/90">{selectedStudent.rejectionReason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3 border-t pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Associated Documents</h4>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-muted group">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium">Curriculum Vitae</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDownload("CV", selectedStudent.firstName, "CV", selectedStudent.id)}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-muted group">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium">Academic Transcript</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDownload("TRANSCRIPT", selectedStudent.firstName, "Transcript", selectedStudent.id)}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Department & Activate Intern</DialogTitle>
            <DialogDescription>
              Assign <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong> to a department and supervisor. An email will be sent with their login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dept">Department</Label>
              <Select
                value={assignmentData.departmentId}
                onValueChange={(val) => setAssignmentData(prev => ({ ...prev, departmentId: val }))}
              >
                <SelectTrigger id="dept">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(departments) && departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={assignmentData.startDate}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={assignmentData.endDate}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button size="sm" disabled={isSubmitting || !assignmentData.departmentId} onClick={handleAssignAndApprove}>
              {isSubmitting ? "Processing..." : "Approve & Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Remove Student Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>? This action will permanently delete all metadata and document links.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" disabled={isSubmitting} onClick={handleDeleteStudent}>
              {isSubmitting ? "Removing..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}