export async function proxyToBackend(req: Request): Promise<Response> {
  const backendBase = process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5005';
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '');
  const targetUrl = backendBase.replace(/\/$/, '') + path + url.search;

  const headers = new Headers(req.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: req.method,
    headers,
    // Next/node runtime sometimes requires duplex when sending a body
  } as RequestInit & { duplex?: 'half' };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.arrayBuffer();
    (init as any).body = body;
    (init as any).duplex = 'half';
  }

  return fetch(targetUrl, init);
}
