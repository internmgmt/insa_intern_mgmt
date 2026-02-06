import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_PATH_PREFIXES = [
  "/auth",
  "/users",
  "/universities",
  "/departments",
  "/applications",
  "/students",
  "/interns",
  "/submissions",
  "/documents",
  "/dashboard",
];

function isAllowedPath(path: string): boolean {
  const normalized = "/" + path.replace(/^\/+/, "");
  return ALLOWED_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function getTargetBaseUrl() {
  const target = process.env.API_PROXY_TARGET;
  if (!target) return null;
  return target.endsWith("/") ? target.slice(0, -1) : target;
}

function sanitizeHeaders(headers: Headers): Record<string, string> {
  const safe: Record<string, string> = {};
  const BLOCKED = new Set(["host", "cookie", "x-forwarded-for", "x-real-ip"]);
  headers.forEach((value, key) => {
    if (!BLOCKED.has(key.toLowerCase())) {
      safe[key] = value;
    }
  });
  return safe;
}

async function proxy(req: NextRequest) {
  const targetBaseUrl = getTargetBaseUrl();

  if (!targetBaseUrl) {
    return NextResponse.json(
      {
        success: false,
        message:
          "API proxy is not configured. Set API_PROXY_TARGET to your backend base URL (example: http://localhost:8000).",
        error: { code: "API_PROXY_TARGET_MISSING" },
      },
      { status: 500 }
    );
  }

  const upstreamPath = req.nextUrl.pathname.replace(/^\/api/, "") || "/";

  if (!isAllowedPath(upstreamPath)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const upstreamUrl = new URL(`${targetBaseUrl}${upstreamPath}${req.nextUrl.search}`);

  const safeHeaders = sanitizeHeaders(req.headers);
  const headers = new Headers(safeHeaders);

  const method = req.method.toUpperCase();
  const hasBody = !(method === "GET" || method === "HEAD");

  const res = await fetch(upstreamUrl, {
    method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new NextResponse(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest) {
  return proxy(req);
}
export async function POST(req: NextRequest) {
  return proxy(req);
}
export async function PUT(req: NextRequest) {
  return proxy(req);
}
export async function PATCH(req: NextRequest) {
  return proxy(req);
}
export async function DELETE(req: NextRequest) {
  return proxy(req);
}
export async function OPTIONS(req: NextRequest) {
  return proxy(req);
}
export async function HEAD(req: NextRequest) {
  return proxy(req);
}