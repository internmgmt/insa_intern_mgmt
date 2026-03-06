"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, Clock, Loader2, User, XCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { listSubmissions } from "@/lib/services/submissions";
import { FilePreview } from "@/components/file-preview";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { exportElementToPdf, generatePdfBlob } from "@/lib/utils/export-report";
import { ReportTemplate } from "@/components/report-template";

function sanitizeUrl(url: string | undefined | null): string {
    if (!url) return "#";
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : "#";
    } catch {
        // Handle relative paths (with or without leading slash)
        // Filter out obviously unsafe schemes like javascript:
        if (url.trim().toLowerCase().startsWith("javascript:")) return "#";
        
        // Ensure leading slash for relative paths
        return url.startsWith("/") ? url : `/${url}`;
    }
}

export default function AdminSubmissionsPage() {
    const { token } = useAuth();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
    
    // PDF Generation State
    const [previewSubmission, setPreviewSubmission] = useState<any>(null);
    const [captureRequest, setCaptureRequest] = useState<any>(null);
    const [isGeneratingPreviewPdf, setIsGeneratingPreviewPdf] = useState(false);
    const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const internFilter = searchParams.get("intern");

    useEffect(() => {
        if (!token) return;
        fetchSubmissions();
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
        if (selectedSubmission?.data && !selectedSubmission.fileUrl && selectedSubmission.type === 'WEEKLY_REPORT') {
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
            }, 800); 
            
            return () => clearTimeout(timeout);
        }
    }, [selectedSubmission]);

    async function fetchSubmissions() {
        try {
            setLoading(true);
            const res = await listSubmissions({ limit: 100 }, token || undefined);
            const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
            setSubmissions(items);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    }

    const handleGeneratePdf = (submission: any) => {
        setPreviewSubmission(submission);
        setCaptureRequest(submission);
    };

    const filteredSubmissions = internFilter
        ? submissions.filter((s) => (s.internName || s.intern?.user?.firstName + ' ' + s.intern?.user?.lastName) === internFilter || s.internId === internFilter)
        : submissions;

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
                                                <Badge variant="outline" className="text-[8px] sm:text-[9px] h-4 py-0 px-1 uppercase shrink-0">
                                                    {sub.type}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight truncate font-medium flex items-center gap-1.5">
                                            <User className="h-3 w-3 opacity-70" />
                                            {(sub.internName || sub.intern?.user?.firstName + ' ' + sub.intern?.user?.lastName || 'Unknown Intern')}
                                            <span className="mx-1 opacity-40">•</span>
                                            <span className="opacity-70">{sub.submittedAt || sub.createdAt ? new Date(sub.submittedAt || sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                                        </p>
                                        
                                        {/* Feedback Display */}
                                        {(sub.feedback || sub.score) && ['APPROVED', 'REJECTED'].includes(sub.status) && (
                                            <div className="mt-2 text-[10px] sm:text-xs bg-muted/50 p-2 rounded-lg border border-border/50">
                                                {sub.score && <div className="font-bold mb-0.5 text-primary">Score: {sub.score}/100</div>}
                                                {sub.feedback && <div className="italic text-muted-foreground">"{sub.feedback}"</div>}
                                            </div>
                                        )}
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
                                        {sub.status}
                                    </Badge>
                                    
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        {((sub as any).fileUrl || (sub as any).files || (sub.data && sub.type === 'WEEKLY_REPORT')) ? (
                                            <>
                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-primary/20 hover:bg-primary/5" onClick={() => setSelectedSubmission(sub)} title="Preview">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                                {((sub as any).fileUrl || (sub as any).files) && (
                                                     <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-primary/20 hover:bg-primary/5" asChild title="Download">
                                                        <a href={sanitizeUrl((sub as any).fileUrl || (sub as any).files)} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-3.5 w-3.5" />
                                                        </a>
                                                    </Button>
                                                )}
                                                {(!((sub as any).fileUrl || (sub as any).files) && sub.data && sub.type === 'WEEKLY_REPORT') && (
                                                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-primary/20 hover:bg-primary/5" onClick={() => handleGeneratePdf(sub)} title="Download PDF Report" disabled={isGeneratingPreviewPdf}>
                                                        {isGeneratingPreviewPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Download className="h-3.5 w-3.5" />}
                                                    </Button>
                                                )}
                                            </>
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
                <PageHeader title="Submissions Oversight" description="Monitor all intern submissions, grades, and feedback." />
                
                {internFilter && (
                    <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-widest px-4 border-primary/20 hover:bg-primary/5" onClick={() => window.history.back()}>
                        Clear Filter
                    </Button>
                )}
            </div>

            <div className="pb-4 px-1">
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Pending ({filteredSubmissions.filter(s => s.status === 'SUBMITTED').length})
                        </TabsTrigger>
                        <TabsTrigger value="reviewed" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Reviewed ({filteredSubmissions.filter(s => ['APPROVED', 'REJECTED'].includes(s.status)).length})
                        </TabsTrigger>
                        <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            All Records ({filteredSubmissions.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4 mt-0">
                        {renderSubmissionList(s => s.status === 'SUBMITTED', "No pending submissions found.")}
                    </TabsContent>
                    <TabsContent value="reviewed" className="space-y-4 mt-0">
                        {renderSubmissionList(s => ['APPROVED', 'REJECTED'].includes(s.status), "No reviewed submissions yet.")}
                    </TabsContent>
                    <TabsContent value="all" className="space-y-4 mt-0">
                        {renderSubmissionList(s => true, "No submissions found.")}
                    </TabsContent>
                </Tabs>
            </div>

            {selectedSubmission && (selectedSubmission.fileUrl || selectedSubmission.files) && (
                <FilePreview
                    url={sanitizeUrl(selectedSubmission.fileUrl || selectedSubmission.files)}
                    title={selectedSubmission.title}
                    onClose={() => setSelectedSubmission(null)}
                />
            )}

            {/* Weekly Report PDF Preview Dialog */}
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
                                    Submitted on {new Date(selectedSubmission.createdAt || selectedSubmission.submittedAt).toLocaleDateString()}
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