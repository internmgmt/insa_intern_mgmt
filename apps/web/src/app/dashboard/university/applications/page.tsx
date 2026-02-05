"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, FileText, Upload, Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle, Eye, Send, Edit, Trash2, Download, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth-provider";
import { useSearchParams } from "next/navigation";
import { createApplicationFull, listApplications, submitApplication, updateApplication } from "@/lib/services/applications";
import { uploadDocument } from "@/lib/services/documents";
import { toast } from "sonner";

type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";

interface Application {
    id: string;
    name?: string;
    academicYear: string;
    status: ApplicationStatus;
    studentCount: number;
    createdAt: string;
    submittedAt?: string;
    officialLetterUrl?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    rejectionReason?: string;
}

export default function ApplicationsPage() {
    const { token, user } = useAuth();
    const searchParams = useSearchParams();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewAppDialog, setShowNewAppDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    useEffect(() => {
        if (searchParams.get("new") === "true") {
            setShowNewAppDialog(true);
        }
    }, [searchParams]);

    const [formData, setFormData] = useState({
        academicYear: "",
        name: "",
        studentCount: 0,
        notes: "",
    });
    const [officialLetterFile, setOfficialLetterFile] = useState<File | null>(null);

    useEffect(() => {
        if (!token) return;
        if (!(["ADMIN", "UNIVERSITY"].includes(user?.role || ""))) return;
        fetchApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, user?.role]);

    async function fetchApplications() {
        try {
            setLoading(true);
            const res = await listApplications({ page: 1, limit: 20 }, token || undefined);
            const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
            setApplications(items as Application[]);
        } catch (error: any) {
            toast.error(error?.message || "Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    }

    const getStatusConfig = (status: ApplicationStatus) => {
        const configs = {
            PENDING: { variant: "warning" as const, icon: Clock, label: "Pending", description: "Draft - Not yet submitted" },
            UNDER_REVIEW: { variant: "secondary" as const, icon: AlertCircle, label: "Under Review", description: "Submitted for admin review" },
            APPROVED: { variant: "success" as const, icon: CheckCircle, label: "Approved", description: "Application accepted" },
            REJECTED: { variant: "destructive" as const, icon: XCircle, label: "Rejected", description: "Application declined" },
            ARCHIVED: { variant: "outline" as const, icon: FileText, label: "Archived", description: "Application archived" },
        };
        return configs[status] || configs.PENDING;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleCreateApplication = async () => {
        if (!token) { toast.error("You must be logged in to create an application"); return; }
        if (user?.role !== "UNIVERSITY") { toast.error("Only university accounts can create applications"); return; }
        if (!user?.university?.id) { toast.error("Your account is not linked to a university. Please contact an admin."); return; }
        if (!formData.academicYear) { toast.error("Academic year is required"); return; }
            if (!formData.name) { toast.error("Application name is required"); return; }
        if (!officialLetterFile) { toast.error("Official letter file is required"); return; }

        try {
            let uploadRes;
            try {
                uploadRes = await uploadDocument(officialLetterFile, { type: "OFFICIAL_LETTER", title: `Official Letter - ${formData.academicYear}` }, token || undefined);
            } catch (uploadErr: any) {
                toast.error(`Upload failed: ${uploadErr?.message || "Unknown error"}`);
                return;
            }
            const fileUrl = uploadRes.data.fileUrl;

            try {
                await createApplicationFull({ name: formData.name, academicYear: formData.academicYear, universityId: user.university.id, officialLetterUrl: fileUrl, students: [] }, token || undefined);
            } catch (createErr: any) {
                const status = createErr?.status ?? createErr?.code;
                if (status === 400) { toast.error("Creation failed: Backend rejected the request. Please ensure all data is valid."); return; }
                throw createErr;
            }

            toast.success("Application created");
            await fetchApplications();
            setShowNewAppDialog(false);
            resetForm();
        } catch (error: any) {
            const status = error?.status ?? error?.code;
            if (status === 403) { toast.error("Forbidden: ensure you are logged in as a university and your account is linked to a university"); }
            else { toast.error(error?.message || "Failed to complete application process"); }
        }
    };

    const handleViewApplication = (app: Application) => { setSelectedApp(app); setShowViewDialog(true); };
    const handleEditClick = (app: Application) => { setSelectedApp(app); setFormData({ name: (app as any).name || '', academicYear: app.academicYear, studentCount: app.studentCount, notes: app.reviewNotes || "" }); setShowEditDialog(true); };

    const handleUpdateApplication = async () => {
        if (!selectedApp) return;
        if (!formData.name) { toast.error("Application name is required"); return; }
        try {
            let officialLetterUrl: string | undefined;
            if (officialLetterFile) {
                const up = await uploadDocument(officialLetterFile, { documentType: "OFFICIAL_LETTER", entityType: "APPLICATION", entityId: selectedApp.id, applicationId: selectedApp.id, title: `Official Letter - ${formData.academicYear}` }, token || undefined);
                officialLetterUrl = up.data.fileUrl;
            }
            await updateApplication(selectedApp.id, { name: formData.name, academicYear: formData.academicYear, ...(officialLetterUrl ? { officialLetterUrl } : {}) }, token || undefined);
            toast.success("Application updated");
            fetchApplications();
            setShowEditDialog(false);
            resetForm();
        } catch (error: any) {
            toast.error(error?.message || "Failed to update application");
        }
    };

    const handleDeleteClick = (app: Application) => { setSelectedApp(app); setShowDeleteDialog(true); };
    const handleDeleteApplication = async () => {
        if (!selectedApp || !token) return;
        try {
            const { deleteApplication } = await import("@/lib/services/applications");
            await deleteApplication(selectedApp.id, token);
            toast.success("Application archived successfully");
            fetchApplications();
            setShowDeleteDialog(false);
        } catch (error: any) {
            toast.error(error?.message || "Failed to archive application");
        }
    };

    const handleSubmitForReview = async (app: Application) => {
        const canSubmit = app.status === "PENDING" && !!app.officialLetterUrl && app.studentCount > 0;
        if (!canSubmit) { toast.error("Cannot submit: ensure status PENDING, at least 1 student, and official letter uploaded."); return; }
        try { await submitApplication(app.id, token || undefined); toast.success("Application submitted"); fetchApplications(); }
        catch (error: any) { toast.error(error?.message || "Failed to submit application"); }
    };

    const resetForm = () => { setFormData({ academicYear: "", name: "", studentCount: 0, notes: "" }); setOfficialLetterFile(null); setSelectedApp(null); };

    const filteredApplications = applications.filter(app => selectedStatus === "ALL" || app.status === selectedStatus);
    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === "PENDING").length,
        underReview: applications.filter(a => a.status === "UNDER_REVIEW").length,
        approved: applications.filter(a => a.status === "APPROVED").length,
        rejected: applications.filter(a => a.status === "REJECTED").length,
        archived: applications.filter(a => a.status === "ARCHIVED").length,
    };

    return (
        <div className="space-y-8 px-4">
            <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                            University Dashboard
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight">Application Management</h1>
                        <p className="text-muted-foreground text-sm mt-1">Create, track, and modify batches of student internship requests</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button onClick={() => setShowNewAppDialog(true)} size="lg" className="gap-2" disabled={!token || (user?.role !== "UNIVERSITY")}> 
                            <Plus className="h-5 w-5" /> New Application
                        </Button>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-l-4 border-l-foreground/70 bg-background/70 shadow-sm"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Total</p><p className="text-2xl font-bold mt-1">{stats.total}</p></div><FileText className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
                    <Card className="border-l-4 border-l-warning cursor-pointer bg-background/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => setSelectedStatus("PENDING")}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Pending</p><p className="text-2xl font-bold mt-1">{stats.pending}</p></div><Clock className="h-8 w-8 text-warning" /></div></CardContent></Card>
                    <Card className="border-l-4 border-l-secondary cursor-pointer bg-background/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => setSelectedStatus("UNDER_REVIEW")}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Under Review</p><p className="text-2xl font-bold mt-1">{stats.underReview}</p></div><AlertCircle className="h-8 w-8 text-secondary" /></div></CardContent></Card>
                    <Card className="border-l-4 border-l-success cursor-pointer bg-background/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => setSelectedStatus("APPROVED")}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Approved</p><p className="text-2xl font-bold mt-1">{stats.approved}</p></div><CheckCircle className="h-8 w-8 text-success" /></div></CardContent></Card>
                    <Card className="border-l-4 border-l-destructive cursor-pointer bg-background/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => setSelectedStatus("REJECTED")}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Rejected</p><p className="text-2xl font-bold mt-1">{stats.rejected}</p></div><XCircle className="h-8 w-8 text-destructive" /></div></CardContent></Card>
                </div>
            </div>

            <Card className="border-dashed">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <Filter className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="status-filter" className="font-medium">Filter by Status:</Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger id="status-filter" className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Applications</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedStatus !== "ALL" && (
                            <Button variant="ghost" size="sm" onClick={() => setSelectedStatus("ALL")}>Clear Filter</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center justify-between">
                        <span>Applications</span>
                        <Badge variant="outline" className="text-xs">{filteredApplications.length} total</Badge>
                    </CardTitle>
                    <CardDescription>{selectedStatus === "ALL" ? "All your internship applications" : `Applications with status: ${getStatusConfig(selectedStatus as ApplicationStatus).label}`}</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="space-y-3">
                        {filteredApplications.length === 0 ? (
                            <div className="text-center py-12"><FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-lg font-medium text-muted-foreground">No applications found</p><p className="text-sm text-muted-foreground mt-1">{selectedStatus === "ALL" ? "Create your first application to get started" : "No applications match the selected filter"}</p></div>
                        ) : (
                            filteredApplications.map((app) => {
                                const statusConfig = getStatusConfig(app.status);
                                const StatusIcon = statusConfig.icon;
                                const canEdit = app.status === "PENDING";
                                const canSubmit = app.status === "PENDING" && app.officialLetterUrl;
                                return (
                                    <div key={app.id} className="flex flex-col gap-4 rounded-xl border bg-background/60 p-5 transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`p-4 rounded-xl bg-gradient-to-br from-${statusConfig.variant}/20 to-${statusConfig.variant}/10 shadow-sm`}>
                                                <StatusIcon className={`h-6 w-6 text-${statusConfig.variant}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold">{(app as any).name || 'Untitled Application'}</h3>
                                                    <Badge variant={statusConfig.variant} className="gap-1.5 font-bold text-[10px] uppercase tracking-wider"><StatusIcon className="h-3 w-3" />{statusConfig.label}</Badge>
                                                </div>
                                                <p className="text-muted-foreground font-mono text-[10px] mb-3">{app.id}</p>
                                                <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                                                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>Academic Year: <span className="font-medium text-foreground">{app.academicYear}</span></span></div>
                                                    <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /><span>{app.studentCount} students</span></div>
                                                    <div className="text-muted-foreground">Created: {formatDate(app.createdAt)}</div>
                                                    {app.submittedAt && (<div className="text-muted-foreground">Submitted: {formatDate(app.submittedAt)}</div>)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {app.officialLetterUrl && (<a href={app.officialLetterUrl} target="_blank" rel="noopener noreferrer" title="Download Official Letter"><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></a>)}
                                            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleViewApplication(app)}><Eye className="h-4 w-4" />View</Button>
                                            {canEdit && (<>
                                                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleEditClick(app)}><Edit className="h-4 w-4" />Edit</Button>
                                                {canSubmit && (<Button variant="default" size="sm" className="gap-2" onClick={() => handleSubmitForReview(app)}><Send className="h-4 w-4" />Submit</Button>)}
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(app)} title="Archive Application"><Trash2 className="h-4 w-4" /></Button>
                                            </>)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showNewAppDialog} onOpenChange={setShowNewAppDialog}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader><DialogTitle>Create New Application</DialogTitle><DialogDescription>Start a new internship application batch. You'll be able to add students after creation.</DialogDescription></DialogHeader>
                        <div className="space-y-4 py-2">
                        <div className="space-y-2"><Label htmlFor="app-name" className="text-xs uppercase font-bold text-muted-foreground">Application Name *</Label><Input id="app-name" placeholder="e.g., Software Engineering Batch 2025" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); }} required /></div>
                        <div className="space-y-2"><Label htmlFor="academic-year" className="text-xs uppercase font-bold text-muted-foreground">Academic Year *</Label><Input id="academic-year" placeholder="2025/2026" value={formData.academicYear} onChange={(e) => { setFormData({ ...formData, academicYear: e.target.value }); }} /></div>
                        <div className="space-y-2"><Label htmlFor="official-letter" className="text-xs uppercase font-bold text-muted-foreground">Official Letter</Label>
                            <div className="border-2 border-dashed rounded-xl p-4 text-center hover:bg-muted/30 transition-colors">
                                <input id="official-letter" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setOfficialLetterFile(e.target.files?.[0] || null)} />
                                <label htmlFor="official-letter" className="cursor-pointer">
                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    {officialLetterFile ? (
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{officialLetterFile.name}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">Click to change</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Click to upload official letter</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">PDF, DOC up to 10MB</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => { setShowNewAppDialog(false); resetForm(); }}>Cancel</Button><Button onClick={handleCreateApplication} disabled={!formData.name || !formData.academicYear || !officialLetterFile}>Create Application</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Edit: {selectedApp?.name}</DialogTitle><DialogDescription>Application ID: {selectedApp?.id}</DialogDescription></DialogHeader>
                        <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label htmlFor="edit-name">Name *</Label><Input id="edit-name" placeholder="e.g., Fall Internship Batch 2024" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /><p className="text-xs text-muted-foreground">Short name to identify this application</p></div>
                        <div className="space-y-2"><Label htmlFor="edit-academic-year">Academic Year *</Label><Input id="edit-academic-year" placeholder="e.g., 2024/2025" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} /></div>
                        <div className="space-y-2"><Label htmlFor="edit-notes">Notes</Label><Textarea id="edit-notes" placeholder="Add any notes or comments..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={4} /></div>
                        <div className="space-y-2"><Label htmlFor="edit-letter">Update Official Letter</Label><Card><CardContent className="p-6 text-center"><input id="edit-letter" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setOfficialLetterFile(e.target.files?.[0] || null)} /><label htmlFor="edit-letter" className="cursor-pointer"><Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />{officialLetterFile ? (<p className="text-sm font-medium">{officialLetterFile.name}</p>) : selectedApp?.officialLetterUrl ? (<p className="text-sm text-muted-foreground">Current file: {selectedApp.officialLetterUrl.split('/').pop()}</p>) : (<p className="text-sm text-muted-foreground">Click to upload</p>)}</label></CardContent></Card></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>Cancel</Button><Button onClick={handleUpdateApplication} disabled={!formData.name}>Save Changes</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>{selectedApp?.name}</DialogTitle><DialogDescription>Application ID: {selectedApp?.id}</DialogDescription></DialogHeader>
                    {selectedApp && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <p className="font-medium mt-1">{selectedApp.name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1"><Badge variant={getStatusConfig(selectedApp.status).variant}>{getStatusConfig(selectedApp.status).label}</Badge></div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Application ID</Label>
                                    <p className="font-medium mt-1 font-mono text-xs">{selectedApp.id}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Academic Year</Label>
                                    <p className="font-medium mt-1">{selectedApp.academicYear}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Student Count</Label>
                                    <p className="font-medium mt-1">{selectedApp.studentCount}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Created At</Label>
                                    <p className="font-medium mt-1">{formatDate(selectedApp.createdAt)}</p>
                                </div>
                                {selectedApp.submittedAt && (
                                    <div>
                                        <Label className="text-muted-foreground">Submitted At</Label>
                                        <p className="font-medium mt-1">{formatDate(selectedApp.submittedAt)}</p>
                                    </div>
                                )}
                                {selectedApp.reviewedAt && (
                                    <div>
                                        <Label className="text-muted-foreground">Reviewed At</Label>
                                        <p className="font-medium mt-1">{formatDate(selectedApp.reviewedAt)}</p>
                                    </div>
                                )}
                            </div>
                            {selectedApp.officialLetterUrl && (
                                <div>
                                    <Label className="text-muted-foreground">Official Letter</Label>
                                    <div className="mt-2"><a href={selectedApp.officialLetterUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">View / Download</a></div>
                                </div>
                            )}
                            {selectedApp.reviewNotes && (
                                <div>
                                    <Label className="text-muted-foreground">Review Notes</Label>
                                    <p className="text-sm mt-1">{selectedApp.reviewNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
                        {selectedApp?.status === 'PENDING' && (
                            <Button
                                className="gap-2"
                                onClick={() => {
                                    setShowViewDialog(false);
                                    handleSubmitForReview(selectedApp);
                                }}
                                disabled={!selectedApp.officialLetterUrl || selectedApp.studentCount === 0}
                            >
                                <Send className="h-4 w-4" />
                                Submit for Review
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Archive Application</DialogTitle><DialogDescription>This will archive the application named "{selectedApp?.name}". You can restore it later by contacting an admin.</DialogDescription></DialogHeader>
                    <div className="py-2"><p className="text-sm">Application ID: {selectedApp?.id}</p></div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteApplication}>Archive</Button></DialogFooter>
                </DialogContent>
                </Dialog>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="status-filter" className="font-medium">Filter by Status:</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger id="status-filter" className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Applications</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        {selectedStatus !== "ALL" && (
                            <Button variant="ghost" size="sm" onClick={() => setSelectedStatus("ALL")}>
                                Clear Filter
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Applications List */}
            <Card>
                <CardHeader>
                    <CardTitle>Applications ({filteredApplications.length})</CardTitle>
                    <CardDescription>
                        {selectedStatus === "ALL"
                            ? "All your internship applications"
                            : `Applications with status: ${getStatusConfig(selectedStatus as ApplicationStatus).label}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredApplications.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium text-muted-foreground">No applications found</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedStatus === "ALL"
                                        ? "Create your first application to get started"
                                        : "No applications match the selected filter"}
                                </p>
                            </div>
                        ) : (
                            filteredApplications.map((app) => {
                                const statusConfig = getStatusConfig(app.status);
                                const StatusIcon = statusConfig.icon;
                                const canEdit = app.status === "PENDING";
                                const canSubmit = app.status === "PENDING" && app.officialLetterUrl;

                                return (
                                    <div
                                        key={app.id}
                                        className="flex items-center justify-between p-5 border rounded-lg hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`p-4 rounded-lg bg-gradient-to-br from-${statusConfig.variant}/20 to-${statusConfig.variant}/10`}>
                                                <StatusIcon className={`h-6 w-6 text-${statusConfig.variant}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold">{app.id}</h3>
                                                    <Badge variant={statusConfig.variant} className="gap-1.5">
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Academic Year: <span className="font-medium text-foreground">{app.academicYear}</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Users className="h-4 w-4" />
                                                        <span>{app.studentCount} students</span>
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        Created: {formatDate(app.createdAt)}
                                                    </div>
                                                    {app.submittedAt && (
                                                        <div className="text-muted-foreground">
                                                            Submitted: {formatDate(app.submittedAt)}
                                                        </div>
                                                    )}
                                                </div>
                                                {app.status === "REJECTED" && app.rejectionReason && (
                                                    <Card className="mt-4 bg-destructive/5 border-destructive/20 shadow-none">
                                                        <CardHeader className="p-3 pb-0 text-destructive">
                                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                                <XCircle className="h-4 w-4" />
                                                                Rejection Reason
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="p-3 pt-1">
                                                            <p className="text-sm text-destructive/80 italic">
                                                                "{app.rejectionReason}"
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            {app.officialLetterUrl && (
                                                <Button variant="ghost" size="sm" title="Download Official Letter">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => handleViewApplication(app)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                            {canEdit && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => handleEditClick(app)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    {canSubmit && (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="gap-2"
                                                            onClick={() => handleSubmitForReview(app)}
                                                        >
                                                            <Send className="h-4 w-4" />
                                                            Submit
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteClick(app)}
                                                        title="Archive Application"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            

            {/* Edit Application Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Application</DialogTitle>
                        <DialogDescription>
                            Update application details. Application ID: {selectedApp?.id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-academic-year">Academic Year *</Label>
                            <Input
                                id="edit-academic-year"
                                placeholder="e.g., 2024/2025"
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                placeholder="Add any notes or comments..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-letter">Update Official Letter</Label>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <input
                                        id="edit-letter"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={(e) => setOfficialLetterFile(e.target.files?.[0] || null)}
                                    />
                                    <label htmlFor="edit-letter" className="cursor-pointer">
                                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                        {officialLetterFile ? (
                                            <p className="text-sm font-medium">{officialLetterFile.name}</p>
                                        ) : selectedApp?.officialLetterUrl ? (
                                            <p className="text-sm text-muted-foreground">Current file: {selectedApp.officialLetterUrl.split('/').pop()}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Click to upload</p>
                                        )}
                                    </label>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowEditDialog(false);
                            resetForm();
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateApplication}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Application Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Application Details</DialogTitle>
                        <DialogDescription>
                            Complete information for {selectedApp?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedApp && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Application ID</Label>
                                    <p className="font-medium mt-1">{selectedApp.id}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant={getStatusConfig(selectedApp.status).variant}>
                                            {getStatusConfig(selectedApp.status).label}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Academic Year</Label>
                                    <p className="font-medium mt-1">{selectedApp.academicYear}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Student Count</Label>
                                    <p className="font-medium mt-1">{selectedApp.studentCount}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Created At</Label>
                                    <p className="font-medium mt-1">{formatDate(selectedApp.createdAt)}</p>
                                </div>
                                {selectedApp.submittedAt && (
                                    <div>
                                        <Label className="text-muted-foreground">Submitted At</Label>
                                        <p className="font-medium mt-1">{formatDate(selectedApp.submittedAt)}</p>
                                    </div>
                                )}
                                {selectedApp.reviewedAt && (
                                    <div>
                                        <Label className="text-muted-foreground">Reviewed At</Label>
                                        <p className="font-medium mt-1">{formatDate(selectedApp.reviewedAt)}</p>
                                    </div>
                                )}
                            </div>
                            {selectedApp.officialLetterUrl && (
                                <div>
                                    <Label className="text-muted-foreground">Official Letter</Label>
                                    <div className="mt-2">
                                        <a href={selectedApp.officialLetterUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">View / Download</a>
                                    </div>
                                </div>
                            )}
                            {selectedApp.reviewNotes && (
                                <div>
                                    <Label className="text-muted-foreground">Review Notes</Label>
                                    <p className="text-sm mt-1">{selectedApp.reviewNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter><Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Archive Application</DialogTitle><DialogDescription>This will archive the application. You can restore it later by contacting an admin.</DialogDescription></DialogHeader>
                    <div className="py-2"><p className="text-sm">Application ID: {selectedApp?.id}</p></div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteApplication}>Archive</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
