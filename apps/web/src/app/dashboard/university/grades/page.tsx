"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Filter, Search, GraduationCap, Users, CheckCircle2 } from "lucide-react";
import { listInterns } from "@/lib/services/interns";

export default function UniversityGradesPage() {
  const { token, user } = useAuth();

  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!token || user?.role !== "UNIVERSITY") return;
      try {
        setLoading(true);
        const res = await listInterns({ limit: 50 }, token);
        if ((res as any).data?.items) {
          setInterns((res as any).data.items);
        }
      } catch (error) {
        console.error("Failed to load interns for university grades:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, user?.role]);

  const gradedInterns = useMemo(() => {
    // University coordinators should only see grades after internship office approval
    const graded = interns.filter(
      (i: any) => typeof i.finalEvaluation === "number" && i.gradingStatus === "APPROVED"
    );
    return graded.filter((i: any) => {
      const fullName = `${i.firstName || ""} ${i.lastName || ""}`.trim() || "Unknown";
      const matchesSearch =
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || i.gradingStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [interns, searchQuery, statusFilter]);

  const totalGraded = gradedInterns.length;
  const approvedCount = gradedInterns.filter((i: any) => i.gradingStatus === "APPROVED").length;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-2 sm:px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Intern Grades</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            All final grades recorded for students from your university.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Graded Interns</p>
              <p className="text-2xl font-bold mt-1">{totalGraded}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/5 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Approved Grades</p>
              <p className="text-2xl font-bold mt-1">{approvedCount}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Awaiting Approval</p>
              <p className="text-2xl font-bold mt-1">{gradedInterns.filter((i: any) => i.gradingStatus !== "APPROVED").length}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Grade Records
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Filter by grading status and search by name or email.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Grading Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending approval</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="h-9 pl-8 text-xs"
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {gradedInterns.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No grades have been recorded yet for your university.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="min-w-[180px]">Intern</TableHead>
                    <TableHead className="min-w-[140px]">Department</TableHead>
                    <TableHead className="w-[140px]">Final Grade</TableHead>
                    <TableHead className="w-[140px]">Grading Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradedInterns.map((intern) => {
                    const fullName = `${intern.firstName || ""} ${intern.lastName || ""}`.trim() || "Unknown";
                    const finalPercentDisplay =
                      typeof intern.finalEvaluation === "number"
                        ? (intern.finalEvaluation * 25).toFixed(1)
                        : null;
                    return (
                      <TableRow key={intern.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground truncate">{fullName}</span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {intern.email || "No email"}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70">
                              {intern.internId || "ID Pending"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-foreground/80">
                            {intern.department?.name || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-foreground/90">
                            {finalPercentDisplay !== null ? `${finalPercentDisplay} / 100` : "Not set"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              intern.gradingStatus === "APPROVED"
                                ? "success"
                                : intern.gradingStatus === "REJECTED"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[10px] px-2 py-0.5"
                          >
                            {intern.gradingStatus || "PENDING_APPROVAL"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
