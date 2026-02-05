"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, CheckCircle, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { listInterns } from "@/lib/services/interns";

export default function InternsPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [interns, setInterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Interns</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Monitor progress and profiles for interns in your department.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-2xl font-bold">{totalInterns}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total interns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <UserCheck className="h-5 w-5 text-success" />
                        </div>
                        <div className="text-2xl font-bold">{activeInterns}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active interns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">{completedInterns}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <FileText className="h-5 w-5 text-warning" />
                        </div>
                        <div className="text-2xl font-bold">{totalSubmissions}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total submissions</p>
                    </CardContent>
                </Card>
            </div>

            {interns.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">No interns found in your department.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {interns.map((intern) => (
                        <Card key={intern.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                {(intern.firstName?.[0] || "") + (intern.lastName?.[0] || "")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-lg">{intern.firstName} {intern.lastName}</h3>
                                            <p className="text-xs text-muted-foreground">{intern.internId || "ID Pending"}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {intern.email}
                                                {intern.department ? ` • ${intern.department.name}` : ""}
                                            </p>
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                <span>
                                                    {intern.startDate ? new Date(intern.startDate).toLocaleDateString() : "—"} 
                                                    {" → "} 
                                                    {intern.endDate ? new Date(intern.endDate).toLocaleDateString() : "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={intern.status === "ACTIVE" ? "success" : intern.status === "COMPLETED" ? "secondary" : "destructive"}>
                                        {intern.status}
                                    </Badge>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {(intern.skills && intern.skills.length > 0) && (
                                        <div className="flex flex-wrap gap-2 text-[11px]">
                                            {intern.skills.map((skill: string) => (
                                                <Badge key={skill} variant="outline">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-4">
                                        <span>
                                            {intern.submissionCount > 0 
                                                ? `${intern.submissionCount} submission${intern.submissionCount !== 1 ? 's' : ''} uploaded`
                                                : "No submissions yet"
                                            }
                                        </span>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto p-0"
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/supervisor/submissions?intern=${encodeURIComponent(intern.firstName + ' ' + intern.lastName)}`
                                                )
                                            }
                                        >
                                            View submissions →
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