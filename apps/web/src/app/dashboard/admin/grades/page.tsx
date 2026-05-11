"use client";

import { useEffect, useMemo, useState, useDeferredValue } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getInternById, listInterns } from "@/lib/services/interns";
import { listSubmissions } from "@/lib/services/submissions";
import { approveInternGrading, rejectInternGrading } from "@/lib/services/interns";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Filter, Search, GraduationCap, Users, CheckCircle2 } from "lucide-react";

export default function AdminGradesPage() {
    const { token } = useAuth();

    const [interns, setInterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearch = useDeferredValue(searchQuery);

    const [gradesDialogOpen, setGradesDialogOpen] = useState(false);
    const [selectedIntern, setSelectedIntern] = useState<any | null>(null);
    const [selectedInternDetail, setSelectedInternDetail] = useState<any | null>(null);
    const [internSubmissions, setInternSubmissions] = useState<any[]>([]);
    const [gradesDialogLoading, setGradesDialogLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            try {
                setLoading(true);
                const res = await listInterns({ limit: 50 }, token);
                if (res.data?.items) {
                    setInterns(res.data.items);
                }
            } catch (error) {
                console.error("Failed to load interns for grades dashboard:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    const handleApprove = async () => {
        if (!token || !selectedIntern) return;
        setIsSubmitting(true);
        try {
            const res = await approveInternGrading(selectedIntern.id, token);
            const updated = (res as any)?.data ?? res;

            // Optimistically update local list instead of refetching
            if (updated?.id) {
                setInterns((prev) =>
                    prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)),
                );
            }

            setGradesDialogOpen(false);
        } catch (error) {
            console.error("Failed to approve grading:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!token || !selectedIntern || !rejectionReason) return;
        setIsSubmitting(true);
        try {
            const res = await rejectInternGrading(selectedIntern.id, rejectionReason, token);
            const updated = (res as any)?.data ?? res;

            if (updated?.id) {
                setInterns((prev) =>
                    prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)),
                );
            }

            setRejectionDialogOpen(false);
            setGradesDialogOpen(false);
        } catch (error) {
            console.error("Failed to reject grading:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredInterns = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const eligible = interns.filter((i) => {
            const endDate = i.endDate ? new Date(i.endDate) : null;
            const isPastEndDate = endDate ? endDate.getTime() < today.getTime() : false;
            const hasFinal = typeof i.finalEvaluation === "number";
            return isPastEndDate && hasFinal;
        });

        return eligible.filter((i) => {
            const fullName = `${i.firstName || ""} ${i.lastName || ""}`.trim() || "Unknown";
            const matchesSearch =
                fullName.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                (i.email?.toLowerCase() || "").includes(deferredSearch.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [interns, deferredSearch, statusFilter]);

    const totalInterns = filteredInterns.length;
    const gradedInterns = filteredInterns.length;
    const completedAwaitingGrade = 0;

    const openGradesDialog = async (intern: any) => {
        if (!token) return;
        setSelectedIntern(intern);
        setGradesDialogOpen(true);
        setGradesDialogLoading(true);
        try {
            const [submissionsRes, detailRes] = await Promise.all([
                listSubmissions({ limit: 200 }, token),
                getInternById(intern.id, token),
            ]);

            const submissionItems = (submissionsRes as any)?.data?.items ?? (submissionsRes as any)?.data ?? [];
            const byIntern = submissionItems.filter((s: any) => s.internId === intern.id && typeof s.score === "number");
            setInternSubmissions(byIntern);

            const detailData = (detailRes as any)?.data ?? detailRes;
            setSelectedInternDetail(detailData);
        } catch (error) {
            console.error("Failed to load grade details:", error);
            setInternSubmissions([]);
            setSelectedInternDetail(null);
        } finally {
            setGradesDialogLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8 px-2 sm:px-4 py-6 sm:py-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Final Grades</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                        Overview of final evaluation scores across all interns.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Interns</p>
                            <p className="text-2xl font-bold mt-1">{totalInterns}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-primary/5 text-primary">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Graded</p>
                            <p className="text-2xl font-bold mt-1">{gradedInterns}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Awaiting Grade</p>
                            <p className="text-2xl font-bold mt-1">{completedAwaitingGrade}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            Grade Records
                        </CardTitle>
                        <p className="text-[11px] text-muted-foreground">
                            Filter by status and search by name or email.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All statuses</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-9 pl-8 text-xs"
                                    placeholder="Search by name or email"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {filteredInterns.length === 0 ? (
                        <div className="py-10 text-center text-xs text-muted-foreground">
                            No interns match the current filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table className="text-xs sm:text-sm">
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="min-w-[180px]">Intern</TableHead>
                                        <TableHead className="min-w-[140px]">Department</TableHead>
                                        <TableHead className="min-w-[120px]">University</TableHead>
                                        <TableHead className="w-[110px]">Status</TableHead>
                                        <TableHead className="w-[120px]">Final Evaluation</TableHead>
                                        <TableHead className="w-[120px]">Grading Status</TableHead>
                                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInterns.map((intern) => {
                                        const fullName = `${intern.firstName || ""} ${intern.lastName || ""}`.trim() || "Unknown";
                                        const finalPercentDisplay =
                                            typeof intern.finalEvaluation === "number"
                                                ? (intern.finalEvaluation * 25).toFixed(1)
                                                : null;

                                        return (
                                            <TableRow key={intern.id} className="hover:bg-muted/40">
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-semibold text-foreground truncate">{fullName}</span>
                                                        <span className="text-[11px] text-muted-foreground truncate">
                                                            {intern.email || "No email"}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/70">
                                                            {intern.internId || "ID Pending"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-foreground/80">
                                                        {intern.department?.name || "—"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-foreground/80">
                                                        {intern.university?.name || "—"}
                                                    </span>
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
                                                        className="text-[10px] px-2 py-0.5"
                                                    >
                                                        {intern.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-semibold text-foreground/90">
                                                        {finalPercentDisplay !== null ? `${finalPercentDisplay} / 100` : "Not set"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            intern.gradingStatus === "APPROVED"
                                                                ? "success"
                                                                : intern.gradingStatus === "REJECTED"
                                                                    ? "destructive"
                                                                    : "outline"
                                                        }
                                                        className="text-[10px] px-2 py-0.5"
                                                    >
                                                        {intern.gradingStatus || "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-[11px] px-1.5 text-primary hover:bg-primary/5"
                                                        onClick={() => openGradesDialog(intern)}
                                                    >
                                                        View Grades
                                                    </Button>
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
            <Dialog open={gradesDialogOpen} onOpenChange={setGradesDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg font-bold">
                            {selectedIntern
                                ? `Grades – ${
                                      `${selectedIntern.firstName || ""} ${selectedIntern.lastName || ""}`.trim() ||
                                      "Unknown"
                                  }`
                                : "Grades"}
                        </DialogTitle>
                    </DialogHeader>
                    {gradesDialogLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 text-xs sm:text-sm">
                            <div className="space-y-2 border rounded-md p-3 bg-muted/40">
                                <h3 className="font-semibold text-foreground flex items-center justify-between">
                                    <span>Mentor Grades</span>
                                    {(() => {
                                        if (!internSubmissions.length) return null;
                                        const total = internSubmissions.reduce(
                                            (acc: number, s: any) => acc + (s.score || 0),
                                            0,
                                        );
                                        const avg = total / internSubmissions.length;
                                        return (
                                            <span className="text-[11px] font-mono text-muted-foreground">
                                                Avg: {avg.toFixed(1)} / 100
                                            </span>
                                        );
                                    })()}
                                </h3>
                                {internSubmissions.length === 0 ? (
                                    <p className="text-[11px] text-muted-foreground">
                                        No scored submissions found for this intern.
                                    </p>
                                ) : (
                                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                                        {internSubmissions.map((s: any) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between border-b last:border-b-0 border-border/40 py-1"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate text-foreground/90">
                                                        {s.title || "Untitled submission"}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {(s.submittedAt || s.createdAt
                                                            ? new Date(s.submittedAt || s.createdAt)
                                                            : null
                                                        )?.toLocaleDateString() || "—"}
                                                    </p>
                                                </div>
                                                <div className="ml-2 text-right">
                                                    <p className="font-mono text-[11px] font-semibold">
                                                        {typeof s.score === "number"
                                                            ? `${s.score.toFixed(1)} / 100`
                                                            : "—"}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                                        {s.status || ""}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 border rounded-md p-3 bg-muted/40">
                                <h3 className="font-semibold text-foreground">Supervisor Evaluation</h3>
                                {selectedIntern ? (() => {
                                    const finalPercent =
                                        typeof selectedIntern.finalEvaluation === "number"
                                            ? selectedIntern.finalEvaluation * 25
                                            : null;

                                    let mentorAvg: number | null = null;
                                    if (internSubmissions.length) {
                                        const total = internSubmissions.reduce(
                                            (acc: number, s: any) => acc + (s.score || 0),
                                            0,
                                        );
                                        mentorAvg = total / internSubmissions.length;
                                    }

                                    const se = (selectedInternDetail as any)?.supervisorEvaluation || {};
                                    const seParts: number[] = [];
                                    if (typeof se.attendance === "number") seParts.push(se.attendance);
                                    if (typeof se.protocol === "number") seParts.push(se.protocol);
                                    if (typeof se.conduct === "number") seParts.push(se.conduct);
                                    if (typeof se.workFinished === "number") seParts.push(se.workFinished);
                                    const supervisorAvg =
                                        seParts.length > 0
                                            ? seParts.reduce((a, b) => a + b, 0) / seParts.length
                                            : null;

                                    return (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground">
                                                    Final score (combined)
                                                </span>
                                                <span className="font-mono text-[12px] font-bold">
                                                    {finalPercent !== null
                                                        ? `${finalPercent.toFixed(1)} / 100`
                                                        : "Not set"}
                                                </span>
                                            </div>
                                            {finalPercent !== null && (
                                                <div className="mt-1.5 space-y-1">
                                                    <p className="text-[11px] font-semibold text-muted-foreground">
                                                        Breakdown
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Mentor average
                                                        </span>
                                                        <span className="font-mono text-[11px]">
                                                            {mentorAvg !== null
                                                                ? `${mentorAvg.toFixed(1)} / 100`
                                                                : "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Supervisor average
                                                        </span>
                                                        <span className="font-mono text-[11px]">
                                                            {supervisorAvg !== null
                                                                ? `${supervisorAvg.toFixed(1)} / 100`
                                                                : "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="pt-1 space-y-0.5">
                                                        <p className="text-[11px] text-muted-foreground">Supervisor breakdown</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] text-muted-foreground">
                                                                Attendance
                                                            </span>
                                                            <span className="font-mono text-[11px]">
                                                                {typeof se.attendance === "number"
                                                                    ? `${se.attendance.toFixed(1)} / 100`
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] text-muted-foreground">
                                                                Protocol / documentation
                                                            </span>
                                                            <span className="font-mono text-[11px]">
                                                                {typeof se.protocol === "number"
                                                                    ? `${se.protocol.toFixed(1)} / 100`
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] text-muted-foreground">
                                                                Conduct
                                                            </span>
                                                            <span className="font-mono text-[11px]">
                                                                {typeof se.conduct === "number"
                                                                    ? `${se.conduct.toFixed(1)} / 100`
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] text-muted-foreground">
                                                                Work finished / delivery
                                                            </span>
                                                            <span className="font-mono text-[11px]">
                                                                {typeof se.workFinished === "number"
                                                                    ? `${se.workFinished.toFixed(1)} / 100`
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="border-t border-dashed border-border/60 pt-2 mt-1.5">
                                                <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                                                    Supervisor notes
                                                </p>
                                                <p className="text-[11px] text-foreground/80 whitespace-pre-line">
                                                    {selectedInternDetail?.completionNotes ||
                                                        "No supervisor notes recorded for this intern."}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <p className="text-[11px] text-muted-foreground">
                                        Select an intern to view detailed grades.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter className="justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setGradesDialogOpen(false)}
                        >
                            Close
                        </Button>
                        {typeof selectedInternDetail?.finalEvaluation === "number" &&
                            selectedInternDetail?.gradingStatus !== "APPROVED" && (
                            <>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setRejectionDialogOpen(true)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleApprove}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Grading</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting the grading. This will be sent to the supervisor.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        placeholder="Rejection reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReject} disabled={!rejectionReason || isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
