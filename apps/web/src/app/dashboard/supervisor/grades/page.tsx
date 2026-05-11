"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { listInterns, setSupervisorFinalEvaluation } from "@/lib/services/interns";
import { listSubmissions } from "@/lib/services/submissions";
import { Loader2, Users, CheckCircle2, AlertCircle, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function SupervisorGradesPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [interns, setInterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);

    const [selectedIntern, setSelectedIntern] = useState<any | null>(null);
    const [evaluationOpen, setEvaluationOpen] = useState(false);
    const [attendance, setAttendance] = useState(85);
    const [protocol, setProtocol] = useState(85);
    const [conduct, setConduct] = useState(85);
    const [workFinished, setWorkFinished] = useState(85);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            try {
                setLoading(true);
                const [internRes, submissionsRes] = await Promise.all([
                    listInterns({ limit: 100 }, token),
                    listSubmissions({ limit: 100 }, token),
                ]);

                if (internRes.data?.items) {
                    setInterns(internRes.data.items);
                }
                const submissionItems = (submissionsRes as any)?.data?.items ?? (submissionsRes as any)?.data ?? [];
                setSubmissions(submissionItems);
            } catch (error) {
                console.error("Failed to fetch data for grades:", error);
                toast.error("Failed to load grades overview");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const totalInterns = interns.length;
    const gradedInterns = interns.filter((i) => typeof i.finalEvaluation === "number").length;
    const awaitingGrade = interns.filter(
        (i) => i.status === "COMPLETED" && (i.finalEvaluation === null || typeof i.finalEvaluation === "undefined")
    ).length;

    const computeMentorAggregate = (internId: string): number | null => {
        const relevant = submissions.filter((s: any) => s.internId === internId && typeof s.score === "number");
        if (relevant.length === 0) return null;
        const total = relevant.reduce((acc: number, s: any) => acc + (s.score || 0), 0);
        return total / relevant.length;
    };

    const selectedMentorAggregate = selectedIntern
        ? computeMentorAggregate(selectedIntern.id) ?? null
        : null;

    const numericComponents = [attendance, protocol, conduct, workFinished].filter(
        (v) => typeof v === "number" && !Number.isNaN(v),
    );
    const supervisorAverage =
        numericComponents.length > 0
            ? numericComponents.reduce((acc, v) => acc + v, 0) / numericComponents.length
            : 0;

    const finalPercent = (() => {
        const mentorAgg = selectedMentorAggregate ?? 0;
        return 0.5 * mentorAgg + 0.5 * supervisorAverage;
    })();

    const computedFinalEvaluation = (() => {
        const value = Number((finalPercent / 25).toFixed(2));
        return Math.min(4, Math.max(0, value));
    })();

    const openEvaluation = (intern: any) => {
        setSelectedIntern(intern);
        setAttendance(85);
        setProtocol(85);
        setConduct(85);
        setWorkFinished(85);
        setNotes("");
        setEvaluationOpen(true);
    };

    const submitEvaluation = async () => {
        if (!selectedIntern || !token) return;
        try {
            setIsSubmitting(true);
            await setSupervisorFinalEvaluation(
                selectedIntern.id,
                {
                    attendance,
                    protocol,
                    conduct,
                    workFinished,
                    mentorAggregate: selectedMentorAggregate ?? undefined,
                    notes: notes || undefined,
                },
                token,
            );
            toast.success("Final evaluation recorded");
            setEvaluationOpen(false);
            // Refresh interns list to reflect updated finalEvaluation
            const res = await listInterns({ limit: 100 }, token);
            if (res.data?.items) {
                setInterns(res.data.items);
            }
        } catch (error: any) {
            console.error("Failed to submit evaluation:", error);
            toast.error(error?.message || "Failed to submit evaluation");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold">Grades Overview</h1>
                <p className="text-muted-foreground text-[11px] sm:text-sm mt-0.5 sm:mt-1">
                    See final evaluations for interns in your department and jump into their activity.
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2 text-primary/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Interns</span>
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold leading-none">{totalInterns}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">Under your supervision</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-emerald-500/10">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2 text-emerald-600/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80">With Final Grade</span>
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold leading-none text-emerald-700/80">{gradedInterns}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">Have a recorded final evaluation</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm bg-amber-50/10 border-amber-500/10">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2 text-amber-600/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Grade</span>
                            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold leading-none text-amber-700/80">{awaitingGrade}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">Completed but not yet graded</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm bg-blue-50/10 border-blue-500/10">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2 text-blue-600/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
                            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold leading-none text-blue-700/80">
                            {interns.filter((i) => i.status === "ACTIVE").length}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">Currently in progress</p>
                    </CardContent>
                </Card>
            </div>

            {interns.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg bg-muted/[0.03]">
                    <p className="text-muted-foreground text-xs sm:text-sm">No interns found in your department.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 pb-4">
                    {interns.map((intern) => {
                        const initials = `${intern.firstName?.[0] || ""}${intern.lastName?.[0] || ""}`;
                        const fullName = `${intern.firstName || ""} ${intern.lastName || ""}`.trim() || "Unknown";
                        const finalPercentDisplay =
                            typeof intern.finalEvaluation === "number"
                                ? (intern.finalEvaluation * 25).toFixed(1)
                                : null;

                        const startDate = intern.startDate ? new Date(intern.startDate) : null;
                        const endDate = intern.endDate ? new Date(intern.endDate) : null;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPastEndDate = endDate ? endDate.getTime() < today.getTime() : false;

                        return (
                            <Card key={intern.id} className="hover:shadow-md transition-shadow duration-200 border-border/60">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border border-border shadow-sm">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{fullName}</h3>
                                                    <Badge
                                                        className="sm:hidden text-[10px]"
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
                                                </div>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground leading-none mb-1.5">
                                                    {intern.internId || "ID Pending"}
                                                </p>
                                                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed truncate">
                                                    {intern.email}
                                                    {intern.department ? ` • ${intern.department.name}` : ""}
                                                </p>

                                                <div className="mt-2.5 flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[9px] sm:text-[10px] px-1.5 h-4 sm:h-5 border-primary/20 bg-primary/[0.02] text-primary/70 font-bold uppercase tracking-tighter"
                                                        >
                                                            Final Evaluation
                                                        </Badge>
                                                        <span className="text-[11px] sm:text-xs font-semibold text-foreground/80">
                                                            {finalPercentDisplay !== null ? `${finalPercentDisplay} / 100` : "Not set"}
                                                        </span>
                                                    </div>
                                                    {(() => {
                                                        const mentorAgg = computeMentorAggregate(intern.id);
                                                        if (mentorAgg === null) return null;
                                                        return (
                                                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground/80">
                                                                <span className="font-medium">Mentor aggregate:</span>
                                                                <span className="font-mono">{mentorAgg.toFixed(1)} / 100</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>

                                                <div className="text-[10px] sm:text-xs text-muted-foreground/60 mt-2 font-medium">
                                                    {startDate ? startDate.toLocaleDateString() : "—"}
                                                    {" → "}
                                                    {endDate ? endDate.toLocaleDateString() : "—"}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            className="hidden sm:inline-flex"
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
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-[11px] sm:text-xs">
                                        <span className="text-muted-foreground font-medium">
                                            {typeof intern.finalEvaluation === "number"
                                                ? "Final evaluation recorded"
                                                : intern.status === "COMPLETED"
                                                ? "Completed - waiting for final evaluation"
                                                : isPastEndDate
                                                ? "End date passed - awaiting supervisor final grade"
                                                : "Internship in progress"}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[11px] px-2"
                                                type="button"
                                                disabled={(() => {
                                                    const hasFinal = typeof intern.finalEvaluation === "number";
                                                    const isActiveOrCompleted =
                                                        intern.status === "ACTIVE" || intern.status === "COMPLETED";
                                                    const canEditAfterRejection =
                                                        hasFinal && intern.gradingStatus === "REJECTED";
                                                    const canSetInitial = !hasFinal;

                                                    if (!isPastEndDate || !isActiveOrCompleted) return true;
                                                    // Allow setting grade if none exists, or re-setting when grading was rejected
                                                    return !(canSetInitial || canEditAfterRejection);
                                                })()}
                                                onClick={() => openEvaluation(intern)}
                                            >
                                                Set Final Grade
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-primary font-bold px-0 hover:bg-transparent hover:underline transition-all"
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/dashboard/supervisor/submissions?intern=${encodeURIComponent(fullName)}`
                                                    )
                                                }
                                            >
                                                View Activity →
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={evaluationOpen} onOpenChange={setEvaluationOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg font-bold">
                            Set Final Grade{selectedIntern ? ` – ${selectedIntern.firstName} ${selectedIntern.lastName}` : ""}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Attendance</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={Number.isNaN(attendance) ? "" : attendance}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw === "") {
                                            setAttendance(NaN as any);
                                            return;
                                        }
                                        const parsed = Number(raw.replace(/[^0-9]/g, ""));
                                        const clamped = Math.max(0, Math.min(100, parsed));
                                        setAttendance(clamped);
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Protocol</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={Number.isNaN(protocol) ? "" : protocol}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw === "") {
                                            setProtocol(NaN as any);
                                            return;
                                        }
                                        const parsed = Number(raw.replace(/[^0-9]/g, ""));
                                        const clamped = Math.max(0, Math.min(100, parsed));
                                        setProtocol(clamped);
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Conduct</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={Number.isNaN(conduct) ? "" : conduct}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw === "") {
                                            setConduct(NaN as any);
                                            return;
                                        }
                                        const parsed = Number(raw.replace(/[^0-9]/g, ""));
                                        const clamped = Math.max(0, Math.min(100, parsed));
                                        setConduct(clamped);
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Work Finished</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={Number.isNaN(workFinished) ? "" : workFinished}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw === "") {
                                            setWorkFinished(NaN as any);
                                            return;
                                        }
                                        const parsed = Number(raw.replace(/[^0-9]/g, ""));
                                        const clamped = Math.max(0, Math.min(100, parsed));
                                        setWorkFinished(clamped);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Supervisor Notes</Label>
                            <Input
                                placeholder="Summarize performance and context (optional)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="rounded-lg border border-dashed border-muted p-3 bg-muted/40 text-[11px] space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-muted-foreground">Mentor aggregate</span>
                                <span className="font-mono">
                                    {selectedMentorAggregate !== null ? `${selectedMentorAggregate.toFixed(1)} / 100` : "No mentor scores yet"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-muted-foreground">Supervisor average</span>
                                <span className="font-mono">{supervisorAverage.toFixed(1)} / 100</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-dashed border-border/60 pt-1.5 mt-1.5">
                                <span className="font-semibold text-muted-foreground">Final score (50% mentor, 50% supervisor)</span>
                                <span className="font-mono font-bold">
                                    {finalPercent.toFixed(1)} / 100
                                </span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEvaluationOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={submitEvaluation}
                            disabled={isSubmitting || !selectedIntern}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                            ) : null}
                            Save Final Grade
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
