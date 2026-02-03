"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

const overview = {
  totalInterns: 12,
  activeInterns: 9,
  pendingSubmissions: 3,
  completedThisMonth: 4,
};

const recentSubmissions = [
  {
    id: "sub-001",
    title: "Weekly Report – Week 4",
    internName: "Yared Getachew",
    type: "WEEKLY_REPORT" as const,
    createdAt: "2025-02-20",
  },
  {
    id: "sub-002",
    title: "Malware Analysis Project",
    internName: "Mimi Worku",
    type: "PROJECT_FILE" as const,
    createdAt: "2025-02-19",
  },
  {
    id: "sub-003",
    title: "Log parser script",
    internName: "Samuel Bekele",
    type: "CODE" as const,
    createdAt: "2025-02-18",
  },
];

const departmentStats = {
  averageEvaluation: 3.7,
  submissionComplianceRate: 96,
};

export default function SupervisorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Supervisor Dashboard"
        description="Overview of your department load and recent submissions."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total interns</CardDescription>
            <CardTitle className="text-2xl">{overview.totalInterns}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active interns</CardDescription>
            <CardTitle className="text-2xl">{overview.activeInterns}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending submissions</CardDescription>
            <CardTitle className="text-2xl">{overview.pendingSubmissions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Completed this month</CardDescription>
            <CardTitle className="text-2xl">{overview.completedThisMonth}</CardTitle>
          </CardHeader>
        </Card>
      </div>

            <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent submissions</CardTitle>
            <CardDescription>Latest work from interns in your department.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSubmissions.map((sub) => (
              <Card key={sub.id}>
                <CardContent className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="p-2">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{sub.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {sub.internName} • {sub.createdAt}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    {sub.type.replace("_", " ")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department performance</CardTitle>
            <CardDescription>Quick view of evaluations and compliance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-baseline justify-between">
              <span>Average evaluation</span>
              <span className="text-lg font-semibold text-foreground">
                {departmentStats.averageEvaluation.toFixed(1)} / 4.0
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span>Submission compliance</span>
              <span className="text-lg font-semibold text-foreground">
                {departmentStats.submissionComplianceRate}%
              </span>
            </div>
            <p className="text-xs pt-1">
              These figures are based on submissions and evaluations in your department.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
