import { apiFetch } from "@/lib/api";
import type { ApiSuccess, DocumentInfo, DocumentType, EntityType, Paginated } from "@/lib/types";

export async function uploadDocument(
  file: File,
  opts: {
    type?: DocumentType;
    documentType?: DocumentType;
    entityId?: string;
    entityType?: EntityType;
    applicationId?: string;
    studentId?: string;
    title?: string
  },
  token?: string
) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("documentType", opts.documentType || opts.type || "");
  fd.append("title", opts.title || file.name);
  if (opts.entityId) fd.append("entityId", opts.entityId);
  if (opts.entityType) fd.append("entityType", opts.entityType);
  if (opts.applicationId) fd.append("applicationId", opts.applicationId);
  if (opts.studentId) fd.append("studentId", opts.studentId);

  return apiFetch<ApiSuccess<DocumentInfo>>("/documents/upload", {
    method: "POST",
    body: fd,
    token,
  });
}
export async function listDocuments(params: { page?: number; limit?: number; type?: string; entityId?: string; entityType?: string } = {}, token?: string) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.type) qs.set("type", params.type);
  if (params.entityId) qs.set("entityId", params.entityId);
  if (params.entityType) qs.set("entityType", params.entityType);
  const query = qs.toString();
  return apiFetch<ApiSuccess<Paginated<DocumentInfo>>>(`/documents${query ? `?${query}` : ""}`, {
    method: "GET",
    token,
  });
}

export async function deleteDocument(id: string, token?: string) {
  return apiFetch<ApiSuccess<null>>(`/documents/${id}`, {
    method: "DELETE",
    token,
  });
}
