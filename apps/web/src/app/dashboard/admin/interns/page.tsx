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
    GraduationCap,
    UserPlus,
    Search,
    Filter,
    Pencil,
    Eye,
    Calendar,
    Briefcase,
    Activity,
    CheckCircle,
    XCircle,
    Building2,
    Users,
    RotateCcw,
    ClipboardList,
    Pause,
    Play
} from "lucide-react";

import { Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
    createIntern,
    completeInternship,
    terminateInternship,
    suspendIntern,
    unsuspendIntern,
    listInterns
} from "@/lib/services/interns";
import { deleteIntern } from "@/lib/services/interns";
import { listStudents } from "@/lib/services/students";
import { listUniversities } from "@/lib/services/universities";
import { listApplications } from "@/lib/services/applications";
import { toast } from "sonner";

export default function AdminInternsPage() {
    const { token, user } = useAuth();
    const searchParams = useSearchParams();
    const studentIdParam = searchParams.get("studentId");

    // Data State
    const [interns, setInterns] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedUniId, setSelectedUniId] = useState<string>("ALL");
    const [selectedBatch, setSelectedBatch] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog States
    const [showAddDialog, setShowAddDialog] = useState(!!studentIdParam);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [selectedIntern, setSelectedIntern] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    // Form State
    const [newInternData, setNewInternData] = useState({
        studentId: studentIdParam || "",
        supervisor: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
    });

    const [statusAction, setStatusAction] = useState<"COMPLETE" | "TERMINATE" | "SUSPEND" | null>(null);
    const [statusData, setStatusData] = useState({
        finalEvaluation: 85,
        notes: "",
        reason: ""
    });

    // Helper to render text/objects
    function renderText(v: any): string {
        if (v === null || v === undefined) return '—';
        if (typeof v === 'string' || typeof v === 'number') return String(v);
        if (typeof v === 'object') {
            return v.name || `${v.firstName || ''} ${v.lastName || ''}`.trim() || String(v.id || '—');
        }
        return String(v);
    }

    // Init
    useEffect(() => {
        if (!token) return;
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Defensive: sometimes bundling or a hot-reload can leave imports undefined at runtime.
            // Attempt to use the static import if available; otherwise dynamically import the service.
            const getListInterns = async () => {
                if (typeof listInterns === 'function') return listInterns;
                const mod = await import('@/lib/services/interns');
                return mod.listInterns;
            };

            const listInternsFn = await getListInterns();

            const promises: Promise<any>[] = [
                listInternsFn({ limit: 50 }, token || undefined),
                listUniversities({ limit: 50 }, token || undefined),
                listApplications({ limit: 50 }, token || undefined),
            ];

            // Only call the students endpoint if the current user is ADMIN to avoid 403 for other roles
            let studentsResult: any = null;
            if (user?.role === 'ADMIN') {
                promises.splice(1, 0, listStudents({ status: 'ACCEPTED', limit: 50 }, token || undefined));
            }

            const results = await Promise.all(promises);

            // results ordering: [interns, students? (if admin), universities, applications] or [interns, universities, applications]
            let idx = 0;
            const intRes = results[idx++];
            if (user?.role === 'ADMIN') {
                studentsResult = results[idx++];
            }
            const uniRes = results[idx++];
            const appRes = results[idx++];

            setInterns((intRes as any).data.items || []);
            setStudents((studentsResult as any)?.data?.items || []);
            setUniversities((uniRes as any).data.items || []);
            setApplications((appRes as any).data.items || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const academicYears = useMemo(() => {
        const years = new Set(applications.map(a => a.academicYear));
        if (years.size === 0) { years.add("2024/2025"); years.add("2025/2026"); }
        return Array.from(years).sort();
    }, [applications]);

    const handleAddIntern = async () => {
        if (!newInternData.studentId) return;
        try {
            setIsSubmitting(true);
            await createIntern({ studentId: newInternData.studentId }, token || undefined);
            toast.success('Intern record created');
            setShowAddDialog(false);
            setNewInternData({ studentId: "", supervisor: "", startDate: new Date().toISOString().split('T')[0], endDate: "" });
            fetchData();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create intern');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedIntern || !statusAction) return;
        try {
            setIsSubmitting(true);
            if (statusAction === "COMPLETE") {
                await completeInternship(selectedIntern.id, {
                    finalEvaluation: statusData.finalEvaluation,
                    completionNotes: statusData.notes
                }, token || undefined);
                toast.success("Internship marked as COMPLETED");
            } else if (statusAction === "SUSPEND") {
                await suspendIntern(selectedIntern.id, {
                    reason: statusData.reason
                }, token || undefined);
                toast.warning("Internship SUSPENDED");
            } else {
                await terminateInternship(selectedIntern.id, {
                    reason: statusData.reason
                }, token || undefined);
                toast.error("Internship TERMINATED");
            }
            setShowStatusDialog(false);
            fetchData();
        } catch (error: any) {
            toast.error(error?.message || "Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnsuspend = async (id: string) => {
        try {
            await unsuspendIntern(id, token || undefined);
            toast.success("Internship UNSUSPENDED");
            fetchData();
        } catch (error: any) {
            toast.error(error?.message || "Failed to unsuspend intern");
        }
    };

    const handleDelete = async () => {
        if (!selectedIntern) return;
        if (deleteConfirmText.trim() !== "DELETE") return toast.error("Type DELETE to confirm");
        try {
            setIsSubmitting(true);
            await deleteIntern(selectedIntern.id, token || undefined);
            toast.success("Intern deleted");
            setShowDeleteDialog(false);
            setDeleteConfirmText("");
            fetchData();
        } catch (err: any) {
            console.error('Delete failed', err);
            toast.error(err?.message || 'Failed to delete intern');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredInterns = useMemo(() => {
        return interns.filter((i: any) => {
            const name = `${i.firstName || ""} ${i.lastName || ""}`.trim() || "Unknown";
            const matchesSearch =
                name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (i.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            const matchesUni = selectedUniId === "ALL" || i.universityId === selectedUniId;
            const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;

            // Batch filter based on student's academic year if available
            let matchesBatch = true;
            if (selectedBatch !== "ALL") {
                const studentBatch = i.studentAcademicYear ?? null;
                matchesBatch = studentBatch === selectedBatch;
            }

            return matchesSearch && matchesUni && matchesStatus && matchesBatch;
        });
    }, [interns, searchQuery, selectedUniId, statusFilter, selectedBatch]);

    const stats = useMemo(() => [
        { label: "Active Interns", value: interns.filter(i => i.status === 'ACTIVE').length, icon: Activity, color: "text-primary" },
        { label: "Completed", value: interns.filter(i => i.status === 'COMPLETED').length, icon: CheckCircle, color: "text-success" },
        { label: "Terminated", value: interns.filter(i => i.status === 'TERMINATED').length, icon: XCircle, color: "text-destructive" },
        { label: "Total Managed", value: interns.length, icon: Users, color: "text-muted-foreground" },
    ], [interns]);

    const getStatusBadge = (intern: any) => {
        if (intern.isSuspended) {
            return (
                <div className="flex flex-col gap-1">
                    <Badge variant="warning" className="animate-pulse">Suspended</Badge>
                    <span className="text-[8px] text-muted-foreground truncate max-w-[100px]" title={intern.suspensionReason}>
                        {intern.suspensionReason}
                    </span>
                </div>
            );
        }
        switch (intern.status) {
            case "ACTIVE": return <Badge variant="success">Active</Badge>;
            case "COMPLETED": return <Badge variant="secondary">Completed</Badge>;
            case "TERMINATED": return <Badge variant="destructive">Terminated</Badge>;
            default: return <Badge variant="outline">{intern.status}</Badge>;
        }
    };

    const resetFilters = () => {
        setSelectedUniId("ALL");
        setSelectedBatch("ALL");
        setStatusFilter("ALL");
        setSearchQuery("");
    };

    return (
        <div className="space-y-10 px-4 py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Internship Management</h1>
                    <p className="text-muted-foreground text-lg">Monitor and manage all active internship programs.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Filters
                    </Button>
                    <Button size="sm" onClick={() => setShowAddDialog(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Intern
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="overflow-hidden border-none shadow-md bg-muted/20">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2 rounded-lg bg-white shadow-sm ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search interns..."
                                    className="pl-8 h-9 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredInterns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <Briefcase className="h-12 w-12 mb-4 opacity-20" />
                            <p className="font-medium">No intern records found.</p>
                            <p className="text-xs">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="font-bold text-[10px] uppercase">Intern</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">University</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Supervisor</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Timeline</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                                        <TableHead className="text-right font-bold text-[10px] uppercase">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInterns.map((intern: any) => {
                                        const name = `${intern.firstName || ""} ${intern.lastName || ""}`.trim() || "Unknown";
                                        const initials = name
                                            .split(' ')
                                            .map((n: string) => (n && n[0]) ? n[0] : '')
                                            .join('')
                                            .toUpperCase()
                                            .substring(0, 2) || "??";
                                        return (
                                            <TableRow key={intern.id} className="group hover:bg-muted/10 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                                            {initials}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">{name}</span>
                                                            <span className="text-[10px] text-muted-foreground">{intern.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground">{universities.find(u => u.id === intern.universityId)?.name || intern.university?.name || "—"}</span>
                                                        <span className="text-[10px] text-primary/80 font-medium">{(intern as any).applicationName || 'Untitled Application'}</span>
                                                        <span className="text-[8px] text-muted-foreground uppercase">{intern.studentAcademicYear || '—'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {intern.supervisor
                                                            ? `${intern.supervisor.firstName} ${intern.supervisor.lastName}`
                                                            : "Unassigned"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-[10px] text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {intern.startDate ? String(intern.startDate).split('T')[0] : "—"}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span>to</span>
                                                            {intern.endDate ? String(intern.endDate).split('T')[0] : "—"}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(intern)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {intern.status === "ACTIVE" && (
                                                            <>
                                                                {intern.isSuspended ? (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-success hover:bg-success/10"
                                                                        onClick={() => handleUnsuspend(intern.id)}
                                                                        title="Unsuspend"
                                                                    >
                                                                        <Play className="h-4 w-4" />
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-warning hover:bg-warning/10"
                                                                        onClick={() => { setSelectedIntern(intern); setStatusAction("SUSPEND"); setShowStatusDialog(true); }}
                                                                        title="Suspend"
                                                                    >
                                                                        <Pause className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-success hover:bg-success/10"
                                                                    onClick={() => { setSelectedIntern(intern); setStatusAction("COMPLETE"); setShowStatusDialog(true); }}
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                                    onClick={() => { setSelectedIntern(intern); setStatusAction("TERMINATE"); setShowStatusDialog(true); }}
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedIntern(intern); setShowViewDialog(true); }}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 transition-opacity group-hover:opacity-100" onClick={() => { setSelectedIntern(intern); setShowEditDialog(true); }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        {user?.role === 'ADMIN' && (
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => { setSelectedIntern(intern); setShowDeleteDialog(true); }} title="Delete">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Intern Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enroll New Intern</DialogTitle>
                        <DialogDescription>Convert an accepted student into an official intern.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1">
                            <Label className="text-xs">Select Student (Accepted Only)</Label>
                            <Select value={newInternData.studentId} onValueChange={(val) => setNewInternData({ ...newInternData, studentId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select student..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.firstName} {s.lastName} - {universities.find(u => u.id === s.universityId)?.name || 'Uni'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Initial Supervisor (Internal)</Label>
                            <Input placeholder="e.g. Dr. Mengistu" value={newInternData.supervisor} onChange={(e) => setNewInternData({ ...newInternData, supervisor: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">Start Date</Label>
                                <Input type="date" value={newInternData.startDate} onChange={(e) => setNewInternData({ ...newInternData, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">End Date (Estimated)</Label>
                                <Input type="date" value={newInternData.endDate} onChange={(e) => setNewInternData({ ...newInternData, endDate: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleAddIntern} disabled={isSubmitting || !newInternData.studentId}>
                            {isSubmitting ? "Enrolling..." : "Complete Enrollment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Update Dialog (Complete/Terminate) */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className={statusAction === "TERMINATE" ? "text-destructive" : statusAction === "SUSPEND" ? "text-warning" : "text-success"}>
                            {statusAction === "COMPLETE" ? "Complete Internship" : statusAction === "SUSPEND" ? "Suspend Internship" : "Terminate Internship"}
                        </DialogTitle>
                        <DialogDescription>
                            Updating status for {selectedIntern && (typeof (selectedIntern as any).student === 'object' ? `${(selectedIntern as any).student.firstName} ${(selectedIntern as any).student.lastName}` : (selectedIntern.studentName || "Unknown"))}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {statusAction === "COMPLETE" ? (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">Final Evaluation Score (0-100)</Label>
                                    <Input
                                        type="number"
                                        value={statusData.finalEvaluation}
                                        onChange={(e) => setStatusData({ ...statusData, finalEvaluation: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Completion Notes</Label>
                                    <Input
                                        placeholder="Summarize performance..."
                                        value={statusData.notes}
                                        onChange={(e) => setStatusData({ ...statusData, notes: e.target.value })}
                                    />
                                </div>
                            </>
                        ) : statusAction === "SUSPEND" ? (
                            <div className="space-y-1">
                                <Label className="text-xs">Reason for Suspension</Label>
                                <Input
                                    className="border-warning/50"
                                    placeholder="Enter reason for suspension..."
                                    value={statusData.reason}
                                    onChange={(e) => setStatusData({ ...statusData, reason: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <Label className="text-xs">Reason for Termination</Label>
                                <Input
                                    className="border-destructive/50"
                                    placeholder="Enter administrative reason..."
                                    value={statusData.reason}
                                    onChange={(e) => setStatusData({ ...statusData, reason: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
                        <Button
                            variant={statusAction === "TERMINATE" ? "destructive" : "default"}
                            className={statusAction === "SUSPEND" ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
                            size="sm"
                            disabled={isSubmitting || ((statusAction === "TERMINATE" || statusAction === "SUSPEND") && !statusData.reason)}
                            onClick={handleStatusUpdate}
                        >
                            {isSubmitting ? "Updating..." : "Confirm Status Change"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View/Edit Intern Dialog */}
            <Dialog open={showViewDialog || showEditDialog} onOpenChange={(open) => { if (!open) { setShowViewDialog(false); setShowEditDialog(false); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{showEditDialog ? "Edit Intern Details" : "Intern Details"}</DialogTitle>
                    </DialogHeader>
                    {selectedIntern && (
                        <div className="grid gap-4 py-4 text-sm">
                            <div className="grid grid-cols-2 border-b pb-4">
                                <div className="text-muted-foreground">Intern Name:</div>
                                <div className="font-semibold">
                                    {`${(selectedIntern as any).firstName || ""} ${(selectedIntern as any).lastName || ""}`.trim() || "Unknown"}
                                </div>
                                <div className="text-muted-foreground">University:</div>
                                <div>{universities.find(u => u.id === selectedIntern.universityId)?.name || selectedIntern.university?.name || "—"}</div>
                                <div className="text-muted-foreground">Status:</div>
                                <div>{getStatusBadge(selectedIntern.status)}</div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Supervisor</Label>
                                    {showEditDialog ? (
                                        <Input defaultValue={selectedIntern.supervisorName} />
                                    ) : (
                                        <span>{selectedIntern.supervisorName || "Unassigned"}</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Start Date</Label>
                                        {showEditDialog ? (
                                            <Input type="date" defaultValue={selectedIntern.startDate?.split('T')[0]} />
                                        ) : (
                                            <span>{selectedIntern.startDate?.split('T')[0] || "—"}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">End Date</Label>
                                        {showEditDialog ? (
                                            <Input type="date" defaultValue={selectedIntern.endDate?.split('T')[0]} />
                                        ) : (
                                            <span>{selectedIntern.endDate?.split('T')[0] || "—"}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => { setShowViewDialog(false); setShowEditDialog(false); }}>
                            {showEditDialog ? "Cancel" : "Close"}
                        </Button>
                        {showEditDialog && (
                            <Button size="sm" onClick={() => { toast.info("Full intern update coming in next iteration"); setShowEditDialog(false); }}>
                                Save Changes
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Intern Dialog (two-step confirmation) */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Delete Intern</DialogTitle>
                        <DialogDescription>
                            This action will permanently remove the intern record. Type <strong>DELETE</strong> in the box below to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Confirmation</Label>
                            <Input placeholder="Type DELETE to confirm" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(""); }}>Cancel</Button>
                        <Button size="sm" className="text-destructive" onClick={handleDelete} disabled={isSubmitting || deleteConfirmText.trim() !== "DELETE"}>
                            {isSubmitting ? "Deleting..." : "Confirm Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
