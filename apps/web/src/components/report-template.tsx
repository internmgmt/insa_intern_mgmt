"use client";

import { LogoBlock } from "@/components/logo-block";
import { Button } from "./ui/button";

export interface ReportTemplateProps {
  report?: {
    title?: string;
    weekNumber?: number | string;
    submittedAt?: string;
    status?: string;
    score?: number | null;
    maxScore?: number | null;
    feedback?: string | null;
    intern?: {
      internId?: string;
      user?: {
        firstName?: string;
        lastName?: string;
      };
    };
    student?: {
      firstName?: string;
      lastName?: string;
      studentId?: string;
    };
    data?: {
      tasksCompleted?: string;
      challenges?: string;
      planForNextWeek?: string;
      dateRange?: string;
      isLate?: boolean;
    };
  };
  className?: string;
}

const sanitizeText = (value?: string) => value?.trim() || "";

export function ReportTemplate({ report, className }: ReportTemplateProps) {
  // Ensure the user text is visible when printed (force high contrast colors in print media)
  const internName = report?.intern?.user
    ? `${report.intern.user.firstName || "Intern"} ${report.intern.user.lastName || ""}`.trim()
    : report?.student
    ? `${report.student.firstName || "Student"} ${report.student.lastName || ""}`.trim()
    : "INSA Intern";

  const status = report?.status || "DRAFT";
  const weekTitle = report?.weekNumber ? `Week ${report.weekNumber}` : "Week —";
  const submittedAt = report?.submittedAt
    ? new Date(report.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "Date TBD";
  const dateRange = report?.data?.dateRange || submittedAt;

  const score = typeof report?.score === "number" ? report.score : null;
  const maxScore = typeof report?.maxScore === "number" && report.maxScore > 0 ? report.maxScore : 100;
  const mentorFeedback = sanitizeText(report?.feedback || undefined);

  const tasksCompleted = sanitizeText(report?.data?.tasksCompleted);
  const challenges = sanitizeText(report?.data?.challenges);
  const planForNextWeek = sanitizeText(report?.data?.planForNextWeek);

  const keyMetrics = [
    {
      label: "Momentum",
      value: status === "APPROVED" ? "Signed off" : "In progress",
      detail: `Status: ${status}`,
    },
    {
      label: "Tasks Logged",
      value: tasksCompleted ? `${tasksCompleted.split("\n").filter(Boolean).length} entries` : "0 entries",
      detail: "Captured via the weekly dossier",
    },
    {
      label: "Next Cycle",
      value: planForNextWeek ? "Outlined" : "Designing",
      detail: planForNextWeek ? "Ready for execution" : "Plan pending",
    },
  ];

  const weeklyTasks = [
    {
      title: "Tasks Completed",
      description: tasksCompleted || "Awaiting the current week's narrative.",
      status: tasksCompleted ? "Documented" : "Pending",
    },
    {
      title: "Challenges & Blockers",
      description: challenges || "No blockers were recorded this cycle.",
      status: challenges ? "Logged" : "Clear",
    },
    {
      title: "Plan for Next Week",
      description: planForNextWeek || "Strategic planning will be added soon.",
      status: planForNextWeek ? "Set" : "To define",
    },
  ];

  const blockers = [
    {
      issue: challenges ? challenges : "Awaiting intern input",
      status: challenges ? "Monitoring and mitigation ongoing." : "No blockers reported yet.",
    },
  ];

  const nextGoals = [
    {
      objective: planForNextWeek ? planForNextWeek : "Reinforce mentor visibility into report signals",
      owner: "Intern",
    }
  ];

  return (
    <section
      className={`report-print-root relative isolate mx-auto w-full max-w-6xl overflow-hidden bg-slate-950 px-6 py-10 sm:px-10 sm:py-12 print:bg-white print:text-slate-900 ${className ?? ""}`}
    >
      {/* Gradient removed for cleaner export */ }
      <div className="relative z-10 space-y-8 print:text-slate-900">
        <header className="report-print-header flex flex-wrap items-start justify-between gap-6 border-b border-white/10 pb-6 sm:items-end print:border-slate-200">
          <div className="flex flex-col gap-4 text-white print:text-slate-900">
            <div className="flex items-center gap-4">
              <LogoBlock />
              <div>
                <p className="text-lg font-semibold text-amber-200/80 print:text-amber-700">
                  Information Network Security Administration
                </p>
                <p className="text-lg font-semibold text-amber-200/80 print:text-amber-700">
                  የኢንፎርሜሽን መረብ ደህንነት አስተዳደር
                </p>
                <p className="report-print-title text-2xl font-semibold tracking-tight text-white print:text-slate-900 mt-2">Intern Management System</p>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400 print:text-slate-500 mt-1">Weekly Performance Briefing</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm text-slate-300 sm:items-end print:text-slate-600">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 print:text-slate-500">Organization</p>
            <p className="text-base font-semibold text-white print:text-slate-900">INSA</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 print:text-slate-500">System</p>
            <p className="text-base font-semibold text-white print:text-slate-900">Intern Management</p>
            <div className="print:hidden">
                <Button variant="outline" size="sm" className="mt-3 border-white/20 text-white">
                Share Brief
                </Button>
            </div>
          </div>
        </header>

        <div className="report-print-summary grid gap-6 rounded-2xl border border-white/5 bg-white/5 p-5 text-sm text-slate-200 shadow-[0_0_40px_rgba(15,23,42,0.6)] sm:grid-cols-[1fr_0.95fr] print:bg-white print:text-slate-900 print:border-slate-200 print:shadow-none">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 print:text-slate-500">Intern Name</p>
            <h3 className="text-xl font-semibold text-white print:text-slate-900">{internName}</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 print:text-slate-500">
              ID: {report?.student?.studentId || report?.intern?.internId || "—"}
            </p>
          </div>
          <div className="grid gap-2 text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-right print:text-slate-500">
            <span>{weekTitle}</span>
            <span>Date: {dateRange}</span>
            <span className="py-1 text-xs tracking-[0.2em] text-emerald-300 print:text-emerald-700">Status: {status}</span>
            <span className="text-xs tracking-[0.2em] text-slate-300 print:text-slate-600">
              Grade: {score !== null ? `${score}/${maxScore}` : "Pending"}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="report-print-metrics grid gap-4 md:grid-cols-3">
            {keyMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-900/40 p-5 print:bg-white print:border-slate-200"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 print:text-slate-500">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white print:text-slate-900">{metric.value}</p>
                <p className="mt-2 text-xs text-slate-400 print:text-slate-600">{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="report-print-main-row grid gap-5 lg:grid-cols-[1.3fr,_1fr]">
            <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5 print:bg-white print:border-slate-200 print:shadow-none">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white print:text-slate-900">Tasks Completed</h3>
                </div>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-line print:text-slate-700">
                {tasksCompleted
                  ? tasksCompleted
                  : "No tasks recorded for this week."}
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/30 p-5 print:bg-white print:border-slate-200">
              <h3 className="text-lg font-semibold text-white print:text-slate-900">Overview</h3>
              <div className="space-y-3">
                {weeklyTasks.map((task) => (
                  <div key={task.title} className="space-y-1">
                    <div className="flex items-center justify-between text-sm font-semibold text-white print:text-slate-900">
                      <span>{task.title}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-amber-200 print:text-amber-700">{task.status}</span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-line print:text-slate-600">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="report-print-two-col grid gap-6 rounded-2xl border border-white/5 bg-white/5 p-6 sm:grid-cols-2 print:bg-white print:border-slate-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white print:text-slate-900">Challenges & Blockers</h3>
            <div className="space-y-3">
              {blockers.map((blocker) => (
                <div key={blocker.issue} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 print:bg-slate-50 print:border-slate-200">
                  <p className="text-sm font-semibold text-white print:text-slate-900">{blocker.issue}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white print:text-slate-900">Plan for Next Week</h3>
            <div className="space-y-3 text-slate-200 print:text-slate-900">
              {nextGoals.map((goal) => (
                <div key={goal.objective} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 print:bg-slate-50 print:border-slate-200">
                  <p className="font-semibold text-white print:text-slate-900">{goal.objective}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900/70 via-slate-950 to-slate-900/50 p-6 text-slate-100 print:bg-white print:border-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-white print:text-slate-900">Mentor Evaluation & Feedback</h3>
            </div>
            <div className="print:hidden">
                <Button variant="ghost" size="sm" className="text-white">
                Add Notation
                </Button>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-200 print:text-slate-700 whitespace-pre-line">
            {mentorFeedback
              ? mentorFeedback
              : "Mentor has not yet added formal notes for this cycle."}
          </p>
        </div>
      </div>
    </section>
  );
}
