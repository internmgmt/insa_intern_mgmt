"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, CheckCircle, FileText, Loader2, Mail, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { listInterns } from "@/lib/services/interns";
import { createSubmission } from "@/lib/services/submissions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function MentorInternsPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [interns, setInterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Give Task Logic
    const [selectedIntern, setSelectedIntern] = useState<any | null>(null);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            try {
                const response = await listInterns({ limit: 100 }, token);
                if (response.data?.items) {
                    setInterns(response.data.items);
                }
            } catch (error) {
                console.error("Failed to fetch interns:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    async function handleGiveTask() {
        if (!selectedIntern || !token || !taskTitle.trim()) return;
        try {
            setIsAssigning(true);
            await createSubmission({
                internId: selectedIntern.id,
                title: taskTitle.trim(),
                description: taskDesc.trim(),
                type: 'TASK',
                status: 'ASSIGNED'
            }, token);
            toast.success(`Task assigned to ${selectedIntern.firstName}`);
            setShowTaskDialog(false);
            setTaskTitle("");
            setTaskDesc("");
        } catch (error: any) {
            toast.error(error?.message || "Failed to assign task");
        } finally {
            setIsAssigning(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-0.5 sm:gap-1 px-1">
                <h1 className="text-xl sm:text-2xl font-bold">My Interns</h1>
                <p className="text-muted-foreground text-[11px] sm:text-sm">
                    Track the progress and workload of interns assigned to you.
                </p>
            </div>

            {interns.length === 0 ? (
                <Card className="border-dashed h-40 flex items-center justify-center bg-muted/5 mx-1">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                        <Users className="h-8 w-8 opacity-20" />
                        <p className="text-xs sm:text-sm font-medium">No interns currently assigned to you.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-1">
                    {interns.map((intern) => (
                        <Card key={intern.id} className="hover:shadow-md transition-shadow overflow-hidden group border-border/60">
                            <CardContent className="p-0">
                                <div className="p-3 sm:p-5 border-b bg-muted/[0.03] flex flex-col justify-between gap-2">
                                    <div className="flex justify-between items-start">
                                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-background shadow-sm rounded-lg">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm rounded-lg">
                                                {(intern.firstName?.[0] || "") + (intern.lastName?.[0] || "")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Badge variant={intern.status === "ACTIVE" ? "success" : "secondary"} className="text-[9px] sm:text-[10px] font-bold h-5 px-1.5 uppercase tracking-wider">
                                            {intern.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm sm:text-base truncate leading-tight">{intern.firstName} {intern.lastName}</h3>
                                        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase tracking-tighter mt-0.5 opacity-70">
                                            {intern.internId || "ID PENDING"}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
                                            <Mail className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{intern.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground truncate">
                                            <ClockIcon className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                                {intern.startDate ? new Date(intern.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "-"} → {intern.endDate ? new Date(intern.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "-"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-3 sm:pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 sm:h-8 rounded-lg flex-1 gap-1 text-[10px] sm:text-xs font-bold px-2"
                                            onClick={() => {
                                                setSelectedIntern(intern);
                                                setTaskTitle("");
                                                setTaskDesc("");
                                                setShowTaskDialog(true);
                                            }}
                                        >
                                            <PlusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                            <span className="truncate">Task</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-7 sm:h-8 rounded-lg flex-1 text-[10px] sm:text-xs font-bold px-2"
                                            onClick={() => router.push(`/dashboard/mentor/submissions?internId=${intern.id}`)}
                                        >
                                            <span className="truncate">Progress</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogContent className="w-[calc(100vw-32px)] sm:max-w-md p-4 sm:p-6 overflow-hidden">
                    <DialogHeader className="pb-1 sm:pb-2">
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Assign New Task
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Create a specific task for {selectedIntern?.firstName}. They will see this in their dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2 sm:py-4">
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Task Title</label>
                            <Input 
                                placeholder="e.g. Weekly Progress Report - Week 3" 
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                className="h-8 sm:h-10 text-xs sm:text-sm"
                            />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Requirements & Details</label>
                            <Textarea 
                                placeholder="Describe exactly what needs to be done..." 
                                className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm resize-none"
                                value={taskDesc}
                                onChange={(e) => setTaskDesc(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-row justify-end gap-2 mt-2 sm:mt-0">
                        <Button variant="ghost" size="sm" className="h-8 sm:h-10 text-xs flex-1 sm:flex-none" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
                        <Button 
                            size="sm"
                            className="h-8 sm:h-10 text-xs flex-1 sm:flex-none"
                            disabled={isAssigning || !taskTitle.trim()} 
                            onClick={handleGiveTask}
                        >
                            {isAssigning ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" /> : <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />}
                            Publish Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}
