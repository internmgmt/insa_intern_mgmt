"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle, XCircle, Clock, Loader2, ExternalLink, Filter, Download, Eye, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { listSubmissions, reviewSubmission } from "@/lib/services/submissions";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { exportElementToPdf, generatePdfBlob } from "@/lib/utils/export-report";
import { ReportTemplate } from "@/components/report-template";
import { FilePreview } from "@/components/file-preview";

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

export default function MentorSubmissionsPage() {
    const { token } = useAuth();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
    const [feedback, setFeedback] = useState("");
    const [score, setScore] = useState<number>(100);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewSubmission, setPreviewSubmission] = useState<any>(null);
    const [captureRequest, setCaptureRequest] = useState<any>(null);
    const [isGeneratingPreviewPdf, setIsGeneratingPreviewPdf] = useState(false);
    const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const internIdFilter = searchParams.get("internId");

    useEffect(() => {
        void fetchSubmissions();
    }, [token]);

    // Ensure hidden preview element always has access to the needed data
    useEffect(() => {
        if (!previewSubmission && submissions.length) {
            setPreviewSubmission(submissions[0]);
        }
    }, [submissions, previewSubmission]);

    // Handle print/download requests
    useEffect(() => {
        if (!captureRequest) return;
        if (!previewSubmission || previewSubmission.id !== captureRequest.id) return;

        let cancelled = false;
        const frame = requestAnimationFrame(() => {
            if (!previewRef.current) return;
            setIsGeneratingPreviewPdf(true);
            void exportElementToPdf(previewRef.current, captureRequest)
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to export the report PDF");
                })
                .finally(() => {
                    if (cancelled) return;
                    setIsGeneratingPreviewPdf(false);
                    setCaptureRequest(null);
                });
        });

        return () => {
            cancelled = true;
            cancelAnimationFrame(frame);
        };
    }, [captureRequest, previewSubmission]);

    // Handle preview generation when opening dialog
    useEffect(() => {
        if (selectedSubmission?.data && !selectedSubmission.fileUrl) {
            // Reset previous preview
            setPreviewPdfUrl(null);
            // Set data for hidden render
            setPreviewSubmission(selectedSubmission);
            
            // Wait for render, then capture
            const timeout = setTimeout(async () => {
                if (previewRef.current) {
                    setIsGeneratingPreviewPdf(true);
                    try {
                        const url = await generatePdfBlob(previewRef.current, selectedSubmission);
                        setPreviewPdfUrl(url);
                    } catch (e) {
                         console.error("Preview generation failed", e);
                         toast.error("Could not generate PDF preview");
                    } finally {
                         setIsGeneratingPreviewPdf(false);
                    }
                }
            }, 800); // 800ms delay to ensure images/fonts loaded in hidden DOM
            
            return () => clearTimeout(timeout);
        }
    }, [selectedSubmission]);

    async function fetchSubmissions() {
        if (!token) return;
        try {
            setLoading(true);
            const res = await listSubmissions({ limit: 100 }, token);
            setSubmissions(res.data?.items || []);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
            toast.error("Failed to load submissions");
        } finally {
            setLoading(false);
        }
    }

    const filteredSubmissions = internIdFilter
        ? submissions.filter((s) => s.intern?.id === internIdFilter || s.student?.id === internIdFilter)
        : submissions;

    const handleGeneratePdf = (submission: any) => {
        setPreviewSubmission(submission);
        setCaptureRequest(submission);
    };

    async function handleOpenReview(    sub: any, decision: 'APPROVE' | 'REJECT') {
        setSelectedSubmission(sub);
        setReviewDecision(decision);
        setFeedback("");
        setScore(sub?.maxScore || 100);
        setShowReviewDialog(true);
    }

    async function submitReview() {
        if (!selectedSubmission || !token) return;
        try {
            setIsSubmitting(true);
            await reviewSubmission(selectedSubmission.id, {
                decision: reviewDecision,
                score: reviewDecision === 'APPROVE' ? score : undefined,
                feedback: feedback,
                rejectionReason: reviewDecision === 'REJECT' ? feedback : undefined
            }, token);
            
            toast.success(`Submission ${reviewDecision.toLowerCase()}ed`);
            setShowReviewDialog(false);
            void fetchSubmissions();
        } catch (error: any) {
            toast.error(error?.message || "Review failed");
        } finally {
            setIsSubmitting(false);
        }
    }

    const renderSubmissionList = (filterFn: (s: any) => boolean, emptyMsg: string) => {
        const items = filteredSubmissions.filter(filterFn);
        
        if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary/30" /></div>;
        
        if (items.length === 0) return (
            <div className="text-center py-16 border border-dashed rounded-xl bg-muted/5">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-60">{emptyMsg}</p>
            </div>
        );

        return (
            <div className="space-y-3 sm:space-y-4">
                {items.map((sub) => (
                    <Card key={sub.id} className="overflow-hidden border-border/60 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-0">
                            <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary/70" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                            <h3 className="font-bold text-sm sm:text-base leading-tight truncate">{sub.title}</h3>
                                            <div className="flex gap-1">
                                                <Badge variant={sub.type === 'TASK' ? 'default' : 'outline'} className="text-[8px] sm:text-[9px] h-4 py-0 px-1 uppercase shrink-0">
                                                    {sub.type}
                                                </Badge>
                                                {sub.data?.isLate && (
                                                    <Badge variant="destructive" className="text-[8px] sm:text-[9px] h-4 py-0 px-1 uppercase shrink-0">
                                                        LATE
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight truncate font-medium">
                                            {(sub.intern?.user?.firstName || sub.student?.firstName || 'Unknown')}{' '}
                                            {(sub.intern?.user?.lastName || sub.student?.lastName || 'Participant')} 
                                            <span className="mx-1.5 opacity-40">•</span> 
                                            <span className="opacity-70">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-row items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40">
                                    <Badge 
                                        variant={
                                            sub.status === 'APPROVED' ? 'success' : 
                                            sub.status === 'REJECTED' ? 'destructive' : 
                                            sub.status === 'SUBMITTED' ? 'warning' : 'secondary'
                                        }
                                        className="text-[9px] sm:text-[10px] uppercase font-bold h-5 sm:h-6 px-1.5 sm:px-2"
                                    >
                                        {sub.status === 'APPROVED' && sub.score ? `${sub.score}/${sub.maxScore || 100}` : sub.status}
                                    </Badge>
                                    
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        {sub.status === 'SUBMITTED' && (
                                            <div className="flex items-center gap-1 border-r border-border/40 pr-1.5 sm:pr-2 mr-1.5 sm:mr-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-full" onClick={() => handleOpenReview(sub, 'APPROVE')} title="Approve">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-full" onClick={() => handleOpenReview(sub, 'REJECT')} title="Reject">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {((sub as any).fileUrl || (sub as any).files || (sub.data && sub.type === 'WEEKLY_REPORT')) && (
                                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-primary/20 hover:bg-primary/5" onClick={() => setSelectedSubmission(sub)} title="Preview">
                                                <Eye className="h-3.5 w-3.5" />
                                            </Button>
                                        )}

                                        {((sub as any).fileUrl || (sub as any).files) && sub.status === 'APPROVED' ? (
                                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-primary/20 hover:bg-primary/5" asChild title="View Document">
                                                <a href={(sub as any).fileUrl || (sub as any).files} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </Button>
                                        ) : sub.data && sub.status === 'APPROVED' ? (
                                            <Button 
                                                size="icon" 
                                                variant="outline" 
                                                className="h-8 w-8 rounded-full border-primary/20 hover:bg-primary/5" 
                                                onClick={() => handleGeneratePdf(sub)}
                                                title="Download Report PDF"
                                                disabled={isGeneratingPreviewPdf}
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                            </Button>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground/40 shrink-0" title="No file uploaded yet">
                                                <Clock className="h-3.5 w-3.5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between px-1">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold italic tracking-tight uppercase">Submissions Review</h1>
                    <p className="text-muted-foreground text-[11px] sm:text-sm mt-0.5">
                        Verify and provide feedback on work submitted by your interns.
                    </p>
                </div>
                {internIdFilter && (
                    <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-widest px-4 border-primary/20 hover:bg-primary/5" onClick={() => window.history.back()}>
                        Clear Filter
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-1">
                {[
                  { title: "Assigned", value: filteredSubmissions.filter(s => s.status === 'ASSIGNED').length, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/10" },
                  { title: "Pending", value: filteredSubmissions.filter(s => s.status === 'SUBMITTED').length, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" },
                  { title: "Approved", value: filteredSubmissions.filter(s => s.status === 'APPROVED').length, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
                  { title: "Avg Score", value: `${filteredSubmissions.filter(s => s.status === 'APPROVED' && s.score).length > 0
                    ? Math.round(
                        (filteredSubmissions.filter(s => s.status === 'APPROVED' && s.score).reduce((acc, s) => acc + (s.score || 0), 0) / 
                        filteredSubmissions.filter(s => s.status === 'APPROVED' && s.score).reduce((acc, s) => acc + (s.maxScore || 100), 0)) * 100
                      )
                    : 0}%`, color: "text-indigo-500", bg: "bg-indigo-500/5", border: "border-indigo-500/10" }
                ].map((stat, i) => (
                  <Card key={i} className={`${stat.bg} ${stat.border} shadow-sm border`}>
                    <CardContent className="p-3 sm:p-4">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1 truncate">{stat.title}</p>
                        <div className={`text-xl sm:text-2xl font-bold ${stat.color} leading-none`}>{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="pb-4 px-1">
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            To Review ({filteredSubmissions.filter(s => s.status === 'SUBMITTED').length})
                        </TabsTrigger>
                        <TabsTrigger value="reviewed" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Reviewed ({filteredSubmissions.filter(s => ['APPROVED', 'REJECTED'].includes(s.status)).length})
                        </TabsTrigger>
                        <TabsTrigger value="assigned" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            In Progress ({filteredSubmissions.filter(s => s.status === 'ASSIGNED').length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4 mt-0">
                         {renderSubmissionList(s => s.status === 'SUBMITTED', "Good job! You're all caught up on reviews.")}
                    </TabsContent>
                    <TabsContent value="reviewed" className="space-y-4 mt-0">
                         {renderSubmissionList(s => ['APPROVED', 'REJECTED'].includes(s.status), "No reviewed submissions yet.")}
                    </TabsContent>
                    <TabsContent value="assigned" className="space-y-4 mt-0">
                         {renderSubmissionList(s => s.status === 'ASSIGNED', "No active tasks assigned.")}
                    </TabsContent>
                </Tabs>
            </div>

            {selectedSubmission && selectedSubmission.type !== 'WEEKLY_REPORT' && (((selectedSubmission as any).fileUrl || (selectedSubmission as any).files)) && (
                <FilePreview
                    url={
                        Array.isArray((selectedSubmission as any).files) 
                            ? (selectedSubmission as any).files.map((f: string) => sanitizeUrl(f))
                            : sanitizeUrl((selectedSubmission as any).fileUrl || (selectedSubmission as any).files)
                    }
                    title={selectedSubmission.title}
                    onClose={() => setSelectedSubmission(null)}
                />
            )}

            {selectedSubmission && selectedSubmission.type === 'WEEKLY_REPORT' && selectedSubmission.data && !selectedSubmission.fileUrl && (
                <Dialog open={!!selectedSubmission} onOpenChange={(open: boolean) => !open && setSelectedSubmission(null)}>
                    <DialogContent 
                        className="w-[min(100vw-1rem,1400px)] max-w-[100vw] sm:max-w-[98vw] h-[90vh] p-0 rounded-xl bg-slate-950 border-slate-800 flex flex-col overflow-hidden"
                        showCloseButton={false}
                    >
                         <div className="sticky top-0 z-50 flex items-center justify-between bg-slate-900/95 backdrop-blur-sm px-4 py-3 border-b border-slate-800 shadow-md">
                            <div>
                                <DialogTitle className="text-sm font-semibold text-slate-100 tracking-wide">{selectedSubmission.title}</DialogTitle>
                                <DialogDescription className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                    Submitted on {new Date(selectedSubmission.createdAt).toLocaleDateString()}
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleGeneratePdf(selectedSubmission)} 
                                    disabled={isGeneratingPreviewPdf}
                                    title="Download Report PDF"
                                    className="h-8 text-xs border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-colors"
                                >
                                    {isGeneratingPreviewPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Download className="h-3.5 w-3.5 mr-2" />}
                                    Download PDF
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setSelectedSubmission(null)} 
                                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                         </div>
                         <div className="flex-1 p-1 sm:p-3 flex justify-center items-center bg-slate-950 overflow-hidden">
                            {previewPdfUrl ? (
                                <iframe 
                                    src={`${previewPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-width`} 
                                    className="w-full h-full rounded-lg shadow-2xl border border-slate-700 bg-white" 
                                    title="Report Preview" 
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-slate-400 animate-pulse">
                                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                    <p className="text-sm font-medium">Generating Report PDF...</p>
                                </div>
                            )}
                         </div>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogContent className="w-[calc(100vw-32px)] sm:max-w-md p-4 sm:p-6 overflow-hidden rounded-xl">
                    <DialogHeader className="pb-1 sm:pb-2">
                        <DialogTitle className="text-base sm:text-lg font-bold uppercase tracking-tight">
                            {reviewDecision === 'APPROVE' ? 'Approve Submission' : 'Reject Submission'}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {(reviewDecision === 'APPROVE' 
                              ? "Record a grade and provide final feedback for the intern."
                              : "Explain why this work does not meet requirements.")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2 sm:py-4">
                        {reviewDecision === 'APPROVE' && (
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-70">Grade (0-{selectedSubmission?.maxScore || 100})</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max={selectedSubmission?.maxScore || 100} 
                                    className="w-full h-8 sm:h-10 rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                                    value={score}
                                    onChange={(e) => setScore(Number(e.target.value))}
                                />
                            </div>
                        )}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-70">{reviewDecision === 'APPROVE' ? 'Performance Global Feedback' : 'Specific Rejection Reason'}</label>
                            <textarea
                                className="w-full min-h-[90px] sm:min-h-[110px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none leading-relaxed"
                                placeholder={reviewDecision === 'APPROVE' ? "Excellent execution and thorough analysis. Keep maintaining this standard." : "Technical documentation is missing Section 2.4 and results are incomplete."}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-row justify-end gap-2 mt-2 sm:mt-0">
                        <Button variant="ghost" size="sm" className="h-8 sm:h-10 text-xs flex-1 sm:flex-none border border-transparent hover:bg-muted" onClick={() => setShowReviewDialog(false)}>Cancel</Button>
                        <Button 
                            variant={reviewDecision === 'APPROVE' ? 'default' : 'destructive'}
                            size="sm"
                            className="h-8 sm:h-10 text-xs flex-1 sm:flex-none font-bold uppercase tracking-widest px-4 shadow-md"
                            disabled={isSubmitting} 
                            onClick={submitReview}
                        >
                            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : reviewDecision === 'APPROVE' ? <CheckCircle className="h-3.5 w-3.5 mr-2" /> : <XCircle className="h-3.5 w-3.5 mr-2" />}
                            Process Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hidden report template for PDF generation */}
            <div className="fixed left-0 top-0 w-[210mm] z-[-50] opacity-0 pointer-events-none">
                <div ref={previewRef}>
                    {previewSubmission ? (
                        <ReportTemplate report={previewSubmission} />
                    ) : null}
                </div>
            </div>
        </div>
    );
}