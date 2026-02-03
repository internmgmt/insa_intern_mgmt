"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Download, Eye, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FilePreview } from "@/components/file-preview";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION";

type SubmissionRow = {
    id: string;
    internName: string;
    title: string;
    type: "WEEKLY_REPORT" | "PROJECT_FILE" | "CODE";
    date: string;
    status: ReviewStatus;
    feedback?: string;
    fileUrl?: string;
};

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(null);
    const searchParams = useSearchParams();
    const internFilter = searchParams.get("intern");

    useEffect(() => {
        fetchSubmissions();
    }, []);

    async function fetchSubmissions() {
        try {
            const res = await fetch('/api/submissions');
            const json = await res.json();
            const list = json?.data?.items ?? [];
            // Map API fields to UI fields
            const mapped = list.map((s: any) => ({
                id: s.id,
                internName: s.internName || 'Unknown Intern',
                title: s.title,
                type: s.type,
                date: s.createdAt,
                status: s.status,
                feedback: s.supervisorFeedback,
                fileUrl: s.fileUrl
            }));
            setSubmissions(mapped);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    }

    const visibleSubmissions = internFilter
        ? submissions.filter((s) => s.internName === internFilter)
        : submissions;

    async function review(id: string, status: ReviewStatus) {
        let feedback: string | undefined = undefined;

        if (status !== "APPROVED") {
            const input = window.prompt("Supervisor feedback (required):", "");
            if (!input || !input.trim()) return;
            feedback = input.trim();
        }

        try {
            const res = await fetch(`/api/submissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    supervisorFeedback: feedback
                }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                alert(json?.message || 'Failed to review submission');
                return;
            }
            fetchSubmissions();
        } catch (error) {
            console.error('Failed to review submission:', error);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Submissions</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Review intern submissions and record your decisions.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <div className="text-2xl font-bold">
                            {visibleSubmissions.filter((s) => s.status === "PENDING").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Pending review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div className="text-2xl font-bold">
                            {visibleSubmissions.filter((s) => s.status === "APPROVED").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Approved</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-2xl font-bold">{visibleSubmissions.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total submissions</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All submissions</CardTitle>
                    <CardDescription>Approve, reject, or request revision with feedback.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading submissions...</div>
                        ) : visibleSubmissions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No submissions found.</div>
                        ) : (
                            visibleSubmissions.map((sub) => (
                                <Card key={sub.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <Avatar className="p-2">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        <FileText className="h-5 w-5" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="font-medium">{sub.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {sub.internName} • {sub.type.replace("_", " ")} • {sub.date}
                                                    </div>
                                                    {sub.feedback && (
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            Feedback: {sub.feedback}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={
                                                        sub.status === "APPROVED"
                                                            ? "success"
                                                            : sub.status === "PENDING"
                                                            ? "warning"
                                                            : "secondary"
                                                    }
                                                >
                                                    {sub.status}
                                                </Badge>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        type="button"
                                                        onClick={() => setSelectedSubmission(sub)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {sub.fileUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            type="button"
                                                            asChild
                                                        >
                                                            <a href={sub.fileUrl} download target="_blank" rel="noopener noreferrer">
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {sub.status === "PENDING" && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-success"
                                                                type="button"
                                                                onClick={() => review(sub.id, "APPROVED")}
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive"
                                                                type="button"
                                                                onClick={() => review(sub.id, "REJECTED")}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() => review(sub.id, "NEEDS_REVISION")}
                                                            >
                                                                Revise
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                    {selectedSubmission && selectedSubmission.fileUrl && (
                        <FilePreview 
                            url={selectedSubmission.fileUrl} 
                            title={selectedSubmission.title} 
                            onClose={() => setSelectedSubmission(null)} 
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
