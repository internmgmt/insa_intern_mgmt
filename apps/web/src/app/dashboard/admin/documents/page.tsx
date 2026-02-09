"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  File,
  Upload,
  FilePlus,
  AlertCircle,
  Trash2,
  Download,
  Eye,
  User,
  Calendar,
  CheckCircle,
  Building,
  Search,
} from "lucide-react";
import { listDocuments, deleteDocument } from "@/lib/services/documents";
import { listUniversities } from "@/lib/services/universities";
import { toast } from "sonner";

type DocumentType = "OFFICIAL_LETTER" | "CV" | "TRANSCRIPT" | "OTHER";

type Doc = {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  type: DocumentType | string;
  status: string;
  uploadedAt: string;
  uploadedBy: string;
  universityName: string;
  relatedTo?: string | null;
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\-() ]/g, "_");
}

export default function AdminDocumentsPage() {
  const { token } = useAuth();

  const [universities, setUniversities] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedUniId, setSelectedUniId] = useState<string>("ALL");
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [unisLoading, setUnisLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | DocumentType | "OTHER">(
    "ALL",
  );

  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);

  useEffect(() => {
    const fetchUnis = async () => {
      if (!token) return;
      try {
        setUnisLoading(true);
        const res = await listUniversities({ page: 1, limit: 100 }, token);
        const items = (res as any)?.data?.items || (res as any)?.data || [];
        setUniversities(items);
      } catch (err: any) {
        console.error("Failed to fetch universities", err);
      } finally {
        setUnisLoading(false);
      }
    };
    fetchUnis();
  }, [token]);

  useEffect(() => {
    fetchDocuments();
  }, [token, selectedUniId]);

  async function fetchDocuments() {
    if (!token) return;
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 100 };
      if (selectedUniId !== "ALL") params.universityId = selectedUniId;

      const res = await listDocuments(params, token);
      const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];

      const mappedDocs = items.map((item: any) => {
        let type = "OTHER";
        let uploadedBy = "Unknown";
        let universityName =
          item?.student?.application?.university?.name ||
          item?.university?.name ||
          "Global";

        try {
          if (item?.metadata) {
            const meta =
              typeof item.metadata === "string"
                ? JSON.parse(item.metadata)
                : item.metadata;
            if (meta?.documentType) type = meta.documentType;
            if (meta?.uploadedBy) uploadedBy = meta.uploadedBy;
          }
        } catch (e) {
          console.error("Error parsing metadata for document:", item?.id, e);
        }

        return {
          id: item?.id || "",
          fileUrl: item?.url || "",
          fileName: item?.title || item?.fileName || "Document",
          fileSize: 0,
          type: type,
          status: item?.student?.status || "VERIFIED",
          uploadedAt: item?.createdAt || new Date().toISOString(),
          uploadedBy:
            uploadedBy ||
            (item.student
              ? `${item.student.firstName} ${item.student.lastName}`
              : "ADMIN"),
          universityName: universityName,
          relatedTo:
            item?.student?.studentId ||
            (type === "OFFICIAL_LETTER" ? "Application" : ""),
        };
      });

      setDocuments(mappedDocs as Doc[]);
    } catch (e: any) {
      console.error("Failed to fetch documents", e);
      toast.error("Failed to fetch documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string | undefined) {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  function getDocumentTypeConfig(type: string) {
    switch (type) {
      case "OFFICIAL_LETTER":
        return {
          label: "Official Letter",
          icon: FileText,
          color: "bg-primary/10",
          textColor: "text-primary",
        };
      case "CV":
        return {
          label: "CV",
          icon: File,
          color: "bg-blue-500/10",
          textColor: "text-blue-500",
        };
      case "TRANSCRIPT":
        return {
          label: "Transcript",
          icon: FileText,
          color: "bg-green-500/10",
          textColor: "text-green-500",
        };
      default:
        return {
          label: type || "Other",
          icon: FilePlus,
          color: "bg-muted/10",
          textColor: "text-muted-foreground",
        };
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.relatedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      doc.universityName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  async function handleDownload(doc: Doc) {
    if (!doc.id || !token) return;
    try {
      toast.info("Download starting...");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
      const res = await fetch(`${baseUrl}/documents/${doc.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;

      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = doc.fileName;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      if (!filename.endsWith(".pdf") && !filename.includes("."))
        filename += ".pdf";

      a.download = sanitizeFilename(filename);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (e) {
      console.error("Download failed", e);
      toast.error("Failed to download document");
    }
  }

  async function handleDelete() {
    if (!selectedDoc) return;
    try {
      await deleteDocument(selectedDoc.id, token || undefined);
      toast.success("Document deleted successfully");
      setShowDeleteDialog(false);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete document");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Documents Admin
        </h1>
        <p className="text-muted-foreground">
          Global document registry and management across all universities.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>University</Label>
              <Select value={selectedUniId} onValueChange={setSelectedUniId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Universities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Universities</SelectItem>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(v: any) => setTypeFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="OFFICIAL_LETTER">
                    Official Letters
                  </SelectItem>
                  <SelectItem value="CV">CVs</SelectItem>
                  <SelectItem value="TRANSCRIPT">Transcripts</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by filename, student ID, or university..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground animate-pulse">
                Loading document registry...
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-semibold text-foreground">
                No Documents Found
              </h3>
              <p className="max-w-xs mx-auto mt-2">
                Adjust your filters or try a different search term to see
                registry items.
              </p>
              {(selectedUniId !== "ALL" ||
                typeFilter !== "ALL" ||
                searchQuery) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSelectedUniId("ALL");
                    setTypeFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="mt-4"
                >
                  Reset all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[40%]">Document</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const typeConfig = getDocumentTypeConfig(doc.type);
                    const TypeIcon = typeConfig.icon;

                    return (
                      <TableRow
                        key={doc.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2.5 rounded-lg ${typeConfig.color} ${typeConfig.textColor}`}
                            >
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground line-clamp-1">
                                {doc.fileName}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-4.5 px-1"
                                >
                                  {typeConfig.label}
                                </Badge>
                                {doc.relatedTo && (
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    ID: {doc.relatedTo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">
                              {doc.universityName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{doc.uploadedBy}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground italic">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(doc.uploadedAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/10"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setShowViewDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-foreground hover:bg-muted"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              Full audit info for this document.
            </DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-y-4 text-sm border-b pb-6 mt-4">
                <div className="text-muted-foreground">Filename:</div>
                <div className="font-medium text-foreground break-all">
                  {selectedDoc.fileName}
                </div>
                <div className="text-muted-foreground">Type:</div>
                <div>
                  <Badge variant="outline">
                    {getDocumentTypeConfig(selectedDoc.type).label}
                  </Badge>
                </div>
                <div className="text-muted-foreground">University:</div>
                <div className="font-medium underline decoration-primary/30 underline-offset-4">
                  {selectedDoc.universityName}
                </div>
                <div className="text-muted-foreground">Uploaded By:</div>
                <div>{selectedDoc.uploadedBy}</div>
                <div className="text-muted-foreground">Upload Date:</div>
                <div>{formatDate(selectedDoc.uploadedAt)}</div>
                <div className="text-muted-foreground">Entity Reference:</div>
                <div className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                  {selectedDoc.relatedTo || "No reference"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDownload(selectedDoc)}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
                  onClick={() => {
                    setShowViewDialog(false);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Document
            </DialogTitle>
            <DialogDescription>
              This document will be permanently removed from the system. This
              cannot be undone. Are you sure?
            </DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-lg text-sm italic mb-4">
              {selectedDoc.fileName}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Keep Document
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}