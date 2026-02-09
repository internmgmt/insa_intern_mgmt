const ALLOWED_BACKEND_BASE = process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5005';

function isAllowedTarget(targetUrl: string): boolean {
  try {
    const allowed = new URL(ALLOWED_BACKEND_BASE);
    const parsed = new URL(targetUrl);
    return parsed.origin === allowed.origin;
  } catch {
    return false;
  }
}

export async function proxyToBackend(req: Request): Promise<Response> {
  const backendBase = ALLOWED_BACKEND_BASE;
  const url = new URL(req.url);
  const pathSegment = url.pathname.replace(/^\/api/, '');
  const sanitizedPath = pathSegment.replace(/\.\./g, '').replace(/\/\//g, '/');
  const targetUrl = backendBase.replace(/\/$/, '') + sanitizedPath + url.search;

  if (!isAllowedTarget(targetUrl)) {
    return new Response(JSON.stringify({ success: false, message: 'Forbidden: disallowed proxy target' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const headers = new Headers(req.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: req.method,
    headers,
  } as RequestInit & { duplex?: 'half' };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.arrayBuffer();
    (init as any).body = body;
    (init as any).duplex = 'half';
  }

  return fetch(targetUrl, init);
}