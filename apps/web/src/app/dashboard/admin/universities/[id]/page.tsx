"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Trash2,
} from "lucide-react";
import {
  deleteUniversityPermanently,
  getUniversityById,
} from "@/lib/services/universities";
import { listUsers } from "@/lib/services/users";
import { listApplications } from "@/lib/services/applications";
import { listDocuments } from "@/lib/services/documents";
import { toast } from "sonner";

type UniversityDetail = {
  id: string;
  name: string;
  address?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  coordinator?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  } | null;
  applicationCount?: number;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
}

function unwrapItems<T>(response: any): T[] {
  return response?.data?.items ?? response?.data ?? [];
}

export default function AdminUniversityDetailPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [university, setUniversity] = useState<UniversityDetail | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token || !params?.id) return;

      setLoading(true);
      setError(null);

      try {
        const [universityRes, usersRes, applicationsRes, documentsRes] =
          await Promise.all([
            getUniversityById(params.id, token),
            listUsers({ universityId: params.id, limit: 100 }, token),
            listApplications({ universityId: params.id, limit: 100 }, token),
            listDocuments({ universityId: params.id, limit: 100 }, token),
          ]);

        const universityData = (universityRes as any)?.data ?? null;
        setUniversity(universityData);
        setUsers(unwrapItems<any>(usersRes));
        setApplications(unwrapItems<any>(applicationsRes));
        setDocuments(unwrapItems<any>(documentsRes));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load university details");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token, params?.id]);

  const applicationStats = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter(
      (app) => app.status === "APPROVED",
    ).length;
    const underReview = applications.filter(
      (app) => app.status === "UNDER_REVIEW",
    ).length;
    const rejected = applications.filter(
      (app) => app.status === "REJECTED",
    ).length;
    return { total, approved, underReview, rejected };
  }, [applications]);

  const canDelete = user?.role === "ADMIN";
  const canConfirmDelete = deleteConfirmText.trim().toUpperCase() === "DELETE";

  async function handleDeleteUniversity() {
    if (!params?.id || !token) return;

    try {
      setIsDeleting(true);
      await deleteUniversityPermanently(params.id, token);
      toast.success("University deleted permanently");
      router.push("/dashboard/admin/universities");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete university");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText("");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!university) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        No university found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={university.name}
        description="University detail view with related users, applications, and documents."
        right={
          <div className="flex flex-wrap items-center gap-2">
            {canDelete ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete permanently
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/admin/universities">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to universities
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              University
            </div>
            <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-4 w-4 text-primary" /> {university.name}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {university.isActive
                ? "Active partner university"
                : "Inactive university record"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Users
            </div>
            <div className="mt-2 text-3xl font-bold">{users.length}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Associated users under this university
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Applications
            </div>
            <div className="mt-2 text-3xl font-bold">
              {applicationStats.total || university.applicationCount || 0}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Current application cycles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Documents
            </div>
            <div className="mt-2 text-3xl font-bold">{documents.length}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              University-scoped documents
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Core university details and coordinator contact.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Name</div>
                  <div className="font-medium">{university.name}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Address</div>
                  <div className="font-medium">{university.address || "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-medium">
                    {university.contactEmail || "—"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Phone</div>
                  <div className="font-medium">
                    {university.contactPhone || "—"}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {formatDate(university.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Updated</div>
                  <div className="font-medium">
                    {formatDate(university.updatedAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Coordinator</div>
                  <div className="font-medium">
                    {university.coordinator
                      ? `${university.coordinator.firstName} ${university.coordinator.lastName}`
                      : "—"}
                  </div>
                  {university.coordinator?.email ? (
                    <div className="text-xs text-muted-foreground">
                      {university.coordinator.email}
                    </div>
                  ) : null}
                </div>
              </div>
              <div>
                <Badge
                  variant={university.isActive ? "success" : "secondary"}
                  className="uppercase text-[10px] font-bold"
                >
                  {university.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Snapshot</CardTitle>
            <CardDescription>
              Quick status breakdown for this university.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Approved</span>
              <Badge variant="success">{applicationStats.approved}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Under review</span>
              <Badge variant="warning">{applicationStats.underReview}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Rejected</span>
              <Badge variant="destructive">{applicationStats.rejected}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Total</span>
              <Badge variant="outline">
                {applicationStats.total || university.applicationCount || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Associated Users</CardTitle>
          <CardDescription>Users linked to this university.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No associated users found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="uppercase text-[10px] font-bold"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.department?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "success" : "secondary"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            Application cycles submitted by this university.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No applications found for this university.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="font-medium">
                          {application.name || application.id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {application.id}
                        </div>
                      </TableCell>
                      <TableCell>{application.academicYear}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            application.status === "APPROVED"
                              ? "success"
                              : application.status === "REJECTED"
                                ? "destructive"
                                : application.status === "UNDER_REVIEW"
                                  ? "warning"
                                  : "outline"
                          }
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{application.studentCount ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/dashboard/admin/applications/${application.id}`}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Documents associated with this university.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No documents found for this university.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">
                        {document.title || document.fileName || document.id}
                      </TableCell>
                      <TableCell>{document.type || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {document.entityType || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {typeof document.uploadedBy === "string"
                          ? document.uploadedBy
                          : `${document.uploadedBy?.firstName || ""} ${document.uploadedBy?.lastName || ""}`.trim() ||
                            "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(document.uploadedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Delete university permanently</DialogTitle>
            <DialogDescription>
              This will permanently remove {university.name}. Related
              applications will be removed by the database, while linked users
              will be detached from the university.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div className="text-sm font-medium text-muted-foreground">
              Type DELETE to confirm
            </div>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText("");
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeleteUniversity()}
              disabled={!canConfirmDelete || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
