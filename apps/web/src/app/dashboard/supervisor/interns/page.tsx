"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, CheckCircle, FileText, Loader2, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { listInterns } from "@/lib/services/interns";
import { toast } from "sonner";

export default function InternsPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [interns, setInterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            try {
                const internsRes = await listInterns({ limit: 100 }, token);
                
                if (internsRes.data?.items) {
                    setInterns(internsRes.data.items);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
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
    const activeInterns = interns.filter((i) => i.status === "ACTIVE").length;
    const completedInterns = interns.filter((i) => i.status === "COMPLETED").length;
    const totalSubmissions = interns.reduce((acc, curr) => acc + (curr.submissionCount || 0), 0);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold">My Interns</h1>
                <p className="text-muted-foreground text-[11px] sm:text-sm mt-0.5 sm:mt-1">
                    Monitor progress and profiles for interns in your department.
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2 text-primary/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold leading-none">{totalInterns}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">Pool count</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-emerald-500/10">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2 text-emerald-600/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80">Active</span>
                            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold leading-none text-emerald-700/80">{activeInterns}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">Productive</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm bg-blue-50/10 border-blue-500/10">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2 text-blue-600/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold leading-none text-blue-700/80">{completedInterns}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">Finished</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm bg-amber-50/10 border-amber-500/10">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2 text-amber-600/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Docs</span>
                            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold leading-none text-amber-700/80">{totalSubmissions}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">Report volume</p>
                    </CardContent>
                </Card>
            </div>

            {interns.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg bg-muted/[0.03]">
                    <p className="text-muted-foreground text-xs sm:text-sm">No interns found in your department.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 pb-4">
                    {interns.map((intern) => (
                        <Card key={intern.id} className="hover:shadow-md transition-shadow duration-200 border-border/60">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border border-border shadow-sm">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                                                {(intern.firstName?.[0] || "") + (intern.lastName?.[0] || "")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{intern.firstName} {intern.lastName}</h3>
                                                <Badge className="sm:hidden text-[10px]" variant={intern.status === "ACTIVE" ? "success" : intern.status === "COMPLETED" ? "secondary" : "destructive"}>
                                                    {intern.status}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground leading-none mb-1.5">{intern.internId || "ID Pending"}</p>
                                            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed truncate">
                                                {intern.email}
                                                {intern.department ? ` • ${intern.department.name}` : ""}
                                            </p>

                                            <div className="mt-2.5 flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 h-4 sm:h-5 border-primary/20 bg-primary/[0.02] text-primary/70 font-bold uppercase tracking-tighter">
                                                        <GraduationCap className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Mentor
                                                    </Badge>
                                                    <span className="text-[11px] sm:text-xs font-semibold text-foreground/70">
                                                        {intern.mentor ? `${intern.mentor.firstName} ${intern.mentor.lastName}` : "Direct Supervision"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-[10px] sm:text-xs text-muted-foreground/60 mt-2 font-medium">
                                                {intern.startDate ? new Date(intern.startDate).toLocaleDateString() : "—"} 
                                                {" → "} 
                                                {intern.endDate ? new Date(intern.endDate).toLocaleDateString() : "—"}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className="hidden sm:inline-flex" variant={intern.status === "ACTIVE" ? "success" : intern.status === "COMPLETED" ? "secondary" : "destructive"}>
                                        {intern.status}
                                    </Badge>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                                    {(intern.skills && intern.skills.length > 0) && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {intern.skills.map((skill: string) => (
                                                <Badge key={skill} variant="outline" className="text-[9px] sm:text-[10px] font-medium border-border/60 text-muted-foreground">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                        <span className="text-muted-foreground font-medium">
                                            {intern.submissionCount > 0 
                                                ? `${intern.submissionCount} report${intern.submissionCount !== 1 ? 's' : ''} logged`
                                                : "Zero reports logged"
                                            }
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-primary font-bold px-0 hover:bg-transparent hover:underline transition-all"
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/supervisor/submissions?intern=${encodeURIComponent(intern.firstName + ' ' + intern.lastName)}`
                                                )
                                            }
                                        >
                                            View Activity →
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}