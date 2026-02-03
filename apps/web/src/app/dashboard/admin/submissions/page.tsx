"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listSubmissions } from "@/lib/services/submissions";
import { useAuth } from "@/components/auth-provider";

type SubmissionStatus = "PENDING" | "REVIEWED";

export default function AdminSubmissionsPage() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return; // wait for auth token
    void fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, token]);

  async function fetchSubmissions() {
    try {
      setLoading(true);
      const res = await listSubmissions({ page: 1, limit: 50, status: statusFilter === 'ALL' ? undefined : statusFilter }, token || undefined);
      const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
      setSubmissions(items);
    } catch (err) {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="px-2">
        <PageHeader title="Submissions Oversight" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Overview</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | "ALL")}
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
            </select>
            <Button variant="outline" size="sm" className="gap-1" type="button">
              <Filter className="h-3 w-3" />
              Filters
            </Button>
          </div>
        </CardHeader>
        {/* Removed explainer content */}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Intern</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted at</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading submissions...</TableCell>
                </TableRow>
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No submissions found.</TableCell>
                </TableRow>
              ) : submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="text-xs font-mono">{sub.id}</TableCell>
                  <TableCell>{sub.internName || sub.intern?.name || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{sub.internUniversity || sub.university?.name || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sub.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{(sub.submittedAt || '').toString()}</TableCell>
                  <TableCell>
                    <Badge variant={sub.status === "PENDING" ? "secondary" : "success"}>{sub.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="View submission"
                      type="button"
                      onClick={() => setSelected(sub)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Submission details</span>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setSelected(null)}
              >
                Close
              </Button>
            </CardTitle>
            <CardDescription className="text-xs">
              Summary of the selected submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
            <div>
              <div className="font-medium text-foreground">{selected.internName}</div>
              <div>{selected.internUniversity}</div>
            </div>
            <div>
              <div>ID: {selected.id}</div>
              <div>Type: {selected.type}</div>
              <div>Submitted at: {selected.submittedAt}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed relation explainer per request */}
    </div>
  );
}
