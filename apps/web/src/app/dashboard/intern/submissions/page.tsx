"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Plus, Download, Eye, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { FilePreview } from "@/components/file-preview";
import { useAuth } from "@/components/auth-provider";
import { uploadDocument } from "@/lib/services/documents";
import { toast } from "sonner";

type SubmissionStatus = "PENDING" | "APPROVED" | "NEEDS_REVISION" | "REJECTED";
type SubmissionType = "WEEKLY_REPORT" | "PROJECT_FILE" | "CODE";

type SubmissionRow = {
    id: string;
    title: string;
    description?: string;
    type: SubmissionType;
    fileUrl: string;
    weekNumber?: number;
    status: SubmissionStatus;
    createdAt: string;
    supervisorFeedback?: string | null;
};

export default function SubmissionsPage() {
    const { token } = useAuth();
    const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selected, setSelected] = useState<SubmissionRow | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "WEEKLY_REPORT" as SubmissionType,
        weekNumber: "",
        fileUrl: "",
    });

    useEffect(() => {
        fetchSubmissions();
    }, []);

    async function fetchSubmissions() {
        try {
            const res = await fetch('/api/submissions');
            const json = await res.json();
            if (!json?.success) {
                console.error('Failed to fetch submissions:', json?.message || json?.error);
                setSubmissions([]);
            } else {
                setSubmissions(json.data.items ?? []);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setUploading(true);
        try {
            const res = await uploadDocument(file, {
                type: 'OTHER',
                title: form.title || file.name,
            }, token);

            if (res.success) {
                setForm(f => ({ ...f, fileUrl: res.data.fileUrl }));
                toast.success('File uploaded successfully');
            } else {
                toast.error(res.message || 'File upload failed');
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(error?.message || 'File upload failed');
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.title.trim() || !form.fileUrl) return;

        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    weekNumber: form.weekNumber ? Number(form.weekNumber) : undefined,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json?.success) {
                alert(json?.message || 'Submission failed');
                return;
            }
            fetchSubmissions();
            setForm({ title: "", description: "", type: "WEEKLY_REPORT", weekNumber: "", fileUrl: "" });
        } catch (error) {
            console.error('Submission failed:', error);
        }
    }

    function canEdit(sub: SubmissionRow) {
        return sub.status === "PENDING" || sub.status === "NEEDS_REVISION";
    }

    function canDelete(sub: SubmissionRow) {
        return sub.status === "PENDING";
    }

    function editSubmission(sub: SubmissionRow) {
        if (!canEdit(sub)) return;

        const newTitle = window.prompt("Update title", sub.title) ?? sub.title;
        const newDescription = window.prompt("Update description", sub.description || "") ?? sub.description;

        setSubmissions((prev) =>
            prev.map((s) =>
                s.id === sub.id
                    ? {
                        ...s,
                        title: newTitle.trim() || s.title,
                        description: newDescription?.trim() || s.description,
                    }
                    : s
            )
        );
    }

    function deleteSubmission(sub: SubmissionRow) {
        if (!canDelete(sub)) return;
        if (!window.confirm("Delete this submission? This cannot be undone.")) return;
        setSubmissions((prev) => prev.filter((s) => s.id !== sub.id));
    }

    function exportToSheets() {
        window.alert("Exporting submissions to Sheets (simulated).");
    }

    const total = submissions.length;
    const approved = submissions.filter(s => s.status === "APPROVED").length;
    const pending = submissions.filter(s => s.status === "PENDING").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Submissions</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Upload weekly reports, project files, and code for review.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={exportToSheets}>
                        Export to Sheets
                    </Button>
                    <Button type="button">
                        <Plus className="mr-2 h-4 w-4" />
                        New submission
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total submissions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{approved}</div>
                        <p className="text-xs text-muted-foreground mt-1">Approved</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{pending}</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Submit new work</CardTitle>
                    <CardDescription>Create a new submission. Files are uploaded via the documents service.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="e.g., Weekly Report #4"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={form.type} onValueChange={(v: any) => setForm((f) => ({ ...f, type: v }))}>
                                    <SelectTrigger id="type" className="w-full h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WEEKLY_REPORT">Weekly report</SelectItem>
                                        <SelectItem value="PROJECT_FILE">Project file</SelectItem>
                                        <SelectItem value="CODE">Code</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weekNumber">Week number (optional)</Label>
                                <Input
                                    id="weekNumber"
                                    type="number"
                                    min={1}
                                    value={form.weekNumber}
                                    onChange={(e) => setForm((f) => ({ ...f, weekNumber: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Describe what you are submitting..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">File Upload</Label>
                            <div className="flex flex-col gap-2">
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                                {uploading && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading...
                                    </div>
                                )}
                                {form.fileUrl && (
                                    <div className="text-xs text-success font-medium">
                                        File uploaded: {form.fileUrl.split('/').pop()}
                                    </div>
                                )}
                                <Card>
                                    <CardContent className="p-4 text-center text-xs text-muted-foreground">
                                        <Upload className="h-6 w-6 mx-auto mb-1" />
                                        <div>Upload your report or project file here.</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        <Button type="submit" disabled={!form.fileUrl || uploading}>
                            {uploading ? "Uploading..." : "Submit"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>My submissions</CardTitle>
                    <CardDescription>Your uploaded work and its review status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading submissions...</div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No submissions yet.</div>
                        ) : (
                            submissions.map((sub) => (
                                <Card key={sub.id} className="text-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{sub.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {sub.type.replace("_", " ")} • {sub.createdAt}
                                                        {sub.weekNumber != null && ` • Week ${sub.weekNumber}`}
                                                    </div>
                                                    {sub.supervisorFeedback && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Feedback: {sub.supervisorFeedback}
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
                                                        onClick={() => setSelected(sub)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
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

            {selected && (
                <Card>
                    <CardContent className="p-3 text-xs text-muted-foreground">
                        <div className="font-medium text-foreground text-sm mb-1">{selected.title}</div>
                        <div>Type: {selected.type.replace("_", " ")}</div>
                        {selected.weekNumber != null && <div>Week: {selected.weekNumber}</div>}
                        <div>Created at: {selected.createdAt}</div>
                        {selected.description && <div className="mt-1">Description: {selected.description}</div>}
                        {selected.supervisorFeedback && (
                            <div className="mt-1">Supervisor feedback: {selected.supervisorFeedback}</div>
                        )}
                    </CardContent>
                </Card>
            )}

            {selected && (
                <FilePreview
                    url={selected.fileUrl}
                    title={selected.title}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}
