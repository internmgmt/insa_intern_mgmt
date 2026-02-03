"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const dashboardData = {
  intern: {
    id: "uuid-1",
    internId: "INSA-2025-001",
    firstName: "Yared",
    lastName: "Getachew",
    email: "yared.getachew@example.com",
  },
  internship: {
    status: "ACTIVE" as const,
    startDate: "2025-07-01",
    endDate: "2025-10-31",
    daysRemaining: 85,
    daysCompleted: 5,
    totalDays: 90,
    completionPercentage: 6,
  },
  department: {
    id: "dept-1",
    name: "Cybersecurity Operations",
    type: "CYBERSECURITY",
  },
  supervisor: {
    id: "sup-1",
    firstName: "Melaku",
    lastName: "Abebe",
    email: "melaku.abebe@example.com",
  },
  submissions: {
    total: 4,
    pending: 1,
    approved: 2,
    rejected: 0,
    needsRevision: 1,
  },
  submissionsByType: {
    WEEKLY_REPORT: 3,
    PROJECT_FILE: 1,
    CODE: 0,
    TASK: 0,
    DOCUMENT: 0,
  },
  recentSubmissions: [
    {
      id: "sub-1",
      title: "Weekly Report – Week 1",
      type: "WEEKLY_REPORT",
      status: "APPROVED",
      supervisorFeedback: "Good start, keep this level of detail.",
      createdAt: "2025-07-08",
    },
    {
      id: "sub-2",
      title: "Weekly Report – Week 2",
      type: "WEEKLY_REPORT",
      status: "NEEDS_REVISION",
      supervisorFeedback: "Clarify log sources and add screenshots.",
      createdAt: "2025-07-15",
    },
    {
      id: "sub-3",
      title: "Malware analysis project outline",
      type: "PROJECT_FILE",
      status: "PENDING",
      supervisorFeedback: null,
      createdAt: "2025-07-18",
    },
  ],
  weeklyReportStatus: {
    currentWeek: 3,
    submittedWeeks: [1, 2],
    missingWeeks: [3],
  },
  certificate: {
    issued: false,
    url: null as string | null,
  },
};

export default function InternDashboardPage() {
  const { intern, internship, department, supervisor, submissions, recentSubmissions, weeklyReportStatus, certificate } =
    dashboardData;

  return (
		<div className="space-y-6">
      <PageHeader
        title="Intern Dashboard"
        description="Track your internship progress, deadlines, and submissions."
      />

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                {intern.firstName} {intern.lastName}
                <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
                  {internship.status}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {department.name} • Supervisor: {supervisor.firstName} {supervisor.lastName}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Completion</span>
                <span className="font-medium text-foreground">{internship.completionPercentage}%</span>
              </div>
              <Progress value={internship.completionPercentage} />
              <div className="mt-1 text-xs">
                {internship.daysCompleted} days completed • {internship.daysRemaining} days remaining
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-muted-foreground">Intern ID</div>
                <div className="text-foreground font-medium">{intern.internId}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Period</div>
                <div className="text-foreground">
                  {internship.startDate} → {internship.endDate}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission overview</CardTitle>
            <CardDescription>Your submission counts by status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="text-foreground font-semibold">{submissions.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending</span>
              <span className="text-foreground">{submissions.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Approved</span>
              <span className="text-foreground">{submissions.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Needs revision</span>
              <span className="text-foreground">{submissions.needsRevision}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent submissions</CardTitle>
            <CardDescription>Latest submissions and supervisor feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium text-foreground">{sub.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {sub.type.replace("_", " ")} • {sub.createdAt}
                  </div>
                  {sub.supervisorFeedback && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Feedback: {sub.supervisorFeedback}
                    </div>
                  )}
                </div>
                <Badge
                  variant={
                    sub.status === "APPROVED"
                      ? "success"
                      : sub.status === "PENDING"
                      ? "warning"
                      : "secondary"
                  }
                  className="text-[10px]"
                >
                  {sub.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly reports</CardTitle>
            <CardDescription>Week {weeklyReportStatus.currentWeek} status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Submitted weeks</span>
              <span className="text-foreground">{weeklyReportStatus.submittedWeeks.join(", ")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Missing weeks</span>
              <span className="text-foreground">
                {weeklyReportStatus.missingWeeks.length ? weeklyReportStatus.missingWeeks.join(", ") : "None"}
              </span>
            </div>
            <div className="pt-2 border-t text-xs">
              <div className="font-medium text-foreground mb-1">Certificate</div>
              <p>
                {certificate.issued
                  ? "Your completion certificate is ready to download."
                  : "Your certificate will be available after final evaluation and approval."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
