"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, Upload, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { uploadDocument } from "@/lib/services/documents";
import { toast } from "sonner";

type SubmissionRow = {
    id: string;
    title: string;
    description?: string;
    type: string;
    fileUrl: string;
    status: string;
    createdAt: string;
    supervisorFeedback?: string | null;
    rejectionReason?: string | null;
};

export default function TasksPage() {
    const { token } = useAuth();
    const [tasks, setTasks] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Task completion state
    const [completingTask, setCompletingTask] = useState<SubmissionRow | null>(null);
    const [completionForm, setCompletionForm] = useState({
        description: "",
        fileUrl: ""
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchTasks();
    }, [token]);

    async function fetchTasks() {
        if (!token) return;
        try {
            const res = await fetch('/api/submissions/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json?.success) {
                const items = json.data.items ?? [];
                // Tasks are anything with status ASSIGNED or REJECTED, and specifically of type 'TASK'
                setTasks(items.filter((s: any) => s.type === 'TASK' && (s.status === 'ASSIGNED' || s.status === 'REJECTED')));
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    }

    async function handleFinishTask(e: React.FormEvent) {
        e.preventDefault();
        if (!completingTask || !selectedFile) return;

        setSubmitting(true);
        try {
            // 1. Upload the file first
            const uploadRes = await uploadDocument(selectedFile, {
                type: 'SUBMISSION',
                title: `Task Output: ${completingTask.title}`,
            }, token!);

            if (!uploadRes.success) {
                toast.error(uploadRes.message || 'Upload failed');
                setSubmitting(false);
                return;
            }

            // Construct download URL using the document ID and filename for extension detection
            // We append the filename as a query param or path suffix so the preview component can detect the type
            const filename = selectedFile.name;
            const fileUrl = `/api/documents/${uploadRes.data.id}/download?filename=${encodeURIComponent(filename)}`;
            
            // 2. Submit the task completion
            const res = await fetch(`/api/submissions/${completingTask.id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileUrl: fileUrl,
                    status: 'SUBMITTED',
                    submittedAt: new Date().toISOString(),
                    description: completionForm.description
                }),
            });

            const json = await res.json();
            if (!res.ok || !json?.success) {
                toast.error(json?.message || 'Update failed');
                return;
            }
            toast.success('Task marked as submitted');
            setCompletingTask(null);
            setCompletionForm({ description: "", fileUrl: "" });
            setSelectedFile(null);
            fetchTasks();
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-0.5 sm:gap-1 px-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Assigned Tasks</h1>
                <p className="text-muted-foreground text-[11px] sm:text-sm">
                    Complete tasks assigned by your mentor to showcase your skills.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-1">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <Card className="shadow-sm border-border/60">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                            <div>
                                <CardTitle className="text-base sm:text-lg">Active Assignments</CardTitle>
                                <CardDescription className="text-[11px] sm:text-xs">Tasks currently awaiting your input.</CardDescription>
                            </div>
                            <Badge variant="secondary" className="font-mono text-xs sm:text-sm h-6 sm:h-7 px-2 sm:px-3">{tasks.length}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-3">
                            {loading ? (
                                <div className="py-12 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-12 bg-muted/5 border-2 border-dashed rounded-lg">
                                    <CheckCircle className="h-8 w-8 mx-auto text-emerald-500 opacity-20 mb-2" />
                                    <p className="text-xs sm:text-sm text-muted-foreground">All caught up! No active tasks.</p>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <Card key={task.id} className={`shadow-none hover:shadow-md transition-all duration-200 ${completingTask?.id === task.id ? "border-primary ring-2 ring-primary/10" : task.status === 'REJECTED' ? "border-destructive/50 bg-destructive/5" : "border-border/60"}`}>
                                        <CardContent className="p-3 sm:p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                                                    <div className={`p-2 h-fit rounded-lg ${task.status === 'REJECTED' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'} shrink-0`}>
                                                        {task.status === 'REJECTED' ? <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : <Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-semibold text-sm sm:text-base leading-tight truncate">{task.title}</div>
                                                            {task.status === 'REJECTED' && (
                                                                <Badge variant="destructive" className="h-5 text-[10px] px-1.5 uppercase tracking-wide">Rejected</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 line-clamp-2">{task.description || "No description provided."}</p>
                                                        
                                                        {task.status === 'REJECTED' && task.rejectionReason && (
                                                            <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                                                                <span className="font-bold uppercase text-[10px] opacity-70 block mb-0.5">Reason:</span>
                                                                {task.rejectionReason}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-2 mt-2 sm:mt-3 text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                            <span className="bg-muted px-1.5 py-0.5 rounded-sm">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => setCompletingTask(task)}
                                                    className="font-bold shrink-0 h-8 sm:h-9 text-xs px-3"
                                                    variant={task.status === 'REJECTED' ? "destructive" : "default"}
                                                >
                                                    {task.status === 'REJECTED' ? "Resubmit" : "Finish"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    {completingTask ? (
                        <Card className="sticky top-6 border-primary bg-primary/5 shadow-lg">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-primary" />
                                    Submitting Output
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Finalize your work for: <strong>{completingTask.title}</strong>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <form onSubmit={handleFinishTask} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Notes for Mentor</Label>
                                        <Textarea 
                                            value={completionForm.description}
                                            onChange={(e) => setCompletionForm(f => ({ ...f, description: e.target.value }))}
                                            placeholder="What have you completed?"
                                            className="text-sm bg-background resize-none"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold">Proof of Work (File)</Label>
                                        <Input 
                                            type="file" 
                                            accept=".pdf,.png,.jpg,.jpeg" 
                                            onChange={handleFileChange} 
                                            disabled={submitting} 
                                            className="bg-background h-9 text-xs" 
                                        />
                                        {selectedFile && <div className="text-[10px] text-emerald-600 font-bold p-2 bg-emerald-50 rounded border border-emerald-100 flex items-center gap-2">
                                            <CheckCircle className="h-3 w-3" /> File selected: {selectedFile.name}
                                        </div>}
                                    </div>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button type="submit" className="w-full font-bold h-9 text-xs" disabled={!selectedFile || submitting}>
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading & Submitting...
                                                </>
                                            ) : "Complete Assignment"}
                                        </Button>
                                        <Button type="button" variant="ghost" className="text-xs h-8" onClick={() => {
                                            setCompletingTask(null);
                                            setCompletionForm({ description: "", fileUrl: "" });
                                            setSelectedFile(null);
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="sticky top-6 shadow-sm border-border/60">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-sm sm:text-base">Instructions</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-4 p-4 sm:p-6 pt-0">
                                <div className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                                    <p>Select an active task from the list on the left.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                                    <p>Prepare your deliverables (documents, screenshots, or code zip).</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                                    <p>Upload your file and add any relevant notes for your mentor.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">4</div>
                                    <p>Submit your work for review and await feedback.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
