"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { getMyProfile } from "@/lib/services/interns";
import { Loader2, Clock, FileText, CheckCircle2, GraduationCap, TrendingUp, Calendar, Building2, User, Download, AlertCircle } from "lucide-react";
import { DonutChart } from "@/components/ui/charts";

export default function InternDashboardPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const [profileRes, submissionsRes] = await Promise.all([
          getMyProfile(token),
          fetch('/api/submissions/my', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.json())
        ]);

        const profile = profileRes.data || {};
        const submissions = submissionsRes.success ? (submissionsRes.data.items as any[]) : [];

        // Process internship data
        const startDate = profile.startDate ? new Date(profile.startDate) : new Date();
        const endDate = profile.endDate ? new Date(profile.endDate) : new Date();
        const now = new Date();
        
        const totalTime = endDate.getTime() - startDate.getTime();
        const completedTime = now.getTime() - startDate.getTime();
        
        const totalDays = Math.max(1, Math.ceil(totalTime / (1000 * 60 * 60 * 24)));
        const daysCompleted = Math.max(0, Math.min(totalDays, Math.ceil(completedTime / (1000 * 60 * 60 * 24))));
        const daysRemaining = Math.max(0, totalDays - daysCompleted);
        const completionPercentage = Math.min(100, Math.max(0, parseFloat(((completedTime / totalTime) * 100).toFixed(1))));

        // Process submissions stats
        const stats = {
          total: submissions.length,
          pending: submissions.filter((s: any) => s.status === 'SUBMITTED').length,
          approved: submissions.filter((s: any) => s.status === 'APPROVED').length,
          rejected: submissions.filter((s: any) => s.status === 'REJECTED').length,
          needsRevision: submissions.filter((s: any) => s.status === 'NEEDS_REVISION').length,
        };

        // Process weekly reports
        const weeklyReports = submissions.filter((s: any) => s.type === 'WEEKLY_REPORT');
        const submittedWeeks = weeklyReports
          .map((s: any) => s.weekNumber)
          .filter((w: any) => w != null)
          .sort((a: number, b: number) => a - b);
        
        const currentWeek = Math.ceil(daysCompleted / 7) || 1;
        const missingWeeks: number[] = [];
        for (let i = 1; i < currentWeek; i++) {
          if (!submittedWeeks.includes(i)) missingWeeks.push(i);
        }

        setData({
          intern: {
            firstName: profile.firstName || 'Unknown',
            lastName: profile.lastName || 'Intern',
            email: profile.email || ''
          },
          internship: {
            status: profile.status || 'ACTIVE',
            startDate: profile.startDate ? new Date(profile.startDate).toLocaleDateString() : 'Not set',
            endDate: profile.endDate ? new Date(profile.endDate).toLocaleDateString() : 'Not set',
            daysRemaining,
            daysCompleted,
            totalDays,
            completionPercentage,
          },
          department: profile.department || { name: '—' },
          supervisor: profile.supervisor || { firstName: '—', lastName: '' },
          mentor: profile.mentor || null,
          submissions: stats,
          recentSubmissions: submissions.slice(0, 5),
          weeklyReportStatus: {
            currentWeek,
            submittedWeeks,
            missingWeeks,
          },
          certificate: {
            issued: profile.certificateIssued || false,
            url: profile.certificateUrl || null,
          },
          internId: profile.internId || 'N/A'
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }

  const { intern, internship, department, supervisor, mentor, submissions, recentSubmissions, weeklyReportStatus, certificate, internId } = data;

  const submissionDistribution = [
    { label: "Approved", value: submissions.approved, color: "hsl(158, 29%, 55%)" },
    { label: "Pending", value: submissions.pending, color: "hsl(22, 34%, 57%)" },
    { label: "Needs Info", value: submissions.needsRevision, color: "hsl(210, 20%, 50%)" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Internship Intelligence"
        description="Strategic overview of your performance, deadlines, and active reporting cycles"
      />

      {/* Compliance Alert for Mandatory Reports */}
      {weeklyReportStatus.missingWeeks.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5 shadow-lg border-l-4 border-l-destructive mx-1">
          <CardContent className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-destructive">Missing Reports</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  You have <span className="font-bold text-foreground">{weeklyReportStatus.missingWeeks.length} outstanding weekly reports</span>.
                </p>
              </div>
            </div>
            <Button variant="destructive" size="sm" className="font-bold text-[10px] uppercase tracking-tighter px-4 rounded-lg w-full md:w-auto h-8" asChild>
              <a href="/dashboard/intern/reports">Resolve Now</a>
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-1">
        {[
          { title: "Timeline", label: "Days Left", value: internship.daysRemaining, icon: Clock, color: "text-[#5ba1a2]", bg: "bg-[#5ba1a2]/10" },
          { title: "Output", label: "Submissions", value: submissions.total, icon: FileText, color: "text-[#b28b71]", bg: "bg-[#b28b71]/10" },
          { title: "Quality", label: "Approved", value: submissions.approved, icon: CheckCircle2, color: "text-[#8bac99]", bg: "bg-[#8bac99]/10" },
          { title: "Status", label: "Progress", value: `${internship.completionPercentage}%`, icon: GraduationCap, color: "text-[#b28b71]", bg: "bg-[#b28b71]/10" },
        ].map((kpi, i) => (
          <Card key={i} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-6 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-muted-foreground truncate">{kpi.title}</p>
                <h3 className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1 truncate">{kpi.value.toLocaleString()}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{kpi.label}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 ${kpi.bg} ${kpi.color} ml-2`}>
                <kpi.icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-1">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <div>
                <CardTitle className="text-base sm:text-lg">Internship Progress</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs">Visual timeline of your journey.</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[9px] sm:text-[10px] uppercase tracking-tighter shadow-sm h-5 px-2">
                ID: {internId}
              </Badge>
            </CardHeader>
            <CardContent className="pt-2 sm:pt-4 p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-[9px] sm:text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                        {internship.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold inline-block text-primary">
                        {internship.completionPercentage}%
                      </span>
                    </div>
                  </div>
                  <Progress value={internship.completionPercentage} className="h-2 sm:h-3" />
                  <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground mt-2 uppercase font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" /> Start: {internship.startDate}
                    </div>
                    <div className="flex items-center gap-1 text-right">
                      End: {internship.endDate} <TrendingUp className="h-2.5 w-2.5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-border/60">
                  <div className={`p-3 sm:p-4 rounded-xl border shadow-inner ${mentor ? 'bg-[#5ba1a2]/5 border-[#5ba1a2]/20' : 'bg-muted/10 opacity-60 border-dashed'}`}>
                    <p className={`text-[9px] sm:text-[10px] uppercase font-bold mb-2 sm:mb-3 flex items-center gap-1.5 ${mentor ? 'text-[#5ba1a2]' : 'text-muted-foreground'}`}>
                      <GraduationCap className="h-3 w-3" /> Technical Mentor
                    </p>
                    {mentor ? (
                      <>
                        <p className="text-sm sm:text-base font-bold truncate">{mentor.firstName} {mentor.lastName}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">{mentor.email}</p>
                      </>
                    ) : (
                      <p className="text-xs sm:text-sm font-bold italic text-muted-foreground mt-2 uppercase tracking-tighter">Awaiting Assignment</p>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-muted/20 border shadow-inner">
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground mb-2 sm:mb-3 flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" /> Strategic Unit
                    </p>
                    <p className="text-sm sm:text-base font-bold truncate">{department.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">{department.type || "Functional Unit"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity Pulse</CardTitle>
                <CardDescription>The latest submissions reviewed by your department</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-[10px] font-bold uppercase tracking-widest h-7">
                <a href="/dashboard/intern/submissions">View All</a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed rounded-xl bg-muted/10 opacity-50">
                    <p className="text-sm">No activity recorded for this period</p>
                  </div>
                ) : (
                  recentSubmissions.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/5 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-lg bg-background border shadow-sm group-hover:border-primary/20 group-hover:text-primary transition-all">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-none">{sub.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1.5 uppercase font-medium tracking-wide">
                            {sub.type.replace("_", " ")} • {new Date(sub.createdAt).toLocaleDateString()}
                          </p>
                          {sub.score !== undefined && sub.score !== null && (
                            <p className="text-[10px] text-primary font-bold mt-1 uppercase">
                              Score: {sub.score}/{sub.maxScore || 100}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          sub.status === "APPROVED" ? "success" : 
                          sub.status === "SUBMITTED" ? "warning" : "secondary"
                        } 
                        className="text-[9px] font-bold uppercase tracking-tighter"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {new Date().getDay() === 5 && (
            <Card className="border-[#b28b71]/50 bg-[#b28b71]/10 shadow-lg animate-pulse">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-[#b28b71]">
                  <Clock className="h-4 w-4" /> Friday Protocol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] font-bold text-[#b28b71] uppercase tracking-wider mb-2">Final Weekly Submission Due</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Today marks the end of report period <span className="text-foreground font-bold">Week {weeklyReportStatus.currentWeek}</span>. 
                  Ensure your performance brief is submitted before midnight to avoid compliance locks.
                </p>
                <Button size="sm" className="w-full mt-4 bg-[#b28b71] hover:bg-[#b28b71]/90 text-white font-bold text-[10px] uppercase rounded-xl" asChild>
                  <a href="/dashboard/intern/reports">Upload Brief</a>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Distribution</CardTitle>
              <CardDescription className="text-xs">Submission status mix</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <DonutChart 
                data={submissionDistribution.length > 0 ? submissionDistribution : [{ label: "No Submissions", value: 1, color: "hsl(210, 20%, 90%)" }]}
                centerLabels={{ label: "Status", value: "Submissions" }}
                size={160}
              />
              <div className="w-full mt-6 space-y-2">
                {[
                  { label: "Approved", value: submissions.approved, color: "bg-[#8bac99]" },
                  { label: "Pending", value: submissions.pending, color: "bg-[#b28b71]" },
                  { label: "Revision", value: submissions.needsRevision, color: "bg-slate-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4 w-4" /> Final Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-background rounded-xl border border-primary/10 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Certification Status</p>
                {certificate.issued && weeklyReportStatus.missingWeeks.length === 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <CheckCircle2 className="h-4 w-4" /> Document Verified
                    </div>
                    <Button variant="default" size="sm" className="w-full font-bold h-9" asChild>
                      <a href={certificate.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" /> Download Certificate
                      </a>
                    </Button>
                  </div>
                ) : certificate.issued && weeklyReportStatus.missingWeeks.length > 0 ? (
                   <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-tighter">
                      <AlertCircle className="h-3.5 w-3.5" /> Compliance Hold
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-relaxed italic">
                      "Certificate is ready but held due to missing weekly reports. Please resolve compliance issues to unlock."
                    </div>
                    <div className="w-full bg-amber-500/10 h-9 rounded-lg border border-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-600 uppercase tracking-widest cursor-not-allowed">
                      Compliance Lock
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground leading-relaxed italic">
                      "Certificate becomes accessible upon department head approval and successful completion of 100% requirements."
                    </div>
                    <div className="w-full bg-muted/50 h-9 rounded-lg border border-dashed flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Locked
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-background rounded-xl border border-primary/10 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Reporting Cycle</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current Cycle</span>
                    <span className="font-bold">Week {weeklyReportStatus.currentWeek}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Missed Reports</span>
                    <span className={`font-bold ${weeklyReportStatus.missingWeeks.length > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                      {weeklyReportStatus.missingWeeks.length || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
