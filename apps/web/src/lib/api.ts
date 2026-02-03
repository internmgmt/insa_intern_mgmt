import type { ApiError } from "@/lib/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

type FetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

export class ApiRequestError extends Error {
  code?: string;
  status?: number;
  details?: unknown;

  constructor(message: string, opts?: { code?: string; status?: number; details?: unknown }) {
    super(message);
    this.name = "ApiRequestError";
    this.code = opts?.code;
    this.status = opts?.status;
    this.details = opts?.details;
  }
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers,
    body: options.body
      ? isFormData
        ? (options.body as BodyInit)
        : JSON.stringify(options.body)
      : undefined,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const errJson = (await res.json()) as ApiError;
      throw new ApiRequestError(errJson.message ?? "Request failed", {
        code: errJson.error?.code,
        status: res.status,
        details: errJson.error?.details,
      });
    }

    let text = "";
    try {
      text = (await res.text()).trim();
    } catch {
      // ignore
    }

    throw new ApiRequestError(text || `Request failed (${res.status})`, { status: res.status });
  }

  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  // For binary endpoints (e.g., document download)
  return (await res.blob()) as unknown as T;
}
