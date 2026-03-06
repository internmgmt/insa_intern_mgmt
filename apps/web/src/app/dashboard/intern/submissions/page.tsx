"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Download, Eye, Loader2, Calendar, FileType, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { FilePreview } from "@/components/file-preview";
import { useAuth } from "@/components/auth-provider";
import { exportElementToPdf } from "@/lib/utils/export-report";
import { ReportTemplate } from "@/components/report-template";

type SubmissionRow = {
    id: string;
    title: string;
    description?: string;
    type: string;
    fileUrl: string;
    weekNumber?: number;
    status: string;
    createdAt: string;
    supervisorFeedback?: string | null;
    feedback?: string | null;
    rejectionReason?: string | null;
    score?: number | null;
    maxScore?: number | null;
    data?: any;
    intern?: any;
    student?: any;
};

function isSafeHttpUrl(url: string | undefined | null): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
}

function sanitizeUrl(url: string | undefined | null): string {
    if (!url) return "#";
    if (isSafeHttpUrl(url)) return url;
    if (url.startsWith("/")) return url;
    return "#";
}

export default function SubmissionsHistoryPage() {
    const { token } = useAuth();
    const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<SubmissionRow | null>(null);
    const [captureSubmission, setCaptureSubmission] = useState<SubmissionRow | null>(null);
    const [captureRequest, setCaptureRequest] = useState<SubmissionRow | null>(null);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const captureRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchSubmissions();
    }, [token]);

    useEffect(() => {
        if (!captureRequest) return;
        if (!captureSubmission || captureSubmission.id !== captureRequest.id) return;

        let canceled = false;
        const frame = requestAnimationFrame(() => {
            if (!captureRef.current) return;
            setIsExportingPdf(true);
            void exportElementToPdf(captureRef.current, captureRequest)
                .catch((error) => {
                    console.error("Failed to generate report PDF", error);
                })
                .finally(() => {
                    if (canceled) return;
                    setIsExportingPdf(false);
                    setCaptureRequest(null);
                });
        });

        return () => {
            canceled = true;
            cancelAnimationFrame(frame);
        };
    }, [captureRequest, captureSubmission]);

    async function fetchSubmissions() {
        if (!token) return;
        try {
            const res = await fetch('/api/submissions/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json?.success) {
                setSubmissions(json.data.items ?? []);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    }

    const total = submissions.length;
    const approved = submissions.filter(s => s.status === "APPROVED").length;
    const rejected = submissions.filter(s => s.status === "REJECTED").length;

    const handleDownloadReport = (submission: SubmissionRow) => {
        setCaptureSubmission(submission);
        setCaptureRequest(submission);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-0.5 sm:gap-1 px-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Submission History</h1>
                <p className="text-muted-foreground text-[11px] sm:text-sm">
                    A comprehensive log of all your reports, project files, and completed assignments.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 px-1">
                <Card className="shadow-sm">
                    <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[9px] sm:text-xs font-medium uppercase text-muted-foreground tracking-wider">Total</CardTitle>
                        <FileType className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="text-xl sm:text-2xl font-bold">{total}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[9px] sm:text-xs font-medium uppercase text-emerald-600 tracking-wider">Approved</CardTitle>
                        <Badge variant="success" className="h-3 sm:h-4 pointer-events-none" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="text-xl sm:text-2xl font-bold text-emerald-600">{approved}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[9px] sm:text-xs font-medium uppercase text-rose-600 tracking-wider">Rejected</CardTitle>
                        <Badge variant="destructive" className="h-3 sm:h-4 pointer-events-none" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="text-xl sm:text-2xl font-bold text-rose-600">{rejected}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="min-h-[400px] shadow-sm border-border/60">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">History Log</CardTitle>
                    <CardDescription className="text-[11px] sm:text-xs">View status and feedback for your previous submissions.</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-3">
                    <div className="space-y-3 sm:space-y-4">
                        {loading ? (
                            <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground/30" /></div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center py-20 bg-muted/5 border-2 border-dashed rounded-xl">
                                <Calendar className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-3" />
                                <p className="text-muted-foreground text-xs sm:text-sm">No history found.</p>
                            </div>
                        ) : (
                            submissions.map((sub) => (
                                <Card key={sub.id} className="text-sm border-border/60 hover:bg-muted/5 transition-colors group shadow-none hover:shadow-sm">
                                    <CardContent className="p-3 sm:p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors shrink-0">
                                                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary/70" />
                                                </div>
                                                <div className="flex-1 space-y-1 min-w-0">
                                                    <div className="font-semibold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                                                        <span className="truncate">{sub.title}</span>
                                                        <Badge variant="outline" className="text-[8px] sm:text-[9px] h-4 px-1 leading-none font-mono uppercase shrink-0">
                                                            {sub.type.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex bg-muted/50 rounded-lg p-0.5 self-start">
                                                       <div className="flex items-center gap-1.5 px-2 py-0.5">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{new Date(sub.createdAt).toLocaleDateString()}</span>
                                                       </div>
                                                       {sub.weekNumber != null && (
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 border-l border-border/50">
                                                                <span className="text-[10px] sm:text-xs font-semibold">Week {sub.weekNumber}</span>
                                                            </div>
                                                       )}
                                                       {sub.data?.isLate && (
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 border-l border-border/50 bg-destructive/10 text-destructive rounded-r-lg">
                                                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">LATE</span>
                                                            </div>
                                                       )}
                                                    </div>
                                                    
                                                    {sub.score !== undefined && sub.score !== null && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Grade</div>
                                                            <div className="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-bold text-xs sm:text-sm">
                                                                {sub.score} <span className="text-[9px] sm:text-[10px] opacity-70">/ {sub.maxScore || 100}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(sub.feedback || sub.supervisorFeedback) && (
                                                        <div className="text-[10px] sm:text-xs text-muted-foreground mt-2 bg-blue-500/[0.03] p-2 sm:p-3 rounded-lg border-l-2 border-blue-500/20">
                                                            <strong className="text-blue-900/70 dark:text-blue-300/70 block mb-0.5 text-[9px] sm:text-[10px] uppercase tracking-wide">Mentor Feedback</strong> 
                                                            {sub.feedback || sub.supervisorFeedback}
                                                        </div>
                                                    )}
                                                    {sub.rejectionReason && (
                                                        <div className="text-[10px] sm:text-xs text-rose-600 mt-2 bg-rose-500/[0.03] p-2 sm:p-3 rounded-lg border-l-2 border-rose-500/20">
                                                            <strong className="text-rose-900/70 dark:text-rose-300/70 block mb-0.5 text-[9px] sm:text-[10px] uppercase tracking-wide">Rejection Reason:</strong> 
                                                            {sub.rejectionReason}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end justify-between gap-2 h-full">
                                                <Badge
                                                    variant={
                                                        sub.status === "APPROVED"
                                                            ? "success"
                                                            : sub.status === "SUBMITTED"
                                                                ? "warning"
                                                                : sub.status === "ASSIGNED"
                                                                    ? "secondary" 
                                                                    : "destructive"
                                                    }
                                                    className="font-bold text-[9px] sm:text-[10px] h-5 px-1.5 uppercase"
                                                >
                                                    {sub.status}
                                                </Badge>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                                                    {(sub.fileUrl || sub.data) && (
                                                        <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" onClick={() => setSelected(sub)}>
                                                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                        </Button>
                                                    )}
                                                    {sub.status === "APPROVED" && (
                                                        isSafeHttpUrl(sub.fileUrl) ? (
                                                            <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" asChild>
                                                                <a href={sanitizeUrl(sub.fileUrl)} download target="_blank" rel="noopener noreferrer">
                                                                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                                </a>
                                                            </Button>
                                                        ) : sub.data ? (
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" 
                                                                onClick={() => handleDownloadReport(sub)}
                                                                title="Download PDF Report"
                                                                disabled={isExportingPdf}
                                                            >
                                                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            </Button>
                                                        ) : null
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

                <div
                    ref={captureRef}
                    aria-hidden="true"
                    className="pointer-events-none fixed inset-0 -z-10 opacity-0"
                >
                    {captureSubmission && <ReportTemplate report={captureSubmission} />}
                </div>

            {selected && isSafeHttpUrl(selected.fileUrl) && (
                <FilePreview
                    url={sanitizeUrl(selected.fileUrl)}
                    title={selected.title}
                    onClose={() => setSelected(null)}
                />
            )}

            {selected && selected.data && !selected.fileUrl && (
                <Dialog open={!!selected} onOpenChange={(open: boolean) => !open && setSelected(null)}>
                    <DialogContent className="max-w-md sm:max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">{selected.title}</DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm">
                                Submitted on {new Date(selected.createdAt).toLocaleDateString()} • Week {selected.weekNumber}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            {selected.data.tasksCompleted && (
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-xs sm:text-sm bg-muted/50 p-1.5 rounded-md inline-block">Tasks Completed</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap pl-1">{selected.data.tasksCompleted}</p>
                                </div>
                            )}
                            {selected.data.challenges && (
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-xs sm:text-sm bg-muted/50 p-1.5 rounded-md inline-block">Challenges</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap pl-1">{selected.data.challenges}</p>
                                </div>
                            )}
                            {selected.data.planForNextWeek && (
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-xs sm:text-sm bg-muted/50 p-1.5 rounded-md inline-block">Plan for Next Week</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap pl-1">{selected.data.planForNextWeek}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );

}