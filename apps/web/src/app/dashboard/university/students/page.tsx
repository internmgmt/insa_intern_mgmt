"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    Download,
    Upload,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    ChevronLeft,
    ChevronRight,
    Send,
    Clock
} from "lucide-react";
import {
    listApplicationStudents,
    addStudentToApplication,
    updateApplicationStudent,
    removeApplicationStudent
} from "@/lib/services/students";
import { listApplications, submitApplication, type ApplicationListItem as Application } from "@/lib/services/applications";
import { uploadDocument } from "@/lib/services/documents";
import { toast } from "sonner";
import type { Student } from "@/lib/types";
import { sanitizeFormData, sanitizeInput } from "@/lib/sanitize";
import { getAcademicYears } from "@/lib/utils";

export default function UniversityStudentsPage() {
    const { token, user } = useAuth();
    const searchParams = useSearchParams();
    const queryAppId = searchParams.get("applicationId");

    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [appsLoading, setAppsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchApps = useCallback(async () => {
        if (!token) return;
        try {
            setAppsLoading(true);
            const res = await listApplications({ page: 1, limit: 100 }, token);
            const apps = res.data.items || [];
            console.log("Fetched apps:", apps.map(a => ({ id: a.id, count: a.studentCount, doc: !!a.officialLetterUrl })));
            setApplications(apps);
            
            // Set initial selectedAppId if not set or from query
            if (apps.length > 0) {
                setSelectedAppId(currentId => {
                    if (queryAppId && apps.some(a => a.id === queryAppId)) return queryAppId;
                    if (!currentId) return apps[0].id;
                    return currentId;
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch applications", err);
            toast.error(err?.message || "Failed to load applications");
        } finally {
            setAppsLoading(false);
        }
    }, [token, queryAppId]);

    useEffect(() => {
        fetchApps();
    }, [token, fetchApps]);

    const selectedApp = useMemo(() => {
        return applications.find(a => a.id === selectedAppId);
    }, [applications, selectedAppId]);

    const isStudentsVisible = useMemo(() => {
        // If no application selected, we show the "No Application Selected" state anyway
        if (!selectedAppId) return true;
        
        // While apps are loading or if selected app isn't found in the list yet, 
        // default to HIDDEN to avoid flashing current students or restricted data.
        if (appsLoading || !selectedApp) return false;

        // Students are visible in Draft (PENDING) for management,
        // Under Review (UNDER_REVIEW) for tracking, 
        // and Approved for monitoring.
        // Basically, coordinators see all status including Rejected to allow fixing.
        return ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"].includes(selectedApp.status);
    }, [selectedApp, selectedAppId, appsLoading]);

    const handleSendForReview = async () => {
        if (!selectedAppId || !token) return;
        try {
            setIsSubmitting(true);
            await submitApplication(selectedAppId, token);
            toast.success("Application sent for review successfully");
            await fetchApps();
        } catch (err: any) {
            toast.error(err?.message || "Failed to send application for review");
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const fetchStudents = useCallback(async () => {
        if (!token || !selectedAppId) return;
        try {
            setLoading(true);
            const res = await listApplicationStudents(selectedAppId, { page: 1, limit: 100 }, token);
            setStudents(res.data.items || []);
        } catch (err: any) {
            console.error("Failed to fetch students", err);
            toast.error(err?.message || "Failed to load students");
        } finally {
            setLoading(false);
        }
    }, [token, selectedAppId]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const filteredStudents = useMemo(() => {
        if (!isStudentsVisible) return [];
        return students.filter(s => {
            const matchesSearch =
                s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [students, searchQuery, statusFilter]);

    function validateFile(
        file: File | null,
        allowedMimes: string[] = ["application/pdf"],
        allowedExts: string[] = [".pdf"],
        maxSize = 10 * 1024 * 1024,
    ) {
        if (!file) return true;
        const name = sanitizeInput(file.name || "");
        const type = file.type || "";
        if (file.size > maxSize) {
            toast.error(`${name} exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`);
            return false;
        }
        const lower = name.toLowerCase();
        if (!allowedExts.some(ext => lower.endsWith(ext))) {
            toast.error(`${name} must be one of: ${allowedExts.join(", ")}`);
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
        if (!selectedAppId || !token) return;
        if (!validateFile(cvFile) || !validateFile(transcriptFile)) return;
        try {
            setIsSubmitting(true);
            const cleanForm = sanitizeFormData(formData);
            const res = await addStudentToApplication(selectedAppId, cleanForm, token);
            const newStudent = res.data;
            if (cvFile) {
                await uploadDocument(cvFile, {
                    documentType: "CV",
                    entityId: newStudent.id,
                    studentId: newStudent.id,
                    applicationId: selectedAppId,
                    entityType: "STUDENT",
                    title: `CV - ${sanitizeInput(newStudent.firstName)} ${sanitizeInput(newStudent.lastName)}`
                }, token);
            }
            if (transcriptFile) {
                await uploadDocument(transcriptFile, {
                    documentType: "TRANSCRIPT",
                    entityId: newStudent.id,
                    studentId: newStudent.id,
                    applicationId: selectedAppId,
                    entityType: "STUDENT",
                    title: `Transcript - ${sanitizeInput(newStudent.firstName)} ${sanitizeInput(newStudent.lastName)}`
                }, token);
            }
            toast.success("Student added successfully");
            setShowAddDialog(false);
            resetForm();
            fetchStudents();
            fetchApps();
        } catch (err: any) {
            toast.error(err?.message || "Failed to add student");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStudent = async () => {
        if (!selectedAppId || !selectedStudent || !token) return;
        if (!validateFile(cvFile) || !validateFile(transcriptFile)) return;
        try {
            setIsSubmitting(true);
            const cleanForm = sanitizeFormData(formData);
            await updateApplicationStudent(selectedAppId, selectedStudent.id, cleanForm, token);
            if (cvFile) {
                await uploadDocument(cvFile, {
                    documentType: "CV",
                    entityId: selectedStudent.id,
                    studentId: selectedStudent.id,
                    applicationId: selectedAppId,
                    entityType: "STUDENT",
                    title: `CV - ${sanitizeInput(cleanForm.firstName)} ${sanitizeInput(cleanForm.lastName)}`
                }, token);
            }
            if (transcriptFile) {
                await uploadDocument(transcriptFile, {
                    documentType: "TRANSCRIPT",
                    entityId: selectedStudent.id,
                    studentId: selectedStudent.id,
                    applicationId: selectedAppId,
                    entityType: "STUDENT",
                    title: `Transcript - ${sanitizeInput(cleanForm.firstName)} ${sanitizeInput(cleanForm.lastName)}`
                }, token);
            }
            toast.success("Student updated successfully");
            setShowEditDialog(false);
            resetForm();
            fetchStudents();
        } catch (err: any) {
            toast.error(err?.message || "Failed to update student");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!selectedAppId || !selectedStudent || !token) return;
        try {
            setIsSubmitting(true);
            await removeApplicationStudent(selectedAppId, selectedStudent.id, token);
            toast.success("Student removed successfully");
            setShowDeleteDialog(false);
            fetchStudents();
            fetchApps();
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete student");
        } finally {
            setIsSubmitting(false);
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

    const openEdit = (s: Student) => {
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACCEPTED": return <CheckCircle2 className="h-4 w-4 text-success" />;
            case "REJECTED": return <XCircle className="h-4 w-4 text-destructive" />;
            case "PENDING": return <AlertCircle className="h-4 w-4 text-warning" />;
            default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACCEPTED": return <Badge variant="success">Accepted</Badge>;
            case "REJECTED": return <Badge variant="destructive">Rejected</Badge>;
            case "PENDING": return <Badge variant="warning">Pending</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">University Students</h1>
                    <p className="text-muted-foreground">Manage students and their application documents.</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedApp && selectedApp.status === "PENDING" && (() => {
                        const letterUrl = selectedApp.officialLetterUrl || (selectedApp as any).official_letter_url;
                        return (
                            <Button
                                variant="default"
                                className="bg-primary hover:bg-primary/90"
                                onClick={handleSendForReview}
                                disabled={isSubmitting || students.length === 0 || !letterUrl}
                                title={
                                    students.length === 0 ? "Add at least 1 student" : 
                                    !letterUrl ? `Official letter missing (ID: ${selectedAppId})` : 
                                    "Send for review"
                                }
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Send for Review
                            </Button>
                        );
                    })()}
                    <Button 
                        onClick={() => { resetForm(); setShowAddDialog(true); }} 
                        disabled={!selectedAppId || selectedApp?.status !== "PENDING"}
                        title={selectedApp?.status !== "PENDING" && selectedAppId ? "Can only add students to Draft batches" : ""}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </div>
            </div>
            
            {/* Debug info to help identify why the button is grayed out */}
            <div className="bg-muted/30 p-2 rounded text-[10px] text-muted-foreground flex gap-4">
                <span>Students Added: <strong>{students.length}</strong></span>
                <span>Active Batch: <strong>{selectedApp?.name || selectedAppId || 'None'}</strong></span>
                <span>Letter Uploaded: <strong>{!!(selectedApp?.officialLetterUrl || (selectedApp as any)?.official_letter_url) ? 'YES' : 'NO'}</strong></span>
                <span>Batch Status: <strong>{selectedApp?.status || 'Unknown'}</strong></span>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 items-center gap-4">
                            <div className="w-full max-w-sm">
                                <Label htmlFor="app-select" className="sr-only">Select Application</Label>
                                <Select value={selectedAppId || ""} onValueChange={setSelectedAppId}>
                                    <SelectTrigger id="app-select">
                                        <SelectValue placeholder="Select an application batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {applications.map((app) => (
                                            <SelectItem key={app.id} value={app.id}>
                                                {app.name} ({app.academicYear})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search students..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {!selectedAppId ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold">No Application Selected</h3>
                            <p className="text-muted-foreground">Please select an application batch to view and manage students.</p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold">No Students Found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery || statusFilter !== "ALL"
                                    ? "Try adjusting your search or filters."
                                    : "No students have been added to this application yet."}
                            </p>
                        </div>
                    ) : (
                        <Card className="shadow-none">
                            <CardContent className="p-0">
                                <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Field of Study</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{student.firstName} {student.lastName}</span>
                                                    <span className="text-xs text-muted-foreground">{student.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                                            <TableCell>{student.fieldOfStudy}</TableCell>
                                            <TableCell>{student.academicYear}</TableCell>
                                            <TableCell>{getStatusBadge(student.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedStudent(student); setShowViewDialog(true); }}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(student)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setSelectedStudent(student); setShowDeleteDialog(true); }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setShowEditDialog(false); resetForm(); } }}>
                <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{showAddDialog ? "Add New Student" : "Edit Student"}</DialogTitle>
                        <DialogDescription>
                            {showAddDialog
                                ? "Enter student details and upload necessary documents for the application."
                                : "Update student profile and documents."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="studentId">Student ID *</Label>
                                <Input id="studentId" value={formData.studentId} disabled={showEditDialog} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                                <Input id="fieldOfStudy" value={formData.fieldOfStudy} onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="academicYear">Academic Year *</Label>
                                <Select 
                                    value={formData.academicYear} 
                                    onValueChange={(val) => setFormData({ ...formData, academicYear: val })}
                                >
                                    <SelectTrigger id="academicYear">
                                        <SelectValue placeholder="Select academic year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAcademicYears().map(year => (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            <p className="text-xs text-muted-foreground">Optional — international format recommended, max 20 characters</p>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-4">Required Documents</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" />
                                        CV
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            className="text-xs"
                                            accept=".pdf"
                                            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" />
                                        Transcript
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            className="text-xs"
                                            accept=".pdf"
                                            onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowAddDialog(false); setShowEditDialog(false); resetForm(); }}>Cancel</Button>
                        <Button
                            onClick={showAddDialog ? handleAddStudent : handleUpdateStudent}
                            disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.studentId || !formData.fieldOfStudy || !formData.academicYear}
                        >
                            {isSubmitting ? "Processing..." : (showAddDialog ? "Add Student" : "Save Changes")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                        <DialogDescription>Full profile for {selectedStudent?.firstName} {selectedStudent?.lastName}</DialogDescription>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                <div className="text-muted-foreground">Student ID:</div>
                                <div className="font-mono">{selectedStudent.studentId}</div>
                                <div className="text-muted-foreground">Email:</div>
                                <div>{selectedStudent.email || "N/A"}</div>
                                <div className="text-muted-foreground">Phone:</div>
                                <div>{selectedStudent.phone || "N/A"}</div>
                                <div className="text-muted-foreground">Field:</div>
                                <div>{selectedStudent.fieldOfStudy}</div>
                                <div className="text-muted-foreground">Year:</div>
                                <div>{selectedStudent.academicYear}</div>
                                <div className="text-muted-foreground">Status:</div>
                                <div>{getStatusBadge(selectedStudent.status)}</div>
                            </div>
                            {selectedStudent.status === 'REJECTED' && selectedStudent.rejectionReason && (
                                <Card className="bg-destructive/5 border-destructive/20 shadow-none">
                                    <CardHeader className="p-3 pb-0 text-destructive">
                                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                                            <XCircle className="h-3 w-3" />
                                            Rejection Reason
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-1">
                                        <p className="text-xs text-destructive/80 italic">
                                            "{selectedStudent.rejectionReason}"
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Student</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong> from this application?
                            This will also delete their associated documents.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                        <Button variant="destructive" disabled={isSubmitting} onClick={handleDeleteStudent}>
                            {isSubmitting ? "Deleting..." : "Delete Permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}