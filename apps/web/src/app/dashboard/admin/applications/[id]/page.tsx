"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getApplication, updateApplication } from "@/lib/services/applications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [app, setApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [academicYear, setAcademicYear] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    async function load() {
      if (!token || !params?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res: any = await getApplication(params.id, token);
        const data = res?.data ?? res;
        setApp(data);
        setAcademicYear(data?.academicYear ?? "");
        setName(data?.name ?? "");
      } catch (e: any) {
        setError(e?.message ?? "Failed to load application");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [token, params?.id]);

  async function save() {
    if (!token || !app) return;
    setError(null);
    try {
      const res: any = await updateApplication(app.id, { academicYear, name }, token);
      const data = res?.data ?? res;
      setApp(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save application");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-destructive">{error}</div>;
  if (!app) return <div className="p-6">No application found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{app.name || 'Application Detail'}</h1>
        <Link href="/dashboard/admin/applications" className="text-sm underline">Back to list</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {app.status === 'REJECTED' && app.reviewNotes && (
          <Card className="md:col-span-2 border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Rejection Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive/80 font-medium">
                {app.reviewNotes}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Core application details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="text-muted-foreground">Name:</span> <span className="font-semibold">{app.name || "-"}</span></div>
            <div><span className="text-muted-foreground">ID:</span> <span className="font-mono">{app.id}</span></div>
            <div><span className="text-muted-foreground">Status:</span> {app.status}</div>
            <div><span className="text-muted-foreground">University:</span> {app.university?.name ?? "-"}</div>
            <div><span className="text-muted-foreground">Created:</span> {app.createdAt ? new Date(app.createdAt).toLocaleString() : "-"}</div>
            <div><span className="text-muted-foreground">Updated:</span> {app.updatedAt ? new Date(app.updatedAt).toLocaleString() : "-"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit</CardTitle>
            <CardDescription>Update basic fields</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="appName" className="text-sm font-medium">Name</label>
              <Input id="appName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label htmlFor="academicYear" className="text-sm font-medium">Academic Year</label>
              <Input id="academicYear" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
            </div>
            <Button onClick={save}>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
