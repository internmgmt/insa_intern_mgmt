"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type InternStatus = "ACTIVE" | "COMPLETED" | "TERMINATED";

type InternRow = {
    id: string;
    internId: string;
    name: string;
    status: InternStatus;
    startDate: string;
    endDate: string;
    fieldOfStudy: string;
    email: string;
    skills: string[];
    lastSubmission: string;
};

const interns: InternRow[] = [
    {
        id: "1",
        internId: "INSA-2025-001",
        name: "Yared Getachew",
        status: "ACTIVE",
        startDate: "2025-07-01",
        endDate: "2025-10-31",
        fieldOfStudy: "Computer Science",
        email: "yared.getachew@example.com",
        skills: ["Go", "Linux", "Monitoring"],
        lastSubmission: "Weekly report • 2 days ago",
    },
    {
        id: "2",
        internId: "INSA-2025-002",
        name: "Mimi Worku",
        status: "ACTIVE",
        startDate: "2025-07-01",
        endDate: "2025-10-31",
        fieldOfStudy: "Information Security",
        email: "mimi.worku@example.com",
        skills: ["Network security", "Python"],
        lastSubmission: "Project file • 5 days ago",
    },
    {
        id: "3",
        internId: "INSA-2025-003",
        name: "Samuel Bekele",
        status: "COMPLETED",
        startDate: "2025-03-01",
        endDate: "2025-06-30",
        fieldOfStudy: "Software Engineering",
        email: "samuel.bekele@example.com",
        skills: ["TypeScript", "React", "API design"],
        lastSubmission: "Final report • last month",
    },
];

export default function InternsPage() {
    const router = useRouter();

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
                        <div className="text-2xl font-bold">{interns.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total interns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="h-5 w-5 text-success" />
                        </div>
                        <div className="text-2xl font-bold">3.7</div>
                        <p className="text-xs text-muted-foreground mt-1">Avg evaluation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending submissions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed this month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {interns.map((intern) => (
                    <Card key={intern.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {intern.name.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-lg">{intern.name}</h3>
                                        <p className="text-xs text-muted-foreground">{intern.internId}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {intern.fieldOfStudy} • {intern.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {intern.startDate} → {intern.endDate}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={intern.status === "ACTIVE" ? "success" : "secondary"}>
                                    {intern.status}
                                </Badge>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex flex-wrap gap-2 text-[11px]">
                                    {intern.skills.map((skill) => (
                                        <Badge key={skill} variant="outline">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                                    <span>{intern.lastSubmission}</span>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0"
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/supervisor/submissions?intern=${encodeURIComponent(intern.name)}`
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
        </div>
    );
}
