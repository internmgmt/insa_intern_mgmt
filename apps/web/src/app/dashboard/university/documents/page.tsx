"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
import { FilePreview } from "@/components/file-preview";
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
} from "lucide-react";
import { uploadDocument, listDocuments, deleteDocument } from "@/lib/services/documents";
import { downloadFile } from "@/lib/download";
import { toast } from "sonner";
import type { DocumentInfo } from "@/lib/types";

type DocumentType = "OFFICIAL_LETTER" | "CV" | "TRANSCRIPT" | "OTHER";

type Doc = {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  type: DocumentType | string;
  status: string;
  uploadedAt: string;
  verifiedAt?: string | null;
  relatedTo?: string | null;
  notes?: string | null;
};

export default function UniversityDocumentsPage() {
  const { token, user } = useAuth();
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | DocumentType | "OTHER">("ALL");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("OFFICIAL_LETTER");
  const [relatedEntity, setRelatedEntity] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  async function fetchDocuments() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await listDocuments({ page: 1, limit: 100 }, token);
      const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];

      console.log('Fetched documents:', items);

      const mappedDocs = items.map((item: any) => {
        let type = "OTHER";
        let status = "VERIFIED";

        try {
          if (item?.metadata) {
            const meta = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
            if (meta?.documentType) type = meta.documentType;
          }
        } catch (e) {
          console.error('Error parsing metadata for document:', item?.id, e);
        }

        // Get status from student or default
        if (item?.student?.status) {
          status = item.student.status;
        } else if (type === 'OFFICIAL_LETTER') {
          status = "SUBMITTED";
        }

        return {
          id: item?.id || '',
          fileUrl: item?.url || '',
          fileName: item?.title || 'Unknown',
          fileSize: 0,
          type: type,
          status: status,
          uploadedAt: item?.createdAt || new Date().toISOString(),
          verifiedAt: null,
          relatedTo: item?.student?.studentId || (type === 'OFFICIAL_LETTER' ? 'Application' : ''),
          notes: null
        };
      });

      console.log('Mapped documents:', mappedDocs);
      setDocuments(mappedDocs as Doc[]);
    } catch (e: any) {
      console.error('Failed to fetch documents', e);
      toast.error(e?.message || 'Failed to fetch documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        return { label: "Official Letter", icon: FileText, color: "bg-primary/10" };
      case "CV":
        return { label: "CV", icon: File, color: "bg-secondary/10" };
      case "TRANSCRIPT":
        return { label: "Transcript", icon: FileText, color: "bg-success/10" };
      default:
        return { label: type || "Other", icon: FilePlus, color: "bg-muted/10" };
    }
  }

  function getStatusConfig(status: string) {
    switch (status) {
      case "VERIFIED":
        return { label: "Verified", variant: "success", icon: CheckCircle };
      case "PENDING":
        return { label: "Pending", variant: "warning", icon: AlertCircle };
      case "REJECTED":
        return { label: "Rejected", variant: "destructive", icon: AlertCircle };
      default:
        return { label: status || "Unknown", variant: "secondary", icon: AlertCircle };
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || (doc.relatedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = typeFilter === "ALL" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Drag/drop
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFileSelect(file); };

  function handleFileSelect(file: File) {
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    try {
      const res = await uploadDocument(selectedFile, {
        type: documentType as any,
        entityId: relatedEntity || undefined,
        title: selectedFile.name,
      }, token || undefined);

      if (!res.success) {
        toast.error(res.message || 'Upload failed');
        return;
      }
      toast.success('Uploaded');
      setShowUploadDialog(false);
      setSelectedFile(null);
      fetchDocuments();
    } catch (e: any) {
      console.error('Upload failed', e);
      toast.error(e?.message || 'Upload failed');
    }
  }

  function handleViewDocument(doc: Doc) { setSelectedDoc(doc); setShowViewDialog(true); }
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

  async function handleDownload(doc: Doc) {
    if (!doc.id || !token) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
    const ok = await downloadFile(
      `${baseUrl}/documents/${doc.id}/download`,
      token,
      doc.fileName || "document.pdf"
    );
    if (ok) {
      toast.success("Download started");
    }
  }

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'PENDING').length,
    verified: documents.filter(d => d.status === 'VERIFIED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
    officialLetters: documents.filter(d => d.type === 'OFFICIAL_LETTER').length,
    cvs: documents.filter(d => d.type === 'CV').length,
    transcripts: documents.filter(d => d.type === 'TRANSCRIPT').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload and manage official letters, CVs, and transcripts</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} size="lg" className="gap-2"><Upload className="h-5 w-5" /> Upload Document</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-foreground"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Documents</p><p className="text-3xl font-bold mt-2">{stats.total}</p></div><div className="p-3 rounded-lg bg-foreground/10"><FileText className="h-8 w-8 text-foreground" /></div></div></CardContent></Card>
        <Card className="border-l-4 border-l-success"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Verified</p><p className="text-3xl font-bold mt-2">{stats.verified}</p></div><div className="p-3 rounded-lg bg-success/10"><CheckCircle className="h-8 w-8 text-success" /></div></div></CardContent></Card>
        <Card className="border-l-4 border-l-warning"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Pending</p><p className="text-3xl font-bold mt-2">{stats.pending}</p></div><div className="p-3 rounded-lg bg-warning/10"><AlertCircle className="h-8 w-8 text-warning" /></div></div></CardContent></Card>
        <Card className="border-l-4 border-l-destructive"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Rejected</p><p className="text-3xl font-bold mt-2">{stats.rejected}</p></div><div className="p-3 rounded-lg bg-destructive/10"><AlertCircle className="h-8 w-8 text-destructive" /></div></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1"><Input placeholder="Search by file name or related entity..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <div className="flex items-center gap-2"><Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by type" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Types</SelectItem><SelectItem value="OFFICIAL_LETTER">Official Letters</SelectItem><SelectItem value="CV">CVs</SelectItem><SelectItem value="TRANSCRIPT">Transcripts</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent></Select></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
          <CardDescription>All uploaded documents and their verification status</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No documents found</p>
              <p className="text-sm text-muted-foreground mt-1">{searchQuery || typeFilter !== "ALL" ? "Try adjusting your search or filters" : "Upload your first document to get started"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => {
                const typeConfig = getDocumentTypeConfig(doc.type);
                const statusConfig = getStatusConfig(doc.status);
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={doc.id} className="group hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5"><TypeIcon className="h-6 w-6 text-primary" /></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{doc.fileName}</h3>
                              <Badge variant={(statusConfig.variant as any) || 'secondary'} className="gap-1.5"><StatusIcon className="h-3 w-3" />{statusConfig.label}</Badge>
                              <Badge className={`${typeConfig.color} ml-2`} variant="outline">{typeConfig.label}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /><span>Related to: <span className="font-medium text-foreground">{doc.relatedTo || '—'}</span></span></div>
                              <div className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /><span>{formatFileSize(doc.fileSize)}</span></div>
                              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>Uploaded: {formatDate(doc.uploadedAt)}</span></div>
                              {doc.verifiedAt && (<div className="text-muted-foreground">Verified: {formatDate(doc.verifiedAt)}</div>)}
                            </div>
                            {doc.notes && (<div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive"><strong>Note:</strong> {doc.notes}</div>)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleViewDocument(doc)}><Eye className="h-4 w-4" /> View</Button>
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload(doc)}><Download className="h-4 w-4" /> Download</Button>
                          {doc.status === "PENDING" && (<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setSelectedDoc(doc); setShowDeleteDialog(true); }}><Trash2 className="h-4 w-4" /></Button>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload official letters, student CVs, transcripts, or other required documents</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type *</Label>
              <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                <SelectTrigger id="document-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFFICIAL_LETTER">Official Letter</SelectItem>
                  <SelectItem value="CV">Student CV</SelectItem>
                  <SelectItem value="TRANSCRIPT">Student Transcript</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="related-entity">Related To</Label>
              <Input id="related-entity" placeholder="e.g., APP-2024-001 or STU-001" value={relatedEntity} onChange={(e) => setRelatedEntity(e.target.value)} />
              <p className="text-xs text-muted-foreground">Enter the Application ID or Student ID this document relates to</p>
            </div>

            <div className="space-y-2">
              <Label>File Upload *</Label>
              <Card className={`border-2 border-dashed rounded-lg p-0 transition-colors cursor-pointer ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <CardContent className="p-8 text-center">
                  <input id="file-upload" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }} />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div>
                        <FilePlus className="h-10 w-10 mx-auto text-success mb-2" />
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{selectedFile.size ? formatFileSize(selectedFile.size) : ''} • Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </label>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-primary" /> Document Requirements</h4>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc"><li>Official letters must be on university letterhead</li><li>CVs and transcripts should be clear and legible</li><li>All documents must be in PDF or DOC format</li><li>Maximum file size is 10MB</li></ul>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUploadDialog(false); setSelectedFile(null); setDocumentType('OFFICIAL_LETTER'); setRelatedEntity(''); }}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!selectedFile}> <Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>Complete information for {selectedDoc?.fileName}</DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Document ID</Label><p className="font-medium mt-1">{selectedDoc.id}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><Badge variant={(getStatusConfig(selectedDoc.status).variant as any) || 'secondary'}>{getStatusConfig(selectedDoc.status).label}</Badge></div></div>
                <div><Label className="text-muted-foreground">Type</Label><p className="font-medium mt-1">{getDocumentTypeConfig(selectedDoc.type).label}</p></div>
                <div><Label className="text-muted-foreground">File Size</Label><p className="font-medium mt-1">{formatFileSize(selectedDoc.fileSize)}</p></div>
                <div><Label className="text-muted-foreground">Uploaded At</Label><p className="font-medium mt-1">{formatDate(selectedDoc.uploadedAt)}</p></div>
                {selectedDoc.verifiedAt && (<div><Label className="text-muted-foreground">Verified At</Label><p className="font-medium mt-1">{formatDate(selectedDoc.verifiedAt)}</p></div>)}
              </div>
              {selectedDoc.relatedTo && (<div><Label className="text-muted-foreground">Related To</Label><p className="font-medium mt-1">{selectedDoc.relatedTo}</p></div>)}
              {selectedDoc.fileUrl && (<div><Label className="text-muted-foreground">File Path</Label><p className="font-mono text-sm mt-1 p-2 bg-muted rounded">{selectedDoc.fileUrl}</p></div>)}
              {selectedDoc.notes && (<div><Label className="text-muted-foreground">Notes</Label><p className="mt-1 p-3 bg-destructive/10 border border-destructive/20 rounded">{selectedDoc.notes}</p></div>)}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            <Button onClick={() => selectedDoc && handleDownload(selectedDoc)}><Download className="mr-2 h-4 w-4" /> Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>Are you sure you want to delete this document? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          {selectedDoc && (<div className="py-4"><div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"><p className="font-semibold">{selectedDoc.fileName}</p><p className="text-sm text-muted-foreground mt-1">Type: {getDocumentTypeConfig(selectedDoc.type).label}</p><p className="text-sm text-muted-foreground">Size: {formatFileSize(selectedDoc.fileSize)}</p></div></div>)}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedDoc(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
