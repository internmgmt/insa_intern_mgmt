"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Send, Loader2, Info, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ReportsPage() {
    const { token, user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [currentWeek, setCurrentWeek] = useState<number>(0);
    const [submittableWeeks, setSubmittableWeeks] = useState<{ week: number, label: string, isLate: boolean }[]>([]);
    const [existingReports, setExistingReports] = useState<any[]>([]);
    
    // Simulate fetching intern start date - In a real app, this would come from user profile API
    // For now, assume a fixed start date or fetch it if available in user context
    const internStartDate = (user?.intern as any)?.startDate;
    const startDate = internStartDate ? new Date(internStartDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Fallback to 30 days ago

    useEffect(() => {
        async function fetchExistingReports() {
            if (!token) return;
            try {
                const res = await fetch('/api/submissions/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json?.success) {
                    const items = json.data.items ?? [];
                    setExistingReports(items.filter((s: any) => s.type === 'WEEKLY_REPORT'));
                }
            } catch (error) {
                console.error('Failed to fetch existing reports:', error);
            }
        }
        fetchExistingReports();
    }, [token]);

    useEffect(() => {
        if (startDate) {
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            const calculatedWeek = Math.ceil(diffDays / 7) || 1;
            
            setCurrentWeek(calculatedWeek);

            // Generate options for weeks 1 to currentWeek
            const weeks = [];
            for (let i = calculatedWeek; i >= 1; i--) {
                weeks.push({
                    week: i,
                    label: i === calculatedWeek ? `Week ${i} (Current)` : `Week ${i}`,
                    isLate: i < calculatedWeek
                });
            }
            setSubmittableWeeks(weeks);
            
            // Default to current week
            setForm(f => ({ ...f, weekNumber: calculatedWeek.toString() }));
        }
    }, [user]);

    const [form, setForm] = useState({
        title: "",
        weekNumber: "",
        tasksCompleted: "",
        challenges: "",
        planForNextWeek: "",
    });

    const isSelectedWeekLate = submittableWeeks.find(w => w.week.toString() === form.weekNumber)?.isLate || false;
    const hasSubmittedForSelectedWeek = existingReports.some(r => r.weekNumber?.toString() === form.weekNumber);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.title.trim()) return;
        if (hasSubmittedForSelectedWeek) {
            toast.error(`You have already submitted a report for Week ${form.weekNumber}`);
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: form.title,
                    type: 'WEEKLY_REPORT',
                    internId: user?.intern?.id,
                    weekNumber: form.weekNumber ? Number(form.weekNumber) : undefined,
                    status: 'SUBMITTED',
                    submittedAt: new Date().toISOString(),
                    data: {
                        tasksCompleted: form.tasksCompleted,
                        challenges: form.challenges,
                        planForNextWeek: form.planForNextWeek,
                        isLate: isSelectedWeekLate
                    }
                }),
            });

            const json = await res.json();
            if (!res.ok || !json?.success) {
                toast.error(json?.message || 'Submission failed');
                return;
            }
            toast.success('Weekly report submitted successfully');
            setForm({ title: "", weekNumber: "", tasksCompleted: "", challenges: "", planForNextWeek: "" });
        } catch (error) {
            toast.error('An error occurred during submission');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-0.5 sm:gap-1 px-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Weekly Reports</h1>
                <p className="text-muted-foreground text-[11px] sm:text-sm">
                    Keep your mentors updated on your weekly progress and achievements.
                </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="p-3 sm:p-4 text-center">
                        <CardTitle className="text-sm sm:text-base flex items-center justify-center gap-2">
                            <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                            Reporting Guidelines
                        </CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">Fill out the form below for your weekly submission</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>List tasks completed this week</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>Mention any challenges encountered</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>Outline plans for next week</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="border-b p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            New Weekly Report
                        </CardTitle>
                        <CardDescription className="text-[11px] sm:text-xs">Submit your report for the current week.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-4 gap-3 sm:gap-4">
                                <div className="col-span-4 sm:col-span-3 space-y-1.5">
                                    <Label htmlFor="title" className="text-xs sm:text-sm font-semibold">Report Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g., Progress Update"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="col-span-4 sm:col-span-1 space-y-1.5">
                                    <Label htmlFor="weekNumber" className="text-xs sm:text-sm font-semibold">Week <span className="text-red-500">*</span></Label>
                                    <Select 
                                        value={form.weekNumber} 
                                        onValueChange={(value) => setForm(f => ({ ...f, weekNumber: value }))}
                                    >
                                        <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {submittableWeeks.map((week) => (
                                                <SelectItem key={week.week} value={week.week.toString()}>
                                                    {week.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {isSelectedWeekLate && !hasSubmittedForSelectedWeek && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        This report is for a past week and will be marked as <strong>LATE</strong>.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {hasSubmittedForSelectedWeek && (
                                <Alert variant="destructive" className="py-2 bg-red-50 text-red-900 border-red-200">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-xs font-medium">
                                        You have already submitted a report for Week {form.weekNumber}. You can only submit one report per week.
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="space-y-1.5">
                                <Label htmlFor="tasksCompleted" className="text-xs sm:text-sm font-semibold">Tasks Completed <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="tasksCompleted"
                                    value={form.tasksCompleted}
                                    onChange={(e) => setForm((f) => ({ ...f, tasksCompleted: e.target.value }))}
                                    placeholder="List the key tasks you completed this week..."
                                    rows={5}
                                    className="resize-none text-xs sm:text-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="challenges" className="text-xs sm:text-sm font-semibold">Challenges Faced</Label>
                                <Textarea
                                    id="challenges"
                                    value={form.challenges}
                                    onChange={(e) => setForm((f) => ({ ...f, challenges: e.target.value }))}
                                    placeholder="Describe any blockers or difficulties..."
                                    rows={3}
                                    className="resize-none text-xs sm:text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="planForNextWeek" className="text-xs sm:text-sm font-semibold">Plan for Next Week <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="planForNextWeek"
                                    value={form.planForNextWeek}
                                    onChange={(e) => setForm((f) => ({ ...f, planForNextWeek: e.target.value }))}
                                    placeholder="What do you plan to work on next week?"
                                    rows={3}
                                    className="resize-none text-xs sm:text-sm"
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-10 sm:h-11 text-sm sm:text-base font-bold" 
                                disabled={submitting || hasSubmittedForSelectedWeek}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                    </>
                                ) : hasSubmittedForSelectedWeek ? (
                                    <>Already Submitted</>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Submit Weekly Report
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t p-3 sm:p-4 flex justify-between items-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                        <p className="text-[10px] sm:text-xs text-muted-foreground italic">Your mentor will be notified immediately.</p>
                        <a href="/dashboard/intern/submissions" className="text-[10px] sm:text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                            View History <ExternalLink className="h-3 w-3" />
                        </a>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
